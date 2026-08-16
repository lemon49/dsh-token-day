import { z } from "zod";
import { isReplacementSurfaceEvent } from "@deepseek-ai/dsh-session";
//#region src/projection.ts
const bucketsSchema = z.object({
	uncachedInputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative(),
	cacheReadTokens: z.number().int().nonnegative(),
	cacheWriteTokens: z.number().int().nonnegative()
}).strict();
const requestsSchema = z.object({
	assistant: z.number().int().nonnegative(),
	compaction: z.number().int().nonnegative(),
	billed: z.number().int().nonnegative()
}).strict();
const projectionSchema = z.object({
	assistantRequests: z.number().int().nonnegative(),
	compactionRequests: z.number().int().nonnegative(),
	billedRequests: z.number().int().nonnegative(),
	compactionUsage: bucketsSchema,
	usage: bucketsSchema,
	models: z.array(z.object({
		provider: z.string(),
		model: z.string(),
		assistantRequests: z.number().int().nonnegative(),
		compactionRequests: z.number().int().nonnegative(),
		billedRequests: z.number().int().nonnegative(),
		usage: bucketsSchema,
		days: z.array(z.object({
			date: z.string(),
			requests: requestsSchema,
			usage: bucketsSchema
		}).strict())
	}).strict()),
	days: z.array(z.object({
		date: z.string(),
		requests: requestsSchema,
		usage: bucketsSchema
	}).strict())
}).strict();
/** Create detached zero buckets for projection state. */
function zeroBuckets() {
	return {
		uncachedInputTokens: 0,
		outputTokens: 0,
		cacheReadTokens: 0,
		cacheWriteTokens: 0
	};
}
/** Create detached zero per-day request counters. */
function zeroRequests() {
	return {
		assistant: 0,
		compaction: 0,
		billed: 0
	};
}
/** Normalize optional provider fields into the four disjoint buckets. */
function bucketsFrom(usage) {
	return {
		uncachedInputTokens: usage.inputTokens,
		outputTokens: usage.outputTokens,
		cacheReadTokens: usage.cacheReadTokens ?? 0,
		cacheWriteTokens: usage.cacheWriteTokens ?? 0
	};
}
/** Compare buckets without counting reasoning output a second time. */
function bucketsEqual(left, right) {
	return left.uncachedInputTokens === right.uncachedInputTokens && left.outputTokens === right.outputTokens && left.cacheReadTokens === right.cacheReadTokens && left.cacheWriteTokens === right.cacheWriteTokens;
}
/** Add or subtract one bucket set. */
function addBuckets(current, value, direction) {
	return {
		uncachedInputTokens: current.uncachedInputTokens + direction * value.uncachedInputTokens,
		outputTokens: current.outputTokens + direction * value.outputTokens,
		cacheReadTokens: current.cacheReadTokens + direction * value.cacheReadTokens,
		cacheWriteTokens: current.cacheWriteTokens + direction * value.cacheWriteTokens
	};
}
/** Add or subtract one request-counter set. */
function addRequests(current, value, direction) {
	return {
		assistant: current.assistant + direction * value.assistant,
		compaction: current.compaction + direction * value.compaction,
		billed: current.billed + direction * value.billed
	};
}
/** Stable UTC calendar day for one durable event timestamp. */
function dayKey(time) {
	return new Date(time).toISOString().slice(0, 10);
}
/** Add or remove one usage sample from a daily aggregation table. */
function adjustDay(days, day, requests, usage, direction) {
	const current = days[day] ?? {
		requests: zeroRequests(),
		usage: zeroBuckets()
	};
	const nextRequests = addRequests(current.requests, requests, direction);
	const nextUsage = addBuckets(current.usage, usage, direction);
	if (nextRequests.assistant === 0 && nextRequests.compaction === 0 && nextRequests.billed === 0 && bucketsEqual(nextUsage, zeroBuckets())) delete days[day];
	else days[day] = {
		requests: nextRequests,
		usage: nextUsage
	};
}
/** Stable collision-free object key for one provider/model pair. */
function routeKey(route) {
	return JSON.stringify([route.provider, route.model]);
}
/** Whether a model day entry became empty after replacing its only sample. */
function modelDayEmpty(day) {
	return day.assistant === 0 && day.compaction === 0 && day.billed === 0 && bucketsEqual(day.usage, zeroBuckets());
}
/** Whether a route record became empty after replacing its only sample. */
function recordEmpty(record) {
	return record.assistantRequests === 0 && record.compactionRequests === 0 && record.billedRequests === 0 && bucketsEqual(record.usage, zeroBuckets()) && Object.keys(record.days).length === 0;
}
/** Apply one signed model-attributed usage sample to a cloned model table. */
function adjustModel(models, route, day, usage, direction, kind, billed) {
	const key = routeKey(route);
	const current = models[key] ?? {
		...route,
		assistantRequests: 0,
		compactionRequests: 0,
		billedRequests: 0,
		usage: zeroBuckets(),
		days: {}
	};
	const dayState = current.days[day] ?? {
		assistant: 0,
		compaction: 0,
		billed: 0,
		usage: zeroBuckets()
	};
	const nextDay = {
		assistant: dayState.assistant + (kind === "assistant" ? direction : 0),
		compaction: dayState.compaction + (kind === "compaction" ? direction : 0),
		billed: dayState.billed + (billed ? direction : 0),
		usage: addBuckets(dayState.usage, usage, direction)
	};
	const days = { ...current.days };
	if (modelDayEmpty(nextDay)) delete days[day];
	else days[day] = nextDay;
	const next = {
		...current,
		assistantRequests: current.assistantRequests + (kind === "assistant" ? direction : 0),
		compactionRequests: current.compactionRequests + (kind === "compaction" ? direction : 0),
		billedRequests: current.billedRequests + (billed ? direction : 0),
		usage: addBuckets(current.usage, usage, direction),
		days
	};
	if (recordEmpty(next)) delete models[key];
	else models[key] = next;
}
/** Resolve the best durable route identity available on an assistant event. */
function assistantRoute(event, fallback) {
	if (event.type === "assistant/message" && event.data.message.source.kind === "model") return {
		provider: event.data.message.source.provider,
		model: event.data.message.source.model
	};
	return fallback ?? {
		provider: "unknown",
		model: "unknown"
	};
}
/** Total billed tokens across the four disjoint buckets. */
function totalTokens(usage) {
	return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens;
}
/** Durable all-request token usage projection, including context compactions. */
const tokenDayProjectionDefinition = {
	key: "tokenDay",
	schema: projectionSchema,
	init: () => ({
		route: null,
		assistantRequests: 0,
		compactionRequests: 0,
		billedRequests: 0,
		compactionUsage: zeroBuckets(),
		usage: zeroBuckets(),
		models: {},
		days: {},
		lastAssistant: null
	}),
	apply: (state, event) => {
		if (isReplacementSurfaceEvent(event)) return state;
		if (event.type === "request/context") {
			const route = {
				provider: event.data.provider,
				model: event.data.model
			};
			if (state.route?.provider === route.provider && state.route.model === route.model) return state;
			return {
				...state,
				route
			};
		}
		if (event.type === "request/header") {
			const route = {
				provider: event.data.header.config.provider,
				model: event.data.header.config.model
			};
			if (state.route?.provider === route.provider && state.route.model === route.model) return state;
			return {
				...state,
				route
			};
		}
		if (event.type === "llm/retry") {
			const current = state.lastAssistant;
			if (current !== null && current.turn === event.data.turn && current.step === event.data.step) return {
				...state,
				lastAssistant: null
			};
			const models = { ...state.models };
			const day = dayKey(event.time);
			if (state.route !== null) adjustModel(models, state.route, day, zeroBuckets(), 1, "assistant", false);
			const days = { ...state.days };
			adjustDay(days, day, {
				assistant: 1,
				compaction: 0,
				billed: 0
			}, zeroBuckets(), 1);
			return {
				...state,
				assistantRequests: state.assistantRequests + 1,
				models,
				days
			};
		}
		if (event.type === "compaction/summary") {
			const compactionRequests = state.compactionRequests + 1;
			const day = dayKey(event.time);
			const days = { ...state.days };
			if (event.data.usage === void 0) {
				const models = { ...state.models };
				adjustModel(models, {
					provider: event.data.provider,
					model: event.data.model
				}, day, zeroBuckets(), 1, "compaction", false);
				adjustDay(days, day, {
					assistant: 0,
					compaction: 1,
					billed: 0
				}, zeroBuckets(), 1);
				return {
					...state,
					compactionRequests,
					models,
					days
				};
			}
			const usage = bucketsFrom(event.data.usage);
			const billed = totalTokens(usage) > 0;
			const route = {
				provider: event.data.provider,
				model: event.data.model
			};
			const models = { ...state.models };
			adjustModel(models, route, day, usage, 1, "compaction", billed);
			adjustDay(days, day, {
				assistant: 0,
				compaction: 1,
				billed: billed ? 1 : 0
			}, usage, 1);
			return {
				...state,
				compactionRequests,
				billedRequests: state.billedRequests + (billed ? 1 : 0),
				compactionUsage: addBuckets(state.compactionUsage, usage, 1),
				usage: addBuckets(state.usage, usage, 1),
				models,
				days
			};
		}
		let turn;
		let step;
		let rawUsage;
		if (event.type === "assistant/chunk" && event.data.chunk.type === "usage") {
			turn = event.data.turn;
			step = event.data.step;
			rawUsage = event.data.chunk.usage;
		} else if (event.type === "assistant/message" && event.data.usage !== void 0) {
			turn = event.data.turn;
			step = event.data.step;
			rawUsage = event.data.usage;
		} else return state;
		const route = assistantRoute(event, state.route);
		const day = dayKey(event.time);
		const usage = bucketsFrom(rawUsage);
		const billed = totalTokens(usage) > 0;
		const previous = state.lastAssistant !== null && state.lastAssistant.turn === turn && state.lastAssistant.step === step ? state.lastAssistant : null;
		if (previous !== null && previous.route.provider === route.provider && previous.route.model === route.model && bucketsEqual(previous.usage, usage)) return state;
		const models = { ...state.models };
		const days = { ...state.days };
		let total = state.usage;
		if (previous !== null) {
			total = addBuckets(total, previous.usage, -1);
			adjustModel(models, previous.route, previous.day, previous.usage, -1, "assistant", previous.billed);
			adjustDay(days, previous.day, zeroRequests(), previous.usage, -1);
		} else adjustDay(days, day, {
			assistant: 1,
			compaction: 0,
			billed: billed ? 1 : 0
		}, zeroBuckets(), 1);
		total = addBuckets(total, usage, 1);
		adjustModel(models, route, day, usage, 1, "assistant", billed);
		adjustDay(days, day, zeroRequests(), usage, 1);
		const billedDelta = previous === null ? billed ? 1 : 0 : billed !== previous.billed ? billed ? 1 : -1 : 0;
		return {
			...state,
			assistantRequests: state.assistantRequests + (previous === null ? 1 : 0),
			billedRequests: state.billedRequests + billedDelta,
			usage: total,
			models,
			days,
			lastAssistant: {
				turn,
				step,
				route,
				day,
				usage,
				billed
			}
		};
	},
	view: (state) => ({
		assistantRequests: state.assistantRequests,
		compactionRequests: state.compactionRequests,
		billedRequests: state.billedRequests,
		compactionUsage: state.compactionUsage,
		usage: state.usage,
		models: Object.values(state.models).map((model) => ({
			provider: model.provider,
			model: model.model,
			assistantRequests: model.assistantRequests,
			compactionRequests: model.compactionRequests,
			billedRequests: model.billedRequests,
			usage: model.usage,
			days: Object.entries(model.days).map(([date, day]) => ({
				date,
				requests: {
					assistant: day.assistant,
					compaction: day.compaction,
					billed: day.billed
				},
				usage: day.usage
			})).sort((left, right) => left.date.localeCompare(right.date))
		})).sort((left, right) => totalTokens(right.usage) - totalTokens(left.usage) || left.provider.localeCompare(right.provider) || left.model.localeCompare(right.model)),
		days: Object.entries(state.days).map(([date, value]) => ({
			date,
			requests: value.requests,
			usage: value.usage
		})).sort((left, right) => left.date.localeCompare(right.date))
	}),
	stateVersion: 8
};
//#endregion
//#region src/session-archive.ts
/**
* Durable session-archive management for the conversation manager.
*
* The DSH workspace registry exposes `archiveSession` but no unarchive, so the
* conversation manager owns its own archive set in a private storage domain
* (`dsh-token-day-session-archive`). Three Web routes expose the set:
*
*  - GET /plugins/dsh-token-day/archived  -> { archivedSessionIds: string[] }
*  - GET /plugins/dsh-token-day/archive?id=...   -> { ok: true }
*  - GET /plugins/dsh-token-day/restore?id=...   -> { ok: true }
*
* Routes are registered lazily once the Web server service binds, mirroring
* the dsh-token-panel pattern; headless profiles keep the plugin inert.
*/
/** Route prefix under which the archive endpoints are served. */
const ARCHIVE_ROUTE_BASE = "/plugins/dsh-token-day";
/** The private domain spec: one global singleton, no tables. */
const archiveDomainSpec = {
	name: "dsh-token-day-session-archive",
	version: 1,
	global: {
		schema: z.object({ archivedSessionIds: z.array(z.string()).default([]) }).strict(),
		initial: { archivedSessionIds: [] }
	},
	tables: {}
};
/** Open the archive domain and build the serialized read/write facade. */
async function createSessionArchive(storageDomain) {
	const domain = await storageDomain.open(archiveDomainSpec);
	let closed = false;
	const dispose = async () => {
		if (closed) return;
		closed = true;
		await domain.close();
	};
	let tail = Promise.resolve();
	const enqueue = (operation) => {
		const run = tail.then(operation, operation);
		tail = run.then(() => {}, () => {});
		return run;
	};
	return {
		api: {
			archivedIds() {
				return domain.global.get().archivedSessionIds;
			},
			archive(sessionId) {
				return enqueue(async () => {
					const state = domain.global.get();
					if (state.archivedSessionIds.includes(sessionId)) return;
					await domain.global.set({
						...state,
						archivedSessionIds: [...state.archivedSessionIds, sessionId]
					});
				});
			},
			restore(sessionId) {
				return enqueue(async () => {
					const state = domain.global.get();
					if (!state.archivedSessionIds.includes(sessionId)) return;
					await domain.global.set({
						...state,
						archivedSessionIds: state.archivedSessionIds.filter((id) => id !== sessionId)
					});
				});
			}
		},
		dispose
	};
}
/** Write one JSON response with no-store caching. */
function json(res, status, body) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify(body));
}
/** Extract the `id` query parameter from a request URL. */
function queryId(url) {
	try {
		return (new URL(url ?? "/", "http://dsh.local").searchParams.get("id") ?? "").trim();
	} catch {
		return "";
	}
}
/** Build the three archive routes against a lazily-resolving API holder and the DSH native archive set. */
function archiveRoutes(api, dshArchived) {
	const notReady = (res) => {
		json(res, 503, { error: "session archive store is not ready" });
	};
	return [
		{
			kind: "exact",
			path: `${ARCHIVE_ROUTE_BASE}/archived`,
			handler: async (_req, res) => {
				const current = api();
				if (current === void 0) {
					notReady(res);
					return;
				}
				try {
					const plugin = [...current.archivedIds()];
					json(res, 200, {
						archivedSessionIds: [.../* @__PURE__ */ new Set([...plugin, ...dshArchived()])],
						restorableSessionIds: plugin
					});
				} catch (error) {
					json(res, 500, { error: String(error) });
				}
			}
		},
		{
			kind: "exact",
			path: `${ARCHIVE_ROUTE_BASE}/archive`,
			handler: async (req, res) => {
				const current = api();
				if (current === void 0) {
					notReady(res);
					return;
				}
				const sessionId = queryId(req.url);
				if (sessionId === "") {
					json(res, 400, { error: "missing or empty \"id\" query parameter" });
					return;
				}
				try {
					await current.archive(sessionId);
					json(res, 200, { ok: true });
				} catch (error) {
					json(res, 500, { error: String(error) });
				}
			}
		},
		{
			kind: "exact",
			path: `${ARCHIVE_ROUTE_BASE}/restore`,
			handler: async (req, res) => {
				const current = api();
				if (current === void 0) {
					notReady(res);
					return;
				}
				const sessionId = queryId(req.url);
				if (sessionId === "") {
					json(res, 400, { error: "missing or empty \"id\" query parameter" });
					return;
				}
				try {
					await current.restore(sessionId);
					json(res, 200, { ok: true });
				} catch (error) {
					json(res, 500, { error: String(error) });
				}
			}
		}
	];
}
const WEB_SERVER_KEYS = ["webServer", "httpServer"];
/**
* Set up the durable archive domain and its Web routes for one plugin fiber.
* Fail-soft: without a storage-domain or Web server service the feature stays
* inert instead of breaking the plugin.
*/
function setupSessionArchive(ctx) {
	const storageDomain = ctx.get("storageDomain");
	if (storageDomain === void 0) {
		ctx.logger.warn("token day: storageDomain service unavailable; session archive disabled");
		return;
	}
	/** The DSH native archive set (workspace registry), read-only. */
	const dshArchivedIds = () => {
		return ctx.get("workspaceRegistry")?.archivedSessionIds ?? [];
	};
	let api;
	let disposeDomain;
	const opened = (async () => {
		try {
			const created = await createSessionArchive(storageDomain);
			api = created.api;
			disposeDomain = created.dispose;
		} catch (error) {
			ctx.logger.warn(`token day: session archive domain failed to open: ${String(error)}`);
		}
	})();
	ctx.effect(() => async () => {
		await opened.catch(() => {});
		if (disposeDomain !== void 0) await disposeDomain();
	}, "token-day: session archive domain");
	let webRegistered = false;
	const registerWebSurface = () => {
		if (webRegistered) return;
		const webServer = ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1]);
		if (webServer === void 0) return;
		webRegistered = true;
		const routes = archiveRoutes(() => api, dshArchivedIds);
		for (const route of routes) ctx.effect(() => webServer.register(route), "token-day: session archive route");
	};
	registerWebSurface();
	ctx.on("internal/service", (name) => {
		if (WEB_SERVER_KEYS.includes(name)) registerWebSurface();
	});
}
//#endregion
//#region src/index.ts
/** Cordis plugin name. */
const name = "token-day-recorder";
/** Host services required for core projection registration and historical replay. */
const inject = [
	"sessionProjections",
	"sessionProjectionCache",
	"sessionQuery",
	"sessions",
	"storageDomain"
];
/** Refresh one readable session without letting an operational failure stop later records or leave an attach race stale. */
async function warmRecord(ctx, record, signal) {
	try {
		const live = ctx.sessions.get(record.header.id);
		if (live !== void 0) await ctx.sessionProjectionCache.write(live);
		else if (record.persisted) {
			await ctx.sessionProjectionCache.coldSnapshot(record.header.id, signal);
			if (signal.aborted) return;
			const attached = ctx.sessions.get(record.header.id);
			if (attached !== void 0) await ctx.sessionProjectionCache.write(attached);
		}
	} catch (error) {
		if (signal.aborted) return;
		ctx.logger.warn(`token day: failed to refresh session "${record.header.id}": ${String(error)}`);
	}
}
/** Populate the new projection's cache sequentially without delaying plugin activation. */
async function warmHistory(ctx, signal) {
	let records;
	try {
		records = await ctx.sessionQuery.listSessions(signal);
	} catch (error) {
		if (signal.aborted) return;
		ctx.logger.warn(`token day: failed to list historical sessions: ${String(error)}`);
		return;
	}
	for (const record of records) {
		if (signal.aborted) return;
		await warmRecord(ctx, record, signal);
	}
}
/** Register the projection, start cancellable fail-soft history warming, and set up the session archive. */
function apply(ctx) {
	ctx.sessionProjections.register(tokenDayProjectionDefinition);
	ctx.effect(() => {
		const controller = new AbortController();
		const operation = warmHistory(ctx, controller.signal);
		return async () => {
			controller.abort(/* @__PURE__ */ new Error("token day plugin disposed"));
			await operation;
		};
	}, "token day: warm historical projections");
	setupSessionArchive(ctx);
}
//#endregion
export { apply, inject, name };

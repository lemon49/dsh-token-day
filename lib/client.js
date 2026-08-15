window.__ModuleLoader__.load({
	id: "dsh-token-day",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:D:\codex\dsh-token-day\src\client\TokenUsageSection.module.css.mjs
		const css = ".K0x3wW_section{width:100%;max-width:960px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:22px;display:flex}.K0x3wW_header{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.K0x3wW_header h2,.K0x3wW_header p,.K0x3wW_block h3,.K0x3wW_status{margin:0}.K0x3wW_header h2{font-size:18px;font-weight:600;line-height:26px}.K0x3wW_header p{max-width:720px;color:var(--dsw-alias-label-tertiary);margin-top:5px;font-size:13px;line-height:20px}.K0x3wW_metrics{grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;display:grid}.K0x3wW_metric{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:7px;min-width:0;padding:13px 14px;display:flex}.K0x3wW_metric span{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}.K0x3wW_metric strong{font-variant-numeric:tabular-nums;text-overflow:ellipsis;font-size:20px;line-height:26px;overflow:hidden}.K0x3wW_activity{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:10px;min-width:0;padding:14px;display:flex}.K0x3wW_activityHead{justify-content:space-between;align-items:flex-end;gap:14px;display:flex}.K0x3wW_activityHead h3,.K0x3wW_activityHead p{margin:0}.K0x3wW_activityHead h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_activityHead p{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:11px;line-height:17px}.K0x3wW_activityGrid{box-sizing:border-box;grid-template-rows:repeat(7,minmax(0,1fr));grid-template-columns:repeat(30,minmax(0,1fr));grid-auto-flow:column;gap:3px;width:100%;min-width:0;padding:2px;display:grid}.K0x3wW_activityCell,.K0x3wW_activityLegend i{background:var(--dsw-alias-bg-module-platform);border:0;border-radius:2px;flex:none;display:block}.K0x3wW_activityCell{aspect-ratio:1;cursor:pointer;width:100%;min-width:0;padding:0}.K0x3wW_activityCell:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_activityCell[data-selected=true]{box-shadow:0 0 0 2px var(--dsw-alias-label-primary)}.K0x3wW_activityLegend i{width:10px;height:10px}.K0x3wW_activityCell[data-future=true]{cursor:default;background:0 0}.K0x3wW_activityCell[data-level=\"1\"],.K0x3wW_activityLegend i[data-level=\"1\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"2\"],.K0x3wW_activityLegend i[data-level=\"2\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"3\"],.K0x3wW_activityLegend i[data-level=\"3\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 64%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"4\"],.K0x3wW_activityLegend i[data-level=\"4\"]{background:var(--dsw-alias-state-business-primary)}.K0x3wW_activityLegend{color:var(--dsw-alias-label-tertiary);white-space:nowrap;align-items:center;gap:4px;font-size:10px;line-height:14px;display:flex}.K0x3wW_insights,.K0x3wW_budget,.K0x3wW_dayDrilldown{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:12px;min-width:0;padding:14px;display:flex}.K0x3wW_insights h3,.K0x3wW_budget h3,.K0x3wW_dayDrilldown h3,.K0x3wW_insights p,.K0x3wW_budget p,.K0x3wW_dayDrilldown p{margin:0}.K0x3wW_insights h3,.K0x3wW_budget h3,.K0x3wW_dayDrilldown h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_insights .K0x3wW_blockHead p,.K0x3wW_budget .K0x3wW_blockHead p,.K0x3wW_dayDrilldown .K0x3wW_blockHead p{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:11px;line-height:17px}.K0x3wW_detailMetrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;display:grid}.K0x3wW_rangeTabs,.K0x3wW_exportControls{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.K0x3wW_rangeTabs button,.K0x3wW_exportControls button,.K0x3wW_quietButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-height:30px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:7px;padding:0 9px;font-size:11px}.K0x3wW_rangeTabs button[aria-pressed=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-business-primary)}.K0x3wW_rangeTabs button:focus-visible,.K0x3wW_exportControls button:focus-visible,.K0x3wW_quietButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_exportControls{justify-content:flex-end}.K0x3wW_exportControls>span{color:var(--dsw-alias-label-tertiary);font-size:11px}.K0x3wW_insightNote{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.K0x3wW_anomalyNotice{color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:10px;font-size:11px;line-height:17px;display:flex}.K0x3wW_anomalyNotice p{margin:0}.K0x3wW_budgetInput{color:var(--dsw-alias-label-tertiary);white-space:nowrap;align-items:center;gap:7px;font-size:11px;display:flex}.K0x3wW_budgetInput input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:128px;height:30px;color:var(--dsw-alias-label-primary);font:inherit;font-variant-numeric:tabular-nums;border-radius:7px;outline:none;padding:0 8px;font-size:12px}.K0x3wW_budgetInput input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent)}.K0x3wW_budgetProgress{align-items:center;gap:10px;display:flex}.K0x3wW_budgetProgress progress{width:min(320px,55%);height:8px;accent-color:var(--dsw-alias-state-business-primary)}.K0x3wW_budgetProgress strong{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:12px}.K0x3wW_budgetWarning{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}.K0x3wW_contributors{flex-direction:column;gap:7px;display:flex}.K0x3wW_contributors>strong{color:var(--dsw-alias-label-secondary);font-size:12px}.K0x3wW_contributors ol{gap:5px;margin:0;padding:0;list-style:none;display:grid}.K0x3wW_contributors li{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:7px;justify-content:space-between;align-items:center;gap:12px;padding:7px 9px;font-size:12px;display:flex}.K0x3wW_contributors li>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.K0x3wW_block{flex-direction:column;gap:10px;min-width:0;display:flex}.K0x3wW_block h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_blockHead{justify-content:space-between;align-items:center;gap:16px;display:flex}.K0x3wW_blockHead input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:min(280px,45%);height:34px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 11px;font-size:12px}.K0x3wW_blockHead input::placeholder{color:var(--dsw-alias-label-tertiary)}.K0x3wW_blockHead input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent)}.K0x3wW_tableWrap{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;min-width:0;overflow:auto}.K0x3wW_tableWrap table{border-collapse:collapse;width:100%;min-width:0;font-size:12px;line-height:18px}.K0x3wW_tableWrap .K0x3wW_modelTable{table-layout:fixed;min-width:580px}.K0x3wW_tableWrap .K0x3wW_sessionTable{min-width:780px}.K0x3wW_modelTable th:first-child,.K0x3wW_modelTable td:first-child{width:30%}.K0x3wW_modelTable th:nth-child(2),.K0x3wW_modelTable td:nth-child(2){width:18%}.K0x3wW_tableWrap th,.K0x3wW_tableWrap td{border-bottom:1px solid var(--dsw-alias-border-l1);text-align:right;vertical-align:middle;white-space:nowrap;padding:10px 12px}.K0x3wW_tableWrap th{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500}.K0x3wW_tableWrap th:first-child,.K0x3wW_tableWrap td:first-child{text-align:left;max-width:270px}.K0x3wW_tableWrap tbody tr:last-child td{border-bottom:0}.K0x3wW_tableWrap tbody tr:hover td{background:var(--dsw-alias-interactive-bg-hover)}.K0x3wW_tableWrap td{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.K0x3wW_tableWrap td strong,.K0x3wW_tableWrap td span{text-overflow:ellipsis;max-width:260px;display:block;overflow:hidden}.K0x3wW_tableWrap td strong{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600}.K0x3wW_tableWrap td span{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px}.K0x3wW_tableWrap td .K0x3wW_tokenValue{max-width:none;color:inherit;font-size:inherit;line-height:inherit;display:inline}.K0x3wW_tableWrap td .K0x3wW_cacheDetail{margin-top:2px}.K0x3wW_analysisEmpty,.K0x3wW_analysisError,.K0x3wW_analysisPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:12px;min-width:0;padding:14px;display:flex}.K0x3wW_analysisEmpty{border-style:dashed}.K0x3wW_analysisError{border-color:var(--dsw-alias-state-error-primary)}.K0x3wW_analysisEmpty h3,.K0x3wW_analysisEmpty p,.K0x3wW_analysisError h3,.K0x3wW_analysisError p,.K0x3wW_analysisPanel h3,.K0x3wW_analysisPanel p{margin:0}.K0x3wW_analysisEmpty h3,.K0x3wW_analysisError h3,.K0x3wW_analysisPanel h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_analysisEmpty p,.K0x3wW_analysisError p,.K0x3wW_analysisPanel .K0x3wW_blockHead p,.K0x3wW_analysisPrivacy{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}.K0x3wW_analysisError p,.K0x3wW_analysisWarning{color:var(--dsw-alias-state-error-primary)}.K0x3wW_analysisCost{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:999px;padding:5px 9px;font-size:11px}.K0x3wW_analysisMetrics{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;display:grid}.K0x3wW_analysisReport{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-module-platform);max-height:640px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word;border-radius:10px;margin:0;padding:14px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;line-height:19px;overflow:auto}.K0x3wW_analysisWarning{font-size:11px;line-height:18px}.K0x3wW_modelSort{color:var(--dsw-alias-label-tertiary);align-items:center;gap:6px;font-size:11px;display:flex}.K0x3wW_modelSort select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:116px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;padding:5px 7px;font-size:12px}.K0x3wW_modelSort select:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_sessionLink{max-width:240px;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;padding:0;font-weight:600;text-decoration:underline #0000;display:block;overflow:hidden}.K0x3wW_sessionLink:hover{text-decoration-color:currentColor}.K0x3wW_sessionLink:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px;border-radius:2px}.K0x3wW_analysisButton{border:1px solid var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, var(--dsw-alias-bg-layer-1));min-height:28px;color:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border-radius:7px;padding:0 9px;font-size:11px}.K0x3wW_analysisButton:disabled{cursor:wait;opacity:.65}.K0x3wW_analysisButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_pricingNotice{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);border-radius:10px;align-items:baseline;gap:8px;padding:10px 12px;font-size:11px;line-height:18px;display:flex}.K0x3wW_pricingNotice strong{color:var(--dsw-alias-label-secondary);white-space:nowrap;font-weight:600}.K0x3wW_pricingNotice p{margin:0}.K0x3wW_priceUnknown{color:var(--dsw-alias-label-tertiary)}.K0x3wW_priceValue{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}.K0x3wW_analysisModelSelect{min-width:180px;color:var(--dsw-alias-label-tertiary);gap:4px;font-size:11px;line-height:16px;display:grid}.K0x3wW_analysisModelSelect select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;padding:5px 7px;font-size:12px}.K0x3wW_analysisModelSelect select:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_analysisScope{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}.K0x3wW_analysisErrorText{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:18px}.K0x3wW_status{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);border-radius:10px;padding:16px;font-size:13px;line-height:20px}@media (width<=860px){.K0x3wW_metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.K0x3wW_detailMetrics,.K0x3wW_analysisMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=580px){.K0x3wW_metrics,.K0x3wW_detailMetrics,.K0x3wW_analysisMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}.K0x3wW_header,.K0x3wW_activityHead,.K0x3wW_blockHead{flex-direction:column;align-items:stretch;gap:8px}.K0x3wW_exportControls{justify-content:flex-start}.K0x3wW_budgetInput{justify-content:space-between}.K0x3wW_pricingNotice{flex-direction:column;align-items:flex-start;gap:2px}.K0x3wW_budgetProgress{flex-direction:column;align-items:flex-start}.K0x3wW_budgetProgress progress,.K0x3wW_blockHead input{width:100%}}.K0x3wW_shareCell{align-items:center;gap:8px;min-width:120px;display:inline-flex}.K0x3wW_shareBar{background:var(--dsw-alias-bg-module-platform);border-radius:3px;width:72px;height:6px;display:inline-block;overflow:hidden}.K0x3wW_shareBar i{background:var(--dsw-alias-brand-primary,#4d6bfe);border-radius:3px;height:100%;display:block}.K0x3wW_shareCell em{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px;font-style:normal}.K0x3wW_chartTotal{color:var(--dsw-alias-label-primary);white-space:nowrap;font-size:14px}.K0x3wW_chartLegend{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;gap:14px;margin:4px 0 12px;font-size:12px;display:flex}.K0x3wW_chartLegend span{align-items:center;gap:6px;display:inline-flex}.K0x3wW_chartLegend i{border-radius:2px;width:10px;height:10px;display:inline-block}.K0x3wW_legendHit{background:#74c0fc}.K0x3wW_legendMiss{background:#4dabf7}.K0x3wW_legendOutput{background:#1864ab}.K0x3wW_chartWrap{position:relative}.K0x3wW_chartSvg{width:100%;height:auto;display:block}.K0x3wW_chartGridLine{stroke:var(--dsw-alias-line-divider,#7f7f7f40);stroke-width:1px}.K0x3wW_chartAxisLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}.K0x3wW_barHit{fill:#74c0fc}.K0x3wW_barMiss{fill:#4dabf7}.K0x3wW_barOutput{fill:#1864ab}.K0x3wW_chartHoverZone{fill:var(--dsw-alias-brand-primary,#4d6bfe);opacity:.08}.K0x3wW_chartTooltip{background:var(--dsw-alias-bg-module-floating,#1f2430);border:1px solid var(--dsw-alias-line-divider,#7f7f7f40);min-width:170px;color:var(--dsw-alias-label-secondary);pointer-events:none;z-index:2;border-radius:8px;flex-direction:column;gap:2px;padding:8px 10px;font-size:11px;line-height:16px;display:flex;position:absolute;top:8px;transform:translate(-50%);box-shadow:0 4px 14px #00000040}.K0x3wW_chartTooltip strong{color:var(--dsw-alias-label-primary);font-size:12px}.K0x3wW_chartTooltip em{color:var(--dsw-alias-label-primary);margin-top:2px;font-style:normal}.K0x3wW_modelScroll{max-height:340px;overflow-y:auto}.K0x3wW_modelScroll .K0x3wW_tableWrap{overflow:visible}.K0x3wW_chartTotalBlock{flex-direction:column;align-items:flex-end;gap:2px;display:flex}.K0x3wW_chartTotalLabel{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px}.K0x3wW_chartTotal{color:var(--dsw-alias-label-primary);white-space:nowrap;font-variant-numeric:tabular-nums;font-size:20px;font-weight:600}";
		const tagId = "dsh-token-day/TokenUsageSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-day";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TokenUsageSection_module_css_default = {
			"chartTotal": "K0x3wW_chartTotal",
			"analysisCost": "K0x3wW_analysisCost",
			"chartHoverZone": "K0x3wW_chartHoverZone",
			"barOutput": "K0x3wW_barOutput",
			"analysisPanel": "K0x3wW_analysisPanel",
			"header": "K0x3wW_header",
			"sessionLink": "K0x3wW_sessionLink",
			"analysisScope": "K0x3wW_analysisScope",
			"chartTotalBlock": "K0x3wW_chartTotalBlock",
			"tokenValue": "K0x3wW_tokenValue",
			"chartLegend": "K0x3wW_chartLegend",
			"budget": "K0x3wW_budget",
			"sessionTable": "K0x3wW_sessionTable",
			"activityHead": "K0x3wW_activityHead",
			"priceValue": "K0x3wW_priceValue",
			"chartTotalLabel": "K0x3wW_chartTotalLabel",
			"dayDrilldown": "K0x3wW_dayDrilldown",
			"rangeTabs": "K0x3wW_rangeTabs",
			"legendMiss": "K0x3wW_legendMiss",
			"priceUnknown": "K0x3wW_priceUnknown",
			"activityGrid": "K0x3wW_activityGrid",
			"pricingNotice": "K0x3wW_pricingNotice",
			"shareBar": "K0x3wW_shareBar",
			"barHit": "K0x3wW_barHit",
			"metrics": "K0x3wW_metrics",
			"activity": "K0x3wW_activity",
			"analysisMetrics": "K0x3wW_analysisMetrics",
			"modelSort": "K0x3wW_modelSort",
			"modelScroll": "K0x3wW_modelScroll",
			"anomalyNotice": "K0x3wW_anomalyNotice",
			"chartSvg": "K0x3wW_chartSvg",
			"analysisError": "K0x3wW_analysisError",
			"budgetProgress": "K0x3wW_budgetProgress",
			"analysisReport": "K0x3wW_analysisReport",
			"cacheDetail": "K0x3wW_cacheDetail",
			"chartTooltip": "K0x3wW_chartTooltip",
			"shareCell": "K0x3wW_shareCell",
			"budgetWarning": "K0x3wW_budgetWarning",
			"barMiss": "K0x3wW_barMiss",
			"insights": "K0x3wW_insights",
			"section": "K0x3wW_section",
			"analysisButton": "K0x3wW_analysisButton",
			"block": "K0x3wW_block",
			"analysisModelSelect": "K0x3wW_analysisModelSelect",
			"legendHit": "K0x3wW_legendHit",
			"legendOutput": "K0x3wW_legendOutput",
			"analysisEmpty": "K0x3wW_analysisEmpty",
			"exportControls": "K0x3wW_exportControls",
			"status": "K0x3wW_status",
			"quietButton": "K0x3wW_quietButton",
			"activityCell": "K0x3wW_activityCell",
			"budgetInput": "K0x3wW_budgetInput",
			"chartWrap": "K0x3wW_chartWrap",
			"insightNote": "K0x3wW_insightNote",
			"tableWrap": "K0x3wW_tableWrap",
			"blockHead": "K0x3wW_blockHead",
			"analysisErrorText": "K0x3wW_analysisErrorText",
			"detailMetrics": "K0x3wW_detailMetrics",
			"metric": "K0x3wW_metric",
			"analysisPrivacy": "K0x3wW_analysisPrivacy",
			"modelTable": "K0x3wW_modelTable",
			"analysisWarning": "K0x3wW_analysisWarning",
			"activityLegend": "K0x3wW_activityLegend",
			"chartGridLine": "K0x3wW_chartGridLine",
			"chartAxisLabel": "K0x3wW_chartAxisLabel",
			"contributors": "K0x3wW_contributors"
		};
		//#endregion
		//#region src/client/TokenUsageSection.tsx
		/** Detached zero buckets for dashboard folds. */
		function zeroBuckets() {
			return {
				uncachedInputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0
			};
		}
		/** Add four disjoint token buckets. */
		function addBuckets(left, right) {
			return {
				uncachedInputTokens: left.uncachedInputTokens + right.uncachedInputTokens,
				outputTokens: left.outputTokens + right.outputTokens,
				cacheReadTokens: left.cacheReadTokens + right.cacheReadTokens,
				cacheWriteTokens: left.cacheWriteTokens + right.cacheWriteTokens
			};
		}
		/** Stable UTC day key used by durable Host records. */
		function dayKey(time) {
			return new Date(time).toISOString().slice(0, 10);
		}
		/** Prompt-side total across uncached input and cache traffic. */
		function inputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/** Complete request/response total without double-counting reasoning output. */
		function totalTokens(usage) {
			return inputTokens(usage) + usage.outputTokens;
		}
		/** Locale-aware exact integer formatting. */
		function formatTokens(value) {
			return new Intl.NumberFormat().format(value);
		}
		/** Format a ratio without implying fractional measurement precision. */
		function formatPercent(value) {
			return `${Math.round(value * 100)}%`;
		}
		/** Compact a token count with a stable K/M/B suffix for dense dashboard cells. */
		function formatCompactTokens(value) {
			const unit = [
				{
					divisor: 1e9,
					suffix: "B"
				},
				{
					divisor: 1e6,
					suffix: "M"
				},
				{
					divisor: 1e3,
					suffix: "K"
				}
			].find((candidate) => value >= candidate.divisor);
			if (unit === void 0) return formatTokens(value);
			return `${new Intl.NumberFormat(void 0, { maximumFractionDigits: 1 }).format(value / unit.divisor)}${unit.suffix}`;
		}
		/** Stable provider/model identity for React lists and aggregation. */
		function modelKey(model) {
			return JSON.stringify([model.provider, model.model]);
		}
		/** Whether a dashboard-only row contains usage whose model route is unavailable. */
		function isUnattributed(model) {
			return model.provider === "" && model.model === "";
		}
		/** Total request attempts recorded for one route. */
		function recordedRequests(model) {
			return model.assistantRequests + model.compactionRequests;
		}
		/** One session summary projected into a usage row, or null when it has no usage. */
		function sessionRow(summary) {
			const recorded = summary.projectionValues?.tokenDay;
			if (recorded === void 0) return null;
			const usage = recorded.usage;
			if (totalTokens(usage) === 0 && recorded.assistantRequests === 0 && recorded.compactionRequests === 0) return null;
			return {
				id: summary.id,
				assistantRequests: recorded.assistantRequests,
				compactionRequests: recorded.compactionRequests,
				billedRequests: recorded.billedRequests,
				usage: { ...usage },
				models: recorded.models,
				days: recorded.days
			};
		}
		/** Merge one model day entry into a map, returning the updated entry. */
		function mergeModelDay(map, day) {
			const current = map.get(day.date);
			map.set(day.date, current === void 0 ? day : {
				date: day.date,
				requests: {
					assistant: current.requests.assistant + day.requests.assistant,
					compaction: current.requests.compaction + day.requests.compaction,
					billed: current.requests.billed + day.requests.billed
				},
				usage: addBuckets(current.usage, day.usage)
			});
		}
		/** Aggregate session summaries into totals and provider/model records. */
		function aggregateUsage(summaries) {
			const models = /* @__PURE__ */ new Map();
			const days = /* @__PURE__ */ new Map();
			let usage = zeroBuckets();
			let assistantRequests = 0;
			let compactionRequests = 0;
			let billedRequests = 0;
			for (const summary of summaries) {
				const row = sessionRow(summary);
				if (row === null) continue;
				usage = addBuckets(usage, row.usage);
				assistantRequests += row.assistantRequests;
				compactionRequests += row.compactionRequests;
				billedRequests += row.billedRequests;
				for (const day of row.days) {
					const current = days.get(day.date);
					days.set(day.date, current === void 0 ? {
						date: day.date,
						requests: { ...day.requests },
						usage: { ...day.usage }
					} : {
						date: day.date,
						requests: {
							assistant: current.requests.assistant + day.requests.assistant,
							compaction: current.requests.compaction + day.requests.compaction,
							billed: current.requests.billed + day.requests.billed
						},
						usage: addBuckets(current.usage, day.usage)
					});
				}
				for (const model of row.models) {
					const key = modelKey(model);
					const current = models.get(key);
					if (current === void 0) {
						models.set(key, {
							...model,
							usage: { ...model.usage },
							days: [...model.days]
						});
						continue;
					}
					const mergedDays = new Map(current.days.map((day) => [day.date, day]));
					for (const day of model.days) mergeModelDay(mergedDays, day);
					models.set(key, {
						...current,
						assistantRequests: current.assistantRequests + model.assistantRequests,
						compactionRequests: current.compactionRequests + model.compactionRequests,
						billedRequests: current.billedRequests + model.billedRequests,
						usage: addBuckets(current.usage, model.usage),
						days: [...mergedDays.values()].sort((left, right) => left.date.localeCompare(right.date))
					});
				}
			}
			return {
				usage,
				assistantRequests,
				compactionRequests,
				billedRequests,
				models: [...models.values()].sort((left, right) => totalTokens(right.usage) - totalTokens(left.usage) || left.provider.localeCompare(right.provider) || left.model.localeCompare(right.model)),
				days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date))
			};
		}
		/** Build a newest-inclusive UTC date range. */
		function datesEndingOn(now, length) {
			const end = /* @__PURE__ */ new Date(`${dayKey(now)}T00:00:00.000Z`);
			end.setUTCDate(end.getUTCDate() - length + 1);
			const dates = [];
			for (let offset = 0; offset < length; offset += 1) {
				const date = new Date(end);
				date.setUTCDate(date.getUTCDate() + offset);
				dates.push(dayKey(date.getTime()));
			}
			return dates;
		}
		/** Aggregate one fixed UTC date range from a daily lookup. */
		function rangeAggregate(days, range, now = Date.now()) {
			const byDate = new Map(days.map((day) => [day.date, day]));
			let requests = 0;
			let billed = 0;
			let usage = zeroBuckets();
			let activeDays = 0;
			const records = [];
			for (const date of datesEndingOn(now, range)) {
				const day = byDate.get(date);
				if (day === void 0) continue;
				const dayRequests = day.requests.assistant + day.requests.compaction;
				requests += dayRequests;
				billed += day.requests.billed;
				usage = addBuckets(usage, day.usage);
				if (dayRequests > 0 || totalTokens(day.usage) > 0) activeDays += 1;
				records.push(day);
			}
			return {
				requests,
				billed,
				usage,
				activeDays,
				records
			};
		}
		/** Aggregate one fixed UTC date range across model routes. */
		function rangeModels(models, range, now = Date.now()) {
			const dates = new Set(datesEndingOn(now, range));
			const result = [];
			for (const model of models) {
				let assistant = 0;
				let compaction = 0;
				let billed = 0;
				let usage = zeroBuckets();
				let hasAny = false;
				for (const day of model.days) {
					if (!dates.has(day.date)) continue;
					hasAny = true;
					assistant += day.requests.assistant;
					compaction += day.requests.compaction;
					billed += day.requests.billed;
					usage = addBuckets(usage, day.usage);
				}
				if (!hasAny) continue;
				result.push({
					provider: model.provider,
					model: model.model,
					assistantRequests: assistant,
					compactionRequests: compaction,
					billedRequests: billed,
					usage,
					days: []
				});
			}
			return result.sort((left, right) => totalTokens(right.usage) - totalTokens(left.usage) || left.provider.localeCompare(right.provider) || left.model.localeCompare(right.model));
		}
		/** Render a summary metric card with exact values available on hover. */
		function Metric({ label, value }) {
			const display = typeof value === "number" ? formatCompactTokens(value) : value;
			const exact = typeof value === "number" ? formatTokens(value) : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.metric,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
					...exact === void 0 ? {} : { title: exact },
					children: display
				})]
			});
		}
		/** Build exactly 30 Monday-first calendar weeks, including blank future days this week. */
		function activityCalendar(days, now = Date.now()) {
			const byDate = new Map(days.map((day) => [day.date, day]));
			const today = dayKey(now);
			const end = /* @__PURE__ */ new Date(`${today}T00:00:00.000Z`);
			const start = new Date(end);
			start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7 - 203);
			const dates = [];
			for (const cursor = new Date(start); dates.length < 210; cursor.setUTCDate(cursor.getUTCDate() + 1)) dates.push(dayKey(cursor.getTime()));
			const maximum = Math.max(0, ...dates.filter((date) => date <= today).map((date) => {
				const day = byDate.get(date);
				return day === void 0 ? 0 : day.requests.assistant + day.requests.compaction;
			}));
			return dates.map((date) => {
				const future = date > today;
				const day = byDate.get(date);
				const requests = future ? 0 : day === void 0 ? 0 : day.requests.assistant + day.requests.compaction;
				return {
					date,
					requests,
					tokens: future ? 0 : day === void 0 ? 0 : totalTokens(day.usage),
					usage: future ? zeroBuckets() : day === void 0 ? zeroBuckets() : { ...day.usage },
					level: requests === 0 || maximum === 0 ? 0 : Math.ceil(requests / maximum * 4),
					future
				};
			});
		}
		/** Render a GitHub-style calendar heatmap of daily request activity. */
		function ActivityHeatmap({ days, t }) {
			const calendar = (0, react.useMemo)(() => activityCalendar(days), [days]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.activity,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: TokenUsageSection_module_css_default.activityHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("activity") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("activityIntro") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.activityLegend,
						"aria-label": t("activity"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("less") }),
							[
								0,
								1,
								2,
								3,
								4
							].map((level) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "data-level": level }, level)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("more") })
						]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: TokenUsageSection_module_css_default.activityGrid,
					role: "grid",
					"aria-label": t("activity"),
					children: calendar.map((day) => {
						const details = day.future ? void 0 : t("activityTooltip", {
							date: day.date,
							requests: formatTokens(day.requests),
							total: formatTokens(day.tokens),
							input: formatTokens(inputTokens(day.usage)),
							output: formatTokens(day.usage.outputTokens),
							cacheRead: formatTokens(day.usage.cacheReadTokens),
							cacheWrite: formatTokens(day.usage.cacheWriteTokens)
						});
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: TokenUsageSection_module_css_default.activityCell,
							type: "button",
							role: "gridcell",
							"data-level": day.level,
							"data-future": day.future ? "true" : void 0,
							disabled: day.future,
							...details === void 0 ? {} : {
								title: details,
								"aria-label": details
							}
						}, day.date);
					})
				})]
			});
		}
		/** Render the model table scoped to the selected date range. */
		function ModelTable({ models, t }) {
			const total = models.reduce((sum, model) => sum + totalTokens(model.usage), 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.block,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: TokenUsageSection_module_css_default.blockHead,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("modelBreakdown") })
				}), models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TokenUsageSection_module_css_default.status,
					children: t("emptyModels")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: TokenUsageSection_module_css_default.modelScroll,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: TokenUsageSection_module_css_default.tableWrap,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
							className: TokenUsageSection_module_css_default.modelTable,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("modelCol") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("providerCol") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("requestsCol") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("billedCol") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("tokensCol") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("shareCol") })
							] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: models.map((model) => {
								const share = total === 0 ? 0 : totalTokens(model.usage) / total;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: isUnattributed(model) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("unknownRoute") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: model.model }) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: model.provider }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: formatTokens(recordedRequests(model)) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: formatTokens(model.billedRequests) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: TokenUsageSection_module_css_default.tokenValue,
										title: formatTokens(totalTokens(model.usage)),
										children: formatCompactTokens(totalTokens(model.usage))
									}) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: TokenUsageSection_module_css_default.shareCell,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: TokenUsageSection_module_css_default.shareBar,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${Math.round(share * 100)}%` } })
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: formatPercent(share) })]
									}) })
								] }, modelKey(model));
							}) })]
						})
					})
				})]
			});
		}
		/** Build per-day three-segment slices from daily records, oldest first (left = earliest, right = today). */
		function tokenSlices(records) {
			return records.slice().sort((left, right) => left.date.localeCompare(right.date)).map((day) => {
				const hit = day.usage.cacheReadTokens;
				const miss = day.usage.uncachedInputTokens + day.usage.cacheWriteTokens;
				const output = day.usage.outputTokens;
				return {
					date: day.date,
					hit,
					miss,
					output,
					total: hit + miss + output
				};
			});
		}
		/** Pick a readable axis maximum at a 1/2/2.5/5 step for the stacked chart. */
		function niceMaximum(value) {
			if (value <= 0) return 1;
			const magnitude = 10 ** Math.floor(Math.log10(value));
			for (const step of [
				1,
				2,
				2.5,
				5,
				10
			]) {
				const candidate = step * magnitude;
				if (candidate >= value) return candidate;
			}
			return 10 * magnitude;
		}
		/** Format one ISO date as M/D without leading zeros (official style). */
		function shortDate(iso) {
			const [year, month, day] = iso.split("-");
			return `${Number(month)}/${Number(day)}`;
		}
		/** Render the stacked daily Tokens bar chart (cache hit / cache miss / output). */
		function TokensChart({ records, rangeLabel, t }) {
			const slices = (0, react.useMemo)(() => tokenSlices(records), [records]);
			const [hovered, setHovered] = (0, react.useState)();
			const total = slices.reduce((sum, slice) => sum + slice.total, 0);
			if (slices.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.block,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("tokensChart") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TokenUsageSection_module_css_default.status,
					children: t("empty")
				})]
			});
			const maximum = niceMaximum(Math.max(...slices.map((slice) => slice.total)));
			const width = 820;
			const height = 264;
			const padTop = 16;
			const padLeft = 56;
			const plotWidth = 754;
			const plotHeight = 218;
			const column = plotWidth / slices.length;
			const barWidth = Math.min(52, Math.max(4, column * .68));
			const axisTicks = [
				0,
				.5,
				1
			].map((ratio) => maximum * ratio);
			const y = (value) => padTop + plotHeight * (1 - value / maximum);
			const labelEvery = Math.max(1, Math.ceil(slices.length / 7));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.block,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.blockHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("tokensChart") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("tokensChartIntro") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: TokenUsageSection_module_css_default.chartTotalBlock,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TokenUsageSection_module_css_default.chartTotalLabel,
								children: t("chartRange", { range: rangeLabel })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								className: TokenUsageSection_module_css_default.chartTotal,
								title: formatTokens(total),
								children: formatTokens(total)
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.chartLegend,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: TokenUsageSection_module_css_default.legendHit }), t("cacheHitInput")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: TokenUsageSection_module_css_default.legendMiss }), t("cacheMissInput")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: TokenUsageSection_module_css_default.legendOutput }), t("output")] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.chartWrap,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							viewBox: `0 0 ${width} ${height}`,
							role: "img",
							"aria-label": t("tokensChart"),
							className: TokenUsageSection_module_css_default.chartSvg,
							children: [axisTicks.map((ratio) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
								x1: padLeft,
								x2: 810,
								y1: y(maximum * ratio),
								y2: y(maximum * ratio),
								className: TokenUsageSection_module_css_default.chartGridLine
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								x: 48,
								y: y(maximum * ratio) + 4,
								textAnchor: "end",
								className: TokenUsageSection_module_css_default.chartAxisLabel,
								children: ratio === 0 ? "0" : formatCompactTokens(maximum * ratio)
							})] }, ratio)), slices.map((slice, index) => {
								const x = padLeft + column * index + (column - barWidth) / 2;
								const hover = hovered === index;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									onMouseEnter: () => {
										setHovered(index);
									},
									onMouseLeave: () => {
										setHovered(void 0);
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: padLeft + column * index,
											y: padTop,
											width: column,
											height: plotHeight,
											fill: "transparent"
										}),
										slice.total > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
												x,
												y: y(slice.output),
												width: barWidth,
												height: y(0) - y(slice.output),
												className: TokenUsageSection_module_css_default.barOutput
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
												x,
												y: y(slice.output + slice.miss),
												width: barWidth,
												height: y(slice.output) - y(slice.output + slice.miss),
												className: TokenUsageSection_module_css_default.barMiss
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
												x,
												y: y(slice.total),
												width: barWidth,
												height: y(slice.output + slice.miss) - y(slice.total),
												className: TokenUsageSection_module_css_default.barHit
											})
										] }) : null,
										index % labelEvery === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											x: padLeft + column * index + column / 2,
											y: 256,
											textAnchor: "middle",
											className: TokenUsageSection_module_css_default.chartAxisLabel,
											children: shortDate(slice.date)
										}) : null,
										hover ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: padLeft + column * index,
											y: padTop,
											width: column,
											height: plotHeight,
											className: TokenUsageSection_module_css_default.chartHoverZone
										}) : null
									]
								}, slice.date);
							})]
						}), hovered === void 0 ? null : (() => {
							const slice = slices[hovered];
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: TokenUsageSection_module_css_default.chartTooltip,
								style: { left: `${(padLeft + column * hovered + column / 2) / width * 100}%` },
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: shortDate(slice.date) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("cacheHitInput"),
										" · ",
										formatTokens(slice.hit)
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("cacheMissInput"),
										" · ",
										formatTokens(slice.miss)
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("output"),
										" · ",
										formatTokens(slice.output)
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("em", { children: [
										t("totalTokens"),
										" · ",
										formatTokens(slice.total)
									] })
								]
							});
						})()]
					})
				]
			});
		}
		/** Render durable Token billing across all listed sessions. */
		function TokenUsageSection({ useSessions, t }) {
			const phase = useSessions((state) => state.phase);
			const ids = useSessions((state) => state.ids);
			const byId = useSessions((state) => state.byId);
			const [range, setRange] = (0, react.useState)(30);
			const data = (0, react.useMemo)(() => aggregateUsage(ids.map((id) => byId[id]).filter((value) => value !== void 0)), [byId, ids]);
			const period = (0, react.useMemo)(() => rangeAggregate(data.days, range), [data.days, range]);
			const scopedModels = (0, react.useMemo)(() => rangeModels(data.models, range), [data.models, range]);
			const rangeLabel = range === 1 ? t("today") : t("rangeDays", { count: range });
			if (phase !== "ready" && ids.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: TokenUsageSection_module_css_default.status,
				children: t("loading")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: TokenUsageSection_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
					className: TokenUsageSection_module_css_default.header,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("intro") })] })
				}), data.days.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TokenUsageSection_module_css_default.status,
					children: t("empty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: TokenUsageSection_module_css_default.rangeTabs,
						"aria-label": rangeLabel,
						children: [
							1,
							7,
							30,
							90
						].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": range === value,
							onClick: () => {
								setRange(value);
							},
							children: value === 1 ? t("today") : t("rangeDays", { count: value })
						}, value))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.metrics,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
								label: t("requests"),
								value: period.requests
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
								label: t("billed"),
								value: period.billed
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
								label: t("totalTokens"),
								value: totalTokens(period.usage)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
								label: t("cacheHitTokens"),
								value: period.usage.cacheReadTokens
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
								label: t("activeDays"),
								value: range === 1 ? `${period.activeDays}/1` : `${period.activeDays}/${range}`
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActivityHeatmap, {
						days: data.days,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelTable, {
						models: scopedModels,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TokensChart, {
						records: period.records,
						rangeLabel,
						t
					})
				] })]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Dictionary namespace owned by the Token day dashboard. */
		const NS = "settings.tokenDay";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			nav: "Token 用量",
			title: "Token 计费统计",
			intro: "基于 DSH 持久会话日志统计模型请求与 Token 用量，不保存提示词或回复正文。",
			rangeDays: "{count} 天",
			today: "当日",
			requests: "请求总数",
			billed: "已计量",
			totalTokens: "Token 总数",
			cacheHitTokens: "缓存命中 Token",
			activeDays: "活跃天数",
			activity: "每日活动",
			activityIntro: "最近 30 周，颜色越深表示当日请求数越高。悬停查看明细。",
			activityTooltip: "{date}\n请求 {requests}\n总计 {total} Token\n输入 {input} · 输出 {output}\n缓存：读 {cacheRead} · 写 {cacheWrite}",
			less: "少",
			more: "多",
			modelBreakdown: "模型",
			modelCol: "模型",
			providerCol: "提供方",
			requestsCol: "请求数",
			billedCol: "已计量",
			tokensCol: "Token 数",
			shareCol: "占比",
			unknownRoute: "模型信息不可用",
			emptyModels: "该时间段内暂无模型用量记录。",
			tokensChart: "Tokens",
			tokensChartIntro: "按天展示输入（命中缓存 / 未命中缓存）与输出 Token 用量。",
			chartRange: "{range}",
			cacheHitInput: "输入 (命中缓存)",
			cacheMissInput: "输入 (未命中缓存)",
			output: "输出",
			empty: "暂无 Token 使用记录。",
			loading: "正在读取会话统计…"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			nav: "Token usage",
			title: "Token billing statistics",
			intro: "Counts model requests and Token usage from durable DSH session logs without storing prompt or response text.",
			rangeDays: "{count} days",
			today: "Today",
			requests: "Total requests",
			billed: "Billed",
			totalTokens: "Total tokens",
			cacheHitTokens: "Cache-hit tokens",
			activeDays: "Active days",
			activity: "Daily activity",
			activityIntro: "Last 30 weeks. Darker cells represent higher daily request counts. Hover for details.",
			activityTooltip: "{date}\nRequests {requests}\nTotal {total} tokens\nInput {input} · Output {output}\nCache: read {cacheRead} · write {cacheWrite}",
			less: "Less",
			more: "More",
			modelBreakdown: "Models",
			modelCol: "Model",
			providerCol: "Provider",
			requestsCol: "Requests",
			billedCol: "Billed",
			tokensCol: "Tokens",
			shareCol: "Share",
			unknownRoute: "Model unavailable",
			emptyModels: "No model usage recorded in this period.",
			tokensChart: "Tokens",
			tokensChartIntro: "Daily input (cache-hit / cache-miss) and output token usage.",
			chartRange: "{range}",
			cacheHitInput: "Input (cache hit)",
			cacheMissInput: "Input (cache miss)",
			output: "Output",
			empty: "No token usage has been recorded.",
			loading: "Reading session usage…"
		};
		//#endregion
		//#region src/client/index.ts
		/** Client services required by the Settings contribution. */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		/** Contribute a localized Token billing page to Settings. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "token-day: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "token-day",
				order: 30,
				label: () => t("nav"),
				locale: NS
			}, TokenUsageSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
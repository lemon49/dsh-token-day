window.__ModuleLoader__.load({
	id: "dsh-token-day",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:D:\codex\dsh-token-day\src\client\TokenUsageSection.module.css.mjs
		const css$1 = ".K0x3wW_section{width:100%;max-width:960px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:22px;display:flex}.K0x3wW_header{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.K0x3wW_header h2,.K0x3wW_header p,.K0x3wW_block h3,.K0x3wW_status{margin:0}.K0x3wW_header h2{font-size:18px;font-weight:600;line-height:26px}.K0x3wW_header p{max-width:720px;color:var(--dsw-alias-label-tertiary);margin-top:5px;font-size:13px;line-height:20px}.K0x3wW_metrics{grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;display:grid}.K0x3wW_metric{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:7px;min-width:0;padding:13px 14px;display:flex}.K0x3wW_metric span{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}.K0x3wW_metric strong{font-variant-numeric:tabular-nums;text-overflow:ellipsis;font-size:20px;line-height:26px;overflow:hidden}.K0x3wW_activity{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:10px;min-width:0;padding:14px;display:flex}.K0x3wW_activityHead{justify-content:space-between;align-items:flex-end;gap:14px;display:flex}.K0x3wW_activityHead h3,.K0x3wW_activityHead p{margin:0}.K0x3wW_activityHead h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_activityHead p{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:11px;line-height:17px}.K0x3wW_activityGrid{box-sizing:border-box;grid-template-rows:repeat(7,16px);grid-auto-flow:column;gap:2px;width:max-content;min-width:0;max-width:100%;margin:0 auto;padding:2px;display:grid;overflow-x:auto}.K0x3wW_activityCell,.K0x3wW_activityLegend i{background:var(--dsw-alias-bg-module-platform);border:0;border-radius:2px;flex:none;display:block}.K0x3wW_activityCell{cursor:pointer;width:16px;min-width:0;height:16px;padding:0}.K0x3wW_activityCell:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_activityCell[data-selected=true]{box-shadow:0 0 0 2px var(--dsw-alias-label-primary)}.K0x3wW_activityLegend i{width:10px;height:10px}.K0x3wW_activityCell[data-future=true]{cursor:default;background:0 0}.K0x3wW_activityCell[data-level=\"1\"],.K0x3wW_activityLegend i[data-level=\"1\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"2\"],.K0x3wW_activityLegend i[data-level=\"2\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"3\"],.K0x3wW_activityLegend i[data-level=\"3\"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 64%, var(--dsw-alias-bg-module-platform))}.K0x3wW_activityCell[data-level=\"4\"],.K0x3wW_activityLegend i[data-level=\"4\"]{background:var(--dsw-alias-state-business-primary)}.K0x3wW_activityLegend{color:var(--dsw-alias-label-tertiary);white-space:nowrap;align-items:center;gap:4px;font-size:10px;line-height:14px;display:flex}.K0x3wW_insights,.K0x3wW_budget,.K0x3wW_dayDrilldown{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:12px;min-width:0;padding:14px;display:flex}.K0x3wW_insights h3,.K0x3wW_budget h3,.K0x3wW_dayDrilldown h3,.K0x3wW_insights p,.K0x3wW_budget p,.K0x3wW_dayDrilldown p{margin:0}.K0x3wW_insights h3,.K0x3wW_budget h3,.K0x3wW_dayDrilldown h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_insights .K0x3wW_blockHead p,.K0x3wW_budget .K0x3wW_blockHead p,.K0x3wW_dayDrilldown .K0x3wW_blockHead p{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:11px;line-height:17px}.K0x3wW_detailMetrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;display:grid}.K0x3wW_rangeTabs,.K0x3wW_exportControls{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.K0x3wW_rangeTabs button,.K0x3wW_exportControls button,.K0x3wW_quietButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-height:30px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:7px;padding:0 9px;font-size:11px}.K0x3wW_rangeTabs button[aria-pressed=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-business-primary)}.K0x3wW_rangeTabs button:focus-visible,.K0x3wW_exportControls button:focus-visible,.K0x3wW_quietButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_exportControls{justify-content:flex-end}.K0x3wW_exportControls>span{color:var(--dsw-alias-label-tertiary);font-size:11px}.K0x3wW_insightNote{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.K0x3wW_anomalyNotice{color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:10px;font-size:11px;line-height:17px;display:flex}.K0x3wW_anomalyNotice p{margin:0}.K0x3wW_budgetInput{color:var(--dsw-alias-label-tertiary);white-space:nowrap;align-items:center;gap:7px;font-size:11px;display:flex}.K0x3wW_budgetInput input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:128px;height:30px;color:var(--dsw-alias-label-primary);font:inherit;font-variant-numeric:tabular-nums;border-radius:7px;outline:none;padding:0 8px;font-size:12px}.K0x3wW_budgetInput input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent)}.K0x3wW_budgetProgress{align-items:center;gap:10px;display:flex}.K0x3wW_budgetProgress progress{width:min(320px,55%);height:8px;accent-color:var(--dsw-alias-state-business-primary)}.K0x3wW_budgetProgress strong{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:12px}.K0x3wW_budgetWarning{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}.K0x3wW_contributors{flex-direction:column;gap:7px;display:flex}.K0x3wW_contributors>strong{color:var(--dsw-alias-label-secondary);font-size:12px}.K0x3wW_contributors ol{gap:5px;margin:0;padding:0;list-style:none;display:grid}.K0x3wW_contributors li{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:7px;justify-content:space-between;align-items:center;gap:12px;padding:7px 9px;font-size:12px;display:flex}.K0x3wW_contributors li>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.K0x3wW_block{flex-direction:column;gap:10px;min-width:0;display:flex}.K0x3wW_block h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_blockHead{justify-content:space-between;align-items:center;gap:16px;display:flex}.K0x3wW_blockHead input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:min(280px,45%);height:34px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 11px;font-size:12px}.K0x3wW_blockHead input::placeholder{color:var(--dsw-alias-label-tertiary)}.K0x3wW_blockHead input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent)}.K0x3wW_tableWrap{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;min-width:0;overflow:auto}.K0x3wW_tableWrap table{border-collapse:collapse;width:100%;min-width:0;font-size:12px;line-height:18px}.K0x3wW_tableWrap .K0x3wW_modelTable{table-layout:fixed;min-width:580px}.K0x3wW_tableWrap .K0x3wW_sessionTable{min-width:780px}.K0x3wW_modelTable th:first-child,.K0x3wW_modelTable td:first-child{width:30%}.K0x3wW_modelTable th:nth-child(2),.K0x3wW_modelTable td:nth-child(2){width:18%}.K0x3wW_tableWrap th,.K0x3wW_tableWrap td{border-bottom:1px solid var(--dsw-alias-border-l1);text-align:right;vertical-align:middle;white-space:nowrap;padding:10px 12px}.K0x3wW_tableWrap th{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500}.K0x3wW_tableWrap th:first-child,.K0x3wW_tableWrap td:first-child{text-align:left;max-width:270px}.K0x3wW_tableWrap tbody tr:last-child td{border-bottom:0}.K0x3wW_tableWrap tbody tr:hover td{background:var(--dsw-alias-interactive-bg-hover)}.K0x3wW_tableWrap td{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.K0x3wW_tableWrap td strong,.K0x3wW_tableWrap td span{text-overflow:ellipsis;max-width:260px;display:block;overflow:hidden}.K0x3wW_tableWrap td strong{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600}.K0x3wW_tableWrap td span{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px}.K0x3wW_tableWrap td .K0x3wW_tokenValue{max-width:none;color:inherit;font-size:inherit;line-height:inherit;display:inline}.K0x3wW_tableWrap td .K0x3wW_cacheDetail{margin-top:2px}.K0x3wW_analysisEmpty,.K0x3wW_analysisError,.K0x3wW_analysisPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:12px;min-width:0;padding:14px;display:flex}.K0x3wW_analysisEmpty{border-style:dashed}.K0x3wW_analysisError{border-color:var(--dsw-alias-state-error-primary)}.K0x3wW_analysisEmpty h3,.K0x3wW_analysisEmpty p,.K0x3wW_analysisError h3,.K0x3wW_analysisError p,.K0x3wW_analysisPanel h3,.K0x3wW_analysisPanel p{margin:0}.K0x3wW_analysisEmpty h3,.K0x3wW_analysisError h3,.K0x3wW_analysisPanel h3{font-size:14px;font-weight:600;line-height:22px}.K0x3wW_analysisEmpty p,.K0x3wW_analysisError p,.K0x3wW_analysisPanel .K0x3wW_blockHead p,.K0x3wW_analysisPrivacy{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}.K0x3wW_analysisError p,.K0x3wW_analysisWarning{color:var(--dsw-alias-state-error-primary)}.K0x3wW_analysisCost{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:999px;padding:5px 9px;font-size:11px}.K0x3wW_analysisMetrics{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;display:grid}.K0x3wW_analysisReport{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-module-platform);max-height:640px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word;border-radius:10px;margin:0;padding:14px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;line-height:19px;overflow:auto}.K0x3wW_analysisWarning{font-size:11px;line-height:18px}.K0x3wW_modelSort{color:var(--dsw-alias-label-tertiary);align-items:center;gap:6px;font-size:11px;display:flex}.K0x3wW_modelSort select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:116px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;padding:5px 7px;font-size:12px}.K0x3wW_modelSort select:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_sessionLink{max-width:240px;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;padding:0;font-weight:600;text-decoration:underline #0000;display:block;overflow:hidden}.K0x3wW_sessionLink:hover{text-decoration-color:currentColor}.K0x3wW_sessionLink:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px;border-radius:2px}.K0x3wW_analysisButton{border:1px solid var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, var(--dsw-alias-bg-layer-1));min-height:28px;color:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border-radius:7px;padding:0 9px;font-size:11px}.K0x3wW_analysisButton:disabled{cursor:wait;opacity:.65}.K0x3wW_analysisButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_pricingNotice{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);border-radius:10px;align-items:baseline;gap:8px;padding:10px 12px;font-size:11px;line-height:18px;display:flex}.K0x3wW_pricingNotice strong{color:var(--dsw-alias-label-secondary);white-space:nowrap;font-weight:600}.K0x3wW_pricingNotice p{margin:0}.K0x3wW_priceUnknown{color:var(--dsw-alias-label-tertiary)}.K0x3wW_priceValue{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}.K0x3wW_analysisModelSelect{min-width:180px;color:var(--dsw-alias-label-tertiary);gap:4px;font-size:11px;line-height:16px;display:grid}.K0x3wW_analysisModelSelect select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;padding:5px 7px;font-size:12px}.K0x3wW_analysisModelSelect select:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_analysisScope{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}.K0x3wW_analysisErrorText{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:18px}.K0x3wW_status{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary);border-radius:10px;padding:16px;font-size:13px;line-height:20px}@media (width<=860px){.K0x3wW_metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.K0x3wW_detailMetrics,.K0x3wW_analysisMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=580px){.K0x3wW_metrics,.K0x3wW_detailMetrics,.K0x3wW_analysisMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}.K0x3wW_header,.K0x3wW_activityHead,.K0x3wW_blockHead{flex-direction:column;align-items:stretch;gap:8px}.K0x3wW_exportControls{justify-content:flex-start}.K0x3wW_budgetInput{justify-content:space-between}.K0x3wW_pricingNotice{flex-direction:column;align-items:flex-start;gap:2px}.K0x3wW_budgetProgress{flex-direction:column;align-items:flex-start}.K0x3wW_budgetProgress progress,.K0x3wW_blockHead input{width:100%}}.K0x3wW_modelTable td .K0x3wW_providerCell,.K0x3wW_modelTable td .K0x3wW_tokenValue{text-overflow:ellipsis;max-width:260px;display:inline-block;overflow:hidden}.K0x3wW_modelTable td .K0x3wW_shareCell{align-items:center;gap:8px;min-width:120px;max-width:none;display:inline-flex;overflow:visible}.K0x3wW_modelTable td .K0x3wW_shareBar{background:var(--dsw-alias-bg-module-platform);border-radius:3px;width:72px;max-width:none;height:6px;display:inline-block;overflow:hidden}.K0x3wW_modelTable td .K0x3wW_shareBar i{background:var(--dsw-alias-brand-primary,#4d6bfe);border-radius:3px;height:100%;display:block}.K0x3wW_modelTable td .K0x3wW_shareCell em{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px;font-style:normal}.K0x3wW_chartTotal{color:var(--dsw-alias-label-primary);white-space:nowrap;font-size:14px}.K0x3wW_chartLegend{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;gap:14px;margin:4px 0 12px;font-size:12px;display:flex}.K0x3wW_chartLegend span{align-items:center;gap:6px;display:inline-flex}.K0x3wW_chartLegend i{border-radius:2px;width:10px;height:10px;display:inline-block}.K0x3wW_legendHit{background:#74c0fc}.K0x3wW_legendMiss{background:#4dabf7}.K0x3wW_legendOutput{background:#1864ab}.K0x3wW_chartWrap{position:relative}.K0x3wW_chartSvg{width:100%;height:auto;display:block}.K0x3wW_chartGridLine{stroke:var(--dsw-alias-line-divider,#7f7f7f40);stroke-width:1px}.K0x3wW_chartAxisLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}.K0x3wW_barHit{fill:#74c0fc}.K0x3wW_barMiss{fill:#4dabf7}.K0x3wW_barOutput{fill:#1864ab}.K0x3wW_chartHoverZone{fill:var(--dsw-alias-brand-primary,#4d6bfe);opacity:.08}.K0x3wW_chartTooltip{background:var(--dsw-alias-bg-module-floating,#1f2430);border:1px solid var(--dsw-alias-line-divider,#7f7f7f40);min-width:170px;color:var(--dsw-alias-label-secondary);pointer-events:none;z-index:2;border-radius:8px;flex-direction:column;gap:2px;padding:8px 10px;font-size:11px;line-height:16px;display:flex;position:absolute;top:8px;transform:translate(-50%);box-shadow:0 4px 14px #00000040}.K0x3wW_chartTooltip strong{color:var(--dsw-alias-label-primary);font-size:12px}.K0x3wW_chartTooltip em{color:var(--dsw-alias-label-primary);margin-top:2px;font-style:normal}.K0x3wW_modelScroll{max-height:340px;overflow-y:auto}.K0x3wW_modelScroll .K0x3wW_tableWrap{overflow:visible}.K0x3wW_chartTotalBlock{flex-direction:column;align-items:flex-end;gap:2px;display:flex}.K0x3wW_chartTotalLabel{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px}.K0x3wW_chartTotal{color:var(--dsw-alias-label-primary);white-space:nowrap;font-variant-numeric:tabular-nums;font-size:20px;font-weight:600}.K0x3wW_activityCell[data-empty=true]{cursor:default;background:0 0}.K0x3wW_rangeCustom{flex-wrap:wrap;align-items:center;gap:10px;margin:4px 0 12px;display:flex}.K0x3wW_rangeCustom label{color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;font-size:12px;display:inline-flex}.K0x3wW_rangeCustom input[type=date]{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:8px;padding:5px 8px;font-size:12px}.K0x3wW_rangeCustom input[type=date]:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.K0x3wW_rangeApply,.K0x3wW_rangeReset{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:8px;padding:5px 12px;font-size:12px}.K0x3wW_rangeApply:hover,.K0x3wW_rangeReset:hover{background:var(--dsw-alias-interactive-bg-hover)}.K0x3wW_rangeApply{background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff;border-color:#0000}.K0x3wW_rangeApply:hover{opacity:.9}.K0x3wW_rangeError{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px}.K0x3wW_tableWrap thead th{background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l2)}";
		const tagId$1 = "dsh-token-day/TokenUsageSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-day";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var TokenUsageSection_module_css_default = {
			"modelScroll": "K0x3wW_modelScroll",
			"exportControls": "K0x3wW_exportControls",
			"analysisPrivacy": "K0x3wW_analysisPrivacy",
			"metrics": "K0x3wW_metrics",
			"analysisEmpty": "K0x3wW_analysisEmpty",
			"tableWrap": "K0x3wW_tableWrap",
			"analysisButton": "K0x3wW_analysisButton",
			"priceValue": "K0x3wW_priceValue",
			"providerCell": "K0x3wW_providerCell",
			"chartTotalBlock": "K0x3wW_chartTotalBlock",
			"analysisScope": "K0x3wW_analysisScope",
			"anomalyNotice": "K0x3wW_anomalyNotice",
			"chartSvg": "K0x3wW_chartSvg",
			"activityCell": "K0x3wW_activityCell",
			"dayDrilldown": "K0x3wW_dayDrilldown",
			"activityGrid": "K0x3wW_activityGrid",
			"analysisModelSelect": "K0x3wW_analysisModelSelect",
			"chartTotal": "K0x3wW_chartTotal",
			"legendHit": "K0x3wW_legendHit",
			"rangeCustom": "K0x3wW_rangeCustom",
			"chartTotalLabel": "K0x3wW_chartTotalLabel",
			"rangeApply": "K0x3wW_rangeApply",
			"budget": "K0x3wW_budget",
			"legendOutput": "K0x3wW_legendOutput",
			"metric": "K0x3wW_metric",
			"budgetProgress": "K0x3wW_budgetProgress",
			"pricingNotice": "K0x3wW_pricingNotice",
			"priceUnknown": "K0x3wW_priceUnknown",
			"legendMiss": "K0x3wW_legendMiss",
			"rangeTabs": "K0x3wW_rangeTabs",
			"barMiss": "K0x3wW_barMiss",
			"modelSort": "K0x3wW_modelSort",
			"barHit": "K0x3wW_barHit",
			"analysisErrorText": "K0x3wW_analysisErrorText",
			"detailMetrics": "K0x3wW_detailMetrics",
			"activityLegend": "K0x3wW_activityLegend",
			"rangeReset": "K0x3wW_rangeReset",
			"analysisWarning": "K0x3wW_analysisWarning",
			"analysisError": "K0x3wW_analysisError",
			"sessionLink": "K0x3wW_sessionLink",
			"budgetInput": "K0x3wW_budgetInput",
			"activityHead": "K0x3wW_activityHead",
			"chartAxisLabel": "K0x3wW_chartAxisLabel",
			"activity": "K0x3wW_activity",
			"status": "K0x3wW_status",
			"tokenValue": "K0x3wW_tokenValue",
			"modelTable": "K0x3wW_modelTable",
			"analysisCost": "K0x3wW_analysisCost",
			"quietButton": "K0x3wW_quietButton",
			"insights": "K0x3wW_insights",
			"analysisMetrics": "K0x3wW_analysisMetrics",
			"header": "K0x3wW_header",
			"chartTooltip": "K0x3wW_chartTooltip",
			"blockHead": "K0x3wW_blockHead",
			"section": "K0x3wW_section",
			"barOutput": "K0x3wW_barOutput",
			"sessionTable": "K0x3wW_sessionTable",
			"shareBar": "K0x3wW_shareBar",
			"chartLegend": "K0x3wW_chartLegend",
			"chartGridLine": "K0x3wW_chartGridLine",
			"budgetWarning": "K0x3wW_budgetWarning",
			"analysisReport": "K0x3wW_analysisReport",
			"shareCell": "K0x3wW_shareCell",
			"chartHoverZone": "K0x3wW_chartHoverZone",
			"insightNote": "K0x3wW_insightNote",
			"chartWrap": "K0x3wW_chartWrap",
			"analysisPanel": "K0x3wW_analysisPanel",
			"block": "K0x3wW_block",
			"contributors": "K0x3wW_contributors",
			"cacheDetail": "K0x3wW_cacheDetail",
			"rangeError": "K0x3wW_rangeError"
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
		/** Build a newest-inclusive UTC date range of `length` days. */
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
		/** Build an inclusive UTC date span, oldest first; empty when invalid. */
		function datesBetween(startIso, endIso) {
			const start = /* @__PURE__ */ new Date(`${startIso}T00:00:00.000Z`);
			const end = /* @__PURE__ */ new Date(`${endIso}T00:00:00.000Z`);
			if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
			const dates = [];
			for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) dates.push(dayKey(cursor.getTime()));
			return dates;
		}
		/** Expand the active selection into an ordered date list, oldest first. */
		function datesInRange(selection, now = Date.now()) {
			if (selection.kind === "yesterday") {
				const yesterday = new Date(now);
				yesterday.setUTCDate(yesterday.getUTCDate() - 1);
				return [dayKey(yesterday.getTime())];
			}
			return selection.kind === "preset" ? datesEndingOn(now, selection.days) : datesBetween(selection.start, selection.end);
		}
		/** Default custom-range draft: the trailing 7 days. */
		function defaultCustomDraft(now = Date.now()) {
			const end = dayKey(now);
			const start = /* @__PURE__ */ new Date(`${end}T00:00:00.000Z`);
			start.setUTCDate(start.getUTCDate() - 6);
			return {
				start: dayKey(start.getTime()),
				end
			};
		}
		/** Human label for the active selection. */
		function rangeLabelOf(selection, t) {
			if (selection.kind === "custom") return t("customRange");
			if (selection.kind === "yesterday") return t("yesterday");
			if (selection.days === 1) return t("today");
			if (selection.days === 3) return t("day3");
			return t("rangeDays", { count: selection.days });
		}
		/** Aggregate one fixed UTC date range from a daily lookup. */
		function rangeAggregate(days, dates) {
			const byDate = new Map(days.map((day) => [day.date, day]));
			let requests = 0;
			let billed = 0;
			let usage = zeroBuckets();
			let activeDays = 0;
			const records = [];
			for (const date of dates) {
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
		/** Aggregate model routes scoped to one UTC date span. */
		function rangeModels(models, dateSet) {
			const result = [];
			for (const model of models) {
				let assistant = 0;
				let compaction = 0;
				let billed = 0;
				let usage = zeroBuckets();
				let hasAny = false;
				for (const day of model.days) {
					if (!dateSet.has(day.date)) continue;
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
		/** Build calendar cells for a fixed 30-week heatmap, aligned to Monday-start weeks. */
		function activityCalendar(days, now = Date.now()) {
			const dates = datesEndingOn(now, 210);
			if (dates.length === 0) return [];
			const byDate = new Map(days.map((day) => [day.date, day]));
			const today = dayKey(now);
			const leading = ((/* @__PURE__ */ new Date(`${dates[0]}T00:00:00.000Z`)).getUTCDay() + 6) % 7;
			const maximum = Math.max(0, ...dates.filter((date) => date <= today).map((date) => {
				const day = byDate.get(date);
				return day === void 0 ? 0 : day.requests.assistant + day.requests.compaction;
			}));
			const cells = [];
			for (let index = 0; index < leading; index += 1) cells.push({
				date: "",
				requests: 0,
				tokens: 0,
				usage: zeroBuckets(),
				level: 0,
				empty: true
			});
			for (const date of dates) {
				if (date > today) {
					cells.push({
						date: "",
						requests: 0,
						tokens: 0,
						usage: zeroBuckets(),
						level: 0,
						empty: true
					});
					continue;
				}
				const day = byDate.get(date);
				const requests = day === void 0 ? 0 : day.requests.assistant + day.requests.compaction;
				const usage = day === void 0 ? zeroBuckets() : { ...day.usage };
				const tokens = day === void 0 ? 0 : totalTokens(day.usage);
				const level = requests === 0 || maximum === 0 ? 0 : Math.ceil(requests / maximum * 4);
				cells.push({
					date,
					requests,
					tokens,
					usage,
					level,
					empty: false
				});
			}
			while (cells.length % 7 !== 0) cells.push({
				date: "",
				requests: 0,
				tokens: 0,
				usage: zeroBuckets(),
				level: 0,
				empty: true
			});
			return cells;
		}
		/** Render the fixed 30-week calendar heatmap of daily request activity. */
		function ActivityHeatmap({ days, t }) {
			const calendar = (0, react.useMemo)(() => activityCalendar(days), [days]);
			const weeks = Math.max(1, Math.ceil(calendar.length / 7));
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
					style: { gridTemplateColumns: `repeat(${weeks}, 16px)` },
					role: "grid",
					"aria-label": t("activity"),
					children: calendar.map((day, index) => {
						if (day.empty) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TokenUsageSection_module_css_default.activityCell,
							"data-empty": "true",
							role: "gridcell"
						}, `empty-${index}`);
						const details = t("activityTooltip", {
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
							title: details,
							"aria-label": details
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: TokenUsageSection_module_css_default.providerCell,
										children: model.provider
									}) }),
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
			const [, month, day] = iso.split("-");
			return `${Number(month)}/${Number(day)}`;
		}
		/** Render the stacked daily Tokens bar chart (cache hit / cache miss / output). */
		function TokensChart({ records, allDates, rangeLabel, t }) {
			const slices = (0, react.useMemo)(() => tokenSlices(records), [records]);
			const sliceByDate = (0, react.useMemo)(() => new Map(slices.map((slice) => [slice.date, slice])), [slices]);
			const [hovered, setHovered] = (0, react.useState)();
			const total = slices.reduce((sum, slice) => sum + slice.total, 0);
			if (allDates.length === 0 || slices.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
			const column = plotWidth / allDates.length;
			const barWidth = Math.min(52, Math.max(4, column * .68));
			const axisTicks = [
				0,
				.5,
				1
			].map((ratio) => maximum * ratio);
			const y = (value) => padTop + plotHeight * (1 - value / maximum);
			const labelEvery = Math.max(1, Math.ceil(allDates.length / 7));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.block,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TokenUsageSection_module_css_default.blockHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("tokensChart") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("tokensChartIntro") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: TokenUsageSection_module_css_default.chartTotalBlock,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TokenUsageSection_module_css_default.chartTotalLabel,
								children: rangeLabel
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
							})] }, ratio)), allDates.map((date, index) => {
								const slice = sliceByDate.get(date);
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
										slice !== void 0 && slice.total > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
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
											children: shortDate(date)
										}) : null,
										hover ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: padLeft + column * index,
											y: padTop,
											width: column,
											height: plotHeight,
											className: TokenUsageSection_module_css_default.chartHoverZone
										}) : null
									]
								}, date);
							})]
						}), hovered === void 0 ? null : (() => {
							const slice = sliceByDate.get(allDates[hovered]);
							if (slice === void 0) return null;
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
		/** Render the preset tabs plus the custom date-range picker. */
		function RangeControls({ selection, draft, onSelect, onDraftChange, onApply, onReset, error, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.rangeTabs,
				"aria-label": t("customRange"),
				children: [
					[
						1,
						3,
						7,
						30,
						90
					].map((days) => {
						const active = selection.kind === "preset" && selection.days === days;
						const label = days === 1 ? t("today") : days === 3 ? t("day3") : t("rangeDays", { count: days });
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": active,
							onClick: () => {
								onSelect({
									kind: "preset",
									days
								});
							},
							children: label
						}, days);
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": selection.kind === "yesterday",
						onClick: () => {
							onSelect({ kind: "yesterday" });
						},
						children: t("yesterday")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": selection.kind === "custom",
						onClick: () => {
							onSelect({
								kind: "custom",
								start: draft.start,
								end: draft.end
							});
						},
						children: t("customRange")
					})
				]
			}), selection.kind === "custom" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TokenUsageSection_module_css_default.rangeCustom,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("startDate") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "date",
						value: draft.start,
						onChange: (event) => {
							onDraftChange({
								...draft,
								start: event.currentTarget.value
							});
						}
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("endDate") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "date",
						value: draft.end,
						onChange: (event) => {
							onDraftChange({
								...draft,
								end: event.currentTarget.value
							});
						}
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TokenUsageSection_module_css_default.rangeApply,
						onClick: onApply,
						children: t("applyRange")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TokenUsageSection_module_css_default.rangeReset,
						onClick: onReset,
						children: t("resetRange")
					}),
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: TokenUsageSection_module_css_default.rangeError,
						children: t("invalidRange")
					}) : null
				]
			}) : null] });
		}
		/** Render durable Token billing across all listed sessions. */
		function TokenUsageSection({ useSessions, t }) {
			const phase = useSessions((state) => state.phase);
			const ids = useSessions((state) => state.ids);
			const byId = useSessions((state) => state.byId);
			const [selection, setSelection] = (0, react.useState)({
				kind: "preset",
				days: 30
			});
			const [draft, setDraft] = (0, react.useState)(() => defaultCustomDraft());
			const [customError, setCustomError] = (0, react.useState)(false);
			const data = (0, react.useMemo)(() => aggregateUsage(ids.map((id) => byId[id]).filter((value) => value !== void 0)), [byId, ids]);
			const dates = (0, react.useMemo)(() => datesInRange(selection), [selection]);
			const dateSet = (0, react.useMemo)(() => new Set(dates), [dates]);
			const period = (0, react.useMemo)(() => rangeAggregate(data.days, dates), [data.days, dates]);
			const scopedModels = (0, react.useMemo)(() => rangeModels(data.models, dateSet), [data.models, dateSet]);
			const rangeLabel = rangeLabelOf(selection, t);
			const applyCustom = () => {
				if (draft.start === "" || draft.end === "" || draft.start > draft.end) {
					setCustomError(true);
					return;
				}
				setCustomError(false);
				setSelection({
					kind: "custom",
					start: draft.start,
					end: draft.end
				});
			};
			const resetCustom = () => {
				setCustomError(false);
				setDraft(defaultCustomDraft());
				setSelection({
					kind: "preset",
					days: 30
				});
			};
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RangeControls, {
						selection,
						draft,
						onSelect: (next) => {
							setCustomError(false);
							setSelection(next);
						},
						onDraftChange: (next) => {
							setCustomError(false);
							setDraft(next);
						},
						onApply: applyCustom,
						onReset: resetCustom,
						error: customError,
						t
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
								value: `${period.activeDays}/${dates.length}`
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
						allDates: dates,
						rangeLabel,
						t
					})
				] })]
			});
		}
		//#endregion
		//#region \0dsh-css:D:\codex\dsh-token-day\src\client\SessionManagerSection.module.css.mjs
		const css = ".tRJJlG_section{width:100%;max-width:1020px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:18px;display:flex}.tRJJlG_header{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.tRJJlG_header h2,.tRJJlG_header p,.tRJJlG_columnHead h3,.tRJJlG_status{margin:0}.tRJJlG_header h2{font-size:18px;font-weight:600;line-height:26px}.tRJJlG_header p{max-width:720px;color:var(--dsw-alias-label-tertiary);margin-top:5px;font-size:13px;line-height:20px}.tRJJlG_refresh{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;flex-shrink:0;padding:7px 14px;font-size:13px;line-height:18px}.tRJJlG_refresh:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.tRJJlG_refresh:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.tRJJlG_error{border:1px solid var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-error-primary);word-break:break-word;border-radius:10px;padding:10px 12px;font-size:13px;line-height:19px}.tRJJlG_columns{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:16px;display:grid}.tRJJlG_column{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex-direction:column;gap:10px;min-width:0;padding:14px;display:flex}.tRJJlG_columnHead{align-items:baseline;gap:10px;display:flex}.tRJJlG_columnHead h3{font-size:14px;font-weight:600;line-height:20px}.tRJJlG_columnHead span{color:var(--dsw-alias-label-tertiary);margin-right:auto;font-size:12px;line-height:18px}.tRJJlG_exportButton{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;flex-shrink:0;padding:2px 9px;font-size:12px;line-height:18px}.tRJJlG_exportButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.tRJJlG_exportButton:disabled{opacity:.55;cursor:default}.tRJJlG_exportButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.tRJJlG_list{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.tRJJlG_row{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;display:flex}.tRJJlG_rowMain{flex-direction:column;gap:3px;min-width:0;display:flex}.tRJJlG_rowTitleLine{align-items:center;gap:8px;min-width:0;display:flex}.tRJJlG_rowTitle{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;line-height:19px;overflow:hidden}.tRJJlG_subagentTag{box-sizing:border-box;border:1px solid var(--dsw-alias-state-info-primary);color:var(--dsw-alias-state-info-primary);white-space:nowrap;border-radius:5px;flex-shrink:0;padding:0 6px;font-size:10px;line-height:15px}.tRJJlG_rowMeta{min-width:0;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:16px;overflow:hidden}.tRJJlG_rowIdLine{align-items:center;gap:8px;min-width:0;display:flex}.tRJJlG_copyButton{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;flex-shrink:0;padding:1px 7px;font-size:11px;line-height:16px}.tRJJlG_copyButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.tRJJlG_copyButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.tRJJlG_rowTime{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:11px;line-height:16px}.tRJJlG_rowPlaceholder{opacity:.7}.tRJJlG_rowPlaceholderText{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:19px}.tRJJlG_action{box-sizing:border-box;background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff;cursor:pointer;border:none;border-radius:8px;flex-shrink:0;padding:6px 14px;font-size:13px;line-height:18px}.tRJJlG_action:hover:not(:disabled){filter:brightness(1.08)}.tRJJlG_action:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.tRJJlG_action:disabled{opacity:.55;cursor:default}.tRJJlG_status{color:var(--dsw-alias-label-tertiary);padding:8px 2px;font-size:13px;line-height:20px}";
		const tagId = "dsh-token-day/SessionManagerSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-day";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SessionManagerSection_module_css_default = {
			"rowTitle": "tRJJlG_rowTitle",
			"action": "tRJJlG_action",
			"columnHead": "tRJJlG_columnHead",
			"error": "tRJJlG_error",
			"rowMeta": "tRJJlG_rowMeta",
			"rowIdLine": "tRJJlG_rowIdLine",
			"header": "tRJJlG_header",
			"copyButton": "tRJJlG_copyButton",
			"rowTime": "tRJJlG_rowTime",
			"exportButton": "tRJJlG_exportButton",
			"rowTitleLine": "tRJJlG_rowTitleLine",
			"subagentTag": "tRJJlG_subagentTag",
			"row": "tRJJlG_row",
			"rowPlaceholderText": "tRJJlG_rowPlaceholderText",
			"rowPlaceholder": "tRJJlG_rowPlaceholder",
			"refresh": "tRJJlG_refresh",
			"columns": "tRJJlG_columns",
			"column": "tRJJlG_column",
			"status": "tRJJlG_status",
			"rowMain": "tRJJlG_rowMain",
			"section": "tRJJlG_section",
			"list": "tRJJlG_list"
		};
		//#endregion
		//#region src/client/SessionManagerSection.tsx
		/**
		* Conversation manager settings page: a two-column read-only view of every
		* DSH session (title, session id, last-updated timestamp) with copy-id and
		* export-archived-ids actions.
		*
		* The session list comes from the standard `useSessions` store. The archive
		* column is read-only: it merges the plugin's legacy archive set with the DSH
		* native archive set (workspace registry), served by
		* GET /plugins/dsh-token-day/archived. Archiving/deleting sessions is left to
		* DSH itself; this page only displays and lets the user copy/export ids.
		*/
		/** Route prefix served by the Host half of this plugin. */
		const ARCHIVE_BASE = "/plugins/dsh-token-day";
		/** Fetch the merged archive set (plugin legacy ∪ DSH native) from the Host. */
		async function fetchArchivedIds() {
			const res = await fetch(`${ARCHIVE_BASE}/archived`, { cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (typeof data !== "object" || data === null) throw new Error("unexpected archive response");
			const archived = data.archivedSessionIds;
			if (!Array.isArray(archived) || archived.some((id) => typeof id !== "string")) throw new Error("unexpected archive response");
			return archived;
		}
		/** Archive one session through the DSH-native Host route (one-way, hides from sidebar). */
		async function mutateArchive(sessionId) {
			const res = await fetch(`${ARCHIVE_BASE}/archive?id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
			if (!res.ok) {
				let message = `HTTP ${res.status}`;
				try {
					const data = await res.json();
					if (typeof data === "object" && data !== null && typeof data.error === "string") message = data.error;
				} catch {}
				throw new Error(message);
			}
		}
		/** Format an epoch-millis timestamp as YYYY/M/D HH:mm:ss in local time. */
		function formatTime(value) {
			const date = new Date(value);
			const pad = (n) => String(n).padStart(2, "0");
			return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
		}
		/** Download a plain-text file through a temporary anchor element. */
		function downloadTextFile(fileName, text) {
			const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = fileName;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 1e3);
		}
		/** Timestamped export file name, e.g. dsh-archived-sessions-20260816-234230.txt. */
		function exportFileName(date = /* @__PURE__ */ new Date()) {
			const pad = (n) => String(n).padStart(2, "0");
			return `dsh-archived-sessions-${`${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`}.txt`;
		}
		/**
		* Header written at the top of the exported txt. Each line starts with `#`
		* so scripts can skip them and still read one id per line. It names the two
		* deletion steps but deliberately avoids any machine-specific file path —
		* the DSH home directory differs per machine.
		*/
		function archiveExportHeader(count, now = /* @__PURE__ */ new Date()) {
			return [
				"# DSH 归档会话 id 导出（供本地删除使用）",
				`# 导出时间：${now.toISOString()}（UTC）`,
				`# 总数：${count} 个会话`,
				"#",
				"# 执行删除时请同时完成两步：",
				"# 1. 删除每个 id 对应的本地会话文件",
				"# 2. 从 DSH 工作区注册表（workspace registry）的 archivedSessionIds 列表中删除对应 id",
				"#    否则\"对话管理\"页面会残留\"（无会话记录）\"条目",
				"#",
				""
			].join("\n");
		}
		/**
		* Order archived ids for display and export exactly alike ("what you see is
		* what you export"): archived sessions that still have a live summary first,
		* newest first, then id-only archive entries (no session record) in archive
		* order. Exporting this exact list guarantees the txt file matches the
		* archive set one-to-one, so deleting from it never misses or mis-targets.
		*/
		function orderArchivedIds(ids, byId, archivedIds) {
			const archived = new Set(archivedIds);
			const withSummary = ids.filter((id) => archived.has(id)).map((id) => byId[id]).filter((summary) => summary !== void 0).sort((left, right) => right.updatedAt - left.updatedAt).map((summary) => summary.id);
			const withoutSummary = archivedIds.filter((id) => byId[id] === void 0);
			return [...withSummary, ...withoutSummary];
		}
		/** One conversation row: title (+subagent tag), session id (with copy), timestamp, optional archive action. */
		function SessionRow({ summary, subagent, busy, actionLabel, onAction, t }) {
			const [copied, setCopied] = (0, react.useState)(false);
			const copyId = () => {
				(async () => {
					try {
						await navigator.clipboard.writeText(summary.id);
						setCopied(true);
						setTimeout(() => {
							setCopied(false);
						}, 1500);
					} catch {}
				})();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: SessionManagerSection_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SessionManagerSection_module_css_default.rowMain,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SessionManagerSection_module_css_default.rowTitleLine,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								className: SessionManagerSection_module_css_default.rowTitle,
								title: summary.displayTitle,
								children: summary.displayTitle
							}), subagent ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SessionManagerSection_module_css_default.subagentTag,
								children: t("subagent")
							}) : null]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SessionManagerSection_module_css_default.rowIdLine,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SessionManagerSection_module_css_default.rowMeta,
								title: summary.id,
								children: [
									t("sessionIdLabel"),
									"=",
									summary.id
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SessionManagerSection_module_css_default.copyButton,
								onClick: copyId,
								title: copied ? t("copied") : t("copyId"),
								children: copied ? t("copied") : t("copyId")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionManagerSection_module_css_default.rowTime,
							children: formatTime(summary.updatedAt)
						})
					]
				}), actionLabel !== void 0 && onAction !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: SessionManagerSection_module_css_default.action,
					disabled: busy,
					onClick: onAction,
					children: actionLabel
				}) : null]
			});
		}
		/** One archive row whose session summary is no longer available (id still copyable). */
		function PlaceholderRow({ sessionId, t }) {
			const [copied, setCopied] = (0, react.useState)(false);
			const copyId = () => {
				(async () => {
					try {
						await navigator.clipboard.writeText(sessionId);
						setCopied(true);
						setTimeout(() => {
							setCopied(false);
						}, 1500);
					} catch {}
				})();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: `${SessionManagerSection_module_css_default.row} ${SessionManagerSection_module_css_default.rowPlaceholder}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SessionManagerSection_module_css_default.rowMain,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: SessionManagerSection_module_css_default.rowTitleLine,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionManagerSection_module_css_default.rowPlaceholderText,
							children: t("noRecord")
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SessionManagerSection_module_css_default.rowIdLine,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: SessionManagerSection_module_css_default.rowMeta,
							title: sessionId,
							children: [
								t("sessionIdLabel"),
								"=",
								sessionId
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SessionManagerSection_module_css_default.copyButton,
							onClick: copyId,
							title: copied ? t("copied") : t("copyId"),
							children: copied ? t("copied") : t("copyId")
						})]
					})]
				})
			});
		}
		/** Render the conversation manager with live and archived session columns. */
		function SessionManagerSection({ useSessions, t }) {
			const phase = useSessions((state) => state.phase);
			const ids = useSessions((state) => state.ids);
			const byId = useSessions((state) => state.byId);
			const [archivedIds, setArchivedIds] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)();
			const [busyId, setBusyId] = (0, react.useState)();
			const [exporting, setExporting] = (0, react.useState)(false);
			const [exported, setExported] = (0, react.useState)(false);
			const exportingRef = (0, react.useRef)(false);
			const loadArchived = async () => {
				try {
					const fetched = await fetchArchivedIds();
					setArchivedIds(fetched);
					setError(void 0);
				} catch (cause) {
					setError(t("loadFailed", { message: String(cause) }));
				}
			};
			(0, react.useEffect)(() => {
				loadArchived();
			}, []);
			/** Archive one session through the DSH-native route (one-way, hides from sidebar). */
			const runArchive = async (sessionId) => {
				setBusyId(sessionId);
				setError(void 0);
				try {
					await mutateArchive(sessionId);
					setArchivedIds((current) => {
						if (current === null) return current;
						return current.includes(sessionId) ? current : [...current, sessionId];
					});
				} catch (cause) {
					setError(t("opFailed", { message: String(cause) }));
				} finally {
					setBusyId(void 0);
				}
			};
			/** Active (non-archived) sessions, newest first. */
			const active = (0, react.useMemo)(() => {
				const archived = new Set(archivedIds ?? []);
				return ids.map((id) => byId[id]).filter((summary) => summary !== void 0).filter((summary) => !archived.has(summary.id)).sort((left, right) => right.updatedAt - left.updatedAt);
			}, [
				ids,
				byId,
				archivedIds
			]);
			/** Archived ids in display order — exactly what the export txt contains. */
			const archivedOrder = (0, react.useMemo)(() => orderArchivedIds(ids, byId, archivedIds ?? []), [
				ids,
				byId,
				archivedIds
			]);
			/**
			* Export every archived session id as a txt file (one id per line). The id
			* list is re-fetched from the Host at export time so it matches the archive
			* registry exactly, never a stale or partial subset of it.
			*/
			const exportArchivedIds = () => {
				if (exportingRef.current) return;
				exportingRef.current = true;
				(async () => {
					setExporting(true);
					setError(void 0);
					try {
						const fresh = await fetchArchivedIds();
						setArchivedIds(fresh);
						const rows = orderArchivedIds(ids, byId, fresh);
						const text = rows.length > 0 ? `${archiveExportHeader(rows.length)}${rows.join("\n")}\n` : "";
						downloadTextFile(exportFileName(), text);
						setExported(true);
						setTimeout(() => {
							setExported(false);
						}, 2e3);
					} catch (cause) {
						try {
							const rows = orderArchivedIds(ids, byId, archivedIds ?? []);
							await navigator.clipboard.writeText(rows.length > 0 ? `${archiveExportHeader(rows.length)}${rows.join("\n")}\n` : "");
							setExported(true);
							setTimeout(() => {
								setExported(false);
							}, 2e3);
						} catch (clipCause) {
							setError(t("exportFailed", { message: String(clipCause) }));
						}
					} finally {
						exportingRef.current = false;
						setExporting(false);
					}
				})();
			};
			if (phase !== "ready" && ids.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SessionManagerSection_module_css_default.status,
				children: t("loading")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: SessionManagerSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: SessionManagerSection_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("intro") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SessionManagerSection_module_css_default.refresh,
							onClick: () => {
								loadArchived();
							},
							children: t("refresh")
						})]
					}),
					error !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: SessionManagerSection_module_css_default.error,
						children: error
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SessionManagerSection_module_css_default.columns,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SessionManagerSection_module_css_default.column,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SessionManagerSection_module_css_default.columnHead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("conversations") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("count", { count: active.length }) })]
							}), active.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SessionManagerSection_module_css_default.status,
								children: t("emptyConversations")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: SessionManagerSection_module_css_default.list,
								children: active.map((summary) => {
									const subagent = summary.origin === "subagent";
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRow, {
										summary,
										subagent,
										busy: busyId === summary.id,
										actionLabel: subagent ? t("archive") : void 0,
										onAction: subagent ? () => {
											runArchive(summary.id);
										} : void 0,
										t
									}, summary.id);
								})
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SessionManagerSection_module_css_default.column,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SessionManagerSection_module_css_default.columnHead,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("archived") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("count", { count: archivedIds?.length ?? 0 }) }),
									archivedIds !== null && archivedIds.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: SessionManagerSection_module_css_default.exportButton,
										disabled: exporting || exported,
										onClick: exportArchivedIds,
										title: t("exportAllIdsTitle"),
										children: exporting ? t("exporting") : exported ? t("exported") : t("exportAllIds")
									}) : null
								]
							}), archivedIds === null || archivedIds.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SessionManagerSection_module_css_default.status,
								children: t("emptyArchived")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: SessionManagerSection_module_css_default.list,
								children: archivedOrder.map((id) => {
									const summary = byId[id];
									if (summary === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlaceholderRow, {
										sessionId: id,
										t
									}, id);
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionRow, {
										summary,
										subagent: summary.origin === "subagent",
										busy: false,
										t
									}, summary.id);
								})
							})]
						})]
					})
				]
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
			day3: "3 天",
			today: "当日",
			yesterday: "昨日",
			customRange: "自定义",
			startDate: "开始日期",
			endDate: "结束日期",
			applyRange: "应用",
			resetRange: "重置",
			invalidRange: "开始日期不能晚于结束日期",
			requests: "请求总数",
			billed: "已计量",
			totalTokens: "Token 总数",
			cacheHitTokens: "缓存命中 Token",
			activeDays: "活跃天数",
			activity: "每日活动",
			activityIntro: "颜色越深表示当日请求数越高。悬停查看明细。",
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
			day3: "3 days",
			today: "Today",
			yesterday: "Yesterday",
			customRange: "Custom",
			startDate: "Start date",
			endDate: "End date",
			applyRange: "Apply",
			resetRange: "Reset",
			invalidRange: "Start date cannot be later than end date.",
			requests: "Total requests",
			billed: "Billed",
			totalTokens: "Total tokens",
			cacheHitTokens: "Cache-hit tokens",
			activeDays: "Active days",
			activity: "Daily activity",
			activityIntro: "Darker cells represent higher daily request counts. Hover for details.",
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
		/**
		* Conversation-manager dictionary namespace. Owned by the session management
		* settings page registered alongside the Token dashboard.
		*/
		const MANAGER_NS = "settings.conversationManager";
		/** Simplified Chinese conversation-manager dictionary and key source of truth. */
		const managerZh = {
			nav: "对话管理",
			title: "对话管理",
			intro: "查看 DSH 会话与归档：左侧为全部会话，右侧为归档会话（含 DSH 内置归档）。可复制单个会话 id，或一键导出归档 id 列表为 txt 文档（每行一个会话 id，与归档一一对应）供本地删除。",
			refresh: "刷新",
			conversations: "对话管理",
			archived: "归档管理",
			count: "共 {count} 个",
			loading: "正在加载会话列表…",
			emptyConversations: "暂无会话",
			emptyArchived: "暂无归档会话",
			sessionIdLabel: "session",
			copyId: "复制 id",
			copied: "已复制",
			archive: "归档",
			subagent: "子 agent",
			noRecord: "（无会话记录）",
			exportAllIds: "导出归档 id (txt)",
			exportAllIdsTitle: "将所有归档会话 id 导出为 txt 文档（每行一个会话 id，供本地删除）",
			exporting: "导出中…",
			exported: "已导出",
			exportFailed: "导出失败：{message}",
			loadFailed: "加载归档列表失败：{message}",
			opFailed: "操作失败：{message}"
		};
		/** English conversation-manager dictionary checked against the Chinese key set. */
		const managerEn = {
			nav: "Conversations",
			title: "Conversation management",
			intro: "View DSH sessions and archives: the left column lists every session, the right column lists archived ones (including DSH-native archives). Copy a single session id, or export the full archived-id list as a txt file (one session id per line, matching the archive one-to-one) for local deletion.",
			refresh: "Refresh",
			conversations: "Conversations",
			archived: "Archive",
			count: "{count} total",
			loading: "Loading session list…",
			emptyConversations: "No conversations",
			emptyArchived: "No archived conversations",
			sessionIdLabel: "session",
			copyId: "Copy id",
			copied: "Copied",
			archive: "Archive",
			subagent: "subagent",
			noRecord: "(no session record)",
			exportAllIds: "Export archived ids (txt)",
			exportAllIdsTitle: "Download every archived session id as a txt file (one id per line, for local deletion)",
			exporting: "Exporting…",
			exported: "Exported",
			exportFailed: "Export failed: {message}",
			loadFailed: "Failed to load archive list: {message}",
			opFailed: "Operation failed: {message}"
		};
		//#endregion
		//#region src/client/index.ts
		/** Client services required by the Settings contributions. */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		/** Contribute a localized Token billing page and the conversation manager to Settings. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "token-day: dictionaries");
			ctx.effect(() => ctx.locale.register(MANAGER_NS, {
				zh: managerZh,
				en: managerEn
			}), "token-day: conversation-manager dictionaries");
			const tokenDayT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "token-day",
				order: 30,
				label: () => tokenDayT("nav"),
				locale: NS
			}, TokenUsageSection));
			const managerT = ctx.locale.bind(MANAGER_NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "conversation-manager",
				order: 40,
				label: () => managerT("nav"),
				locale: MANAGER_NS
			}, SessionManagerSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
sap.ui.define([
	"sap/m/ViewSettingsFilterItem"
], function (ViewSettingsFilterItem) {
	return ViewSettingsFilterItem.extend("ui5ns.ui5.control.easyfilter.EasyFilterBy", {
		metadata: {	
			properties: {
				applyTo: { type: 'String', defaultValue: null },
				loadFrom: { type: 'String', defaultValue: null }
			},
			aggregations: {
				items: {
					type: 'ui5ns.ui5.control.easyfilter.EasyFilterItem'
				}
			},
			defaultAggregation: "items"
		},
		
		getApplyTo: function () {
			return this.getProperty('applyTo');
		},
		
		setApplyTo: function (sValue) {
			this.setProperty("applyTo", sValue, true);
		},
		
		getLoadFrom: function () {
			return this.getProperty('loadFrom');
		},
		
		setLoadFrom: function (sValue) {
			this.setProperty("loadFrom", sValue, true);
		}
	});
});
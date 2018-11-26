sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ui5ns/ui5/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ui5ns.ui5.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// Pre-load para ajudar na velocidade de abrir o calendário (datepicker) pela primeira vez
			sap.ui.getCore().loadLibrary("sap.ui.unified");
		}
	});
});
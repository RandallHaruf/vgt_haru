sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ui5ns/ui5/model/models",
	"ui5ns/ui5/model/Constants",
	"ui5ns/ui5/lib/jszip",
	"ui5ns/ui5/lib/XLSX",
	"ui5ns/ui5/lib/FileSaver",
	"ui5ns/ui5/lib/Utils",
	"ui5ns/ui5/lib/Validador"
], function (UIComponent, Device, models, Constants) {
	"use strict";

	const setRegistroAcesso = function () {
		window.onload = function () {
			var s = document.createElement('script');
			s.type = 'text/javascript';
			var code = 
				'const registrarAcesso = function (self) {'
					+ 'setTimeout(function () {'
						+ 'fetch("' + Constants.urlBackend + 'verifica-auth", {'
								+ 'credentials: "include"'
							+ '})'
							+ '.then((res) => {'
								+ 'self(self);'
							+ '})'
							+ '.catch((err) => {'
								+ 'self(self);'
							+ '});'
					+ '}, 120000);' // 120s
				+ '};'
				+ 'registrarAcesso(registrarAcesso);';
			try {
				s.appendChild(document.createTextNode(code));
				document.body.appendChild(s);
			} catch (e) {
				s.text = code;
				document.body.appendChild(s);
			}
		};
	};

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
			
			setRegistroAcesso();
		}
	});
});
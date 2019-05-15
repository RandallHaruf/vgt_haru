sap.ui.define(
	[
		"sap/ui/core/Icon"
	],
	function (Icon) {
		"use strict";

		return Icon.extend("ui5ns.ui5.control.NumericIcon", {
			metadata: {
				properties: {
					value: {
						type: "int",
						defaultValue: 0
					}
				}
			},

			init: function () {
				this.addStyleClass('sap-dennisseah-iconnumindicator-icon');
			},

			renderer: function (oRm, oControl) {
				oControl.setSize('25px');
				sap.ui.core.IconRenderer.render.apply(this, arguments);
			},

			onAfterRendering: function () {
				var val = this.getValue();
				if (0 < val && val < 10) {
					var num = $('<div class="sap-dennisseah-iconnumindicator-num"></div>');
					num.attr('title', val);
					num.html("<span class='sap-dennisseah-iconnumindicator-val-pequeno'>" + val + "</span>");
					this.$().append(num);
				} else if (val >= 10) {
					var num = $('<div class="sap-dennisseah-iconnumindicator-num"></div>');
					num.attr('title', val);
					num.html("<span class='sap-dennisseah-iconnumindicator-val'>" + val + "</span>");
					this.$().append(num);
				}
			}
		});
	}
);
sap.ui.define(
	[
		"sap/ui/core/Control"
	],
	function (Control) {
		"use strict";

		return Control.extend("ui5ns.ui5.control.NumericIcon", {
			metadata: {
				properties: {
					number: "int"
				},
				aggregations: {
					icon: {
						type: "sap.ui.core.Icon",
						multiple: false
					}
				}
			},

			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("sapMFlexBox");
				oRm.addClass("sapMFlexBoxAlignContentStretch");
				oRm.addClass("sapMFlexBoxAlignItemsStretch");
				oRm.addClass("sapMFlexBoxJustifyStart");
				oRm.addClass("sapMFlexBoxWrapNoWrap");
				oRm.addClass("sapMHBox");
				oRm.writeClasses();
				oRm.write(">");

				var icon = oControl.getIcon();
				if (icon) {
					icon.setSize("1.2rem");
					var color = icon.getColor() || "#000";
					oRm.write("<div>");
					oRm.renderControl(icon);
					oRm.write("</div>");
					oRm.write('<div class="hdbflowgraph-numeric-icon-text" style="color:' + color + '">');
					var number = oControl.getNumber();
					number = number ? number.toString() : "";
					oRm.writeEscaped(number);
					oRm.write("</div>");
				}
				oRm.write("</div>");
			}
		});
	}
);
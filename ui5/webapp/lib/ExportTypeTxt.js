sap.ui.define(
	[],
	function () {
		return sap.ui.core.util.ExportType.extend("my.own.ExportType", {
			init: function () {
				// Set default values
				this.setProperty("fileExtension", "txt", true);
				this.setProperty("mimeType", "text/plain", true);
				this.setProperty("charset", "utf-8", true);
			},

			generate: function () {
				var aBuffer = [];

				var oColumns = this.columnGenerator(),
					oColumn;

				aBuffer.push("<columns>");

				while (!(oColumn = oColumns.next()).done) {
					aBuffer.push("<column>" + jQuery.sap.encodeXML(oColumn.value.name) + "</column>");
				}

				aBuffer.push("</columns>");

				var oRows = this.rowGenerator(),
					oRow;

				aBuffer.push("<rows>");

				while (!(oRow = oRows.next()).done) {
					var oCells = oRow.value.cells,
						oCell;

					aBuffer.push("<row>");
					aBuffer.push("<cells>");

					while (!(oCell = oCells.next()).done) {
						aBuffer.push("<cell");
						if (oCell.value.customData.color) {
							aBuffer.push(" color=\"" + jQuery.sap.encodeXML(oCell.value.customData.color) + "\"");
						}
						aBuffer.push(">");
						aBuffer.push(jQuery.sap.encodeXML(oCell.value.content));
						aBuffer.push("</cell>");
					}
				}

				aBuffer.push("</rows>");

				return aBuffer.join("");
			}
		});
	}
);
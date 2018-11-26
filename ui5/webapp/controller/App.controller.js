sap.ui.define(
	[
		"sap/ui/core/mvc/Controller"
	], 
	function (Controller) {
		"use strict";
	
		return Controller.extend("ui5ns.ui5.controller.App", {
			/*onInit: function () {
				jQuery.ajax("/node/Pessoas", {
					type: "GET",
					success: function (response) {
						alert(response);
					},
					error: function (err) {
						alert("Erro");
					}
				});
				$.ajax({
		            type: "GET",
		            async: true,
		            url: "VALECS/Pessoas",
		            contentType: "application/json",
		            dataType: "json",
		            headers: {
		                //"x-csrf-token": 'Fetch',
		                "Accept": "application/json"
		            },
		            success: function(resp) {
		                alert(JSON.stringify(resp));
		            },
		            error: function(error){
		            	alert(JSON.stringify(error));
		            }
	        	});
			}*/
		});
	}
);
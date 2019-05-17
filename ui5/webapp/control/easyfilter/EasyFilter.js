sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/Button',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/ViewSettingsDialog',
	'ui5ns/ui5/lib/NodeAPI'
], function (Control, Button, Filter, FilterOperator, ViewSettingsDialog, NodeAPI) {
	var thisControl;
	
	var getFilterSelection = function (event) {
		var filterSelection = {};
					
		var filterItems = event.getParameter("filterItems");
		
		if (filterItems && filterItems.length) {
			for (var i = 0, length = filterItems.length; i < length; i++) {
				var filterItem = filterItems[i],
					parentKey = filterItem.getParent().getApplyTo() ? filterItem.getParent().getApplyTo() : filterItem.getParent().getKey();
				
				if (parentKey) {
					if (filterSelection[parentKey] && filterSelection[parentKey].length) {
						filterSelection[parentKey].push(filterItem.getKey());
					}
					else {
						filterSelection[parentKey] = [filterItem.getKey()];
					}
				}
			}
		}
		
		return filterSelection;
	};
	
	var getParent = function () {
		var bEncontrouParent = false, 
			oParent = thisControl.getParent(),
			sApplyTo = thisControl.getApplyTo();
		
		while (!bEncontrouParent && oParent) {
			if (oParent.getId().indexOf(sApplyTo) > -1) {
				bEncontrouParent = true;
			}
			else {
				oParent = oParent.getParent();
			}
		}
		
		return oParent;
	};
	
	var applyFilter = function (filterSelection) {
		var oParent = getParent(),
			filteredItemsCount = -1;
		
		if (oParent) {
			var filterKeys = Object.keys(filterSelection);
			
			var parentBinding = oParent.getBinding("items");
			var filters = [];
			
			for (var i = 0, length = filterKeys.length; i < length; i++) {
				var column = filterKeys[i];
				var values = filterSelection[column];
				var aux = [];
				
				for (var j = 0, length2 = values.length; j < length2; j++) {
					aux.push(new Filter(column, FilterOperator.EQ, values[j]));
				}
				
				if (aux.length) {
					filters.push(new Filter(aux, false));
				}
			}
			
			parentBinding.filter(filters.length ? filters : [], false);
			
			filteredItemsCount = parentBinding.iLength;
		}
		
		return filteredItemsCount;
	};
	
	var triggerFilter = function (filterSelection, suppress) {
		var filteredItemsCount = applyFilter(filterSelection); 
		
		var oParameter = {
			filterSelection: filterSelection
		};
		
		if (filteredItemsCount !== -1) {
			oParameter.filteredItemsCount = filteredItemsCount;
		}
		
		thisControl._filterSelection = filterSelection;
		if (!suppress) {
			thisControl.fireEvent('filter', oParameter);
		}
	};
	
	var carregarMapaItens = function () {
		if (!thisControl._mapaItens.carregado) {
			thisControl._mapaItens.itens = thisControl.getItems();
			thisControl._mapaItens.carregado = true;
		}	
	};
	
	return Control.extend("ui5ns.ui5.control.easyfilter.EasyFilter", {
		/*
		* configuration
		*/
		metadata: {
			properties: {
				tooltip: { type: 'String', defaultValue: 'Filtrar' },
				type: { type: 'sap.m.ButtonType', defaultValue: 'Default' },
				applyTo: { type: 'String', defaultValue: null }
			},
			aggregations: {
				_filterButton: { type: 'sap.m.Button', multiple: false, visibility: 'hidden' },
				items: { type: 'ui5ns.ui5.control.easyfilter.EasyFilterBy', multiple: true, singularName: "item" }
			},
			defaultAggregation: "items",
			events: {
				filter: { parameters: { filterSelection: { type: 'object' }  } }
			}
		},
		
		init: function () {
			thisControl = this;
			
			this._filterSelection = {};
			
			this._mapaItens = {
				carregado: false,
				itens: []
			};
			
			this.setAggregation('_filterButton', new Button({
				tooltip: this.getTooltip(),
				icon: 'sap-icon://filter',
				type: this.getType(),
				press: this._onFilter.bind(this)
			}));
		},
		
		/*
		*	public methods
		*/
		trigger: function (sEvent) {
			switch (sEvent) {
				case 'filter':
					triggerFilter(thisControl._filterSelection);
					break;
				default:
					console.log('Invalid event: ' + sEvent);
					break;
			}
		},
		
		clear: function () {
			triggerFilter({}, true);
			if (thisControl._filterDialog) {
				thisControl._filterDialog._resetButton.firePress();
			}
		},
		
		loadFrom: function () {
			var aPromise = [];
			
			carregarMapaItens();
			
			$.each(thisControl._mapaItens.itens, function (indexFilterByControl, filterByControl) {
				aPromise.push(NodeAPI.pListarRegistros(filterByControl.getLoadFrom()));
			});
			
			return Promise.all(aPromise);
		},
		
		/*
		*	getters and setters
		*/
		getTooltip: function () {
			return this.getProperty('tooltip');
		},
		
		setTooltip: function (sTooltip) {
			this.setProperty("tooltip", sTooltip, true);
			this.getAggregation("_filterButton").setTooltip(sTooltip);
		},
		
		getType: function () {
			return this.getProperty('type');
		},
		
		setType: function (buttonType) {
			this.setProperty("type", buttonType, true);
			this.getAggregation("_filterButton").setType(buttonType);
		},
		
		getApplyTo: function () {
			return this.getProperty('applyTo');
		},
		
		setApplyTo: function (applyTo) {
			this.setProperty("applyTo", applyTo, true);
		},
		
		/*
		*	rendering
		*/
		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_filterButton"));
			oRm.write("</div>");
		},
		
		/*
		*	private methods
		*/
		_onFilter: function (oEvent) {
			var oFilterDialog = new ViewSettingsDialog();
				
			if (!this._filterDialog) {
				oFilterDialog.attachConfirm(function (event) {
					triggerFilter(getFilterSelection(event));
				});
				
			carregarMapaItens();
				
			$.each(thisControl._mapaItens.itens, function (indexFilterByControl, filterByControl) {
					oFilterDialog.addFilterItem(filterByControl);
				});
				
				this._filterDialog = oFilterDialog;
			}
			
			this._filterDialog.open();
		}
	});
});
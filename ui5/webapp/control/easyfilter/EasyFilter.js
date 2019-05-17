sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/Button',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/ViewSettingsDialog',
	'ui5ns/ui5/lib/NodeAPI'
], function (Control, Button, Filter, FilterOperator, ViewSettingsDialog, NodeAPI) {
	//var this;
	
	/*var setFilterByMap = function () {
		if (!this._filterByMap[this.getId()].stored) {
			this._filterByMap[this.getId()].items = this.getItems();
			this._filterByMap[this.getId()].stored = true;
		}	
	};*/
	
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
			this._filterSelection = {};
			
			/*this._filterByMap = {};
			this._filterByMap[this.getId()] = {
				stored: false,
				items: []
			};
			
			this._filterItemMap = {};*/
			
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
					this._triggerFilter(this._filterSelection);
					break;
				default:
					console.log('Invalid event: ' + sEvent);
					break;
			}
		},
		
		clear: function () {
			this._triggerFilter({}, true);
			if (this._filterDialog) {
				this._filterDialog._resetButton.firePress();
			}
		},
		
		loadFrom: function () {
			var aPromise = [];
			
			//setFilterByMap();
			
			$.each(this.getItems()/*this._filterByMap[this.getId()].items*/, function (indexFilterByControl, filterByControl) {
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
			if (!this._filterDialog) {
				var that = this;
			
				var oFilterDialog = new ViewSettingsDialog();
			
				oFilterDialog.attachConfirm(function (event) {
					that._triggerFilter(that._getFilterSelection(event));
				});
				
				//setFilterByMap();
				
				$.each(this.getItems()/*this._filterByMap[this.getId()].items*/, function (indexFilterByControl, filterByControl) {
					oFilterDialog.addFilterItem(filterByControl);
				});
				
				this._filterDialog = oFilterDialog;
			}
			
			// reset da tela inicial = this._filterDialog._header.mAggregations.contentRight[0].mProperties.text
			
			this._filterDialog.open();
		},
		
		_getFilterSelection: function (event) {
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
		},
		
		_findParent: function () {
			var bEncontrouParent = false, 
				oParent = this.getParent(),
				sApplyTo = this.getApplyTo();
			
			while (!bEncontrouParent && oParent) {
				if (oParent.getId().indexOf(sApplyTo) > -1) {
					bEncontrouParent = true;
				}
				else {
					oParent = oParent.getParent();
				}
			}
			
			return oParent;
		},
		
		_applyFilter: function (filterSelection) {
			var oParent = this._findParent(),
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
		},
		
		_triggerFilter: function (filterSelection, suppress) {
			var filteredItemsCount = this._applyFilter(filterSelection); 
			
			var oParameter = {
				filterSelection: filterSelection
			};
			
			if (filteredItemsCount !== -1) {
				oParameter.filteredItemsCount = filteredItemsCount;
			}
			
			this._filterSelection = filterSelection;
			if (!suppress) {
				this.fireEvent('filter', oParameter);
			}
		}
	});
});
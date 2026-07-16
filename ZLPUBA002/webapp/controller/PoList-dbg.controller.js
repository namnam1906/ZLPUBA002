sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"../utilities/Formatter",
	"../utilities/Utilities",
	"iam/bc/utilities/ValueHelpCollection",
	"iam/bc/utilities/Utilities"
], function (BaseController, MessageBox, History, Formatter, LocalUtilities, ValueHelpCollection, GUtilities) {
	"use strict";

	return BaseController.extend("com.cu.s4hana.zlpuba002.controller.PoList", {
		
		isListInit: true,
		formatter: Formatter,
        _criterias: [{
            id: "idPoNo",
            keyfield: "EBELN",
            type: "MultiInput",
            control: null
        }, {
            id: "idPoDocType",
            keyfield: "BSART",
            type: "MultiInput",
            control: null
        }, {
            id: "idPrNo",
            keyfield: "BANFN",
            type: "MultiInput",
            control: null
        }, {
            id: "idOaNo",
            keyfield: "KONNR",
            type: "MultiInput",
            control: null
        }, {
            id: "idPlant",
            keyfield: "WERKS",
            type: "MultiInput",
            control: null
        }, {
            id: "idMaterial",
            keyfield: "MATNR",
            type: "MultiInput",
            control: null
        }, {
            id: "idShortText",
            keyfield: "TXZ01",
            type: "MultiInput",
            control: null
        }, {
            id: "idMaterialGroup",
            keyfield: "MATKL",
            type: "MultiInput",
            control: null
        }, {
            id: "idPurchasingGroup",
            keyfield: "EKGRP",
            type: "MultiInput",
            control: null
        }, {
            id: "idVendor",
            keyfield: "LIFNR",
            type: "MultiInput",
            control: null
        }, {
            id: "idFundCenter",
            keyfield: "FISTL",
            type: "MultiInput",
            control: null
        }, {
            id: "idFund",
            keyfield: "GEBER",
            type: "MultiInput",
            control: null
        }, {
            id: "idAccountAssignment",
            keyfield: "KNTTP",
            type: "MultiComboBox",
            control: null
        }, {
            id: "idCreateBy",
            keyfield: "ERNAM",
            type: "MultiInput",
            control: null
        }, {
            id: "idCreateDate",
            keyfield: "BEDAT",
            type: "DateRange",
            control: null
        }, {
            id: "idStatus",
            keyfield: "STATUS",
            type: "MultiComboBox",
            control: null
        }],
        
        C_MODEL_NAME: {
			userParam: "userParam"
		},
		
		C_MODEL: {
			userParam: null
		},
        
        onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PoList").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            this.settingScreenCriteria();
            LocalUtilities.addValidator(this._criterias);
		},
		
		settingScreenCriteria: function () {
            for (var lvFname in this._criterias) {
                this._criterias[lvFname].control = this.getView().byId(this._criterias[lvFname].id);
            }
            
            var oSmartTable = this.getView().byId("idSmartTablePoList");            
	        oSmartTable.applyVariant({
	             sort: {
	                      sortItems: [
	                      			  { 
	                                    columnKey: "BEDAT", 
	                                    operation:"Descending"},
	                                  { 
	                                     columnKey: "EBELN", 
	                                     operation:"Descending"}
	                                 ]
	                  }
	        });
        
        },
		
		handleRouteMatched: function (oEvent) {
			
			if(this.isListInit){
				this.initModel();
				this.initialScreen();
	            this.setDefaultValue();
	            
	            var aDefer = [];
				aDefer.push(this.getUserParameters());
				$.when.apply($, aDefer).then(function (status) {
					
					var userParam = this.C_MODEL.userParam.getData();
					
					// Default Plant
					if(userParam.WERKS){
						var oToken = GUtilities.CreateToken(false, "WERKS", "EQ", userParam.WERKS);
						this.getView().byId("idPlant").setTokens([oToken]);
					}
					
					this.getView().byId("idSmartTablePoList").rebindTable(true);
					
				}.bind(this));
	            
			}else{
				this.isListInit = true;
				this.getView().byId("idSmartTablePoList").rebindTable(true);
			}
			
		},
		
		getUserParameters: function() {
				
			var defer = new $.Deferred();
			var lvUser = "";
			var srvModel = this.getOwnerComponent().getModel();
			var userParam = this.C_MODEL.userParam;
			
			if(sap.ushell !== undefined){
				lvUser = sap.ushell.Container.getService("UserInfo").getId();
			}else{
				defer.resolved();
				return;
			}

			var path = "/UserAuthorizationSet('" + lvUser + "')";
			srvModel.read(path, {
				success: function (s) {
					userParam.setData({});
					userParam.setData(s);
					userParam.updateBindings();
					defer.resolve();
				},
				error: function (e) {
					userParam.setData({});
					userParam.updateBindings();
					defer.resolve();
				}
			});

			return defer;

		},
		
		initModel: function () {
			
			var userParam = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(userParam, this.C_MODEL_NAME.userParam);
			this.C_MODEL.userParam = userParam;

		},

		onPoListPress: function (oEvent) {
			
			this.isListInit = false;

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			var po = oBindingContext.getObject().EBELN;

			return new Promise(function (fnResolve) {
				this.doNavigate("PoHeader", oBindingContext, fnResolve, "", po);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
        
		initialScreen: function () {
            var loSmtFilter = this.getView().byId("smartFilterBar");
            if (loSmtFilter) loSmtFilter.clear();
            if (!this.oVHCollection) this.oVHCollection = new ValueHelpCollection(this.getView().getModel());
        },
        
        setDefaultValue: function () {
            // var lsInitCompCode = "1100";
            // var loToken = LibUtilities.CreateToken(false, "EzPayComCode_S", "EQ", lsInitCompCode);
            // var loControl = this.getView().byId("idEzPayComCode");
            // loControl.setTokens([loToken]);
            // this.setCompCode(lsInitCompCode);
            
        	var dateSelectControl = this.getView().byId("idDatePeriod");
        	var dateRangeControl = this.getView().byId("idCreateDate");
        	
        	dateSelectControl.setSelectedKey("1M");
        	dateRangeControl.setEnabled(false);
            
        },
        
        onChangeDatePeriod: function(oEvent){
        	var dateRangeControl = this.getView().byId("idCreateDate");
        	var selectedPeriod = oEvent.getParameters().selectedItem.getProperty("key");
        	if(selectedPeriod === "-"){
        		dateRangeControl.setEnabled(true);
        		//<BOI CH02
	          /*  var currentDate = new Date();
	            var lv_date = dateRangeControl.getDateValue();
	            if(lv_date == null){
	            	dateRangeControl.setDateValue(currentDate);
	            }*/
	            this.chkDateRange();
	            //>EOI CH02
        	}else{
        		dateRangeControl.setEnabled(false);
        		dateRangeControl.setDateValue(null);
        	}
        },
        
        //<BOI CH02
         chkDateRange:function(){
	        var lv_pono = this.getView().byId("idPoNo").getTokens();
	        var lv_podoctype = this.getView().byId("idPoDocType").getTokens();
	        var lv_prno = this.getView().byId("idPrNo").getTokens();
	        var lv_oano = this.getView().byId("idOaNo").getTokens();
	        var lv_plant = this.getView().byId("idPlant").getTokens();
	        var lv_mat = this.getView().byId("idMaterial").getTokens();
	        var lv_tx = this.getView().byId("idShortText").getTokens();
	        var lv_matgroup = this.getView().byId("idMaterialGroup").getTokens();
	        var lv_purgroup = this.getView().byId("idPurchasingGroup").getTokens();
	        var lv_vendor = this.getView().byId("idVendor").getTokens();
	        var lv_fundcenter = this.getView().byId("idFundCenter").getTokens();
	        var lv_fund = this.getView().byId("idFund").getTokens();
	        var lv_acc = this.getView().byId("idAccountAssignment").getSelectedKeys();
	        var lv_create = this.getView().byId("idCreateBy").getTokens();
        	var lv_dateRangeControl = this.getView().byId("idCreateDate").getDateValue();
	        var lv_status = this.getView().byId("idStatus").getSelectedKeys();
	        var currentDate = new Date();
            if( lv_pono.length == 0 && lv_podoctype.length == 0 
	      && lv_prno.length == 0 && lv_oano.length == 0
              && lv_plant.length == 0 && lv_mat.length == 0 && lv_tx.length == 0
              && lv_tx.length == 0 && lv_matgroup.length == 0 && lv_purgroup.length == 0
              && lv_vendor.length == 0 && lv_fundcenter.length == 0 && lv_fund.length == 0 && lv_acc == ""
              && lv_create.length == 0 && lv_status == "" && lv_dateRangeControl == null){
            	this.getView().byId("idCreateDate").setDateValue(currentDate);
             }
        },
        //EOI CH02
        
        checkDateFormatPeriod: function(oEvent) {
        	var dateSelectControl = this.getView().byId("idDatePeriod");
			var bValid = oEvent.getParameter("valid");
			var oDRS = oEvent.getSource();
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);
				
				if(!oEvent.getSource().getDateValue()){
	        		dateSelectControl.setEnabled(true);
	        	}else{
	        		dateSelectControl.setEnabled(false);
	        		dateSelectControl.setSelectedKey("-");
	        	}
				
			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		
		checkDateFormat: function(oEvent) {
			var bValid = oEvent.getParameter("valid");
			var oDRS = oEvent.getSource();
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
		},
        
        onbeforeRebindTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            this.adjustDateFilter(mBindingParams.filters);
            var loFilters = this.getFilterBar(mBindingParams.filters);
            mBindingParams.filters = loFilters;
        },
 
		onVHPrNo: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PR(
                loControl,
                true,
                true,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHPoNo: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PO_(
                loControl,
                true,
                true,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHOaNo: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4OA(
                loControl,
                true,
                true,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHPlant: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4Plant(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHPoDocType: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PoDocType(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHMaterial: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4Material(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHPrItemShortText: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PrItemShortText(
                loControl,
                true,
                true,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHMaterialGroup: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4MaterialGroup(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHPurchasingGroup: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PurchasingGroup(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHVendor: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4VendorMM(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHFundCenter: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4FundCenter(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHFund: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4Fund(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        onVHCreateBy: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4SapUserName(
                loControl,
                true,
                false,
                laTokens,
                "TEXT",
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    var oToken = pTokens;
                    loControl.setTokens(oToken);
                    // loControl.setTokens(GUtilities.RetrieveToken("WERKS", pControlEvent.getParameters().tokens));
                }.bind(this)
            );
        },
        
        getFilterBar: function (pFilterParam) {
            var laFilters = [];
            var loSmtFilter = this.getView().byId("smartFilterBar");
            for (var i in this._criterias) {
                if (this._criterias[i].control) {
                    var loSelect = loSmtFilter.getControlByKey(this._criterias[i].keyfield);
                    if (!loSelect) {
                        continue;
                    }
                    switch (this._criterias[i].type) {
                        case "MultiInput":
                            var laSubIndvFilters = [];
                            var laTokens = loSelect.getTokens();
                            if (laTokens.length > 0) {
                                for (var lvInd in laTokens) {
                                    var loToken = laTokens[lvInd];
                                    var loFilter;
                                    if (loToken.getCustomData().length > 0) {
                                        var loRange = loToken.data("value");
                                        loFilter = new sap.ui.model.Filter(
                                            // loRange.keyField,
                                            this._criterias[i].keyfield,
                                            (loRange.exclude ? "NE" : loRange.operation),
                                            loRange.value1,
                                            loRange.value2
                                        );
                                    } else {
                                        loFilter = new sap.ui.model.Filter(
                                            lvFname,
                                            "EQ",
                                            loToken.getKey()
                                        );
                                    }
                                    laSubIndvFilters.push(loFilter);
                                }
                            }
                            if (laSubIndvFilters.length > 0) {
                                var loField = this._criterias[i].keyfield;
                                var loParamFilter = pFilterParam.filter(function (val) {
                                    return val.sPath === loField;
                                });
                                if (loParamFilter.length > 0) {
                                    laSubIndvFilters.concat(loParamFilter);
                                    pFilterParam = pFilterParam.filter(function (val) {
                                        return val.sPath !== loField;
                                    });
                                }
                                var loIndvFilter = new sap.ui.model.Filter(laSubIndvFilters, false);
                                laFilters.push(loIndvFilter);
                            }
                            break;
                        case "Input":
                            var loValue = loSelect.getSelectedKey();
                            laFilters.push(new sap.ui.model.Filter(this._criterias[i].keyfield, "EQ", loValue));
                            break;
                        case "DateRange":
                            var lvFname = this._criterias[i].keyfield;
                            var lvDateFrom = loSelect.getFrom();
                            var lvDateTo = loSelect.getTo();
                            
                            if(!lvDateTo){
								lvDateTo = lvDateFrom;
							}
                            
                            if (lvDateFrom && lvDateTo) {
                            	var loFilterDate = new sap.ui.model.Filter(
                                        lvFname,
                                        "BT",
                                        lvDateFrom,
                                        lvDateTo
                                    );
                             //   lvDateFrom.setFullYear(lvDateFrom.getFullYear() - 543);
	                            // lvDateTo.setFullYear(lvDateTo.getFullYear() - 543);  
                            	loFilterDate = GUtilities.AdjustDateTimeDataToSend(loFilterDate);
								laFilters.push(loFilterDate);	
                            }else{
                            	
                            	if(lvFname !== "BEDAT"){
                            		break;
                            	}
                            	
                            	var selectedPeriod = this.getView().byId("idDatePeriod").getSelectedKey();
                            	
                            	if(selectedPeriod !== '-'){
                            		
                            		var month = 0;
                            		switch (selectedPeriod) {
                            			case "1M":
                            				month = 1;
                            				break;
                            			case "2M":
                            				month = 2;
                            				break;
                            			case "3M":
                            				month = 3;
                            				break;
                            			default:
                            		}
                            	
	                            	lvDateFrom = new Date();
	                            	lvDateFrom.setMonth(lvDateFrom.getMonth() - month);
	                            	lvDateTo = new Date();
	                            	lvDateFrom.setHours(7,0,0,0);
	                            	lvDateTo.setHours(7,0,0,0);
	                            	
	                            	var loFilterDate = new sap.ui.model.Filter(
	                                        lvFname,
	                                        "BT",
	                                        lvDateFrom,
	                                        lvDateTo
	                                    );
	                                // lvDateFrom.setFullYear(lvDateFrom.getFullYear() - 543);
	                                // lvDateTo.setFullYear(lvDateTo.getFullYear() - 543);  
	                            	loFilterDate = GUtilities.AdjustDateTimeDataToSend(loFilterDate);
									laFilters.push(loFilterDate);	
								
                            	}
                            }
                            
                            break;
                    	case "MultiComboBox":
							var lvFname = this._criterias[i].keyfield;
							var laTokens = [];
							var laSubIndvFilters = [];
							laTokens = this._criterias[i].control.getSelectedKeys();
							if (laTokens.length > 0) {
								for (var i in laTokens) {
									
									var lvToken = laTokens[i];
									if(lvFname === "KNTTP" && laTokens[i] === '-'){
										lvToken = ' ';
									}
									
									var loFilter = new sap.ui.model.Filter(
										lvFname,
										"EQ",
										lvToken
									);
									laSubIndvFilters.push(loFilter);
								}
							}
							if (laSubIndvFilters.length > 0) {
								var loIndvFilter = new sap.ui.model.Filter(laSubIndvFilters, false);
								laFilters.push(loIndvFilter);
							}
							break;
                    }
                    ;
                }
            }
            // Get Smarttable header column/TablePersonalisation dialog filter
            if (pFilterParam.length > 0) {
                laFilters.push(new sap.ui.model.Filter(pFilterParam, true));
            }
            // Push all filter together
            var laAllFilter;
            // if (laFilters.length > 0 && laFilters[0] && laFilters[0].aFilters.length > 0) {
            if (laFilters.length > 0 && laFilters[0]) {
                var laSubFilter = new sap.ui.model.Filter(laFilters, true);
                // return laSubFilter;
                laAllFilter = laSubFilter;
            } else {
                laAllFilter = laFilters;
            }
            return laAllFilter;
        },
        
        adjustDateFilter: function (aSearchFilter) {
            for (var i in aSearchFilter) {
                if (aSearchFilter[i] && aSearchFilter[i].aFilters && aSearchFilter[i].aFilters.length > 0) {
                    LocalUtilities.adjustTimezone(aSearchFilter[i].aFilters);
                }
            }
        },
        
		formatDateUTCtoLocale: function (dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, po) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				
				switch (sRouteName) {
					case "PoHeader":
						this.oRouter.navTo(sRouteName, {
							po: po
						});
						break;
					default:
				}
				
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		
		handleCreateRefPr: function(){
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102_1"
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, false);
			
		},
		
		handleCreateRefOa: function(){
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102_2"
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, false);
			
		},
		
		onBeforeExport: function(oEvent){
			var that = this;
			var oExport = oEvent.mParameters.exportSettings;
			that._checkPropertyType(oExport);
		},
		
		_checkPropertyType: function(oValue) {
			// Be careful, There are Static variables for ONLY this file and Page1ProjectList.view.xml .
			var arr = oValue.workbook.columns;
			for( var i in arr) {
				switch(arr[i].property) {
					case "BEDAT": 
						arr[i].type = sap.ui.export.EdmType.Date; 
						break;
				}
			}
		},
		
		handlePrintPo: function(oEvent){
			
			var po = oEvent.getSource().getParent().getBindingContext().getObject().EBELN;
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					// shellHash: "ZFIORI-ZLPUBA107_NAV?sap-ui-tech-hint=GUI&sap-language=TH&PO=" + po 
					shellHash: "ZFIORI-ZLPUBA107_NAV&/PrintPo/" + po 
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);
			
		},
		
	});
}, /* bExport= */ true);
sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"../utilities/Formatter",
	"../utilities/Utilities",
	"iam/bc/utilities/ValueHelpCollection",
	"iam/bc/utilities/Utilities"
], function (BaseController, MessageBox, History, Formatter, LocalUtilities, ValueHelpCollection, GUtilities) {
	"use strict";

	return BaseController.extend("com.cu.s4hana.zlpuba002_1.controller.PrItemList", {
		
		isListInit: true,
		formatter: Formatter,
        _criterias: [{
            id: "idPrNo",
            keyfield: "BANFN",
            type: "MultiInput",
            control: null
        }, {
            id: "idPrDocType",
            keyfield: "BSART",
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
            keyfield: "BADAT",
            type: "DateRange",
            control: null
        }, {
            id: "idDeliveryDate",
            keyfield: "LFDAT",
            type: "DateRange",
            control: null
        }],
        
        C_MODEL_NAME: {
			poItemModel: "poItemModel",
			controlModel: "controlModel",
			userParam: "userParam",
			prEgpData: "prEgpData"
		},

		C_MODEL: {
			poItemModel: null,
			controlModel: null,
			userParam: null,
			prEgpData: null,
			egpTime: null					//CH09: Ins
		},
        
        onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PrItemList").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.initModel();
            this.settingScreenCriteria();
            LocalUtilities.addValidator(this._criterias);
		},
		
		initModel: function () {

			var poItemModel = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().setModel(poItemModel, this.C_MODEL_NAME.poItemModel);
			this.C_MODEL.poItemModel = poItemModel;
			
			var controlModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(controlModel, this.C_MODEL_NAME.controlModel);
			this.C_MODEL.controlModel = controlModel;
			
			var userParam = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(userParam, this.C_MODEL_NAME.userParam);
			this.C_MODEL.userParam = userParam;
			
			var prEgpData = new sap.ui.model.json.JSONModel({});
			this.getOwnerComponent().setModel(prEgpData, this.C_MODEL_NAME.prEgpData);
			this.C_MODEL.prEgpData = prEgpData;

		},
		
		settingScreenCriteria: function () {
            for (var lvFname in this._criterias) {
                this._criterias[lvFname].control = this.getView().byId(this._criterias[lvFname].id);
            }
            
         //   var oSmartTable = this.getView().byId("idSmartTablePrItemList");            
	        // oSmartTable.applyVariant({
	        //      sort: {
	        //               sortItems: [
	        //               			  { 
	        //                             columnKey: "BADAT", 
	        //                             operation:"Descending"},
	        //                           { 
	        //                              columnKey: "BANFN", 
	        //                              operation:"Descending"}
	        //                          ]
	        //           }
	        // });
        
        },
		
		handleRouteMatched: function (oEvent) {
			if(this.isListInit){
				this.resetData();
				this.initialScreen();
	            this.setDefaultValue();
				this.getEgpTime();				//CH09: Ins
	            var aDefer = [];
				aDefer.push(this.getUserParameters());
				$.when.apply($, aDefer).then(function (status) {
					
					var userParam = this.C_MODEL.userParam.getData();
					
					// Default Plant
					if(userParam.WERKS){
						var oToken = GUtilities.CreateToken(false, "WERKS", "EQ", userParam.WERKS);
						this.getView().byId("idPlant").setTokens([oToken]);
					}
					
					this.getView().byId("idSmartTablePrItemList").rebindTable(true);
					
				}.bind(this));
				
			}else{
				this.isListInit = true;
				this.resetData();
				this.getView().byId("idSmartTablePrItemList").rebindTable(true);
				
				if (this.getView().getBusy() === true) {
					this.getView().setBusy(false);
				}
				
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
		
		resetData: function () {

			this.C_MODEL.poItemModel.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.poItemModel).setData({});
			this.C_MODEL.poItemModel.refresh();
			
			this.C_MODEL.controlModel.setData({});
			this.getView().getModel(this.C_MODEL_NAME.controlModel).setData({ "Count": 0 });
			this.C_MODEL.controlModel.refresh();
		
		},
		
		onDataRecieved: function(oEvent){
        	var that = this;
        	var oList = that.getView().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function(oItem){                
                return oItem.getBindingContext().getPath();
              });
              
            var currentPr;
        	var model = that.getView().byId("idSmartTablePrItemList").getModel();
              aContexts.forEach(function(sPath){
              	model.setProperty(sPath+'/CHK_ALL',false);
              	model.setProperty(sPath+'/CHK_BOX',false);
              	model.setProperty(sPath+'/CHK_HIDE',true);
              	if(model.getProperty(sPath+'/BANFN') === currentPr){
              		model.setProperty(sPath+'/CHK_HIDE',false);
              	}
              	currentPr = model.getProperty(sPath+'/BANFN');
              });
              model.updateBindings();
        },
        
        handleClickAllPr: function(oEvent){
			
			var that = this;
			var select = oEvent.getSource().getSelected();
			var index = oEvent.getSource().getBindingContext().getObject();
			
			var oList = that.getView().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function(oItem){                
                return oItem.getBindingContext().getPath();
              });
             
             var count;
             var model = that.getView().byId("idSmartTablePrItemList").getModel();
              aContexts.forEach(function(sPath){
              	if(model.getProperty(sPath+'/BANFN') === index.BANFN){
              		
              		if(model.getProperty(sPath+'/CHK_BOX') === select){
              			return;
              		}
              		
                	model.setProperty(sPath+'/CHK_BOX',select);
                	
                	if(select){
						count = that.C_MODEL.controlModel.getProperty("/Count");
						count++;
						that.C_MODEL.controlModel.setProperty("/Count",count);
					}else{
						count = that.C_MODEL.controlModel.getProperty("/Count");
						count--;
						that.C_MODEL.controlModel.setProperty("/Count",count);
					}
					
              	}
              });
              model.updateBindings();
              
		},
		
		handleClickEachPr: function(oEvent){
			
			var that = this;
			var select = oEvent.getSource().getSelected();
			var index = oEvent.getSource().getBindingContext().getObject();
			var count;
			
			if(select){
				count = that.C_MODEL.controlModel.getProperty("/Count");
				count++;
				that.C_MODEL.controlModel.setProperty("/Count",count);
			}else{
				count = that.C_MODEL.controlModel.getProperty("/Count");
				count--;
				that.C_MODEL.controlModel.setProperty("/Count",count);
			}
			
			var oList = that.getView().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function(oItem){                
                return oItem.getBindingContext().getPath();
              });
             var bContexts = aContexts;
             
             var model = that.getView().byId("idSmartTablePrItemList").getModel();
              aContexts.forEach(function(sPath){
              	if(model.getProperty(sPath+'/BANFN') === index.BANFN){
              		if(!select){
              			model.setProperty(sPath+'/CHK_ALL',select);
              		}else{
              			var isAll = true;
              			var path0;
              			bContexts.forEach(function(sPath2){
			              	if(model.getProperty(sPath2+'/BANFN') === index.BANFN){
			              		if(model.getProperty(sPath2+'/CHK_HIDE')){
			              			path0 = sPath2;
			              		}
			              		if(!model.getProperty(sPath2+'/CHK_BOX')){
			              			isAll = false;
			              		}
			              	}
			              });
			            if(isAll){
			            	model.setProperty(path0+'/CHK_ALL',true);
			            }  
			              
              		}
              	}
              });
              model.updateBindings();
              
		},
		
		handleClickSelectAll: function(oEvent){
			
			var that = this;
			var select = oEvent.getSource().getSelected();
			var oList = that.getView().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function(oItem){                
                return oItem.getBindingContext().getPath();
              });
             
             var count;
             var model = that.getView().byId("idSmartTablePrItemList").getModel();
              aContexts.forEach(function(sPath){
              	
              		model.setProperty(sPath+'/CHK_ALL',select);
              		
              		if(model.getProperty(sPath+'/CHK_BOX') === select){
              			return;
              		}
              		
                	model.setProperty(sPath+'/CHK_BOX',select);
                	
                	if(select){
						count = that.C_MODEL.controlModel.getProperty("/Count");
						count++;
						that.C_MODEL.controlModel.setProperty("/Count",count);
					}else{
						count = that.C_MODEL.controlModel.getProperty("/Count");
						count--;
						that.C_MODEL.controlModel.setProperty("/Count",count);
					}
			
              });
              model.updateBindings();
              
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
        		// //<BOI CH03
	         //   // var currentDate = new Date();
	         //   // var lv_date = dateRangeControl.getDateValue();
	         //   // if(lv_date == null){
	         //   // 	dateRangeControl.setDateValue(currentDate);
	         //   // }
	            this.chkDateRange();
	         //   //>EOI CH03
        	}else{
        		dateRangeControl.setEnabled(false);
        		dateRangeControl.setDateValue(null);
        	}
        },
        
	    //<BOI CH03
		chkDateRange:function(){
	        var lv_prno = this.getView().byId("idPrNo").getTokens();
	        var lv_podoctype = this.getView().byId("idPrDocType").getTokens();
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
	        var lv_deliv_dt = this.getView().byId("idDeliveryDate").getDateValue();
	        var currentDate = new Date();
            if( lv_prno .length == 0 && lv_podoctype .length == 0 
              && lv_plant.length == 0 && lv_mat.length == 0 && lv_tx.length == 0
              && lv_tx.length == 0 && lv_matgroup.length == 0 && lv_purgroup.length == 0
              && lv_vendor.length == 0 && lv_fundcenter.length == 0 && lv_fund.length == 0 && lv_acc == ""
              && lv_create.length == 0 && lv_deliv_dt == null && lv_dateRangeControl == null){
            	this.getView().byId("idCreateDate").setDateValue(currentDate);
             }
		},
	    //>EOI CH03
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
        
        onVHPrDocType: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PrDocType(
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
                            	
                            	if(lvFname !== "BADAT"){
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
		
		handleCreateNewPo: function (oEvent) {

			var that = this;
			var lvDocType = "";
			var lvEgpNo = "";
			var lvEgpYear = "";
			var isEgpDiff = false;
			var oList = that.getView().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function(oItem){                
                return oItem.getBindingContext().getPath();
              });
             
             var arr = [];
             var model = that.getView().byId("idSmartTablePrItemList").getModel();
              aContexts.forEach(function(sPath){
              	if(model.getProperty(sPath+'/CHK_BOX')){
              		if(lvEgpNo !== "" && lvEgpNo !== model.getProperty(sPath+'/ZZMMEGP_PROJ')){
              			isEgpDiff = true;
              		}else{
              			lvEgpNo = model.getProperty(sPath+'/ZZMMEGP_PROJ');
              			lvEgpYear = model.getProperty(sPath+'/ZZMMEGP_YEAR');
              		}
                	arr.push(model.getProperty(sPath));
                	lvDocType = model.getProperty(sPath+'/BSART');
              	}
              });
              
              if(arr.length === 0){
	              	var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					MessageBox.error( that.getView().getModel("i18n").getProperty("Message.Selected1Line"),
						{ styleClass: bCompact ? "sapUiSizeCompact" : "" }
					);
					return;
              }else{
              	
              	if(lvDocType === "1A31" 
					|| lvDocType === "1INT"		//CH11: Ins
				){
              		that.navToPoHeader(arr);
              		
              	}else{
              		
	              	// e-GP number must be the same
	              	if(isEgpDiff){
	              		var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error( that.getView().getModel("i18n").getProperty("Message.DiffEgpAddItem"),
							{ styleClass: bCompact ? "sapUiSizeCompact" : "" }
						);
						return;
	              	}
	              	
	              	if (that.getView().getBusy() === false) {
						that.getView().setBusyIndicatorDelay(0);
						that.getView().setBusy(true);
					}
	              	
	              	var aDefer = [];
	              	aDefer.push(that.callEgpService("EGPWS0007", lvEgpNo, lvEgpYear));
	              	aDefer.push(that.callEgpService("EGPWS0022", lvEgpNo, lvEgpYear));
	              	aDefer.push(that.callEgpService("EGPWS0028", lvEgpNo, lvEgpYear));
	              	$.when.apply($, aDefer).then(function (status1, status2, status3) {
	              		
	              		if(status1 === "ERROR" && status2 === "ERROR" && status3 === "ERROR"
							&& that.C_MODEL.egpTime == true	//CH11: Ins
						){
	              			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
							MessageBox.warning( that.getView().getModel("i18n").getProperty("Message.CannotReachEgp"),
								{
									actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function(sAction) {
										if(sAction === sap.m.MessageBox.Action.OK){
											that.navToPoHeader(arr);
										}else{
											if (that.getView().getBusy()) {
												that.getView().setBusy(false);
											}
										}
									}
								}
							);
						
	              		}else{
	              			that.navToPoHeader(arr);
	              		}
	
	              	});
              	
              	}
              	
              }

		},
		
		navToPoHeader: function(arr){
			
			var that = this;
			var poItemModel = that.C_MODEL.poItemModel;
			
			that.isListInit = false;
          	poItemModel.setData([]);
          	poItemModel.setData(arr);
          	poItemModel.updateBindings();
          	
          	return new Promise(function (fnResolve) {
				that.doNavigate("PoNewHeader", "", fnResolve, "", "");
			}.bind(that)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			
		},
		
		callEgpService: function(serviceNo, lvEgpNo, lvEgpYear){
			
			var that = this;
			var defer = new $.Deferred();
			
			if(this.C_MODEL.egpTime){			//CH09: Ins
				defer.resolve("ERROR");
				return defer;
			}

			var request = {
				"ProjectDatas" : {
					"LoginDatas" : {
						"FIELD1" : that.getOwnerComponent().egp.username,
						"FIELD2" : that.getOwnerComponent().egp.password
					},
					"Request" : {
						"FIELD1" : lvEgpNo,
						"FIELD2" : lvEgpYear
					}
				}
			};
			
			request = JSON.stringify(request);
			var requestJson = JSON.parse(request);
			var requestXml = this.OBJtoXML(requestJson);

			jQuery.ajax({
				url: "/EgpInterface/rest/" + serviceNo,
				data: requestXml,
				cache: false,
				contentType: 'application/xml',
				processData: false,
				async: true,
				type: 'POST',
				beforeSend: function (xhr) {
					// xhr.setRequestHeader('Authorization', 'Bearer ' + that.getCookie("___C_SANSIRI_API_TOKEN"));
				},
				success: function (data) {
					var result = that.xmlToJson(data,serviceNo);
					switch (serviceNo) {
						case "EGPWS0007":
							if(result.productdatas.responsecode.field1 === "000"){
								that.C_MODEL.prEgpData.setProperty("/EGPWS0007", result.productdatas);
								that.C_MODEL.prEgpData.updateBindings();
								defer.resolve("SUCCESS");
							}else{
								defer.resolve("ERROR");
							}
							break;
						case "EGPWS0022":
							if(result.contractdatas !== undefined){
								if(result.contractdatas.responsecode.field1 === "000"){
									that.C_MODEL.prEgpData.setProperty("/EGPWS0022", result.contractdatas);
									that.C_MODEL.prEgpData.updateBindings();
									defer.resolve("SUCCESS");
								}else{
									defer.resolve("ERROR");
								}
							}else{
								defer.resolve("ERROR");
							}
							break;
						case "EGPWS0028":
							if(result.merchantdatas !== undefined){
								if(result.merchantdatas.responsecode.field1 === "000"){
									that.C_MODEL.prEgpData.setProperty("/EGPWS0028", result.merchantdatas);
									that.C_MODEL.prEgpData.updateBindings();
									defer.resolve("SUCCESS");
								}else{
									defer.resolve("ERROR");
								}
							}else{
								defer.resolve("ERROR");
							}
							break;
					}
				},
				error: function (error) {
					defer.resolve("ERROR");
				}
			});
			
			return defer;
			
		},
		
		OBJtoXML: function(obj) {
		  var xml = '';
		  for (var prop in obj) {
		    xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
		    if (obj[prop] instanceof Array) {
		      for (var array in obj[prop]) {
		        xml += "<" + prop + ">";
		        xml += this.OBJtoXML(new Object(obj[prop][array]));
		        xml += "</" + prop + ">";
		      }
		    } else if (typeof obj[prop] == "object") {
		      xml += this.OBJtoXML(new Object(obj[prop]));
		    } else {
		      xml += obj[prop];
		    }
		    xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
		  }
		  var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
		  return xml;
		  
		},
		
		parsexml: function (node, j, serviceNo) {
			var that = this;
		    var nodeName = node.nodeName.replace(/^.+:/, '').toLowerCase();
		    var cur = null;
		    var text = $(node).contents().filter(function(x) {
		      return this.nodeType === 3;
		    });
		    if (text[0] && text[0].nodeValue.trim()) {
		      cur = text[0].nodeValue;
		    } else {
		      cur = {};
		      $.each(node.attributes, function() {
		        if (this.name.indexOf('xmlns:') !== 0) {
		          cur[this.name.replace(/^.+:/, '')] = this.value;
		        }
		      });
		      $.each(node.children, function() {
		        that.parsexml(this, cur, serviceNo);
		      });
		    }
		    
		    // j[nodeName] = cur;
		    
		    if(nodeName === "contractdetail4" || nodeName === "winnertin" || nodeName === "product"){
				if(!j[nodeName]){
					j[nodeName] = [];
				}	
				j[nodeName].push(cur);
			}else{
				j[nodeName] = cur;
			}
			
		  },
		
		xmlToJson: function (xml,serviceNo) {
		  var roots = $(xml);
		  var root = roots[roots.length-1];
		  var json = {};
		  this.parsexml(root, json, serviceNo);
		  return json['#document'];
		},
		
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, Pr) {
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
					case "PoNewHeader":
						this.oRouter.navTo(sRouteName);
						break;
					default:
				}
				
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		
		handleManagePo: function(){
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102"
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
					case "BADAT": 
					case "LFDAT": 
						arr[i].type = sap.ui.export.EdmType.Date; 
						break;
				}
			}
		},
		//CH09: Ins Start
		getEgpTime: function () {
			var that = this;
			var srvModel = this.getView().getModel();
			var defer = new $.Deferred();

			var path = "/EgpTimeSet(APPL='ZLPUBA002_1')";

			srvModel.read(path, {

				success: function (s) {
					that.C_MODEL.egpTime = s.CURRENT_FLAG;

				},

				error: function (pError) {
				}

			});
			return;
		}
		//CH09: Ins End
	});
}, /* bExport= */ true);
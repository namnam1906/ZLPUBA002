sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"../utilities/Formatter",
	"iam/bc/utilities/CommonVHDialog",
	"iam/bc/utilities/Utilities"
], function (BaseController, MessageBox, History, Formatter, CommonVHDialog, GUtilities) {
	"use strict";

	return BaseController.extend("com.cu.s4hana.zlpuba002_1.controller.PoNewItem", {
		
		formatter: Formatter,
		C_MODEL_NAME: {
			poItemDetail: "poItemDetail",
			poItemText: "poItemText",
			poAccountAssignment: "poAccountAssignment",
			f4Material: "f4Material"
		},
		
		C_MODEL: {
			poItemDetail: null,
			poItemText: null,
			poAccountAssignment: null,
			f4Material: null
		},
		
		_formFragments: {},
		
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PoNewItem").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			this.getView().addEventDelegate({
	             onAfterShow : jQuery.proxy(function(evt) {
	                  this.onAfterShow(evt);
	             }, this)
	         });
	         
	         this._MessageManager = new sap.ui.core.message.MessageManager();
			 this.getView().setModel(this._MessageManager.getMessageModel(), "message");
			
		},
		
		initModel: function() {
			
			var poItemDetailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(poItemDetailModel, this.C_MODEL_NAME.poItemDetail);
			this.C_MODEL.poItemDetail = poItemDetailModel;
			
			var poItemTextModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(poItemTextModel, this.C_MODEL_NAME.poItemText);
			this.C_MODEL.poItemText = poItemTextModel;
			
			var poAccountAssignmentModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(poAccountAssignmentModel, this.C_MODEL_NAME.poAccountAssignment);
			this.C_MODEL.poAccountAssignment = poAccountAssignmentModel;
			
			var f4MaterialModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(f4MaterialModel, this.C_MODEL_NAME.f4Material);
			this.C_MODEL.f4Material = f4MaterialModel;
			
		},
		
		handleRouteMatched: function (oEvent) {
			
			// Get parameters
			if (oEvent.getParameters().data) {
				var po = oEvent.getParameters().data.Po;
				var poItem = oEvent.getParameters().data.PoItem;
			}
			
			this._showFormFragment("PoNewItem");
			
			// Clear Value State
			// this.clearValueState();
			
			// Check PO item already retrieved
			this.initModel();
			var IsExisting = this.checkIsExisting(po,poItem);
			
			if(IsExisting){
				this.syncData(po,poItem);
				this.getMasterData();
			}else{
				this.doNavBackRefresh();
			}
			
			this.initSelectControl(poItem);
			
		},
		
		initSelectControl: function(poItem){
			if(this.getOwnerComponent().getModel("poItem")){
				this.getView().byId("idSelectItem").setVisible(true);
				this.getView().byId("idSelectItem").setSelectedKey(poItem);
				this.getView().byId("idGoToNextItem").setVisible(true);
				this.getView().byId("idGoToPreviousItem").setVisible(true);
			}else{
				this.getView().byId("idSelectItem").setVisible(false);
				this.getView().byId("idGoToNextItem").setVisible(false);
				this.getView().byId("idGoToPreviousItem").setVisible(false);
			}
		},
		
		checkIsExisting: function(po,poItem){
			
			var poItemModel = this.getOwnerComponent().getModel("poItem");
			var isExisting = false;
			if(poItemModel){
				isExisting = true;
			}
			return isExisting;
		},
		
		clearValueState: function(){
			this.getView().byId("idItemShortText").setValueState("None");
			this.getView().byId("idMaterialGroup").setValueState("None");
			this.getView().byId("idPlant").setValueState("None");
			this.getView().byId("idSumLimit").setValueState("None");
			this.getView().byId("idExpectLimit").setValueState("None");
			this.getView().byId("idQuantity").setValueState("None");
			this.getView().byId("idUnitPrice").setValueState("None");
			this.getView().byId("idPriceUnit").setValueState("None");
			this.getView().byId("idDeliveryDate").setValueState("None");
			
			this.getView().byId("idFunctionalArea").setValueState("None");
			this.getView().byId("idFundCenter").setValueState("None");
			this.getView().byId("idGlAccountK").setValueState("None");
			this.getView().byId("idBusinessAreaK").setValueState("None");
			this.getView().byId("idFundK").setValueState("None");
			this.getView().byId("idFunctionalAreaK").setValueState("None");
			
		},
		
		syncData: function(pPo,pPoItem){
			
			var that = this;
			var poItemDetail = that.C_MODEL.poItemDetail;
			var poItemText = that.C_MODEL.poItemText;
			var poAccountAssignment = that.C_MODEL.poAccountAssignment;
			var poItemData = that.getOwnerComponent().getModel("poItem").getProperty("/");
			
			// Set busy indicator
			if (that.getView().getBusy() === false) {
				that.getView().setBusyIndicatorDelay(0);
				that.getView().setBusy(true);
			}
			
			setTimeout(function(){
				for(var i=0;i<poItemData.length;i++){
					if(parseInt(poItemData[i].EBELP,0) === parseInt(pPoItem,0)){
						if(poItemData[i].KNTTP === ''){
							poItemData[i].KNTTP = '-';
						}
						poItemDetail.setData(poItemData[i]);
						poItemText.setData(poItemData[i].PoItemText.results);
						poAccountAssignment.setData(poItemData[i].PoAccAssignment.results);
					}
				}
				
				poItemDetail.updateBindings();
				poItemText.updateBindings();
				poAccountAssignment.updateBindings();
				
				// if (that.getView().getBusy() === true) {
				// 	that.getView().setBusy(false);
				// }
				
				if(that.getOwnerComponent().getModel("errors").getData().length > 0){
					that.syncMessagePopover(poItemDetail.getData().EBELP);
					var oButton = that.getView().byId("messagePopoverBtn");
					setTimeout(function(){
						that.oMP.openBy(oButton);
					}.bind(that), 100);
				}
				
				// if (that.getView().getBusy() === true) {
				// 	that.getView().setBusy(false);
				// }
				
				that.prepareRefDoc();
				
			}, 500);
			
		},
		
		syncMessagePopover: function(prItem){
			
			var messageModel = this.getOwnerComponent().getModel("errors");
			var messageData = $.extend([],messageModel.getData());
			var poItemDetail = this.C_MODEL.poItemDetail.getData();
			
			this._MessageManager = new sap.ui.core.message.MessageManager();
	        this.getView().setModel(this._MessageManager.getMessageModel(),"message");
	        this.createMessagePopover();
			
			for(var i=0;i<messageData.length;i++){
				var items = messageData[i].code.split(" ");
				if(parseInt(items[1],0) === parseInt(prItem,0)){
					var target = "";
					var controlId = "";
					var processor = "";
					switch (messageData[i].target) {
						case "/TXZ01":
							target = this.getView().byId("idItemShortText").getBindingPath("value");
							controlId = this.getView().byId("idItemShortText").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/MATKL":
							target = this.getView().byId("idMaterialGroup").getBindingPath("value");
							controlId = this.getView().byId("idMaterialGroup").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/WERKS":
							target = this.getView().byId("idPlant").getBindingPath("value");
							controlId = this.getView().byId("idPlant").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/SUMLIMIT":
							target = this.getView().byId("idSumLimit").getBindingPath("value");
							controlId = this.getView().byId("idSumLimit").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/COMMITMENT":
							target = this.getView().byId("idExpectLimit").getBindingPath("value");
							controlId = this.getView().byId("idExpectLimit").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/MENGE":
							target = this.getView().byId("idQuantity").getBindingPath("value");
							controlId = this.getView().byId("idQuantity").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/NETPR":
							target = this.getView().byId("idUnitPrice").getBindingPath("value");
							controlId = this.getView().byId("idUnitPrice").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/PEINH":
							target = this.getView().byId("idPriceUnit").getBindingPath("value");
							controlId = this.getView().byId("idPriceUnit").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/EINDT":
							target = this.getView().byId("idDeliveryDate").getBindingPath("dateValue");
							controlId = this.getView().byId("idDeliveryDate").getId();
							processor = this.getView().getModel("poItemDetail");
							break;
						case "/SAKTO":
							target = this.getView().byId("idGlAccountK").getBindingPath("value");
							controlId = this.getView().byId("idGlAccountK").getId();
							processor = this.getView().getModel("poAccountAssignment");
							break;
						case "/GSBER":
							target = this.getView().byId("idBusinessAreaK").getBindingPath("value");
							controlId = this.getView().byId("idBusinessAreaK").getId();
							processor = this.getView().getModel("poAccountAssignment");
							break;
						case "/KOSTL":
							target = this.getView().byId("idCostCenterK").getBindingPath("value");
							controlId = this.getView().byId("idCostCenterK").getId();
							processor = this.getView().getModel("poAccountAssignment");
							break;
						case "/GEBER":
							if(poItemDetail.KNTTP === "" || poItemDetail.KNTTP === "-"){
								target = this.getView().byId("idFund").getBindingPath("value");
								controlId = this.getView().byId("idFund").getId();
								processor = this.getView().getModel("poItemDetail");
							}else{
								target = this.getView().byId("idFundK").getBindingPath("value");
								controlId = this.getView().byId("idFundK").getId();
								processor = this.getView().getModel("poAccountAssignment");
							}
							break;
						case "/FKBER":
							if(poItemDetail.KNTTP === "" || poItemDetail.KNTTP === "-"){
								target = this.getView().byId("idFunctionalArea").getBindingPath("value");
								controlId = this.getView().byId("idFunctionalArea").getId();
								processor = this.getView().getModel("poItemDetail");
							}else{
								target = this.getView().byId("idFunctionalAreaK").getBindingPath("value");
								controlId = this.getView().byId("idFunctionalAreaK").getId();
								processor = this.getView().getModel("poAccountAssignment");
							}
							break;
						case "/FISTL":
							if(poItemDetail.KNTTP === "" || poItemDetail.KNTTP === "-"){
								target = this.getView().byId("idFundCenter").getBindingPath("value");
								controlId = this.getView().byId("idFundCenter").getId();
								processor = this.getView().getModel("poItemDetail");
							}else{
								target = this.getView().byId("idFundCenterK").getBindingPath("value");
								controlId = this.getView().byId("idFundCenterK").getId();
								processor = this.getView().getModel("poAccountAssignment");
							}
							break;
						default:
						
					}
					if(target){
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: messageData[i].code,
								type: sap.ui.core.MessageType.Error,
								additionalText: messageData[i].additionalText,
								description: messageData[i].description,
								target: target,
								processor: processor,
								controlId: controlId
							})
						);
					}
				}else{
					this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: messageData[i].message,
						code: messageData[i].code,
						type: messageData[i].type,
						additionalText: messageData[i].additionalText,
						description: messageData[i].description,
						target: messageData[i].target,
						processor: ""
					})
				);
				}
			}
			
			var msg = this._MessageManager.getMessageModel().getData();
			function mycomparator(a,b) {
				if ( a.id < b.id )
			        return -1;
			    if ( a.id > b.id )
			        return 1;
			}
			msg.sort(mycomparator);
			this._MessageManager.getMessageModel().updateBindings();
			
		},
		
		createMessagePopover: function () {
			var that = this;
			this.oMP = new sap.m.MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item"),
						oPage = that.oView.byId("idPoNewItemPage"),
						oMessage = oItem.getBindingContext("message").getObject(),
						oControl = sap.ui.getCore().byId(oMessage.getControlId());
						// oControl = that.getView().byId("formContainer").getItems()[0].getFormContainers()[0].getFormElements()[0].getFields()[0];

					if (oControl) {
						oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
						setTimeout(function(){
							oControl.focus();
						}, 300);
					}
				},
				items: {
					path:"message>/",
					template: new sap.m.MessageItem(
						{
							title: "{message>message}",
							subtitle: "{message>additionalText}",
							groupName: {parts: [{path: 'message>code'}], formatter: this.getGroupName},
							activeTitle: {parts: [{path: 'message>target'},{path: 'message>processor'}], formatter: this.isPositionable},
							type: "{message>type}",
							description: "{message>description}"
						})
				}
			});

			this.oMP._oMessageView.setGroupItems(true);
			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
		},
		
		getGroupName : function (code) {
			// the group name is generated based on the current layout
			// and is specific for each use case
			// if(target){
			// 	return true;
			// }else{
			// 	return false;
			// }

			if (code) {
				// var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
				// 	sFormTitle = oControl.getParent().getParent().getParent().getTitle();
				return code;
			}else{
				return "";
			}
		},

		isPositionable : function (target,processor) {
			// Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
			// return sControlId ? true : true;
			
			if(target && processor){
				return true;
			}else{
				return false;
			}
			
		},
		
		handleMessagePopoverPress: function (oEvent) {
			this.oMP = null;
			if (!this.oMP) {
				this.createMessagePopover();
			}
			this.oMP.toggle(oEvent.getSource());
		},
		
		convertUndefinedValue: function(object){
			
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					if(object[key] === undefined){
						object[key] = "";
					}
				}
			}
			
			return object;
			
		},
		
		getMasterData: function(){
		
			var that = this;
			var aDefer = [];
			if (that.getView().getBusy() === false) {
				that.getView().setBusyIndicatorDelay(0);
				that.getView().setBusy(true);
			}
			aDefer.push(that.getF4MaterialData());
			$.when.apply($, aDefer).then(function (status) {
				if (that.getView().getBusy() === true) {
					that.getView().setBusy(false);
				}
			});
			
		},
		
		getF4MaterialData: function () {
			var srvModel = this.getView().getModel();
			var f4Material = this.C_MODEL.f4Material;
			var defer = new $.Deferred();
			var path = "/F4MaterialSet";
			srvModel.read(path, {
				success: function (s) {
					f4Material.setData([]);
					f4Material.setData(s.results);
					defer.resolve();
				},
				error: function (pError) {
					defer.resolve();
				}
			});
			return defer;
		},
		
		handleItemChange: function (oEvent) {
			
			var Po = this.C_MODEL.poItemDetail.getData().EBELN;
			var PoItem = parseInt(oEvent.getParameters().selectedItem.getKey(),0);
			
			this.syncErrorMessages();
			
			return new Promise(function (fnResolve) {
				this.doNavigate("PoNewItem", "", fnResolve, "", Po, PoItem);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		
		handleGoToNextItem: function(){
			
			var po = this.C_MODEL.poItemDetail.getData().EBELN;
			var currentPoItem = this.C_MODEL.poItemDetail.getData().EBELP;
			var poItemData = this.getOwnerComponent().getModel("poItem").getData();
			var currentIndex = -1;
			var nextIndex = -1;
			
			for(var i=0;i<poItemData.length;i++){
				if(parseInt(currentPoItem,0) === parseInt(poItemData[i].EBELP,0)){
					currentIndex = i;
					break;
				}
			}
			
			if((currentIndex + 1) === poItemData.length){
				nextIndex = 0;
			}else{
				nextIndex = currentIndex + 1;
			}
			
			var nextPoItem = poItemData[nextIndex].EBELP;
			
			this.syncErrorMessages();
			
			return new Promise(function (fnResolve) {
				this.doNavigate("PoNewItem", "", fnResolve, "", po, nextPoItem);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			
		},
		
		handleGoToPreviousItem: function(){
			
			var po = this.C_MODEL.poItemDetail.getData().EBELP;
			var currentPoItem = this.C_MODEL.poItemDetail.getData().EBELP;
			var poItemData = this.getOwnerComponent().getModel("poItem").getData();
			var currentIndex = -1;
			var prevIndex = -1;
			
			for(var i=0;i<poItemData.length;i++){
				if(parseInt(currentPoItem,0) === parseInt(poItemData[i].EBELP,0)){
					currentIndex = i;
					break;
				}
			}
			
			if(currentIndex === 0){
				prevIndex = poItemData.length - 1;
			}else{
				prevIndex = currentIndex - 1;
			}
			
			var nextPoItem = poItemData[prevIndex].EBELP;
			
			this.syncErrorMessages();
			
			return new Promise(function (fnResolve) {
				this.doNavigate("PoNewItem", "", fnResolve, "", po, nextPoItem);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			
		},
		
		updateModelBindings: function(){
			this.C_MODEL.poItemDetail.updateBindings();
			this.C_MODEL.poItemText.updateBindings();
			this.C_MODEL.poAccountAssignment.updateBindings();
		},
		
		handleChangeAccountAssignment: function(oEvent){
			var selectedKey = oEvent.getParameters().selectedItem.getKey();
			var selecedText = oEvent.getParameters().selectedItem.getText();
			
			this.C_MODEL.poItemDetail.setProperty("/KNTTP", selectedKey);
			this.C_MODEL.poItemDetail.setProperty("/KNTTP_NAME", selecedText);
			
			if(selectedKey === "K"){
				var plant = "";
				var plantName = "";
				var userParamModel = this.getOwnerComponent().getModel("userParam");
				if(userParamModel){
					var param = userParamModel.getData();
					plant = param.WERKS;
					plantName = param.NAME1;
				}else{
					plant = this.C_MODEL.poItemDetail.getProperty("/WERKS");
					plantName = this.C_MODEL.poItemDetail.getProperty("/WERKS_NAME");
				}
				var temp = [];
				temp.push({"ZEKKN":"1","KOKRS":"1000","KOKRS_NAME":"เขตการควบคุมจุฬาฯ",GSBER: plant, GSBER_NAME: plantName});
				this.C_MODEL.poAccountAssignment.setProperty("/",temp);
				this.C_MODEL.poItemDetail.setProperty("/KNTTP_NAME", this.getView().getModel("i18n").getProperty("Label.AccountAssignment.CostCenter"));
				this.C_MODEL.poItemDetail.setProperty("/PoAccAssignment/results",this.C_MODEL.poAccountAssignment.getData());
			}else if(selectedKey === "A"){
				this.C_MODEL.poAccountAssignment.setProperty("/",[]);
				this.C_MODEL.poItemDetail.setProperty("/KNTTP_NAME", this.getView().getModel("i18n").getProperty("Label.AccountAssignment.Asset"));
				this.C_MODEL.poItemDetail.setProperty("/PoAccAssignment/results",this.C_MODEL.poAccountAssignment.getData());
			}else if(selectedKey === "U"){
				this.C_MODEL.poAccountAssignment.setProperty("/",[]);
				this.C_MODEL.poItemDetail.setProperty("/KNTTP_NAME", this.getView().getModel("i18n").getProperty("Label.AccountAssignment.Unknown"));
			}else{
				this.C_MODEL.poItemDetail.setProperty("/GEBER", "");
				this.C_MODEL.poItemDetail.setProperty("/GEBER_NAME", "");
				this.C_MODEL.poItemDetail.setProperty("/FKBER", "");
				this.C_MODEL.poItemDetail.setProperty("/FKBER_NAME", "");
				this.C_MODEL.poItemDetail.setProperty("/FISTL", "");
				this.C_MODEL.poItemDetail.setProperty("/FISTL_NAME", "");
				this.C_MODEL.poItemDetail.setProperty("/FIPOS", "");
				this.C_MODEL.poItemDetail.setProperty("/FIPOS_NAME", "");
				this.C_MODEL.poItemDetail.setProperty("/KBLNR", "");
				this.C_MODEL.poItemDetail.setProperty("/KBLPOS", "");
				this.C_MODEL.poItemDetail.setProperty("/KNTTP_NAME", this.getView().getModel("i18n").getProperty("Label.AccountAssignment.None"));
			}
			
			this.updateModelBindings();
		},
		
		handleChangeItemCategory: function(oEvent){
			var selectedKey = oEvent.getParameters().selectedItem.getKey();
			if(selectedKey === "D"){
				this.C_MODEL.poItemDetail.setProperty("/SUMLIMIT", this.C_MODEL.poItemDetail.getProperty("/NETPR"));
				this.C_MODEL.poItemDetail.setProperty("/COMMITMENT", this.C_MODEL.poItemDetail.getProperty("/NETPR"));
				this.C_MODEL.poItemDetail.setProperty("/NOLIMIT", false);
				this.C_MODEL.poItemDetail.setProperty("/MENGE", "1");
				this.C_MODEL.poItemDetail.setProperty("/MEINS", "AU");
				this.C_MODEL.poItemDetail.setProperty("/MEINS_NAME", this.getView().getModel("i18n").getProperty("Label.ActivityUnit"));
			}else{
				this.C_MODEL.poItemDetail.setProperty("/SUMLIMIT", 0);
				this.C_MODEL.poItemDetail.setProperty("/COMMITMENT", 0);
				this.C_MODEL.poItemDetail.setProperty("/NOLIMIT", false);
				// this.C_MODEL.poItemDetail.setProperty("/MENGE", "");
				// this.C_MODEL.poItemDetail.setProperty("/MEINS", "");
				// this.C_MODEL.poItemDetail.setProperty("/MEINS_NAME", "");
			}
			this.C_MODEL.poItemDetail.updateBindings();
		},
		
		syncErrorMessages: function(){
			
			if(!this._MessageManager){
				return;
			}
			
			var messageData = this._MessageManager.getMessageModel().getData();
			var arr = [];
			for(var i=0;i<messageData.length;i++){
				var msg = $.extend({}, messageData[i]);
				arr.push(msg);
			}
			this.getOwnerComponent().getModel("errors").setData([]);
			this.getOwnerComponent().getModel("errors").setData(arr);
			this.getOwnerComponent().getModel("errors").updateBindings();
			this._MessageManager.removeAllMessages();
			
		},
		
		handleBackPress: function () {
			this.syncErrorMessages();
			this.doNavBack();
		},
		
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.cu.s4hana.zlpuba002_1.view.fragment." + sFragmentName, this);
			this.getView().addDependent(oFormFragment);
			
			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("idPoNewItemPage");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},		
		
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		
		doNavBack: function () {
			
			var poItemModel = this.getOwnerComponent().getModel("poItem");
			var page = "PoNewHeader";
			if(!poItemModel){
				page = "PrItemList";
			}

			return new Promise(function (fnResolve) {
				this.doNavigate(page, "", fnResolve, "", "", "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		
		doNavBackRefresh: function(){
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102_1"
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, false);
			
		},
		
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, Po, PoItem) {
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
					case "PoNewItem":
						this.oRouter.navTo(sRouteName, {
							Po: Po,
							PoItem: PoItem
						});
						break;
					case "PoNewHeader":
						this.oRouter.navTo(sRouteName);
						break;
					case "PrItemList":
						this.oRouter.navTo(sRouteName);
						break;
					default:
				}
				
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		
		onVHMaterial: function (oEvent) {
			
			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			// var mService = that.getOwnerComponent().getModel();
			var serviceUrl = this.getView().getModel().sServiceUrl.replace("zlpuba002_srv","zlpuba001_srv");
			var mService = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Material"),
				key: "MATNR",
				descriptionKey: "MAKTX",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "MATNR",
					label: this.getView().getModel("i18n").getProperty("Label.Material")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.MATNR = pSelected.MATNR;
                    	index.TXZ01 = pSelected.MAKTX;
                    	model.updateBindings();
                    	that.onChangeMaterial(index.MATNR);
                    	
                    	if(that.getView().byId("idPlant").getValue()){
							that.getView().byId("idValType").setEditable(true);				
						}
                    	
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Material"),
                        template: "MATNR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialName"),
                        template: "MAKTX",
                        demandPopin: true
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.SizeDimension"),
                        template: "GROES",
                        demandPopin: true
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4MaterialSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "MATNR",
                        label: this.getView().getModel("i18n").getProperty("Label.Material"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "MAKTX",
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "GROES",
                        label: this.getView().getModel("i18n").getProperty("Label.SizeDimension"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeItemShortText: function(oEvent){
			var sTarget = oEvent.getSource().getBindingPath("value");
			if(oEvent.getSource().getValue()){
				this.changeMessageModel(sTarget);
			}
		},
		
		onChangeMaterial: function (oEvent) {

			var that = this;
			var serviceUrl = this.getView().getModel().sServiceUrl.replace("zlpuba002_srv","zlpuba001_srv");
			var srvModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			var poItemDetail = that.C_MODEL.poItemDetail;
			var material = poItemDetail.getProperty("/MATNR");

			if (!material) {
				poItemDetail.setProperty("/MATNR", "");
				poItemDetail.setProperty("/TXZ01", "");
				poItemDetail.setProperty("/BWTAR", "");
				poItemDetail.setProperty("/BWTAR_NAME", "");
				poItemDetail.setProperty("/MATKL", "");
				poItemDetail.setProperty("/MATKL_NAME", "");
				poItemDetail.setProperty("/MEINS", "");
				poItemDetail.setProperty("/MEINS_NAME", "");
				that.getView().byId("idValType").setEditable(false);
				return;
			}

			var path = "/MatInfoSet('" + material + "')";

			srvModel.read(path, {

				success: function (s) {
					
					poItemDetail.setProperty("/TXZ01", s.MAKTX);
					poItemDetail.setProperty("/MATKL", s.MATKL);
					poItemDetail.setProperty("/MATKL_NAME", s.WGBEZ);
					poItemDetail.setProperty("/MEINS", s.MEINS);
					poItemDetail.setProperty("/MEINS_NAME", s.MSEHL);
					
					if(that.getView().byId("idPlant").getValue()){
						that.getView().byId("idValType").setEditable(true);				
					}

				},

				error: function (pError) {
					
					poItemDetail.setProperty("/MATNR", "");
					poItemDetail.setProperty("/TXZ01", "");
					poItemDetail.setProperty("/BWTAR", "");
					poItemDetail.setProperty("/BWTAR_NAME", "");
					poItemDetail.setProperty("/MATKL", "");
					poItemDetail.setProperty("/MATKL_NAME", "");
					poItemDetail.setProperty("/MEINS", "");
					poItemDetail.setProperty("/MEINS_NAME", "");
					that.getView().byId("idValType").setEditable(false);
					
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHMaterialGroup: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.MaterialGroup"),
				key: "MATKL",
				descriptionKey: "WGBEZ",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "MATKL",
					label: this.getView().getModel("i18n").getProperty("Label.MaterialGroup")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.MATKL = pSelected.MATKL;
                    	index.MATKL_NAME = pSelected.WGBEZ;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialGroup"),
                        template: "MATKL",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialGroupName"),
                        template: "WGBEZ",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4MatGroupSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "MATKL",
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialGroup"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "WGBEZ",
                        label: this.getView().getModel("i18n").getProperty("Label.MaterialGroupName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeMaterialGroup: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poItemDetail = that.C_MODEL.poItemDetail;
			var materialGroup = poItemDetail.getProperty("/MATKL");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!materialGroup) {
				poItemDetail.setProperty("/MATKL", "");
				poItemDetail.setProperty("/MATKL_NAME", "");
				return;
			}

			var path = "/F4MatGroupSet('" + materialGroup + "')";

			srvModel.read(path, {

				success: function (s) {
					poItemDetail.setProperty("/MATKL_NAME", s.WGBEZ);
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					poItemDetail.setProperty("/MATKL", "");
					poItemDetail.setProperty("/MATKL_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHTax: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Tax"),
				key: "MWSKZ",
				descriptionKey: "TEXT1",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "MWSKZ",
					label: this.getView().getModel("i18n").getProperty("Label.Tax")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.MWSKZ = pSelected.MWSKZ;
                    	index.MWSKZ_NAME = pSelected.TEXT1;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Tax"),
                        template: "MWSKZ",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.TaxName"),
                        template: "TEXT1",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4TaxCodeSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "MWSKZ",
                        label: this.getView().getModel("i18n").getProperty("Label.Tax"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "TEXT1",
                        label: this.getView().getModel("i18n").getProperty("Label.TaxName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeTax: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poItemDetail = that.C_MODEL.poItemDetail;
			var tax = poItemDetail.getProperty("/MWSKZ");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!tax) {
				poItemDetail.setProperty("/MWSKZ", "");
				poItemDetail.setProperty("/MWSKZ_NAME", "");
				return;
			}

			var path = "/F4TaxCodeSet('" + tax + "')";

			srvModel.read(path, {

				success: function (s) {
					poItemDetail.setProperty("/MWSKZ_NAME", s.TEXT1);
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					poItemDetail.setProperty("/MWSKZ", "");
					poItemDetail.setProperty("/MWSKZ_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHPlant: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Plant"),
				key: "WERKS",
				descriptionKey: "NAME1",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "WERKS",
					label: this.getView().getModel("i18n").getProperty("Label.Plant")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.WERKS = pSelected.WERKS;
                    	index.WERKS_NAME = pSelected.NAME1;
                    	index.LGORT = "";
                    	index.LGORT_NAME = "";
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
                    	
                    	that.getView().byId("idSloc").setEditable(true);
                    	
                    	if(that.getView().byId("idMaterial").getValue()){
							that.getView().byId("idValType").setEditable(true);				
						}
						
						if(index.KNTTP === 'K'){
                    		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER",index.WERKS);
                    		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER_NAME",index.WERKS_NAME);
                    		that.C_MODEL.poAccountAssignment.updateBindings();
                    	}
                    	
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Plant"),
                        template: "WERKS",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.PlantName"),
                        template: "NAME1",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4PlantSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "WERKS",
                        label: this.getView().getModel("i18n").getProperty("Label.Plant"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "NAME1",
                        label: this.getView().getModel("i18n").getProperty("Label.PlantName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangePlant: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poItemDetail = that.C_MODEL.poItemDetail;
			var plant = poItemDetail.getProperty("/WERKS");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!plant) {
				poItemDetail.setProperty("/WERKS", "");
				poItemDetail.setProperty("/WERKS_NAME", "");
				poItemDetail.setProperty("/LGORT", "");
				poItemDetail.setProperty("/LGORT_NAME", "");
				poItemDetail.setProperty("/BWTAR", "");
				poItemDetail.setProperty("/BWTAR_NAME", "");
				that.getView().byId("idSloc").setEditable(false);
				that.getView().byId("idValType").setEditable(false);
				
				if(poItemDetail.getProperty("/KNTTP") === 'K'){
            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER","");
            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER_NAME","");
            		that.C_MODEL.poAccountAssignment.updateBindings();
            	}
            	
				return;
			}

			var path = "/F4PlantSet('" + plant + "')";

			srvModel.read(path, {

				success: function (s) {
					poItemDetail.setProperty("/WERKS", s.WERKS);
					poItemDetail.setProperty("/WERKS_NAME", s.NAME1);
					poItemDetail.setProperty("/LGORT", "");
					poItemDetail.setProperty("/LGORT_NAME", "");
					that.changeMessageModel(sTarget);
					that.getView().byId("idSloc").setEditable(true);
					
					if(that.getView().byId("idMaterial").getValue()){
						that.getView().byId("idValType").setEditable(true);				
					}
					
					if(poItemDetail.getProperty("/KNTTP") === 'K'){
	            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER",s.WERKS);
	            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER_NAME", s.NAME1);
	            		that.C_MODEL.poAccountAssignment.updateBindings();
	            	}
						
				},

				error: function (pError) {
					
					poItemDetail.setProperty("/WERKS", "");
					poItemDetail.setProperty("/WERKS_NAME", "");
					poItemDetail.setProperty("/LGORT", "");
					poItemDetail.setProperty("/LGORT_NAME", "");
					that.getView().byId("idSloc").setEditable(false);
					that.getView().byId("idValType").setEditable(false);
					
					if(poItemDetail.getProperty("/KNTTP") === 'K'){
	            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER","");
	            		that.C_MODEL.poAccountAssignment.setProperty("/0/GSBER_NAME","");
	            		that.C_MODEL.poAccountAssignment.updateBindings();
	            	}

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHSloc: function (oEvent) {

			var that = this;
			var plant = this.C_MODEL.poItemDetail.getProperty("/WERKS");
			
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("WERKS","EQ",plant,""));
			
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.StorageLocation"),
				key: "LGORT",
				descriptionKey: "LGOBE",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "LGORT",
					label: this.getView().getModel("i18n").getProperty("Label.StorageLocation")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.WERKS = pSelected.WERKS;
                    	index.LGORT = pSelected.LGORT;
                    	index.LGORT_NAME = pSelected.LGOBE;
                    	model.updateBindings();
                    	that.onChangePlant();
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.StorageLocation"),
                        template: "LGORT",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.StorageLocationName"),
                        template: "LGOBE",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4SlocSet",
					filters: aFilters
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "LGORT",
                        label: this.getView().getModel("i18n").getProperty("Label.StorageLocation"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "LGOBE",
                        label: this.getView().getModel("i18n").getProperty("Label.StorageLocationName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeSloc: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poItemDetail = that.C_MODEL.poItemDetail;
			var plant = poItemDetail.getProperty("/WERKS");
			var sloc = poItemDetail.getProperty("/LGORT");

			if (!sloc) {
				poItemDetail.setProperty("/LGORT", "");
				poItemDetail.setProperty("/LGORT_NAME", "");
				return;
			}

			var path = "/F4SlocSet(WERKS='" + plant + "',LGORT='" + sloc + "')";

			srvModel.read(path, {

				success: function (s) {
					
					poItemDetail.setProperty("/LGORT_NAME", s.LGOBE);

				},

				error: function (pError) {
					
					poItemDetail.setProperty("/LGORT", "");
					poItemDetail.setProperty("/LGORT_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHCurrency: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getProperty("/");
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Currency"),
				key: "WAERS",
				descriptionKey: "KTEXT",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "WAERS",
					label: this.getView().getModel("i18n").getProperty("Label.Currency")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.WAERS = pSelected.WAERS;
                    	index.WAERS_NAME = pSelected.KTEXT;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.Currency"),
					template: "WAERS",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.CurrencyName"),
					template: "KTEXT",
					demandPopin: true
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4CurrencySet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "WAERS",
					label: this.getView().getModel("i18n").getProperty("Label.Currency"),
					control: new sap.m.Input(),
					operation: "NE"
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "KTEXT",
					label: this.getView().getModel("i18n").getProperty("Label.CurrencyName"),
					control: new sap.m.Input(),
					operation: "NE"
				}]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onVHCostCenter: function (oEvent) {

			var that = this;
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.CostCenter"),
				key: "KOSTL",
				descriptionKey: "KTEXT",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "KOSTL",
					label: this.getView().getModel("i18n").getProperty("Label.CostCenter")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.KOSTL = pSelected.KOSTL;
                    	index.KOSTL_NAME = pSelected.KTEXT;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.CostCenter"),
                        template: "KOSTL",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.CostCenterName"),
                        template: "KTEXT",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4CostCenterSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "KOSTL",
                        label: this.getView().getModel("i18n").getProperty("Label.CostCenter"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "KTEXT",
                        label: this.getView().getModel("i18n").getProperty("Label.CostCenterName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeCostCenter: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var costCenter = oEvent.getSource().getValue();

			if (!costCenter) {
				index.KOSTL = "";
				index.KOSTL_NAME = "";
				model.updateBindings();
				return;
			}
			
			if(!index.KOKRS){
				index.KOKRS = "1000";
			}

			var path = "/F4CostCenterSet(KOKRS='" + index.KOKRS + "',KOSTL='" + costCenter + "')";

			srvModel.read(path, {

				success: function (s) {
					index.KOSTL_NAME = s.KTEXT;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},

				error: function (e) {
					index.KOSTL = "";
					index.KOSTL_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHOrder: function (oEvent) {

			var that = this;
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				case "NA":
					model = this.C_MODEL.prNewAsset;
					index = model.getProperty("/");
					break;
				default:
			}

			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Order"),
				key: "AUFNR",
				descriptionKey: "KTEXT",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "AUFNR",
					label: this.getView().getModel("i18n").getProperty("Label.Order")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.AUFNR = pSelected.AUFNR;
                    	index.AUFNR_NAME = pSelected.KTEXT;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Order"),
                        template: "AUFNR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.OrderName"),
                        template: "KTEXT",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4OrderSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "AUFNR",
                        label: this.getView().getModel("i18n").getProperty("Label.Order"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "KTEXT",
                        label: this.getView().getModel("i18n").getProperty("Label.OrderName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeOrder: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var order = oEvent.getSource().getValue();

			if (!order) {
				index.AUFNR = "";
				index.AUFNR_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4OrderSet('" + order + "')";

			srvModel.read(path, {

				success: function (s) {
					index.AUFNR_NAME = s.KTEXT;
					model.updateBindings();
					
				},

				error: function (e) {
					index.AUFNR = "";
					index.AUFNR_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHFund: function (oEvent) {

			var that = this;
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			var sTarget = oEvent.getSource().getBindingPath("value");
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Fund"),
				key: "FINCODE",
				descriptionKey: "BEZEICH",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "FINCODE",
					label: this.getView().getModel("i18n").getProperty("Label.Fund")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.GEBER = pSelected.FINCODE;
                    	index.GEBER_NAME = pSelected.BEZEICH;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Fund"),
                        template: "FINCODE",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.FundName"),
                        template: "BEZEICH",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4FundSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "FINCODE",
                        label: this.getView().getModel("i18n").getProperty("Label.Fund"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BEZEICH",
                        label: this.getView().getModel("i18n").getProperty("Label.FundName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeFund: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var fund = oEvent.getSource().getValue();
			if (!fund) {
				index.GEBER = "";
				index.GEBER_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4FundSet('" + fund + "')";

			srvModel.read(path, {
				success: function (s) {
					index.GEBER_NAME = s.BEZEICH;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},
				error: function (pError) {
					index.GEBER = "";
					index.GEBER_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHGl: function (oEvent) {

			var that = this;
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.GlAccount"),
				key: "SAKNR",
				descriptionKey: "TXT20",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "SAKNR",
					label: this.getView().getModel("i18n").getProperty("Label.GlAccount")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.SAKTO = pSelected.SAKNR;
                    	index.SAKTO_NAME = pSelected.TXT20;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.GlAccount"),
                        template: "SAKNR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.GlAccountName"),
                        template: "TXT20",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4GlSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "SAKNR",
                        label: this.getView().getModel("i18n").getProperty("Label.GlAccount"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "TXT20",
                        label: this.getView().getModel("i18n").getProperty("Label.GlAccountName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeGl: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var Gl = oEvent.getSource().getValue();

			if (!Gl) {
				index.SAKTO = "";
				index.SAKTO_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4GlSet('" + Gl + "')";

			srvModel.read(path, {

				success: function (s) {
					index.SAKTO_NAME = s.TXT20;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},

				error: function (e) {
					index.SAKTO = "";
					index.SAKTO_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onVHBusinessArea: function (oEvent) {

			var that = this;
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.BusinessArea"),
				key: "GSBER",
				descriptionKey: "GTEXT",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "GSBER",
					label: this.getView().getModel("i18n").getProperty("Label.BusinessArea")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.GSBER = pSelected.GSBER;
                    	index.GSBER_NAME = pSelected.GTEXT;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.BusinessArea"),
                        template: "GSBER",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.BusinessAreaName"),
                        template: "GTEXT",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4BusAreaSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "GSBER",
                        label: this.getView().getModel("i18n").getProperty("Label.BusinessArea"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "GTEXT",
                        label: this.getView().getModel("i18n").getProperty("Label.BusinessAreaName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeBusinessArea: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var busArea = oEvent.getSource().getValue();

			if (!busArea) {
				index.GSBER = "";
				index.GSBER_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4BusAreaSet('" + busArea + "')";

			srvModel.read(path, {

				success: function (s) {
					index.GSBER_NAME = s.GTEXT;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},

				error: function (e) {
					index.GSBER = "";
					index.GSBER_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		changeMessageModel: function(sTarget){
			this.removeMessageFromTarget(sTarget);
		},
		
		removeMessageFromTarget: function (sTarget) {
			this._MessageManager.getMessageModel().getData().forEach(function(oMessage){
				if (oMessage.target === sTarget) {
					this._MessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},
		
		onVHFunctionalArea: function (oEvent) {

			var that = this;
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
				key: "FKBER",
				descriptionKey: "FKBTX",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "FKBER",
					label: this.getView().getModel("i18n").getProperty("Label.FunctionalArea")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.FKBER = pSelected.FKBER;
                    	index.FKBER_NAME = pSelected.FKBTX;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
                        template: "FKBER",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.FunctionalAreaName"),
                        template: "FKBTX",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4FuncAreaSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "FKBER",
                        label: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "FKBTX",
                        label: this.getView().getModel("i18n").getProperty("Label.FunctionalAreaName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeFunctionalArea: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var funcArea = oEvent.getSource().getValue();
			
			if (!funcArea) {
				index.FKBER = "";
				index.FKBER_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4FuncAreaSet('" + funcArea + "')";

			srvModel.read(path, {

				success: function (s) {
					index.FKBER_NAME = s.FKBTX;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					index.FKBER = "";
					index.FKBER_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHFundCenter: function (oEvent) {

			var that = this;
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.FundCenter"),
				key: "FICTR",
				descriptionKey: "BEZEICH",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "FICTR",
					label: this.getView().getModel("i18n").getProperty("Label.FundCenter")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.FISTL = pSelected.FICTR;
                    	index.FISTL_NAME = pSelected.BEZEICH;
                    	model.updateBindings();
                    	that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.FundCenter"),
                        template: "FICTR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.FundCenterName"),
                        template: "BEZEICH",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4FundCenterSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "FICTR",
                        label: this.getView().getModel("i18n").getProperty("Label.FundCenter"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BEZEICH",
                        label: this.getView().getModel("i18n").getProperty("Label.FundCenterName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeFundCenter: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var fundCenter = oEvent.getSource().getValue();

			if (!fundCenter) {
				index.FISTL = "";
				index.FISTL_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4FundCenterSet('" + fundCenter + "')";

			srvModel.read(path, {

				success: function (s) {
					index.FISTL_NAME = s.BEZEICH;
					model.updateBindings();
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					index.FISTL = "";
					index.FISTL_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHCommitment: function (oEvent) {

			var that = this;
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.CommitmentItem"),
				key: "FIPEX",
				descriptionKey: "BEZEI",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "FIPEX",
					label: this.getView().getModel("i18n").getProperty("Label.CommitmentItem")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.FIPOS = pSelected.FIPEX;
                    	index.FIPOS_NAME = pSelected.BEZEI;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.CommitmentItem"),
                        template: "FIPEX",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.CommitmentItemName"),
                        template: "BEZEI",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4CommitItemSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "FIPEX",
                        label: this.getView().getModel("i18n").getProperty("Label.CommitmentItem"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BEZEI",
                        label: this.getView().getModel("i18n").getProperty("Label.CommitmentItemName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeCommitment: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var commitmentItem = oEvent.getSource().getValue();

			if (!commitmentItem) {
				index.FIPOS = "";
				index.FIPOS_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4CommitItemSet('" + commitmentItem + "')";

			srvModel.read(path, {

				success: function (s) {
					index.FIPOS_NAME = s.BEZEI;
					model.updateBindings();
				},

				error: function (e) {
					index.FIPOS = "";
					index.FIPOS_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		prepareRefDoc: function(){
			
			var that = this;
			var data = this.C_MODEL.poItemDetail.getData();
			var form = this.getView().byId("idPoNewItemPage").getContent()[0].getSections()[0].getSubSections()[0].getBlocks()[0].getContent()[0];
			var control = form.getFormContainers()[2].getFormElements()[2].getFields()[0];
			control.removeAllItems();
			
			if(data.BANFN && data.BANFN !== ""){
				var link = new sap.m.Link({text: data.BANFN + " / " + parseInt(data.BNFPO,0), href: that.formatter.parseRefDocLink(data.BANFN, data.BNFPO), target: "_blank"});
				control.addItem(link);
			}else if(data.KONNR && data.KONNR !== ""){
				var link = new sap.m.Link({text: data.KONNR + " / " + parseInt(data.KTPNR,0), href: that.formatter.parseRefDocLink(data.KONNR, data.KTPNR), target: "_blank"});
				control.addItem(link);
			}else{
				var link = new sap.m.Link({text: "-", href: "", enabled: false});
				control.addItem(link);
			}
			
		},
		
		onVHValType: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poItemDetail;
			var index = model.getData();
			
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("MATNR","EQ",index.MATNR,""));
			aFilters.push(new sap.ui.model.Filter("BWKEY","EQ",index.WERKS,""));
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.ValType"),
				key: "BWTAR",
				descriptionKey: "DESCR",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "BWTAR",
					label: this.getView().getModel("i18n").getProperty("Label.ValType")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.BWTAR = pSelected.BWTAR;
                    	index.BWTAR_NAME = pSelected.DESCR;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.ValType"),
                        template: "BWTAR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.Description"),
                        template: "DESCR",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4ValTypeSet",
					filters: aFilters
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BWTAR",
                        label: this.getView().getModel("i18n").getProperty("Label.ValType"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "DESCR",
                        label: this.getView().getModel("i18n").getProperty("Label.Description"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeValType: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poItemDetail = that.C_MODEL.poItemDetail;
			var valType = poItemDetail.getProperty("/BWTAR");
			var material = poItemDetail.getProperty("/MATNR");
			var plant = poItemDetail.getProperty("/WERKS");

			if (!valType) {
				poItemDetail.setProperty("/BWTAR", "");
				poItemDetail.setProperty("/BWTAR_NAME", "");
				return;
			}

			var path = "/F4ValTypeSet(MATNR='" + material + "',BWKEY='" + plant + "',BWTAR='" + valType + "')";

			srvModel.read(path, {

				success: function (s) {
					poItemDetail.setProperty("/BWTAR_NAME", s.DESCR);
				},

				error: function (pError) {
					poItemDetail.setProperty("/BWTAR", "");
					poItemDetail.setProperty("/BWTAR_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},
		
		onVHEarmarkedFunds: function (oEvent) {

			var that = this;
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.EarmarkedFunds"),
				key: "BELNR",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "BELNR",
					label: this.getView().getModel("i18n").getProperty("Label.EarmarkedFunds")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.KBLNR = pSelected.BELNR;
                    	index.KBLPOS = pSelected.BLPOS;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.EarmarkedFunds"),
                        template: "BELNR",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.EarmarkedFundsItem"),
                        template: "BLPOS",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4EarFundSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BELNR",
                        label: this.getView().getModel("i18n").getProperty("Label.EarmarkedFunds"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "BLPOS",
                        label: this.getView().getModel("i18n").getProperty("Label.EarmarkedFundsItem"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeEarmarkedFunds: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					break;
				default:
			}
			
			var earmarkedFund = index.KBLNR;
			var earmarkedFundItem = index.KBLPOS;
			
			if(!earmarkedFund || !earmarkedFundItem){
				return;
			}

			if (!earmarkedFund && !earmarkedFundItem) {
				index.KBLNR = "";
				index.KBLPOS = "";
				model.updateBindings();
				return;
			}

			var path = "/F4EarFundSet(BELNR='" + earmarkedFund + "',BLPOS='" + earmarkedFundItem + "')";
			srvModel.read(path, {
				success: function (s) {
					index.KBLNR = s.BELNR;
					index.KBLPOS = s.BLPOS;
					model.updateBindings();
				},
				error: function (e) {
					index.KBLNR = "";
					index.KBLPOS = "";
					model.updateBindings();
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}
			});

		},
		
		onVHAsset: function (oEvent) {

			var that = this;
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			var paths;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					paths = oEvent.getSource().getBindingContext("poAccountAssignment").getPath();
					break;
				default:
			}
			
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Asset"),
				key: "ANLN1",
				descriptionKey: "TXT50",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "ANLN1",
					label: this.getView().getModel("i18n").getProperty("Label.Asset")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.ANLN1 = pSelected.ANLN1;
                    	index.ANLN2 = pSelected.ANLN2;
                    	model.updateBindings();
                    	if(knttp === "A"){
                    		that.getAssetInfo(index.ANLN1,index.ANLN2,paths);
                    	}
					},
					cancel: null,
					afterClose: null
				},
				columns: [
                    {
                        label: this.getView().getModel("i18n").getProperty("Label.Asset"),
                        template: "ANLN1",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.SubAsset"),
                        template: "ANLN2",
                        demandPopin: false
                    }, {
                        label: this.getView().getModel("i18n").getProperty("Label.AssetName"),
                        template: "TXT50",
                        demandPopin: false
                    }
                ],
				datas: {
					odataModel: mService,
					entitySet: "/F4AssetSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "ANLN1",
                        label: this.getView().getModel("i18n").getProperty("Label.Asset"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "ANLN2",
                        label: this.getView().getModel("i18n").getProperty("Label.SubAsset"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "TXT50",
                        label: this.getView().getModel("i18n").getProperty("Label.AssetName"),
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.NE
                    }
                ]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		onChangeAsset: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			
			var knttp = oEvent.getSource().getCustomData()[0].getProperty("value");
			var model;
			var index;
			var paths;
			
			switch (knttp) {
				case "-":
					model = this.C_MODEL.poItemDetail;
					index = model.getProperty("/");
					break;
				case "K":
					model = this.C_MODEL.poAccountAssignment;
					index = model.getProperty("/0");
					break;
				case "A":
					model = this.C_MODEL.poAccountAssignment;
					index = oEvent.getSource().getBindingContext("poAccountAssignment").getObject();
					paths = oEvent.getSource().getBindingContext("poAccountAssignment").getPath();
					break;
				case "NA":
					model = this.C_MODEL.poNewAsset;
					index = model.getProperty("/");
					break;
				default:
			}
			
			/* CH10 : DEL
			var asset = oEvent.getSource().getValue();

			if (!asset) {
				index.ANLN1 = "";
				index.ANLN2 = "";
				index.MENGE = "1";
				index.SAKTO = "";
				index.SAKTO_NAME = "";
				index.GSBER = "";
				index.GSBER_NAME = "";
				index.FIPOS = "";
				index.FIPOS_NAME = "";
				index.AUFNR = "";
				index.AUFNR_NAME = "";
				index.FISTL = "";
				index.FISTL_NAME = "";
				index.GEBER = "";
				index.GEBER_NAME = "";
				index.FKBER = "";
				index.FKBER_NAME = "";
				model.updateBindings();
				return;
			}
			CH10 : DEL */

			// CH10 : INS
			var oSource = oEvent.getSource().mBindingInfos.value.binding.sPath;

			if (oSource === "ANLN1") {
				var asset = oEvent.getSource().getValue();
				
				if (!asset) {
					index.ANLN1 = "";
					index.ANLN2 = "";
					index.MENGE = "1";
					index.SAKTO = "";
					index.SAKTO_NAME = "";
					index.GSBER = "";
					index.GSBER_NAME = "";
					index.FIPOS = "";
					index.FIPOS_NAME = "";
					index.AUFNR = "";
					index.AUFNR_NAME = "";
					index.FISTL = "";
					index.FISTL_NAME = "";
					index.GEBER = "";
					index.GEBER_NAME = "";
					index.FKBER = "";
					index.FKBER_NAME = "";
					model.updateBindings();
					return;
				} else {
					var tbrIndex = parseInt(paths.replace('/',''),10);
					var subasset = that.getView().getModel("poAccountAssignment").oData[tbrIndex].ANLN2;

					if (!subasset) {
						var subasset = "0";
					}
				}
			} else if(oSource === "ANLN2") {
				var tbrIndex = parseInt(paths.replace('/',''),10);
				var asset = that.getView().getModel("poAccountAssignment").oData[tbrIndex].ANLN1;

				if (!asset) {
					index.ANLN1 = "";
					index.ANLN2 = "";
					index.MENGE = "1";
					index.SAKTO = "";
					index.SAKTO_NAME = "";
					index.GSBER = "";
					index.GSBER_NAME = "";
					index.FIPOS = "";
					index.FIPOS_NAME = "";
					index.AUFNR = "";
					index.AUFNR_NAME = "";
					index.FISTL = "";
					index.FISTL_NAME = "";
					index.GEBER = "";
					index.GEBER_NAME = "";
					index.FKBER = "";
					index.FKBER_NAME = "";
					model.updateBindings();
					return;
				} else {
					var subasset = oEvent.getSource().getValue();;
				}
			}
			// CH10 : INS

			// var path = "/F4AssetSet('" + asset + "')";					// CH10 : DEL
			var path = "/F4AssetSet(ANLN1='" + asset + "',ANLN2='" + subasset + "')";	// CH10 : INS

			srvModel.read(path, {

				success: function (s) {
					index.ANLN2 = s.ANLN2;
					model.updateBindings();
					if(knttp === "A"){
						that.getAssetInfo(index.ANLN1,index.ANLN2,paths);
					}
				},

				error: function (e) {
					index.ANLN1 = "";
					index.ANLN2 = "";
					index.MENGE = "1";
					index.SAKTO = "";
					index.SAKTO_NAME = "";
					index.GSBER = "";
					index.GSBER_NAME = "";
					index.FIPOS = "";
					index.FIPOS_NAME = "";
					index.AUFNR = "";
					index.AUFNR_NAME = "";
					index.FISTL = "";
					index.FISTL_NAME = "";
					index.GEBER = "";
					index.GEBER_NAME = "";
					index.FKBER = "";
					index.FKBER_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		getAssetInfo: function(asset,subAsset,paths){
			
			var that = this;
			var srvModel = that.getView().getModel();
			var model = this.C_MODEL.poAccountAssignment;
			var path = "/AssetInfoSet(KOKRS='1000',ANLN1='" + asset + "',ANLN2='" + subAsset + "')";
			srvModel.read(path, {
				success: function (s) {
					model.setProperty(paths + "/ANLN2", s.ANLN2);
					model.setProperty(paths + "/SAKTO", s.SAKTO);
					model.setProperty(paths + "/SAKTO_NAME", s.SAKTO_NAME);
					model.setProperty(paths + "/GSBER", s.GSBER);
					model.setProperty(paths + "/GSBER_NAME", s.GSBER_NAME);
					model.setProperty(paths + "/FIPOS", s.FIPOS);
					model.setProperty(paths + "/FIPOS_NAME", s.FIPOS_NAME);
					model.setProperty(paths + "/AUFNR", s.AUFNR);
					model.setProperty(paths + "/AUFNR_NAME", s.AUFNR_NAME);
					model.setProperty(paths + "/FISTL", s.FISTL);
					model.setProperty(paths + "/FISTL_NAME", s.FISTL_NAME);
					model.setProperty(paths + "/GEBER", s.GEBER);
					model.setProperty(paths + "/GEBER_NAME", s.GEBER_NAME);
					model.setProperty(paths + "/FKBER", s.FKBER);
					model.setProperty(paths + "/FKBER_NAME", s.FKBER_NAME);
					model.updateBindings();
				},
				error: function (pError) {
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}
			});
			
		},
		
		handleSuggest: function(oEvent){
			// var oSource = oEvent.getSource();
			// var sTerm = oEvent.getParameter("suggestValue");
		 //   var aFilters = [];
		    
		 ////   if (!oSource.getSuggestionItems().length) {
			// // 	oSource.bindAggregation("suggestionItems", {
			// // 		path: "/F4MaterialSet",
			// // 		template: new sap.ui.core.Item({
			// // 			text: "{MATNR}"
			// // 		})
			// // 	});
			// // }
		    
		 //   if (sTerm) {
		 //       aFilters.push(new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.StartsWith, sTerm));
		 //   }
		 //   var oBinding = oSource.getBinding('suggestionRows');
		 //   oBinding.filter(aFilters);
		 //   oBinding.attachEventOnce('dataReceived', function() {
			// 	oBinding.updateBindings();
			// });
		},
		
		handleAddAsset: function(oEvent){
			var that = this;
			var list = oEvent.getSource().getParent().getParent();
			
			var itemQty = this.C_MODEL.poItemDetail.getData().MENGE;
			var assetList = this.C_MODEL.poAccountAssignment.getData();
			var remainQty = itemQty;
			for(var i=0;i<assetList.length;i++){
				remainQty = parseInt(remainQty,0) - parseInt(assetList[i].MENGE,0);
			}
			
			var addAssetDialog = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getProperty("Label.Confirm"),
				type: 'Message',
				content: [
					new sap.m.HBox({
						justifyContent: "Center",
						alignItems: "Center",
						items: [
							new sap.m.Label({ text: that.getView().getModel("i18n").getProperty("Label.ConfirmAddQty"), labelFor: 'idAddAsset'}),
							new sap.m.StepInput('idAddAsset', {
								value: remainQty,
								min: 1,
								width: '80px'
							}).addStyleClass("sapUiTinyMarginBegin")
						]
					})
				],
				beginButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getProperty("Label.Ok"),
					enabled: true,
					press: function () {
						var val = sap.ui.getCore().byId('idAddAsset').getValue();
						addAssetDialog.close();
						
						if(val > 0){
							that.doHandleAddAsset(val);
						}
						list.removeSelections();
					}
				}),
				endButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getProperty("Button.Cancel"),
					press: function () {
						addAssetDialog.close();
					}
				}),
				afterClose: function() {
					addAssetDialog.destroy();
				}
			});

			addAssetDialog.open();
			
		},
		
		doHandleAddAsset: function(val){
			
			var poItemData = this.C_MODEL.poItemDetail.getData();
			var model = this.C_MODEL.poAccountAssignment;
			var data = model.getData();
			
			//Get max line
			var currentItem = data.length;
			
			for(var i=1;i<=val;i++){
				currentItem = parseInt(currentItem,0);
				if(currentItem < 9){
					var nextItem = "0" + (currentItem + 1);
				}else{
					var nextItem = "" + (currentItem + 1);
				}
				currentItem = nextItem;
				data.push({
					EBELN: poItemData.EBELN,
					EBELP: poItemData.EBELP,
					ZEKKN: nextItem,
					MENGE: 1,
					MEINS: poItemData.MEINS
				});
			}
			
			model.setData([]);
			model.setData(data);
			model.updateBindings();
			
		},
		
		handleDeleteAsset: function(oEvent){
			
			var that = this;
			var list = oEvent.getSource().getParent().getParent();
			var selectedData = list.getSelectedItems();
			if(selectedData.length === 0){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error( this.getView().getModel("i18n").getProperty("Message.Selected1Line"),
					{ styleClass: bCompact ? "sapUiSizeCompact" : "" }
				);
				return;
			}
			
			var poAccAssignmentModel = that.C_MODEL.poAccountAssignment;
			var poAccAssignmentData = $.extend([],poAccAssignmentModel.getData());
			var poItem;
			
			for(var i=0;i<selectedData.length;i++){
				poItem = selectedData[i].getBindingContext("poAccountAssignment").getObject().EBELP;
				var itemNumber = selectedData[i].getBindingContext("poAccountAssignment").getObject().ZEKKN;
				var idx = that.findIndexAcc(itemNumber,poAccAssignmentData);
				poAccAssignmentData.splice(idx, 1);
			}
			
			// Re-run index number
			for(var j=0;j<poAccAssignmentData.length;j++){
				var index = j + 1;
				if(index < 10){
					poAccAssignmentData[j].ZEKKN = "0" + index;
				}else{
					poAccAssignmentData[j].ZEKKN = "" + index;
				}
			}
			
			that.C_MODEL.poAccountAssignment.setData([]);
			that.C_MODEL.poAccountAssignment.setData(poAccAssignmentData);
			that.C_MODEL.poAccountAssignment.updateBindings();
			list.removeSelections();
			
			// Sync back
			var poItemModel = that.getOwnerComponent().getModel("poItem");
			var poItemData = poItemModel.getProperty("/");
			for(var i=0;i<poItemData.length;i++){
				if(parseInt(poItemData[i].EBELP,0) === parseInt(poItem,0)){
					poItemData[i].PoAccAssignment.results = [];
					poItemData[i].PoAccAssignment.results = poAccAssignmentData;
				}
			}
			poItemModel.updateBindings();
			
		},
		
		findIndexAcc: function(itemNumber,poAccData){
			var idx = -1;
			for(var i=0;i<poAccData.length;i++){
				if(parseInt(poAccData[i].ZEKKN,0) === parseInt(itemNumber,0)){
					idx = i;
				}
			}
			return idx;
		},
		
		onChangeSumLimit: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			
			if(parseFloat(index.SUMLIMIT) > 0){
				var sTarget = oEvent.getSource().getBindingPath("value");
				this.changeMessageModel(sTarget);
			}
			
		},
		
		onChangeExpectLimit: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			
			if(parseFloat(index.COMMITMENT) > 0){
				var sTarget = oEvent.getSource().getBindingPath("value");
				this.changeMessageModel(sTarget);
			}
			
			index.NETPR = index.COMMITMENT;
			index.RLWRT = index.COMMITMENT;
			
		},
		
		onChangeNolimit: function(oEvent){
			
			var sumLimitControl = this.getView().byId("idSumLimit");
			var sumLimitLabel = sumLimitControl.getParent().getLabel();
			
			sumLimitLabel.setRequired(!oEvent.mParameters.selected);
			sumLimitControl.setEditable(!oEvent.mParameters.selected);
			sumLimitControl.setValue(0);
			
		},
		
		onChangeQty: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			// Check Price Unit
			if(index.PEINH && index.PEINH > 0){
				if(index.PEINH === 1){
					index.RLWRT = index.MENGE * index.NETPR;
				}else{
					index.RLWRT = ( index.MENGE / index.PEINH ) * index.NETPR;
				}
			}
			
			if(parseFloat(index.MENGE) > 0){
				var sTarget = oEvent.getSource().getBindingPath("value");
				this.changeMessageModel(sTarget);
			}
			
		},
		
		onChangeUnit: function (oEvent) {

			//Get Material Unit
			var that = this;
			var srvModel = that.getView().getModel();
			var model = this.C_MODEL.poItemDetail;
			var index = model.getProperty("/");
			var unit = index.MEINS_NAME;
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!unit) {
				index.MEINS = "";
				index.MEINS_NAME = "";
				model.updateBindings();
				return;
			}

			var path = "/F4UnitSet('" + unit + "')";

			srvModel.read(path, {

				success: function (s) {
					
					index.MEINS = s.ZUNIT;
					index.MEINS_NAME = s.MSEHL;
					model.updateBindings();
					that.changeMessageModel(sTarget);

				},

				error: function (pError) {
					
					index.MEINS = "";
					index.MEINS_NAME = "";
					model.updateBindings();

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},
		
		onChangeUnitPrice: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			// Check Price Unit
			if(index.PEINH && index.PEINH > 0){
				if(index.PEINH === 1){
					index.RLWRT = index.MENGE * index.NETPR;
				}else{
					index.RLWRT = ( index.MENGE / index.PEINH ) * index.NETPR;
				}
			}
			
			if(parseFloat(index.NETPR) > 0){
				var sTarget = oEvent.getSource().getBindingPath("value");
				this.changeMessageModel(sTarget);
			}
			
		},
		
		onChangePriceUnit: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			// Check Price Unit
			if(index.PEINH && index.PEINH > 0){
					if(index.PEINH === 1){
						index.RLWRT = index.MENGE * index.NETPR;
					}else{
						index.RLWRT = ( index.MENGE / index.PEINH ) * index.NETPR;
					}
			}
			
			if(parseFloat(index.PEINH) > 0){
				var sTarget = oEvent.getSource().getBindingPath("value");
				this.changeMessageModel(sTarget);
			}
			
		},
		
		onChangeTotalValue: function(oEvent){
			
			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));
			
			var index = this.C_MODEL.poItemDetail.getProperty("/");
			if(index.NETPR !== 0){
				index.MENGE = index.RLWRT / index.NETPR;
			}
		},
		
		onChangeDeliveryDate: function(oEvent){
			if(oEvent.getParameters().valid){
				var sTarget = oEvent.getSource().getBindingPath("dateValue");
				this.changeMessageModel(sTarget);
			}else{
				oEvent.getSource().setDateValue(null);
				oEvent.getSource().setValue(null);
			}
		},
		
		onVHUnit: function (oEvent) {

			var that = this;
			// var oInputControl = oEvent.getSource();
			// var aTokens = oInputControl.getTokens();
			var model = this.C_MODEL.poItemDetail;
			var index = model.getProperty("/");
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Unit"),
				key: "ZUNIT",
				descriptionKey: "MSEHL",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "ZUNIT",
					label: this.getView().getModel("i18n").getProperty("Label.Unit")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
                    	index.MEINS = pSelected.ZUNIT;
                    	index.MEINS_NAME = pSelected.MSEHL;
                    	model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.Unit"),
					template: "ZUNIT",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.UnitName"),
					template: "MSEHL",
					demandPopin: true
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4UnitSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "ZUNIT",
					label: this.getView().getModel("i18n").getProperty("Label.Unit"),
					control: new sap.m.Input(),
					operation: "NE"
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "MSEHL",
					label: this.getView().getModel("i18n").getProperty("Label.UnitName"),
					control: new sap.m.Input(),
					operation: "NE"
				}]
			};
			
			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		
		},
		
		convertErrorFormat: function(arrErrors) {
			for (var i in arrErrors) {
				arrErrors[i].MESSAGE = arrErrors[i].message;
			}
		},
		
		createErrorMessagePopoverAsset: function (arrErrors) {

			var that = this;
			var errorList = [];
			var lvArrError = that.deleteDuplicateRecords(arrErrors);
			for (var i = 0; i < lvArrError.length; i++) {
				
				if(lvArrError[i]["code"] === "/IWBEP/CX_MGW_TECH_EXCEPTION"){
					continue;
				}
				
				var title = "";
				var msg = "";
				if (that.isHasData(lvArrError[i]["MESSAGE"])) {
					var msgArr = lvArrError[i]["MESSAGE"].split("|");
					if (msgArr.length > 1) {
						title = msgArr[1];
						msg = "Message: " + msgArr[1];
					} else {
						title = lvArrError[i]["MESSAGE"];
						msg = "Message: " + lvArrError[i]["MESSAGE"];
					};
				}
				if (title !== "Return") {
					var errorRow = {
						type: 'Error',
						title: title,
						description: msg,
						subtitle: '',
						counter: 1
					};
					errorList.push(errorRow);
				};

			};

			var oErrorModel = that.C_MODEL.errorsAsset;
			oErrorModel.setProperty("/ERROR_NUM", errorList.length);
			oErrorModel.setProperty("/VISIBLE", true);

			var oMessageTemplate = new sap.m.MessagePopoverItem({
				type: '{type}',
				title: '{title}',
				description: '{description}'
			});

			that.oMessagePopoverAsset = new sap.m.MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				}
			});

			var oMsgErrorModel = new sap.ui.model.json.JSONModel(errorList);
			that.oMessagePopoverAsset.setModel(oMsgErrorModel);

			if (errorList.length > 0) {
				sap.m.MessageBox.error("เกิดข้อผิดพลาด กรุณาตรวจสอบ Error Log");
			}
		},
		
		deleteDuplicateRecords: function(arrErrors) {

			var errorList = [];
			var lvDuplicated;

			for (var i = 0; i < arrErrors.length; i++) {

				lvDuplicated = false;
				for (var j = 0; j < errorList.length; j++) {
					// Check duplicated message
					if (arrErrors[i]["MESSAGE"] == errorList[j]["MESSAGE"]) {
						lvDuplicated = true;
						break;
					}
				}

				if (!lvDuplicated) {
					errorList.push(arrErrors[i]);
				}

			}

			return errorList;

		},
		
		handleErrorLogAssetPress: function (evt) {
			this.oMessagePopoverAsset.openBy(evt.getSource());
		},
		
		clearErrorLogAsset: function () {
			if (this.oMessagePopoverAsset) {
				this.oMessagePopoverAsset.close();
			}
			this.C_MODEL.errorsAsset.setProperty("/VISIBLE", false);
			this.C_MODEL.errorsAsset.setProperty("/ERROR_NUM", 0);
		},
		
		validateDataForCreateNewAsset: function(){
			return true;	
		},
		
		isHasData: function(input) {
			if (this.isNullOrBlank(input)) {
				return false;
			} else {
				return true;
			}
		},
		
		isNullOrBlank: function(e) {
			return "boolean" != typeof e && (!e || null == e || "" == e);
		},
		
		onAfterShow:function(oEvent){
			var objectPageLayout = this.getView().getContent()[0].getContent()[0];
			var firstSectionId = objectPageLayout.getSections()[0].getId();
			objectPageLayout.setSelectedSection(firstSectionId);
		},
		
		// selectedSuggestMaterial: function(oEvent){
		// 	var selectedMatDesc = oEvent.getParameters().selectedRow.getBindingContext().getObject().MAKTX;
		// 	this.C_MODEL.poItemDetail.setProperty("/TXZ01", selectedMatDesc);
		// },
		
		onTextBoxLiveChange: function (oEvent) {
            // debugger;
            GUtilities.formatTextArea(oEvent, 120);
        },
		
		onExit: function () {

			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName) || this._formFragments[sPropertyName] === null) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}

		}
	});
}, /* bExport= */ true);
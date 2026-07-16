sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"../utilities/Formatter",
	"../utilities/Utilities",
	"iam/bc/utilities/ValueHelpCollection",
	"iam/bc/utilities/CommonVHDialog",
	"iam/bc/utilities/Utilities"
], function (BaseController, MessageBox, History, Formatter, LocalUtilities, ValueHelpCollection, CommonVHDialog, GUtilities) {
	"use strict";

	return BaseController.extend("com.cu.s4hana.zlpuba002_1.controller.PoNewHeader", {

		formatter: Formatter,

		_criterias: [{
			id: "idDialogPrNo",
			keyfield: "BANFN",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogPrDocType",
			keyfield: "BSART",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogPlant",
			keyfield: "WERKS",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogMaterial",
			keyfield: "MATNR",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogShortText",
			keyfield: "TXZ01",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogMaterialGroup",
			keyfield: "MATKL",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogPurchasingGroup",
			keyfield: "EKGRP",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogVendor",
			keyfield: "LIFNR",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogFundCenter",
			keyfield: "FISTL",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogFund",
			keyfield: "GEBER",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogAccountAssignment",
			keyfield: "KNTTP",
			type: "MultiComboBox",
			control: null
		}, {
			id: "idDialogCreateBy",
			keyfield: "ERNAM",
			type: "MultiInput",
			control: null
		}, {
			id: "idDialogCreateDate",
			keyfield: "BADAT",
			type: "DateRange",
			control: null
		}, {
			id: "idDialogDeliveryDate",
			keyfield: "LFDAT",
			type: "DateRange",
			control: null
		}],

		C_MODEL_NAME: {
			poHeader: "poHeader",
			poItem: "poItem",
			poHeaderText: "poHeaderText",
			poItemText: "poItemText",
			attachmentModel: "attachmentModel",
			deletedAttachmentModel: "deletedAttachmentModel",
			f4Vendor: "f4Vendor",
			controlModel: "controlModel",
			addItemModel: "addItemModel",
			errors: "errors"
		},

		C_MODEL: {
			poHeader: null,
			poItem: null,
			poHeaderText: null,
			poItemText: null,
			attachmentModel: null,
			deletedAttachmentModel: null,
			controlModel: null,
			addItemModel: null,
			f4Vendor: null,
			errors: null,
			egpTime: null					//CH09: Ins
		},

		isInit: true,
		_formFragments: {},
		uploadFailCount: 0, //CH12: Add

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PoNewHeader").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.initModel();
			// this.getView().addEventDelegate({
			//           onAfterShow : jQuery.proxy(function(evt) {
			//                this.onAfterShow(evt);
			//           }, this)
			//       });

			this._MessageManager = new sap.ui.core.message.MessageManager();
			this.getView().setModel(this._MessageManager.getMessageModel(), "message");	

		},

		createMessagePopover: function () {
			var that = this;
			this.oMP = new sap.m.MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item"),
						oPage = that.oView.byId("idPoNewHeaderPage"),
						oMessage = oItem.getBindingContext("message").getObject(),
						oControl = sap.ui.getCore().byId(oMessage.getControlId());
					if (oControl) {
						oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
						setTimeout(function () {
							oControl.focus();
						}, 300);
					}
				},
				items: {
					path: "message>/",
					template: new sap.m.MessageItem({
						title: "{message>message}",
						subtitle: "{message>additionalText}",
						groupName: {
							parts: [{
								path: 'message>code'
							}],
							formatter: this.getGroupName
						},
						activeTitle: {
							parts: [{
								path: 'message>target'
							}, {
								path: 'message>processor'
							}],
							formatter: this.isPositionable
						},
						type: "{message>type}",
						description: "{message>description}"
					})
				}
			});

			this.oMP._oMessageView.setGroupItems(true);
			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
		},

		handleRequiredField: function (control, controlType, section) {
			var sTarget, val;
			switch (controlType) {
			case "input":
				sTarget = control.getBindingPath("value");
				val = control.getValue();
				break;
			case "date":
				sTarget = control.getBindingPath("dateValue");
				val = control.getValue();
				break;
			case "select":
				sTarget = control.getBindingPath("selectedKey");
				val = control.getSelectedKey();
				break;
			case "token":
				sTarget = control.getBindingPath("value");
				if (control.getTokens().length > 0) {
					val = "ok";
				} else {
					val = "";
				}
				break;
			}
			this.removeMessageFromTarget(sTarget);
			if (!val) {
				this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
						code: section,
						type: sap.ui.core.MessageType.Error,
						additionalText: control.getLabels()[0].getText(),
						description: control.getLabels()[0].getText(),
						target: sTarget,
						processor: this.getView().getModel("poHeader")
					})
				);
			}
		},

		removeMessageFromTarget: function (sTarget) {
			if (this._MessageManager) {
				this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
					if (oMessage.target === sTarget) {
						this._MessageManager.removeMessages(oMessage);
					}
				}.bind(this));
			}
		},

		getGroupName: function (code) {
			if (code) {
				return code;
			} else {
				return "";
			}
		},

		isPositionable: function (target, processor) {
			if (target && processor) {
				return true;
			} else {
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

		changeMessageModel: function (sTarget) {
			this.removeMessageFromTarget(sTarget);
		},

		onExit: function () {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName) || this._formFragments[sPropertyName] === null) {
					return;
				}
				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
			if (oFormFragment) {
				return oFormFragment;
			}
			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "com.cu.s4hana.zlpuba002_1.view.fragment." + sFragmentName, this);
			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment: function (sFragmentName) {
			var oPage = this.byId("idPoNewHeaderPage");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		handleRouteMatched: function (oEvent) {

			if (this.isInit) {
				// this._showFormFragment("PoNewHeader");
				this.initModel();
				this.resetData();
				this.defaultScreenData();
				this.getData();
			} else {

				this.updateModelBindings();
				this.isInit = true;

				if (this.C_MODEL.errors.getData().length > 0) {
					this.syncMessagePopover();
					// var oButton = this.getView().byId("messagePopoverBtn");
					// setTimeout(function(){
					// 	this.oMP.openBy(oButton);
					// }.bind(this), 100);
				}

			}

			this.initialScreen();
		},

		defaultScreenData: function () {

			this.C_MODEL.poHeader.setProperty("/BEDAT", new Date());
			this.C_MODEL.poHeader.setProperty("/E_GP_NR", "");
			this.C_MODEL.poHeader.setProperty("/BUKRS", "1000");
			this.C_MODEL.poHeader.setProperty("/EKORG", "1000");
			this.C_MODEL.poHeader.setProperty("/ZZMM_NO_ESIGN", false);
			// this.C_MODEL.poHeader.setProperty("/E_GP_NR", "");

		},

		getDatafromPrList: function () {

			var that = this;
			var prList = this.getOwnerComponent().getModel("poItemModel");
			var poItem = this.C_MODEL.poItem;
			var defer = new $.Deferred();

			if (!prList) {
				this.doNavBackRefresh();
				defer.resolve();
			} else {

				if (this.getView().getBusy() === false) {
					this.getView().setBusyIndicatorDelay(0);
					this.getView().setBusy(true);
				}

				var prListData = prList.getData();
				var arr = [];
				for (var i = 0; i < prListData.length; i++) {
					var it = $.extend({}, prListData[i]);
					var rec = {};
					rec.EBELN = "NEW";
					rec.EBELP = (i + 1) * 10;
					rec.BANFN = it.BANFN;
					rec.BNFPO = it.BNFPO;
					rec.BSART = it.BSART;
					arr.push(rec);
				}
				poItem.setData([]);
				poItem.setSizeLimit(arr.length); //++CH01
				poItem.setData(arr);
				poItem.updateBindings();

				var aDefer = [];
				for (var i = 0; i < arr.length; i++) {
					aDefer.push(this.getPrItemData(arr[i].BANFN, arr[i].BNFPO));
				}
				aDefer.push(this.getPoItemTextData());
				aDefer.push(this.getPernrControlField(new Date(), prListData[0].EKGRP));
				$.when.apply($, aDefer).then(function (status) {
					defer.resolve();
				});

			}

			return defer;

		},

		updatePoItemText: function () {

			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();
			var poItemText = this.C_MODEL.poItemText.getData();

			for (var i = 0; i < poItemData.length; i++) {
				for (var j = 0; j < poItemText.length; j++) {
					var text = $.extend({}, poItemText[j]);
					if (text.TDID === "F12") {
						text.DETAIL = poItemData[i].ZZFM_YEAR;
					} else if (text.TDID === "F01") {
						text.DETAIL = poItemData[i].ExtItemText;
						delete poItemData[i].ExtItemText;
					}
					poItemData[i].PoItemText.results.push(text);
				}
			}
			poItemModel.updateBindings();

			this.C_MODEL.poHeader.setProperty("/LIFNR", poItemData[0].LIFNR);
			this.C_MODEL.poHeader.setProperty("/LIFNR_NAME", poItemData[0].LIFNR_NAME);
			this.C_MODEL.poHeader.setProperty("/EKGRP", poItemData[0].EKGRP);
			this.C_MODEL.poHeader.setProperty("/EKGRP_NAME", poItemData[0].EKGRP_NAME);
			this.C_MODEL.poHeader.updateBindings();

		},

		getPernrControlField: function (date, purchGroup) {

			var that = this;
			var poHeaderModel = this.C_MODEL.poHeader;
			var poHeaderData = poHeaderModel.getData();
			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();
			var srvModel = this.getView().getModel();
			//var date = "" + encodeURIComponent(date.toISOString().substring(0, 10) + "T07:00:00");   // CH08 : DEL
			var defer = new $.Deferred();
			var oButton = this.getView().byId("messagePopoverBtn");

			that.changeMessageModel("/ZMMAPP_PERNR");

			var isEgp = true;
			if (poItemData.length > 0) {
				if (poItemData[0].BSART === "1A31" || poItemData[0].BSART === "1INT") {
					isEgp = false;
				}
			}

			if (!isEgp) {
				poHeaderModel.setProperty("/ZMMAPP_PERNR", "");
				poHeaderModel.setProperty("/ZMMAPP_VORNA", "");
				poHeaderModel.setProperty("/ZMMAPP_NACH2", "");
				poHeaderModel.setProperty("/ZMMAPP_PLANS", "");
				poHeaderModel.setProperty("/ZMMAPP_STEXT", "");
				poHeaderModel.setProperty("/ZMMACTO_PERNR", "");
				poHeaderModel.setProperty("/ZMMACTO_VORNA", "");
				poHeaderModel.setProperty("/ZMMACTO_NACH2", "");
				poHeaderModel.setProperty("/ZMMACTO_PLANS", "");
				poHeaderModel.setProperty("/ZMMACTO_STEXT", "");
				poHeaderModel.updateBindings();
			}

			// var path = "/F4PernrSet(PERNR='00000000',EKGRP='" + purchGroup + "',BEDAT=datetime'" + date + "')";
			//var path = "/PernrInfoSet(EKGRP='" + purchGroup + "',BEDAT=datetime'" + date + "')";          // CH08 : DEL
            
            // CH08 : START INS
            var aFilters = [];                                            
            var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("EKGRP", "EQ", purchGroup, ""),
					new sap.ui.model.Filter("BEDAT", "EQ", date, "")
				],
				and: true
			})
            aFilters.push(oFilter);
            // CH08 : END INS
            
			//srvModel.read(path, {                             // CH08 : DEL
            srvModel.read("/PernrInfoSet", {                       // CH08 : INS
                filters: [new sap.ui.model.Filter(aFilters, false)],            // CH08 : INS
				success: function (s) {
                    // CH08 : START INS
                    for (var i=0; i < s.results.length; i++) {
                        poHeaderModel.setProperty("/PERNR_AUTH_FLAG", s.results[i].ZSCREENCTRL);
                        if (!isEgp) {
                            if (s.results[i].ZMMAPP_VORNA !== "") {
                                poHeaderModel.setProperty("/ZMMAPP_PERNR", s.results[i].ZMMAPP_PERNR);
                                poHeaderModel.setProperty("/ZMMAPP_VORNA", s.results[i].ZMMAPP_VORNA);
                                poHeaderModel.setProperty("/ZMMAPP_NACH2", s.results[i].ZMMAPP_NACH2);
                                poHeaderModel.setProperty("/ZMMAPP_PLANS", s.results[i].ZMMAPP_PLANS);
                                poHeaderModel.setProperty("/ZMMAPP_STEXT", s.results[i].ZMMAPP_STEXT);

                                that._MessageManager.addMessages(
                                    new sap.ui.core.message.Message({
                                        message: that.getView().getModel("i18n").getProperty("Message.AuthPersonChanged"),
                                        code: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
                                        type: sap.ui.core.MessageType.Warning,
                                        additionalText: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
                                        description: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
                                        target: "/ZMMAPP_PERNR",
                                        processor: ""
                                    })
                                );

                                setTimeout(function () {
                                    that.oMP.openBy(oButton);
                                }.bind(that), 100);

                            }
                            if (s.results[i].ZMMACTO_VORNA !== "") {
                                poHeaderModel.setProperty("/ZMMACTO_PERNR", s.results[i].ZMMACTO_PERNR);
                                poHeaderModel.setProperty("/ZMMACTO_VORNA", s.results[i].ZMMACTO_VORNA);
                                poHeaderModel.setProperty("/ZMMACTO_NACH2", s.results[i].ZMMACTO_NACH2);
                                poHeaderModel.setProperty("/ZMMACTO_PLANS", s.results[i].ZMMACTO_PLANS);
                                poHeaderModel.setProperty("/ZMMACTO_STEXT", s.results[i].ZMMACTO_STEXT);
                            }

                        }
                    }
                    // CH08 : END INS

                    /* CH08 : START DEL
					poHeaderModel.setProperty("/PERNR_AUTH_FLAG", s.ZSCREENCTRL);
					if (!isEgp) {
						if (s.ZMMAPP_VORNA !== "") {
							poHeaderModel.setProperty("/ZMMAPP_PERNR", s.ZMMAPP_PERNR);
							poHeaderModel.setProperty("/ZMMAPP_VORNA", s.ZMMAPP_VORNA);
							poHeaderModel.setProperty("/ZMMAPP_NACH2", s.ZMMAPP_NACH2);
							poHeaderModel.setProperty("/ZMMAPP_PLANS", s.ZMMAPP_PLANS);
							poHeaderModel.setProperty("/ZMMAPP_STEXT", s.ZMMAPP_STEXT);

							that._MessageManager.addMessages(
								new sap.ui.core.message.Message({
									message: that.getView().getModel("i18n").getProperty("Message.AuthPersonChanged"),
									code: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
									type: sap.ui.core.MessageType.Warning,
									additionalText: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
									description: that.getView().getModel("i18n").getProperty("Label.AuthPerson"),
									target: "/ZMMAPP_PERNR",
									processor: ""
								})
							);

							setTimeout(function () {
								that.oMP.openBy(oButton);
							}.bind(that), 100);

						}
						if (s.ZMMACTO_VORNA !== "") {
							poHeaderModel.setProperty("/ZMMACTO_PERNR", s.ZMMACTO_PERNR);
							poHeaderModel.setProperty("/ZMMACTO_VORNA", s.ZMMACTO_VORNA);
							poHeaderModel.setProperty("/ZMMACTO_NACH2", s.ZMMACTO_NACH2);
							poHeaderModel.setProperty("/ZMMACTO_PLANS", s.ZMMACTO_PLANS);
							poHeaderModel.setProperty("/ZMMACTO_STEXT", s.ZMMACTO_STEXT);
						}

					}
                    CH08 : END DEL */
                    
					poHeaderModel.updateBindings();
					defer.resolve();
				},
				error: function (pError) {
					poHeaderModel.setProperty("/PERNR_AUTH_FLAG", "X");
					if (!isEgp) {
						poHeaderModel.setProperty("/ZMMAPP_PERNR", "");
						poHeaderModel.setProperty("/ZMMAPP_VORNA", "");
						poHeaderModel.setProperty("/ZMMAPP_NACH2", "");
						poHeaderModel.setProperty("/ZMMAPP_PLANS", "");
						poHeaderModel.setProperty("/ZMMAPP_STEXT", "");
						poHeaderModel.setProperty("/ZMMACTO_PERNR", "");
						poHeaderModel.setProperty("/ZMMACTO_VORNA", "");
						poHeaderModel.setProperty("/ZMMACTO_NACH2", "");
						poHeaderModel.setProperty("/ZMMACTO_PLANS", "");
						poHeaderModel.setProperty("/ZMMACTO_STEXT", "");
					}
					poHeaderModel.updateBindings();
					defer.resolve();
				}
			});

			return defer;

		},

		getPoItemTextData: function () {
			var srvModel = this.getView().getModel();
			var poItemText = this.C_MODEL.poItemText;
			var defer = new $.Deferred();
			var path = "/PoItemTextSet";
			srvModel.read(path, {
				success: function (s) {
					poItemText.setData([]);
					poItemText.setData(s.results);
					defer.resolve();
				},
				error: function (pError) {
					defer.resolve();
				}
			});
			return defer;
		},

		syncMessagePopover: function () {

			var messageModel = this.getOwnerComponent().getModel("errors");
			var messageData = $.extend([], messageModel.getData());

			this._MessageManager = new sap.ui.core.message.MessageManager();
			this.getView().setModel(this._MessageManager.getMessageModel(), "message");
			this.createMessagePopover();

			for (var i = 0; i < messageData.length; i++) {
				if (messageData[i].code === this.getView().getModel("i18n").getResourceBundle().getText("Label.GeneralData")) {
					var target = "";
					var controlId = "";

					switch (messageData[i].target) {
					case "/BSART":
						target = this.getView().byId("idDocumentType").getBindingPath("value");
						controlId = this.getView().byId("idDocumentType").getId();
						break;
					case "/LIFNR":
						target = this.getView().byId("idVendor").getBindingPath("value");
						controlId = this.getView().byId("idVendor").getId();
						break;
					case "/BEDAT":
						target = this.getView().byId("idDocumentDate").getBindingPath("dateValue");
						controlId = this.getView().byId("idDocumentDate").getId();
						break;
					case "/BUKRS":
						target = this.getView().byId("idCompany").getBindingPath("value");
						controlId = this.getView().byId("idCompany").getId();
						break;
					case "/EKORG":
						target = this.getView().byId("idPurchasingOrg").getBindingPath("value");
						controlId = this.getView().byId("idPurchasingOrg").getId();
						break;
					case "/EKGRP":
						target = this.getView().byId("idPurchasingGroup").getBindingPath("value");
						controlId = this.getView().byId("idPurchasingGroup").getId();
						break;
					}

					if (target) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: messageData[i].message,
								code: messageData[i].code,
								type: sap.ui.core.MessageType.Error,
								additionalText: messageData[i].additionalText,
								description: messageData[i].description,
								target: target,
								processor: this.getView().getModel("poHeader"),
								controlId: controlId
							})
						);
					}
				} else {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: messageData[i].message,
							code: messageData[i].code,
							type: sap.ui.core.MessageType.Error,
							additionalText: messageData[i].additionalText,
							description: messageData[i].description,
							target: messageData[i].target,
							processor: ""
						})
					);
				}
			}

		},

		initialScreen: function () {
			if (!this.oVHCollection) this.oVHCollection = new ValueHelpCollection(this.getView().getModel());
		},

		initModel: function () {

			var poHeaderModel = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().setModel(poHeaderModel, this.C_MODEL_NAME.poHeader);
			this.C_MODEL.poHeader = poHeaderModel;

			var poItemModel = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(poItemModel, this.C_MODEL_NAME.poItem);
			this.C_MODEL.poItem = poItemModel;

			var poHeaderTextModel = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(poHeaderTextModel, this.C_MODEL_NAME.poHeaderText);
			this.C_MODEL.poHeaderText = poHeaderTextModel;

			var poItemTextModel = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(poItemTextModel, this.C_MODEL_NAME.poItemText);
			this.C_MODEL.poItemText = poItemTextModel;

			var attachmentModel = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(attachmentModel, this.C_MODEL_NAME.attachmentModel);
			this.C_MODEL.attachmentModel = attachmentModel;

			var deletedAttachmentModel = new sap.ui.model.json.JSONModel([]);
			this.getOwnerComponent().setModel(deletedAttachmentModel, this.C_MODEL_NAME.deletedAttachmentModel);
			this.C_MODEL.deletedAttachmentModel = deletedAttachmentModel;

			var f4VendorModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(f4VendorModel, this.C_MODEL_NAME.f4Vendor);
			this.C_MODEL.f4Vendor = f4VendorModel;

			var controlModel = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().setModel(controlModel, this.C_MODEL_NAME.controlModel);
			this.C_MODEL.controlModel = controlModel;

			var addItemModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(addItemModel, this.C_MODEL_NAME.addItemModel);
			this.C_MODEL.addItemModel = addItemModel;

			var errorsModel = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().setModel(errorsModel, this.C_MODEL_NAME.errors);
			this.C_MODEL.errors = errorsModel;

		},

		updateModelBindings: function () {
			this.C_MODEL.poHeader.updateBindings();
			this.C_MODEL.poItem.updateBindings();
			this.C_MODEL.poHeaderText.updateBindings();
			this.C_MODEL.controlModel.updateBindings();
			this.C_MODEL.attachmentModel.updateBindings();
		},

		resetData: function () {

			this.C_MODEL.poHeader.setData({});
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.poHeader).setData({});
			this.C_MODEL.poHeader.refresh();

			this.C_MODEL.poItem.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.poItem).setData([]);
			this.C_MODEL.poItem.refresh();

			this.C_MODEL.poHeaderText.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.poHeaderText).setData([]);
			this.C_MODEL.poHeaderText.refresh();

			this.C_MODEL.poItemText.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.poItemText).setData([]);
			this.C_MODEL.poItemText.refresh();

			this.C_MODEL.f4Vendor.setData([]);
			this.getView().getModel(this.C_MODEL_NAME.f4Vendor).setData([]);
			this.C_MODEL.f4Vendor.refresh();

			this.C_MODEL.controlModel.setData({});
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.controlModel).setData([]);
			this.C_MODEL.controlModel.refresh();

			this.C_MODEL.attachmentModel.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.attachmentModel).setData([]);
			this.C_MODEL.attachmentModel.refresh();

			this.C_MODEL.deletedAttachmentModel.setData([]);
			this.getOwnerComponent().getModel(this.C_MODEL_NAME.deletedAttachmentModel).setData([]);
			this.C_MODEL.deletedAttachmentModel.refresh();

			if (this._MessageManager) {
				this._MessageManager.removeAllMessages();
			}

		},

		getData: function () {
			var that = this;
			var aDefer = [];
			if (that.getView().getBusy() === false) {
				that.getView().setBusyIndicatorDelay(0);
				that.getView().setBusy(true);
			}
			aDefer.push(that.getDefaultCompany());
			aDefer.push(that.getDefaultPurOrg());
			aDefer.push(that.getPoHeaderTextData());
			aDefer.push(that.getDatafromPrList());
			aDefer.push(that.getF4VendorData());
			aDefer.push(that.getVendorEgp());
			aDefer.push(that.getAuthPersonEgp());
			aDefer.push(that.getMaterialUnitData());
			aDefer.push(that.getEgpCollData());
			aDefer.push(that.getUserParameters());
			aDefer.push(that.getEgpTime());				//CH09: Ins
			$.when.apply($, aDefer).then(function (status1, status2, status3, status4, status5, vendorList, authPerson, materialUnit, egpColl,
				status6) {
				that.updatePoItemText();

				var prEgpModel = that.getOwnerComponent().getModel("prEgpData");
				if (prEgpModel) {
					var prEgpData = prEgpModel.getData();
					if (prEgpData.EGPWS0007 || prEgpData.EGPWS0022 || prEgpData.EGPWS0028) {
						that.initWithEgpData(prEgpData, vendorList, authPerson, materialUnit, egpColl);
					}
				}

				that._showFormFragment("PoNewHeader");
				that.onAfterShowView();

				that.updateModelBindings();
				if (that.getView().getBusy() === true) {
					that.getView().setBusy(false);
				}
			});
		},

		getUserParameters: function () {

			var that = this;
			var defer = new $.Deferred();
			var lvUser = "";
			var srvModel = this.getView().getModel();

			if (sap.ushell !== undefined) {
				lvUser = sap.ushell.Container.getService("UserInfo").getId();
			} else {
				defer.resolved();
				return;
			}

			var path = "/UserAuthorizationSet('" + lvUser + "')";
			srvModel.read(path, {
				success: function (s) {
					that.collectFileSize(parseInt(s.FILE_SIZE, 0));
					defer.resolve();
				},
				error: function (e) {
					defer.resolve();
				}
			});

			return defer;

		},

		collectFileSize: function (file_size) {
			var oComponent = this.getOwnerComponent();
			var mFileSize = new sap.ui.model.json.JSONModel();
			mFileSize.setData({
				"limit": file_size
			});
			oComponent.setModel(mFileSize, "mFileSize");
		},

		getVendorEgp: function () {
			var that = this;
			var defer = new $.Deferred();

			var prEgpModel = that.getOwnerComponent().getModel("prEgpData");
			if (prEgpModel) {
				var prEgpData = prEgpModel.getData();
				if (!prEgpData.EGPWS0022) {
					return defer.resolve([]);
				}
			} else {
				return defer.resolve([]);
			}

			var aFilters = [];
			if (prEgpData.EGPWS0022) { //++CH07
				aFilters.push(new sap.ui.model.Filter("STCD3", "EQ", prEgpData.EGPWS0022.contractdetail.field3, ""));
			} //++CH07
			var srvModel = this.getView().getModel();
			var path = "/F4VendorSet";
			srvModel.read(path, {
				filters: aFilters,
				success: function (s) {
					defer.resolve(s.results);
				},
				error: function (pError) {
					defer.resolve([]);
				}
			});
			return defer;
		},

		handleSuggest: function (oEvent) {

			// var that = this;
			// var oSource = oEvent.getSource();
			// var sTerm = oEvent.getParameter("suggestValue");
			//   // var orFilters = [];
			//   var aFilters = [];
			//   if (sTerm) {
			//       aFilters.push(new sap.ui.model.Filter("LIFNR", sap.ui.model.FilterOperator.NE, sTerm));
			//       // aFilters.push(new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.NE, sTerm));
			//       // aFilters.push(new sap.ui.model.Filter({filters:orFilters,and:false}));
			//   }
			//   // oEvent.getSource().getBinding("suggestionRows").filter(aFilters);

			//   if(that.C_MODEL.f4Vendor.getData().length === 0){
			//     if(!oSource.getBusy()){
			// 	    oSource.setBusyIndicatorDelay(0);
			// 	    oSource.setBusy(true);
			//     }
			//     var aDefer = []
			//     aDefer.push(that.getF4VendorData([]));
			// 	$.when.apply($, aDefer).then(function () {
			// 		that.C_MODEL.f4Vendor.updateBindings();
			// 		if(oSource.getBusy()){
			// 			oSource.setBusy(false);	
			// 		}
			// 	});
			//   }

		},

		// selectedSuggestVendor: function(oEvent){
		// 	var selectedDesc = oEvent.getParameters().selectedRow.getBindingContext().getObject().NAME1;
		// 	this.C_MODEL.poHeader.setProperty("/LIFNR_NAME", selectedDesc);
		// },

		getAuthPersonEgp: function () {
			var that = this;
			var defer = new $.Deferred();

			var prEgpModel = that.getOwnerComponent().getModel("prEgpData");
			if (prEgpModel) {
				var prEgpData = prEgpModel.getData();
				if (!prEgpData.EGPWS0022) {
					return defer.resolve([]);
				}
			} else {
				return defer.resolve([]);
			}

			var aFilters = [];
			//aFilters.push(new sap.ui.model.Filter("VORNA","EQ",prEgpData.EGPWS0022.contractdetail.field12,""));	//<-CH06(-)
			//aFilters.push(new sap.ui.model.Filter("NACH2","EQ",prEgpData.EGPWS0022.contractdetail.field13,""));	//<-CH06(-)
			if (prEgpData.EGPWS0022) { //++CH07
				aFilters.push(new sap.ui.model.Filter("VORNA", "EQ", prEgpData.EGPWS0022.contractdetail3.field42, "")); //<-CH06(+)
				aFilters.push(new sap.ui.model.Filter("NACH2", "EQ", prEgpData.EGPWS0022.contractdetail3.field43, "")); //<-CH06(+)
			} //++CH07

			var srvModel = this.getView().getModel();
			var path = "/F4PernrSet";
			srvModel.read(path, {
				filters: aFilters,
				success: function (s) {
					defer.resolve(s.results);
				},
				error: function (pError) {
					defer.resolve([]);
				}
			});
			return defer;
		},

		getMaterialUnitData: function () {
			var that = this;
			var defer = new $.Deferred();
			var aFilters = [];

			var prEgpModel = that.getOwnerComponent().getModel("prEgpData");
			if (prEgpModel) {
				var prEgpData = prEgpModel.getData();
				if (prEgpData.EGPWS0022) {
					aFilters.push(new sap.ui.model.Filter("EGP_UNIT", "EQ", prEgpData.EGPWS0022.contractdetail4[0].field8, ""));
					// 	for(var i=0;i<prEgpData.EGPWS0007.product.length;i++){
					// 		aFilters.push(new sap.ui.model.Filter("EGP_UNIT","EQ",prEgpData.EGPWS0007.product[i].field12,""));
					// 	}
				}
			}

			var srvModel = this.getView().getModel();
			var path = "/F4EgpUnitSet";
			srvModel.read(path, {
				filters: aFilters,
				success: function (s) {
					defer.resolve(s.results);
				},
				error: function (pError) {
					defer.resolve([]);
				}
			});
			return defer;
		},

		getEgpCollData: function () {
			var that = this;
			var defer = new $.Deferred();
			var srvModel = this.getView().getModel();
			var path = "/F4EgpCollSet";
			srvModel.read(path, {
				success: function (s) {
					defer.resolve(s.results);
				},
				error: function (pError) {
					defer.resolve([]);
				}
			});
			return defer;
		},

		initWithEgpData: function (egpData, vendorList, authPerson, materialUnit, egpColl) {

			var poHeaderModel = this.C_MODEL.poHeader;
			var poHeaderData = poHeaderModel.getData();
			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();
			var poHeaderTextModel = this.C_MODEL.poHeaderText;
			var poHeaderTextData = poHeaderTextModel.getData();
			var poItemTextModel = this.C_MODEL.poItemText;
			var poItemTextData = poItemTextModel.getData();

			// PO Header
			if (vendorList.length === 1) {
				poHeaderModel.setProperty("/LIFNR", vendorList[0].LIFNR);
				poHeaderModel.setProperty("/LIFNR_NAME", vendorList[0].NAME1);
			}
			if (egpData.EGPWS0022) { //++CH07
				if (typeof (egpData.EGPWS0022.contractdetail.field4) !== "object") {
					poHeaderModel.setProperty("/UNSEZ", egpData.EGPWS0022.contractdetail.field4);
				}

				// Begin - End Date
				if (typeof (egpData.EGPWS0022.contractdetail.field35) !== "object" && typeof (egpData.EGPWS0022.contractdetail.field36) !==
					"object") {
					var bdate = egpData.EGPWS0022.contractdetail.field35;
					var edate = egpData.EGPWS0022.contractdetail.field36;
					poHeaderModel.setProperty("/KDATB", new Date(parseInt(bdate.slice(0, 4), 0), parseInt(bdate.slice(5, 7), 0) - 1, parseInt(bdate.slice(
						8, 10), 0)));
					poHeaderModel.setProperty("/KDATE", new Date(parseInt(edate.slice(0, 4), 0), parseInt(edate.slice(5, 7), 0) - 1, parseInt(edate.slice(
						8, 10), 0)));
				}
				// Determine condition type ZVA2
				var zva2 = false;
				if (egpData.EGPWS0022.contractdetail4[0].field10 === "Y") {
					poHeaderModel.setProperty("/ZVA2", true);
					zva2 = true;
				}

			} //++CH07
			// if(poHeaderData.PERNR_AUTH_FLAG === '1'){
			if (poItemData[0].BSART === "1A31" || poItemData[0].BSART === "1INT") {

			} else {

				if (egpData.EGPWS0022) { //++CH07
					//if(typeof(egpData.EGPWS0022.contractdetail.field12) !== "object"){	//<-CH06(-)
					if (typeof (egpData.EGPWS0022.contractdetail3.field42) !== "object") { //<-CH06(+)
						poHeaderModel.setProperty("/ZMMAPP_PERNR", "");
						//poHeaderModel.setProperty("/ZMMAPP_VORNA", egpData.EGPWS0022.contractdetail.field12); DEL BY CH04
						//poHeaderModel.setProperty("/ZMMAPP_NACH2", egpData.EGPWS0022.contractdetail.field13); DEL BY CH04
						//<BOI CH04

						//var lv_pernr = egpData.EGPWS0022.contractdetail.field12;	//<-CH06(-)
						var lv_pernr = egpData.EGPWS0022.contractdetail3.field42; //<-CH06(+)
						if (lv_pernr.length > 40) {
							lv_pernr = lv_pernr.substr(0, 40);
						}
						poHeaderModel.setProperty("/ZMMAPP_VORNA", lv_pernr);

						//var lv_nach2 = egpData.EGPWS0022.contractdetail.field13;	//<-CH06(-)
						var lv_nach2 = egpData.EGPWS0022.contractdetail3.field43; //<-CH06(+)
						if (lv_nach2.length > 40) {
							lv_nach2 = lv_nach2.substr(0, 40);
						}
						poHeaderModel.setProperty("/ZMMAPP_NACH2", lv_nach2);
						//>EOI CH04
						poHeaderModel.setProperty("/ZMMAPP_PLANS", "");
						poHeaderModel.setProperty("/ZMMAPP_STEXT", "");
					}
				} //++CH07
			}
			// if(typeof(egpData.EGPWS0022.contractdetail.field12) !== "object"){
			// 	poHeaderModel.setProperty("/ZMMAPP_VORNA", egpData.EGPWS0022.contractdetail.field12);
			// 	poHeaderModel.setProperty("/ZMMAPP_NACH2", egpData.EGPWS0022.contractdetail.field13);
			// }else{
			// 	if(authPerson.length > 0){
			// 		poHeaderModel.setProperty("/ZMMAPP_PERNR", authPerson[0].PERNR);
			// 		poHeaderModel.setProperty("/ZMMAPP_VORNA", authPerson[0].VORNA);
			// 		poHeaderModel.setProperty("/ZMMAPP_NACH2", authPerson[0].NACH2);
			// 		poHeaderModel.setProperty("/ZMMAPP_PLANS", authPerson[0].PLANS);
			// 		poHeaderModel.setProperty("/ZMMAPP_STEXT", authPerson[0].STEXT);
			// 	}
			// }

			// PO Header Text
			for (var i = 0; i < poHeaderTextData.length; i++) {
				if (egpData.EGPWS0022) { //++CH07
					if (poHeaderTextData[i].TDID === "F63") {

						if (typeof (egpData.EGPWS0022.contractdetail2.field5) !== "object") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", egpData.EGPWS0022.contractdetail2.field5);
						}
					} else if (poHeaderTextData[i].TDID === "F49") {
						// if(egpData.EGPWS0022.contractdetail3.field19 === "02"){
						if (typeof (egpData.EGPWS0022.contractdetail3.field20) !== "object") {
							// poHeaderTextModel.setProperty("/" + i + "/DETAIL", "" + this.formatter.parseValue(parseFloat(egpData.EGPWS0022.contractdetail3.field20)));
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", "" + egpData.EGPWS0022.contractdetail3.field20);
						}
						// }
					} else if (poHeaderTextData[i].TDID === "F90") {
						if (typeof (egpData.EGPWS0022.contractdetail.field2) !== "object") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", "" + egpData.EGPWS0022.contractdetail.field2);
						}
					} else if (poHeaderTextData[i].TDID === "F17") {
						if (typeof (egpData.EGPWS0022.contractdetail.field32) !== "object") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", egpData.EGPWS0022.contractdetail.field32 + " วัน");
						}
					} else if (poHeaderTextData[i].TDID === "F88") {
						if (typeof (egpData.EGPWS0022.contractdetail2.field24) !== "object") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", egpData.EGPWS0022.contractdetail2.field24);
						}
					} else if (poHeaderTextData[i].TDID === "F71") {
						if (typeof (egpData.EGPWS0022.contractdetail3.field7) !== "object") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", egpData.EGPWS0022.contractdetail3.field7);
						}
					} else if (poHeaderTextData[i].TDID === "F55") {
						var text = "";
						if (typeof (egpData.EGPWS0022.contractdetail3.field3) !== "object" && parseInt(egpData.EGPWS0022.contractdetail3.field3, 0) !==
							0) {
							text = egpData.EGPWS0022.contractdetail3.field3 + " ปี";
						}
						if (typeof (egpData.EGPWS0022.contractdetail3.field4) !== "object" && parseInt(egpData.EGPWS0022.contractdetail3.field4, 0) !==
							0) {
							text = text + " " + egpData.EGPWS0022.contractdetail3.field4 + " เดือน";
						}
						if (typeof (egpData.EGPWS0022.contractdetail3.field5) !== "object" && parseInt(egpData.EGPWS0022.contractdetail3.field5, 0) !==
							0) {
							text = text + " " + egpData.EGPWS0022.contractdetail3.field5 + " วัน";
						}
						if (text !== "") {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", text);
						}
					}
					//<BOI CH05-2
					else if (poHeaderTextData[i].TDID === "F47") {
						if (poHeaderTextModel.getProperty("/" + i + "/DETAIL")) {
							poHeaderTextModel.setProperty("/" + i + "/DETAIL", "");
						}
					}
					//>EOI CH05-2
					//<DEL BY CH05
					// else if(poHeaderTextData[i].TDID === "F47"){
					// 	if(typeof(egpData.EGPWS0022.contractdetail3.field19) !== "object"){
					// 		for(var j=0;j<egpColl.length;j++){
					// 			if(parseInt(egpColl[j].EGP_COLL,0) === parseInt(egpData.EGPWS0022.contractdetail3.field19,0)){
					// 				poHeaderTextModel.setProperty("/" + i + "/DETAIL", egpColl[j].EGP_COLL_DESC);
					// 				break;
					// 			}
					// 		}
					// 	}
					// }
					//>DEL BY CH05

				} //++CH07
			}

			// PO Item
			// for(var i=0;egpData.EGPWS0022.contractdetail4.length;i++){

			// if(egpData.EGPWS0028 !== undefined){

			// 	for(var i=0;egpData.EGPWS0028.winnertin.length;i++){

			// 		// var rec = egpData.EGPWS0022.contractdetail4[i];
			// 		var rec = egpData.EGPWS0028.winnertin[i];
			// 		if(!rec){
			// 			return;
			// 		}

			// 		// get Condition Type ZVA2
			// 		var zva2 = false;
			// 		if(egpData.EGPWS0022.contractdetail4[0].field10 === "Y"){
			// 			zva2 = true;
			// 		}

			// 		//Get qty
			// 		var qtyItem = 1;
			// 		var egpUnit = "";
			// 		for(var n=0;n<egpData.EGPWS0007.product.length;n++){
			// 			if(parseInt(rec.field2,0) === parseInt(egpData.EGPWS0007.product[n].field1,0)){
			// 				qtyItem = parseFloat(egpData.EGPWS0007.product[n].field5);
			// 				egpUnit = egpData.EGPWS0007.product[n].field12;
			// 				break;
			// 			}
			// 		}

			// 		// Item Net Price
			// 		var totalVal = parseFloat(rec.field3);
			// 		var netVal = 0;
			// 		if(qtyItem > 0){
			// 			netVal = totalVal / qtyItem;
			// 		}

			// 		for(var j=0;j<poItemData.length;j++){

			// 			if(parseInt(poItemData[j].ZZMMEGP_ITEM,0) === parseInt(rec.field2,0)){

			// 				poItemModel.setProperty("/" + j + "/NETPR", netVal);
			// 				poItemModel.setProperty("/" + j + "/ZVA2", zva2);

			// 				var totalAmount = (netVal / poItemData[j].PEINH) * poItemData[j].MENGE;
			// 				poItemModel.setProperty("/" + j + "/RLWRT", totalAmount);

			// 				// Item unit
			// 				if(!poItemData[j].MATNR){
			// 					for(var k=0;k<materialUnit.length;k++){
			// 						if(parseInt(materialUnit[k].EGP_UNIT,0) === parseInt(egpUnit,0)){
			// 							poItemModel.setProperty("/" + j + "/MEINS", materialUnit[k].SAP_UNIT);
			// 							poItemModel.setProperty("/" + j + "/MEINS_NAME", materialUnit[k].SAP_UNIT_DESC);
			// 						}
			// 					}
			// 				}

			// 			}

			// 		}

			// 	}

			// }

			for (var j = 0; j < poItemData.length; j++) {

				var qtyItem = 1;
				var egpUnit = "";
				var totalVal = 0;
				var netVal = 0;

				if (egpData.EGPWS0007) { //++CH07
					for (var n = 0; n < egpData.EGPWS0007.product.length; n++) {
						if (parseInt(poItemData[j].ZZMMEGP_ITEM, 0) === parseInt(egpData.EGPWS0007.product[n].field1, 0)) {
							qtyItem = parseFloat(egpData.EGPWS0007.product[n].field5);
							// egpUnit = egpData.EGPWS0007.product[n].field12;
							break;
						}
					}
				} //++CH07

				if (egpData.EGPWS0022) { //++CH07
					if (egpData.EGPWS0022) {
						egpUnit = egpData.EGPWS0022.contractdetail4[0].field8;
					}
				} //++CH07
				// Determine net price 
				if (egpData.EGPWS0028 !== undefined) {

					for (var i = 0; i < egpData.EGPWS0028.winnertin.length; i++) {
						if (parseInt(poItemData[j].ZZMMEGP_ITEM, 0) === parseInt(egpData.EGPWS0028.winnertin[i].field2, 0)) {
							totalVal = egpData.EGPWS0028.winnertin[i].field3;
							break;
						}
					}
					if (qtyItem > 0) {
						netVal = totalVal / qtyItem;
					}
					//<DEL BY CH05	
					// poItemModel.setProperty("/" + j + "/NETPR", netVal);
					// poItemModel.setProperty("/" + j + "/RLWRT", (netVal / poItemData[j].PEINH) * poItemData[j].MENGE);
					//>DEL BY CH05
					//<BOI CH05
					if (poItemData[j].PSTYP != "D") {
						poItemModel.setProperty("/" + j + "/NETPR", netVal);
						poItemModel.setProperty("/" + j + "/RLWRT", (netVal / poItemData[j].PEINH) * poItemData[j].MENGE);
					} else {
						poItemModel.setProperty("/" + j + "/RLWRT", (poItemData[j].NETPR / poItemData[j].PEINH) * poItemData[j].MENGE);
					}
					//>EOI CH05
				}

				poItemModel.setProperty("/" + j + "/ZVA2", zva2);

				// Determine item unit
				//<DEL BY CH02
				// if(!poItemData[j].MATNR){
				// 	for(var k=0;k<materialUnit.length;k++){
				// 		if(parseInt(materialUnit[k].EGP_UNIT,0) === parseInt(egpUnit,0)){
				// 			poItemModel.setProperty("/" + j + "/MEINS", materialUnit[k].SAP_UNIT);
				// 			poItemModel.setProperty("/" + j + "/MEINS_NAME", materialUnit[k].SAP_UNIT_DESC);
				// 		}
				// 	}
				// }
				//>DEL BY CH02

			}

			poHeaderModel.updateBindings();
			poHeaderTextModel.updateBindings();
			poItemModel.updateBindings();

		},

		getPoHeaderTextData: function () {
			var srvModel = this.getView().getModel();
			var poHeaderText = this.C_MODEL.poHeaderText;
			var defer = new $.Deferred();
			var path = "/PoHeaderTextSet";
			srvModel.read(path, {
				success: function (s) {
					poHeaderText.setData([]);
					poHeaderText.setData(s.results);
					defer.resolve();
				},
				error: function (pError) {
					defer.resolve();
				}
			});
			return defer;
		},

		onAfterShowView: function () {
			var objectPageLayout = this.getView().getContent()[0].getContent()[0];
			var firstSectionId = objectPageLayout.getSections()[0].getId();
			objectPageLayout.setSelectedSection(firstSectionId);
		},

		getPrData: function (pr) {

			var that = this;
			var srvModel = this.getView().getModel();
			var prHeader = this.C_MODEL.prHeader;
			var prItem = this.C_MODEL.prItem;
			var prHeaderText = this.C_MODEL.prHeaderText;
			var prAttachment = this.C_MODEL.prAttachment;
			var prWorkflowLog = this.C_MODEL.prWorkflowLog;
			var defer = new $.Deferred();

			var path = "/PrHeaderSet('" + pr + "')";

			srvModel.read(path, {

				urlParameters: {
					"$expand": "PrItem,PrHeaderText"
				},

				success: function (s) {

					// Pr Header Data
					var hd = $.extend({}, s);
					if (hd.BADAT) hd.BADAT.setHours(0);
					hd.BANFN = "NEW";
					prHeader.setData({});
					prHeader.setData(hd);

					// PR Item Data
					for (var i = 0; i < s.PrItem.results.length; i++) {
						s.PrItem.results[i].BANFN = "NEW";
					}
					prItem.setData([]);
					prItem.setData(s.PrItem.results);

					// PR Header Text Data
					for (var i = 0; i < s.PrHeaderText.results.length; i++) {
						s.PrHeaderText.results[i].BANFN = "NEW";
					}
					prHeaderText.setData([]);
					prHeaderText.setData(s.PrHeaderText.results);

					defer.resolve();

				},

				error: function (pError) {
					defer.resolve();
				}

			});

			return defer;

		},

		handleChangeZva2Header: function (oEvent) {

			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();
			var zva2hd = this.C_MODEL.poHeader.getData().ZVA2;

			for (var i = 0; i < poItemData.length; i++) {
				poItemModel.setProperty("/" + i + "/ZVA2", zva2hd);
			}
			poItemModel.updateBindings();

		},

		onTextBoxLiveChange: function (oEvent) {
			// debugger;
			GUtilities.formatTextArea(oEvent, 120);
		},

		handleChangeLongText: function (oEvent) {
			if (oEvent.getSource().getValue()) {
				oEvent.getSource().getParent().setIconColor("Positive");
			} else {
				oEvent.getSource().getParent().setIconColor("Neutral");
			}
		},

		handleBackPress: function () {
			var that = this;
			var mode = that.C_MODEL.controlModel.getData().mode;
			sap.m.MessageBox.warning(that.getView().getModel("i18n").getProperty("Message.CancelCreatePr"), {
				title: that.getView().getModel("i18n").getProperty("Label.Confirm"),
				styleClass: "",
				initialFocus: null,
				textDirection: sap.ui.core.TextDirection.Inherit,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === "YES") {
						that.doNavBack();
					}
				}
			});
		},

		doNavBack: function () {
			this.isListInit = true;

			if (this._MessageManager) {
				this.getOwnerComponent().getModel("errors").setData([]);
				this.getOwnerComponent().getModel("errors").updateBindings();
				this._MessageManager.removeAllMessages();
			}

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("default", true);
		},

		doNavToPo: function () {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102"
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, false);

		},

		doNavBackRefresh: function () {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZFIORI-ZLPUBA102_1"
				}
			}));
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, false);

		},

		handleFileDelete: function (oEvent) {

			var obj = oEvent.getSource().getBindingContext("attachmentModel").getObject();
			oEvent.getSource().getParent().removeItem(oEvent.getSource());

			var deletedAttachModel = this.C_MODEL.deletedAttachmentModel;
			var deletedAttachData = deletedAttachModel.getData();
			if (obj.OLD) {
				deletedAttachData.push(obj);
			}
			deletedAttachModel.setData([]);
			deletedAttachModel.setData(deletedAttachData);
			deletedAttachModel.updateBindings();

		},

		handleFileChange: function (oEvent) {

		},

		handleFileBeforeUpload: function (oEvent) {
			var serviceModel = this.oView.getModel();
			var token = serviceModel.getSecurityToken();
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: encodeURIComponent(oEvent.getParameter("fileName"))
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});
			if (!oEvent.getParameters().getHeaderParameter("x-csrf-token")) {
				oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			}
		},
		
		handleFileUploadComplete: async function (oEvent) {

			var that = this;

			var oFile = oEvent.getParameter("files")[0];
			var fName = oFile.fileName;
			var status = oFile.status;
			var responseRaw = oFile ? oFile.responseRaw : "";

			//==================== CH12:Start Add  ===========================
			if (status < 200 || status >= 300) {
				this.uploadFailCount += 1;
			}
			if (this.uploadFailCount === 1) {
				await this.showErrorAttachFile();
				
			}
			//==================== CH12:End Add  ===========================

			var defer = that.aStackUploadDefer.pop();
			defer.resolve();

			this.aUploadItem.push({
				fileName: fName,
				status: status,
				response: responseRaw
			});

		},
		//===========================  CH12:Start Add  ===========================
		showErrorAttachFile: function () {
				var that = this;
				return new Promise(function (resolve) {

				var oDialog = new sap.m.Dialog({
					title: that.getView().getModel("i18n").getProperty("Message.ErrorTitle"),
					type: "Message",
					state: "Error",
					content: new sap.m.Text({
						text: that.getView().getModel("i18n").getProperty("Message.ErrorAttachment")
					}),
					endButton: new sap.m.Button({
						text: "ปิด",
						press: function () {
							oDialog.close();							
						}
					}),
					afterClose: function () {
						oDialog.destroy();
						resolve();
					}
				});

				oDialog.open();
			});
		},
		//===========================  CH12:End Add  ===========================		
		handleFileUploadTerminate: function (oEvent) {
			var that = this;
			var defer = that.aStackUploadDefer.pop();
			defer.resolve();
		},

		handleFileSizeExceed: function () {
			var that = this;
			var limitSize = that.getOwnerComponent().getModel("mFileSize").getProperty("/limit");
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("Message.FileTooLargeDetail", [limitSize]), {
					title: that.getView().getModel("i18n").getProperty("Message.FileTooLargeTitle"),
					onClose: function () {
						fnResolve();
					}
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},

		syncErrorMessages: function () {

			if (!this._MessageManager) {
				return;
			}

			var messageData = this._MessageManager.getMessageModel().getData();
			var arr = [];
			for (var i = 0; i < messageData.length; i++) {
				var msg = $.extend({}, messageData[i]);
				arr.push(msg);
			}
			this.C_MODEL.errors.setData([]);
			this.C_MODEL.errors.setData(arr);
			this.C_MODEL.errors.updateBindings();
			this._MessageManager.removeAllMessages();

		},

		handlePoItemPress: function (oEvent) {

			this.isInit = false;
			this.syncErrorMessages();

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext("poItem");
			var Po = oBindingContext.getObject().EBELN;
			var PoItem = oBindingContext.getObject().EBELP;

			return new Promise(function (fnResolve) {
				this.doNavigate("PoNewItem", oBindingContext, fnResolve, "", Po, PoItem);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
					// case "PrHeader":
					// 	this.oRouter.navTo(sRouteName, {
					// 		Pr: Pr
					// 	});
					// 	break;
					// case "PrItem":
					// 	this.oRouter.navTo(sRouteName, {
					// 		Pr: Pr,
					// 		PrItem: PrItem
					// 	});
					// 	break;
				case "PoNewItem":
					this.oRouter.navTo(sRouteName, {
						Po: Po,
						PoItem: PoItem
					});
					break;
					// case "AssignPeople":
					// 	this.oRouter.navTo(sRouteName, {
					// 		Pr: Pr
					// 	});
					// 	break;
				default:
				}

			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},

		onVHVendor: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");

			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Vendor"),
				key: "LIFNR",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "LIFNR",
					label: this.getView().getModel("i18n").getProperty("Label.Vendor")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.LIFNR = pSelected.LIFNR;
						index.LIFNR_NAME = pSelected.NAME1;
						index.ZZMM_J_1TPBUPL = pSelected.J_1TPBUPL;
						index.J_1TPBUPL_NAME = pSelected.DESCRIPTION;
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.Vendor"),
					template: "LIFNR",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.VendorName"),
					template: "NAME1",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.BranchName"),
					template: "DESCRIPTION",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.Street"),
					template: "STREET",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.City"),
					template: "CITY1",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.Remark"),
					template: "REMARK",
					demandPopin: true
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.TaxNo"),
					template: "STCD3",
					demandPopin: true
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4BcodeSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "LIFNR",
					label: this.getView().getModel("i18n").getProperty("Label.Vendor"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "NAME1",
					label: this.getView().getModel("i18n").getProperty("Label.VendorName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "DESCRIPTION",
					label: this.getView().getModel("i18n").getProperty("Label.BranchName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "STREET",
					label: this.getView().getModel("i18n").getProperty("Label.Street"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "CITY1",
					label: this.getView().getModel("i18n").getProperty("Label.City"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "REMARK",
					label: this.getView().getModel("i18n").getProperty("Label.Remark"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "STCD3",
					label: this.getView().getModel("i18n").getProperty("Label.TaxNo"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		getF4VendorData: function () {
			var srvModel = this.getView().getModel();
			var f4Vendor = this.C_MODEL.f4Vendor;
			var defer = new $.Deferred();
			var path = "/F4VendorSet";

			srvModel.read(path, {
				// filter: aFilters,
				// urlParameters:{"$top" : "100"},
				success: function (s) {
					f4Vendor.setData([]);
					f4Vendor.setData(s.results);
					f4Vendor.updateBindings();
					defer.resolve();
				},
				error: function (pError) {
					defer.resolve();
				}
			});
			return defer;
		},

		onChangeVendor: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var vendor = poHeader.getProperty("/LIFNR");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!vendor) {
				poHeader.setProperty("/LIFNR", "");
				poHeader.setProperty("/LIFNR_NAME", "");
				poHeader.setProperty("/ZZMM_J_1TPBUPL", "");
				poHeader.setProperty("/J_1TPBUPL_NAME", "");
				return;
			}

			var path = "/F4VendorSet('" + vendor + "')";

			srvModel.read(path, {

				success: function (s) {
					poHeader.setProperty("/LIFNR_NAME", s.NAME1);
					poHeader.setProperty("/ZZMM_J_1TPBUPL", "");
					poHeader.setProperty("/J_1TPBUPL_NAME", "");
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					poHeader.setProperty("/LIFNR", "");
					poHeader.setProperty("/LIFNR_NAME", "");
					poHeader.setProperty("/ZZMM_J_1TPBUPL", "");
					poHeader.setProperty("/J_1TPBUPL_NAME", "");
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},

		onVHVendorBranch: function (oEvent) {

			var that = this;
			var vendor = this.C_MODEL.poHeader.getProperty("/LIFNR");

			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("LIFNR", "EQ", vendor, ""));

			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.VendorBranch"),
				key: "J_1TPBUPL",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "J_1TPBUPL",
					label: this.getView().getModel("i18n").getProperty("Label.VendorBranch")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.ZZMM_J_1TPBUPL = pSelected.J_1TPBUPL;
						index.J_1TPBUPL_NAME = pSelected.DESCRIPTION;
						model.updateBindings();
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.VendorBranch"),
					template: "J_1TPBUPL",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.VendorBranchName"),
					template: "DESCRIPTION",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4BcodeSet",
					filters: aFilters
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "J_1TPBUPL",
					label: this.getView().getModel("i18n").getProperty("Label.VendorBranch"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "DESCRIPTION",
					label: this.getView().getModel("i18n").getProperty("Label.VendorBranchName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onChangeVendorBranch: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var vendor = poHeader.getProperty("/LIFNR");
			var vendorBranch = poHeader.getProperty("/ZZMM_J_1TPBUPL");

			if (!vendorBranch) {
				poHeader.setProperty("/ZZMM_J_1TPBUPL", "");
				poHeader.setProperty("/J_1TPBUPL_NAME", "");
				return;
			}

			var path = "/F4BcodeSet(LIFNR='" + vendor + "',J_1TPBUPL='" + vendorBranch + "')";
			srvModel.read(path, {
				success: function (s) {
					poHeader.setProperty("/ZZMM_J_1TPBUPL", s.J_1TPBUPL);
					poHeader.setProperty("/J_1TPBUPL_NAME", s.DESCRIPTION);
				},
				error: function (pError) {
					poHeader.setProperty("/ZZMM_J_1TPBUPL", "");
					poHeader.setProperty("/J_1TPBUPL_NAME", "");
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}
			});

		},

		onVHDocumentType: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			// var oInputControl = oEvent.getSource();
			var aTokens = [];
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");

			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("BSTYP", "EQ", "F", ""));

			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.DocumentType"),
				key: "BSART",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "BSART",
					label: this.getView().getModel("i18n").getProperty("Label.DocumentType")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.BSART = pSelected.BSART;
						index.BSART_NAME = pSelected.BATXT;
						// if(index.BSART === "3001"){
						// 	index.ZZMM_NO_ESIGN = true;
						// }else{
						// 	index.ZZMM_NO_ESIGN = false;
						// }
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.DocumentType"),
					template: "BSART",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.DocumentTypeName"),
					template: "BATXT",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PoTypeSet",
					filters: aFilters
				},
				basicTokens: aTokens,
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "BSART",
					label: this.getView().getModel("i18n").getProperty("Label.DocumentType"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "BATXT",
					label: this.getView().getModel("i18n").getProperty("Label.DocumentTypeName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);
		},

		onChangeDocumentDate: function (oEvent) {

			if (oEvent.getParameters().valid) {
				var sTarget = oEvent.getSource().getBindingPath("dateValue");
				this.changeMessageModel(sTarget);
			} else {
				oEvent.getSource().setDateValue(null);
				oEvent.getSource().setValue(null);
			}

			var poHeader = this.C_MODEL.poHeader;
			this.getPernrControlField(oEvent.getSource().getDateValue(), poHeader.getProperty("/EKGRP"));

		},

		onChangeBeginEndDate: function (oEvent) {
			if (!oEvent.getParameters().valid) {
				oEvent.getSource().setDateValue(null);
				oEvent.getSource().setValue(null);
			}
		},

		onChangeDocumentType: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var docType = poHeader.getProperty("/BSART");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!docType) {
				poHeader.setProperty("/BSART", "");
				poHeader.setProperty("/BSART_NAME", "");
				// poHeader.setProperty("/ZZMM_NO_ESIGN", false);
				return;
			}

			var path = "/F4PoTypeSet(BSTYP='F',BSART='" + docType + "')";

			srvModel.read(path, {

				success: function (s) {

					poHeader.setProperty("/BSART", s.BSART);
					poHeader.setProperty("/BSART_NAME", s.BATXT);
					// if(s.BSART === "3001"){
					// 	poHeader.setProperty("/ZZMM_NO_ESIGN", true);
					// }else{
					// 	poHeader.setProperty("/ZZMM_NO_ESIGN", false);
					// }
					that.changeMessageModel(sTarget);

				},

				error: function (pError) {

					poHeader.setProperty("/BSART", "");
					poHeader.setProperty("/BSART_NAME", "");
					// poHeader.setProperty("/ZZMM_NO_ESIGN", false);

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},

		onVHPurchasingGroup: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var poHeader = this.C_MODEL.poHeader;
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.PurchasingGroup"),
				key: "EKGRP",
				descriptionKey: "EKNAM",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "EKGRP",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingGroup")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.EKGRP = pSelected.EKGRP;
						index.EKGRP_NAME = pSelected.EKNAM;
						model.updateBindings();
						that.changeMessageModel(sTarget);
						that.getPernrControlField(poHeader.getProperty("/BEDAT"), index.EKGRP);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingGroup"),
					template: "EKGRP",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingGroupName"),
					template: "EKNAM",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PurGroupSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "EKGRP",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingGroup"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "EKNAM",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingGroupName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onChangePurchasingGroup: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var purchasingGroup = poHeader.getProperty("/EKGRP");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!purchasingGroup) {
				poHeader.setProperty("/EKGRP", "");
				poHeader.setProperty("/EKGRP_NAME", "");
				that.changeMessageModel("/ZMMAPP_PERNR");
				return;
			}

			var path = "/F4PurGroupSet('" + purchasingGroup + "')";

			srvModel.read(path, {

				success: function (s) {

					poHeader.setProperty("/EKGRP", s.EKGRP);
					poHeader.setProperty("/EKGRP_NAME", s.EKNAM);
					that.changeMessageModel(sTarget);

					that.getPernrControlField(poHeader.getProperty("/BEDAT"), s.EKGRP);

				},

				error: function (pError) {

					poHeader.setProperty("/EKGRP", "");
					poHeader.setProperty("/EKGRP_NAME", "");

					that.getPernrControlField(poHeader.getProperty("/BEDAT"), "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},

		onVHPurchasingOrg: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.PurchasingOrg"),
				key: "EKORG",
				descriptionKey: "EKOTX",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "EKORG",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingOrg")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.EKORG = pSelected.EKORG;
						index.EKORG_NAME = pSelected.EKOTX;
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingOrg"),
					template: "EKORG",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingOrgName"),
					template: "EKOTX",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PurOrgSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "EKORG",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingOrg"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "EKOTX",
					label: this.getView().getModel("i18n").getProperty("Label.PurchasingOrgName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onChangePurchasingOrg: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var purchasingOrg = poHeader.getProperty("/EKORG");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!purchasingOrg) {
				poHeader.setProperty("/EKORG", "");
				poHeader.setProperty("/EKORG_NAME", "");
				return;
			}

			var path = "/F4PurOrgSet('" + purchasingOrg + "')";

			srvModel.read(path, {

				success: function (s) {

					poHeader.setProperty("/EKORG_NAME", s.EKOTX);
					that.changeMessageModel(sTarget);

				},

				error: function (pError) {

					poHeader.setProperty("/EKORG", "");
					poHeader.setProperty("/EKORG_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},

		onVHCompany: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.Company"),
				key: "BUKRS",
				descriptionKey: "BUTXT",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "BUKRS",
					label: this.getView().getModel("i18n").getProperty("Label.Company")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.BUKRS = pSelected.BUKRS;
						index.BUKRS_NAME = pSelected.BUTXT;
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.Company"),
					template: "BUKRS",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.CompanyName"),
					template: "BUTXT",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4CompCodeSet"
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "BUKRS",
					label: this.getView().getModel("i18n").getProperty("Label.Company"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "BUTXT",
					label: this.getView().getModel("i18n").getProperty("Label.CompanyName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onChangeCompany: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var companyCode = poHeader.getProperty("/BUKRS");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!companyCode) {
				poHeader.setProperty("/BUKRS", "");
				poHeader.setProperty("/BUKRS_NAME", "");
				return;
			}

			var path = "/F4CompCodeSet('" + companyCode + "')";

			srvModel.read(path, {

				success: function (s) {

					poHeader.setProperty("/BUKRS_NAME", s.BUTXT);
					that.changeMessageModel(sTarget);

				},

				error: function (pError) {

					poHeader.setProperty("/BUKRS", "");
					poHeader.setProperty("/BUKRS_NAME", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});

				}

			});

		},

		getDefaultCompany: function () {
			var srvModel = this.getView().getModel();
			var poHeader = this.C_MODEL.poHeader;
			var path = "/F4CompCodeSet('1000')";
			srvModel.read(path, {
				success: function (s) {
					poHeader.setProperty("/BUKRS_NAME", s.BUTXT);
				},
				error: function (pError) {
					poHeader.setProperty("/BUKRS", "");
					poHeader.setProperty("/BUKRS_NAME", "");
				}
			});
		},

		getDefaultPurOrg: function () {
			var srvModel = this.getView().getModel();
			var poHeader = this.C_MODEL.poHeader;
			var path = "/F4PurOrgSet('1000')";
			srvModel.read(path, {
				success: function (s) {
					poHeader.setProperty("/EKORG_NAME", s.EKOTX);
				},
				error: function (pError) {
					poHeader.setProperty("/EKORG", "");
					poHeader.setProperty("/EKORG_NAME", "");
				}
			});
		},

		onVHUnit: function (oEvent) {

			var that = this;
			var model = oEvent.getSource().getBindingContext("poItem").getModel();
			var index = oEvent.getSource().getBindingContext("poItem").getProperty();
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

		onChangeQty: function (oEvent) {

			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));

			var index = oEvent.getSource().getBindingContext("poItem").getProperty();
			if (index.PEINH === 1) {
				index.RLWRT = index.MENGE * index.NETPR;
			} else {
				index.RLWRT = (index.MENGE / index.PEINH) * index.NETPR;
			}
		},

		onChangeUnit: function (oEvent) {

			//Get Material Unit
			var that = this;
			var srvModel = that.getView().getModel();
			var model = this.C_MODEL.poItem;
			var index = oEvent.getSource().getBindingContext("poItem").getProperty();
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

		onChangeUnitPrice: function (oEvent) {

			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));

			var index = oEvent.getSource().getBindingContext("poItem").getProperty();
			if (index.NETPR !== 0) {
				if (index.PEINH === 1) {
					index.RLWRT = index.MENGE * index.NETPR;
				} else {
					index.RLWRT = (index.MENGE / index.PEINH) * index.NETPR;
				}
			}
		},

		onChangeTotalValue: function (oEvent) {

			var inputValue = oEvent.getParameters().newValue;
			oEvent.getSource().setValue(GUtilities.formatAmount(inputValue));

			var index = oEvent.getSource().getBindingContext("poItem").getProperty();
			if (index.NETPR !== 0) {
				index.MENGE = index.RLWRT / index.NETPR;
			}
		},

		handleCheckPoPress: function () {
			this.doCreatePoPress(false, true);
		},

		handleCreatePoPress: function (oEvent) {
			this.doCreatePoPress(false, false);
		},

		handleHoldPress: function () {
			this.doCreatePoPress(true, false);
		},

		doCreatePoPress: function (isHold, isCheck) {
			var that = this;
			var aDefer = [];

			// Remove all messages before call new request
			this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
				this._MessageManager.removeMessages(oMessage);
			}.bind(this));

			that._MessageManager = new sap.ui.core.message.MessageManager();
			that.getView().setModel(that._MessageManager.getMessageModel(), "message");
			that.createMessagePopover();

			if (that.validateDataForSave(isCheck)) {

				if (!that.getView().getBusy()) {
					that.getView().setBusyIndicatorDelay(0);
					that.getView().setBusy(true);
				}
				var lprBSART = that.C_MODEL.poItem.getData()[0].BSART	//CH11: Ins

				aDefer.push(that.checkEgpNumber(isCheck));
				$.when.apply($, aDefer).then(function (status) {
					if (status === "ERROR"
						&& !(lprBSART == "1A31" || lprBSART == "1INT")	//CH11: Ins
					) {
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.warning(that.getView().getModel("i18n").getProperty("Message.DiffEgp"), {
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === sap.m.MessageBox.Action.OK) {
									that.doSaveData(isHold, isCheck);
								} else {
									if (that.getView().getBusy()) {
										that.getView().setBusy(false);
									}
								}
							}
						});
					} else {
						that.doSaveData(isHold, isCheck);
					}
				});

			};
		},

		doSaveData: function (isHold, isCheck) {

			var that = this;
			var dataForSave = that.createDataForSave(isHold, isCheck);
			var oButton = this.getView().byId("messagePopoverBtn");

			var serviceUrl = that.oView.getModel().sServiceUrl;
			var odataServiceModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			odataServiceModel.refreshSecurityToken();

			odataServiceModel.create("/PoHeaderSet", dataForSave, {
				success: function (s) {
					if (isCheck) {
						if (that.getView().getBusy()) {
							that.getView().setBusy(false);
						};
						MessageBox.success(that.getView().getModel("i18n").getProperty("Message.CheckPoSuccess"), {
							actions: [MessageBox.Action.CLOSE],
							onClose: function (oAction) {
								if (oAction === "CLOSE") {

								};
							}
						});
					} else {
						var aDefer = [];
						aDefer.push(that.uploadFile(s.EBELN));
						$.when.apply($, aDefer).then(function (status) {
							that.prepareMessageCreateSuccess(status, s.EBELN, isHold);
						});
					}
				},
				error: function (e) {
					if (that.getView().getBusy() === true) {
						that.getView().setBusy(false);
					};
					that.errorHandlingCreate(e);
					setTimeout(function () {
						that.oMP.openBy(oButton);
					}.bind(that), 100);
				}
			});

		},

		checkEgpNumber: function (isCheck) {

			var that = this;
			var defer = new $.Deferred();

			if (isCheck) {
				defer.resolve("SUCCESS");
			}

			if(this.C_MODEL.egpTime){			//CH09: Ins
				defer.resolve("ERROR");
				return defer;
			}

			var poItemData = $.extend([], this.C_MODEL.poItem.getData());
			var egpNo = "";
			var egpYear = "";
			var diffEgp = false;

			for (var i = 0; i < poItemData.length; i++) {

				if (poItemData[i].ZZMMEGP_PROJ === "" && poItemData[i].ZZMMEGP_YEAR === "") {
					continue;
				}

				if (egpNo === "" && egpYear === "") {
					egpNo = poItemData[i].ZZMMEGP_PROJ;
					egpYear = poItemData[i].ZZMMEGP_YEAR;
				} else {
					if (poItemData[i].ZZMMEGP_PROJ !== egpNo || poItemData[i].ZZMMEGP_YEAR !== egpYear) {
						diffEgp = true;
						break;
					}
				}
			}
			if (diffEgp || (egpNo === "" && egpYear === "")) {
				defer.resolve("SUCCESS");
			}

			var request = {
				"ProjectDatas": {
					"LoginDatas": {
						"FIELD1": that.getOwnerComponent().egp.username,
						"FIELD2": that.getOwnerComponent().egp.password
					},
					"Request": {
						"FIELD1": egpNo,
						"FIELD2": egpYear
					}
				}
			};

			request = JSON.stringify(request);
			var requestJson = JSON.parse(request);
			var requestXml = this.OBJtoXML(requestJson);

			jQuery.ajax({
				// url: "/EgpInterface/rest/EGPWS0016",				//CH09: DEL
				url: "/EgpInterface/rest/EGPWS0006",				//CH09: INS
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
					// var result = that.xmlToJson(data,"EGPWS0016");		//CH09: DEL
					var result = that.xmlToJson(data,"EGPWS0006");			//CH09: INS
					if (result.projectdatas.responsecode.field1 !== "000") {
						defer.resolve("ERROR");
					} else {
						defer.resolve("SUCCESS");
					}

				},
				error: function (error) {
					defer.resolve("ERROR");
				}
			});

			return defer;

		},

		errorHandlingCreate: function (e) {
			var that = this;
			try {
				var loError = JSON.parse(e.responseText);
				if (loError.error.innererror.errordetails.length > 0) {
					var laMsg = jQuery.extend(true, {}, loError.error.innererror);
					that.convertErrorFormat(laMsg.errordetails);
					that.createErrorMessagePopover(laMsg.errordetails);
				} else {
					that._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: that.getView().getModel("i18n").getProperty("Message.ErrorText"),
							type: sap.ui.core.MessageType.Error,
							additionalText: that.getView().getModel("i18n").getProperty("Message.ErrorTitle")
						})
					);
				}
			} catch (err) {
				that._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: that.getView().getModel("i18n").getProperty("Message.ErrorText"),
						type: sap.ui.core.MessageType.Error,
						additionalText: that.getView().getModel("i18n").getProperty("Message.ErrorTitle")
					})
				);
			}
		},

		convertErrorFormat: function (arrErrors) {
			for (var i in arrErrors) {
				arrErrors[i].MESSAGE = arrErrors[i].message;
			}
		},

		deleteDuplicateRecords: function (arrErrors) {
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

		isHasData: function (input) {
			if (this.isNullOrBlank(input)) {
				return false;
			} else {
				return true;
			}
		},

		isNullOrBlank: function (e) {
			return "boolean" != typeof e && (!e || null == e || "" == e);
		},

		createErrorMessagePopover: function (arrErrors) {
			var lvArrError = this.deleteDuplicateRecords(arrErrors);
			var lvType;
			var lvCurrentType;
			var lvCode = "";
			var lvMsg = "";
			var lvTitle = "";
			var lvLastCode = "";
			for (var i = 0; i < lvArrError.length; i++) {
				// Skip technical errors
				if (!this.isHasData(lvArrError[i]["MESSAGE"]) || lvArrError[i]["code"] === "/IWBEP/CX_MGW_TECH_EXCEPTION" || lvArrError[i][
						"MESSAGE"
					] === "Return") {
					continue;
				}
				lvCurrentType = "";
				if (lvArrError[i]["severity"] === "warning") {
					lvCurrentType = sap.ui.core.MessageType.Warning;
				} else if (lvArrError[i]["severity"] === "info") {
					lvCurrentType = sap.ui.core.MessageType.Information;
				} else if (lvArrError[i]["severity"] === "success") {
					lvCurrentType = sap.ui.core.MessageType.Success;
				} else {
					lvCurrentType = sap.ui.core.MessageType.Error;
				}

				if (lvArrError[i]["code"][0] === "Z") {
					lvCode = lvArrError[i]["code"];
					// lvType = "Error";
					lvType = lvCurrentType;
					if (i !== 0 && lvLastCode && lvLastCode !== lvArrError[i]["code"]) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								code: "",
								message: lvTitle,
								type: lvType,
								additionalText: lvCode,
								description: lvMsg
							})
						);
						lvCode = "";
						lvMsg = "";
						lvTitle = "";
					} else {
						if (lvTitle) {

							if (lvMsg) {
								lvMsg = lvMsg + "\r\n" + lvArrError[i]["MESSAGE"];
							} else {
								lvMsg = lvArrError[i]["MESSAGE"];
							}
						} else {
							lvTitle = lvArrError[i]["MESSAGE"];
						}
					}
					lvLastCode = lvArrError[i]["code"];
				} else {

					if (lvTitle) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								code: "",
								message: lvTitle,
								type: lvType,
								additionalText: lvCode,
								description: lvMsg
							})
						);
					}
					lvCode = "";
					lvMsg = "";
					lvTitle = "";

					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							code: "",
							message: lvArrError[i]["MESSAGE"],
							type: lvCurrentType,
							additionalText: lvArrError[i]["code"],
							description: lvArrError[i]["MESSAGE"]
						})
					);
				}
			}

			if (lvTitle) {
				this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						code: "",
						message: lvTitle,
						type: lvType,
						additionalText: lvCode,
						description: lvMsg
					})
				);
			}

		},

		prepareMessageCreateSuccess: function (pStatus, po, isHold) {

			var that = this;
			var msg = "";
			var icon = "";
			var title = "";
			if (pStatus === "SUCCESS") {
				// msg = "สร้างใบสั่งซื้อเลขที่ {0} แล้ว";
				if (isHold) {
					msg = that.getView().getModel("i18n").getResourceBundle().getText("Message.CreatePoHoldSuccess", [po]);
				} else {
					msg = that.getView().getModel("i18n").getResourceBundle().getText("Message.CreatePoSuccess", [po]);
				}
				icon = sap.m.MessageBox.Icon.SUCCESS;
				title = that.getView().getModel("i18n").getResourceBundle().getText("Message.SuccessTitle", [po]);
			} else {
				// msg = "บันทึกเอกสารสัญญาก่อสร้างเรียบร้อย แต่ไม่สามารถ Upload Attach File ได้";
				if (isHold) {
					msg = that.getView().getModel("i18n").getResourceBundle().getText("Message.CreatePoHoldSuccesButAttachment", [po]);
				} else {
					msg = that.getView().getModel("i18n").getResourceBundle().getText("Message.CreatePoSuccesButAttachment", [po]);
				}
				icon = sap.m.MessageBox.Icon.WARNING;
				title = that.getView().getModel("i18n").getResourceBundle().getText("Message.WarningTitle", [po]);
			};
			MessageBox.show(msg, {
				icon: icon,
				title: title,
				actions: [sap.m.MessageBox.Action.CLOSE],
				onClose: function (oAction) {
					if (oAction === "CLOSE") {
						// that.doNavBack();
						that.doNavToPo();
					}
				}
			});

		},

		uploadFile: function (po) {

			var that = this;
			var serviceUrl = this.getView().getModel().sServiceUrl;
			var odataServiceModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			var defer = new $.Deferred();

			var updCollection = that.getView().byId("idPoNewHeaderPage").getContent()[0].getSections()[4].getSubSections()[0].getBlocks()[0];
			that.aStackUploadDefer = [];
			that.aUploadItem = [];
			var serviceUrl = odataServiceModel.sServiceUrl + "/PoHeaderSet('" + po + "')/PoAttachMedia";			

			// For upload
			for (var i = 0; i < updCollection._aFileUploadersForPendingUpload.length; i++) {
				updCollection._aFileUploadersForPendingUpload[i].setUploadUrl(serviceUrl);
				that.aStackUploadDefer.push(new $.Deferred());
			}

			// For Upload - Drag & Drop
			var upd = updCollection._oFileUploader;
			var file = updCollection._aFilesFromDragAndDropForPendingUpload;
			if (file.length > 0) {
				upd.setUploadUrl(serviceUrl);
			}

			if (updCollection._aFileUploadersForPendingUpload.length > 0) {
				updCollection.upload();
			}

			// For delete
			var deletedAttachmentData = this.C_MODEL.deletedAttachmentModel.getData();
			for (var i = 0; i < deletedAttachmentData.length; i++) {
				var obj = deletedAttachmentData[i];
				that.deleteUploadCollectionItem(obj.EBELN, obj.ARCHIV_ID, obj.ARCHIV_DOCID);
				that.aStackUploadDefer.push(new $.Deferred());
			}

			$.when.apply($, that.aStackUploadDefer).then(function () {

				updCollection._aFileUploadersForPendingUpload = [];

				var laToolBarContent = updCollection.getToolbar().mAggregations.content;
				if (laToolBarContent.length > 3) {
					laToolBarContent.splice(3);
				}

				defer.resolve("SUCCESS");

			});

			return defer;

		},

		deleteDuplicatedFile: function (files) {
			var list = [];
			var isFound;
			for (var i = 0; i < files.length; i++) {
				isFound = false;
				for (var j = 0; j < list.length; j++) {
					if (files[i].getFileName() === list[j].getFileName()) {
						isFound = true;
						// return;
					}
				}
				if (!isFound) {
					list.push(files[i]);
				}
			}
			return list;
		},

		deleteUploadCollectionItem: function (po, archId, archDocId) {

			var that = this;
			var serviceUrl = that.getView().getModel().sServiceUrl;
			var odataServiceModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);

			var path = "/PoAttachMediaSet(EBELN='" + po + "',ARCHIV_ID='" + archId + "',ARCHIV_DOCID='" + archDocId + "')/$value";

			odataServiceModel.remove(path, {
				success: function (s) {
					var defer = that.aStackUploadDefer.pop();
					defer.resolve();
				},
				error: function (e) {
					var defer = that.aStackUploadDefer.pop();
					defer.resolve();
				}
			});

		},

		onVHAuthPerson: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");

			var aFilters = [];
			if (index.BEDAT && index.EKGRP) {
				aFilters.push(new sap.ui.model.Filter("EKGRP", "EQ", index.EKGRP, ""));
				aFilters.push(new sap.ui.model.Filter("BEDAT", "EQ", index.BEDAT, ""));
				aFilters = GUtilities.AdjustDateTimeDataToSend(aFilters);
			};

			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
				key: "PERNR",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "PERNR",
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.ZMMAPP_PERNR = pSelected.PERNR;
						index.ZMMAPP_VORNA = pSelected.VORNA;
						index.ZMMAPP_NACH2 = pSelected.NACH2;
						index.ZMMAPP_PLANS = pSelected.PLANS;
						index.ZMMAPP_STEXT = pSelected.STEXT;
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
					template: "PERNR",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.FirstName"),
					template: "VORNA",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.LastName"),
					template: "NACH2",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PositionNo"),
					template: "PLANS",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PositionName"),
					template: "STEXT",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PernrSet",
					filters: aFilters
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "PERNR_CHAR",
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "VORNA",
					label: this.getView().getModel("i18n").getProperty("Label.FirstName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "NACH2",
					label: this.getView().getModel("i18n").getProperty("Label.LastName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "PLANS_CHAR",
					label: this.getView().getModel("i18n").getProperty("Label.PositionNo"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "STEXT",
					label: this.getView().getModel("i18n").getProperty("Label.PositionName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onVHSubPerson: function (oEvent) {

			var that = this;
			var model = this.C_MODEL.poHeader;
			var index = model.getData();
			var mService = that.getOwnerComponent().getModel();
			var sTarget = oEvent.getSource().getBindingPath("value");

			var aFilters = [];
			if (index.BEDAT && index.EKGRP) {
				aFilters.push(new sap.ui.model.Filter("EKGRP", "EQ", index.EKGRP, ""));
				aFilters.push(new sap.ui.model.Filter("BEDAT", "EQ", index.BEDAT, ""));
				aFilters = GUtilities.AdjustDateTimeDataToSend(aFilters);
			}

			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
				key: "PERNR",
				descriptionKey: "",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "PERNR",
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo")
				}],
				fullOperationKey: true,
				callbackFunction: {
					ok: function (oControlEvent, pTokens, pDataSet, pSelected) {
						index.ZMMACTO_PERNR = pSelected.PERNR;
						index.ZMMACTO_VORNA = pSelected.VORNA;
						index.ZMMACTO_NACH2 = pSelected.NACH2;
						index.ZMMACTO_PLANS = pSelected.PLANS;
						index.ZMMACTO_STEXT = pSelected.STEXT;
						model.updateBindings();
						that.changeMessageModel(sTarget);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
					template: "PERNR",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.FirstName"),
					template: "VORNA",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.LastName"),
					template: "NACH2",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PositionNo"),
					template: "PLANS",
					demandPopin: false
				}, {
					label: this.getView().getModel("i18n").getProperty("Label.PositionName"),
					template: "STEXT",
					demandPopin: false
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PernrSet",
					filters: aFilters
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
					groupTitle: "",
					groupName: "group1",
					name: "PERNR_CHAR",
					label: this.getView().getModel("i18n").getProperty("Label.PersonelNo"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "VORNA",
					label: this.getView().getModel("i18n").getProperty("Label.FirstName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "NACH2",
					label: this.getView().getModel("i18n").getProperty("Label.LastName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "PLANS_CHAR",
					label: this.getView().getModel("i18n").getProperty("Label.PositionNo"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}, {
					groupTitle: "",
					groupName: "group1",
					name: "STEXT",
					label: this.getView().getModel("i18n").getProperty("Label.PositionName"),
					control: new sap.m.Input(),
					operation: sap.ui.model.FilterOperator.NE
				}]
			};

			var loVHDialog = new CommonVHDialog();
			loVHDialog.show(oVHRParams);

		},

		onChangeAuthPerson: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var authPerson = poHeader.getProperty("/ZMMAPP_PERNR");
			var purchGroup = poHeader.getProperty("/EKGRP");
			var docDate = poHeader.getProperty("/BEDAT");
			var date = "" + encodeURIComponent(docDate.toISOString().substring(0, 10) + "T07:00:00");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!authPerson) {
				poHeader.setProperty("/ZMMAPP_PERNR", "");
				poHeader.setProperty("/ZMMAPP_VORNA", "");
				poHeader.setProperty("/ZMMAPP_NACH2", "");
				poHeader.setProperty("/ZMMAPP_PLANS", "");
				poHeader.setProperty("/ZMMAPP_STEXT", "");
				return;
			}

			var path = "/F4PernrSet(PERNR_CHAR='" + authPerson + "',EKGRP='" + purchGroup + "',BEDAT=datetime'" + date + "')";

			srvModel.read(path, {

				success: function (s) {
					poHeader.setProperty("/ZMMAPP_PERNR", s.PERNR);
					poHeader.setProperty("/ZMMAPP_VORNA", s.VORNA);
					poHeader.setProperty("/ZMMAPP_NACH2", s.NACH2);
					poHeader.setProperty("/ZMMAPP_PLANS", s.PLANS);
					poHeader.setProperty("/ZMMAPP_STEXT", s.STEXT);
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					poHeader.setProperty("/ZMMAPP_PERNR", "");
					poHeader.setProperty("/ZMMAPP_VORNA", "");
					poHeader.setProperty("/ZMMAPP_NACH2", "");
					poHeader.setProperty("/ZMMAPP_PLANS", "");
					poHeader.setProperty("/ZMMAPP_STEXT", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},

		onChangeSubPerson: function (oEvent) {

			var that = this;
			var srvModel = that.getView().getModel();
			var poHeader = that.C_MODEL.poHeader;
			var subPerson = poHeader.getProperty("/ZMMACTO_PERNR");
			var purchGroup = poHeader.getProperty("/EKGRP");
			var docDate = poHeader.getProperty("/BEDAT");
			var date = "" + encodeURIComponent(docDate.toISOString().substring(0, 10) + "T07:00:00");
			var sTarget = oEvent.getSource().getBindingPath("value");

			if (!subPerson) {
				poHeader.setProperty("/ZMMACTO_PERNR", "");
				poHeader.setProperty("/ZMMACTO_VORNA", "");
				poHeader.setProperty("/ZMMACTO_NACH2", "");
				poHeader.setProperty("/ZMMACTO_PLANS", "");
				poHeader.setProperty("/ZMMACTO_STEXT", "");
				return;
			}

			var path = "/F4PernrSet(PERNR_CHAR='" + subPerson + "',EKGRP='" + purchGroup + "',BEDAT=datetime'" + date + "')";

			srvModel.read(path, {

				success: function (s) {
					poHeader.setProperty("/ZMMACTO_PERNR", s.PERNR);
					poHeader.setProperty("/ZMMACTO_VORNA", s.VORNA);
					poHeader.setProperty("/ZMMACTO_NACH2", s.NACH2);
					poHeader.setProperty("/ZMMACTO_PLANS", s.PLANS);
					poHeader.setProperty("/ZMMACTO_STEXT", s.STEXT);
					that.changeMessageModel(sTarget);
				},

				error: function (pError) {
					poHeader.setProperty("/ZMMACTO_PERNR", "");
					poHeader.setProperty("/ZMMACTO_VORNA", "");
					poHeader.setProperty("/ZMMACTO_NACH2", "");
					poHeader.setProperty("/ZMMACTO_PLANS", "");
					poHeader.setProperty("/ZMMACTO_STEXT", "");

					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
				}

			});

		},

		validateDataForSave: function (isCheck) {

			if (isCheck) {
				return true;
			}

			var isSuccess = true;
			var oButton = this.getView().byId("messagePopoverBtn");

			//***** Register required fields *****

			// this._MessageManager = new sap.ui.core.message.MessageManager();
			// this.getView().setModel(this._MessageManager.getMessageModel(), "message");
			// this.createMessagePopover();

			// Document Type
			var document_type_control = this.getView().byId("idDocumentType");
			this.handleRequiredField(document_type_control, "input", this.getView().getModel("i18n").getResourceBundle().getText(
				"Label.GeneralData"));

			// Vendor
			var vendor_control = this.getView().byId("idVendor");
			this.handleRequiredField(vendor_control, "input", this.getView().getModel("i18n").getResourceBundle().getText("Label.GeneralData"));

			// Document Date
			var document_date_control = this.getView().byId("idDocumentDate");
			this.handleRequiredField(document_date_control, "date", this.getView().getModel("i18n").getResourceBundle().getText(
				"Label.GeneralData"));

			// Company
			var company_control = this.getView().byId("idCompany");
			this.handleRequiredField(company_control, "input", this.getView().getModel("i18n").getResourceBundle().getText("Label.GeneralData"));

			// Purchasing Org
			var pur_org_control = this.getView().byId("idPurchasingOrg");
			this.handleRequiredField(pur_org_control, "input", this.getView().getModel("i18n").getResourceBundle().getText("Label.GeneralData"));

			// Purchasing Group
			var pur_group_control = this.getView().byId("idPurchasingGroup");
			this.handleRequiredField(pur_group_control, "input", this.getView().getModel("i18n").getResourceBundle().getText(
				"Label.GeneralData"));

			// Page Item
			var poItem = this.C_MODEL.poItem.getData();

			for (var i = 0; i < poItem.length; i++) {

				// Item Short Text
				if (!poItem[i].TXZ01) {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.ShortText"),
							description: this.getView().getModel("i18n").getProperty("Label.ShortText"),
							target: "/TXZ01",
							processor: ""
						})
					);
				}

				// Material Group
				if (!poItem[i].MATKL) {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.MaterialGroup"),
							description: this.getView().getModel("i18n").getProperty("Label.MaterialGroup"),
							target: "/MATKL",
							processor: ""
						})
					);
				}

				// Plant
				if (!poItem[i].WERKS) {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.Plant"),
							description: this.getView().getModel("i18n").getProperty("Label.Plant"),
							target: "/WERKS",
							processor: ""
						})
					);
				}

				// Item Qty
				if (parseFloat(poItem[i].MENGE) <= 0 || poItem[i].MENGE === null || poItem[i].MENGE === undefined || poItem[i].MENGE === "") {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.Quantity"),
							description: this.getView().getModel("i18n").getProperty("Label.Quantity"),
							target: "/MENGE",
							processor: ""
						})
					);
				}

				// Unit Price
				if (parseFloat(poItem[i].NETPR) <= 0 || poItem[i].NETPR === null || poItem[i].NETPR === undefined || poItem[i].NETPR === "") {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.UnitPrice"),
							description: this.getView().getModel("i18n").getProperty("Label.UnitPrice"),
							target: "/NETPR",
							processor: ""
						})
					);
				}

				// Price Unit
				if (parseFloat(poItem[i].PEINH) <= 0 || poItem[i].PEINH === null || poItem[i].PEINH === undefined || poItem[i].PEINH === "") {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.PriceUnit"),
							description: this.getView().getModel("i18n").getProperty("Label.PriceUnit"),
							target: "/PEINH",
							processor: ""
						})
					);
				}

				// Delivery Date
				if (!poItem[i].EINDT || poItem[i].EINDT === null) {
					this._MessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
							code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP, 0)),
							type: sap.ui.core.MessageType.Error,
							additionalText: this.getView().getModel("i18n").getProperty("Label.DeliveryDate"),
							description: this.getView().getModel("i18n").getProperty("Label.DeliveryDate"),
							target: "/EINDT",
							processor: ""
						})
					);
				}

				if (poItem[i].PSTYP === "D" || poItem[i].PSTYP === "9") {
					// Sum Limit
					if (!poItem[i].NOLIMIT) {
						if (parseFloat(poItem[i].SUMLIMIT) <= 0 || poItem[i].SUMLIMIT === null || poItem[i].SUMLIMIT === undefined || poItem[i].SUMLIMIT ===
							"") {
							this._MessageManager.addMessages(
								new sap.ui.core.message.Message({
									message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
									code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
										0)),
									type: sap.ui.core.MessageType.Error,
									additionalText: this.getView().getModel("i18n").getProperty("Label.SumLimit"),
									description: this.getView().getModel("i18n").getProperty("Label.SumLimit"),
									target: "/SUMLIMIT",
									processor: ""
								})
							);
						}
					}

					// Expect Limit
					if (parseFloat(poItem[i].COMMITMENT) <= 0 || poItem[i].COMMITMENT === null || poItem[i].COMMITMENT === undefined || poItem[i].COMMITMENT ===
						"") {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.ExpectLimit"),
								description: this.getView().getModel("i18n").getProperty("Label.ExpectLimit"),
								target: "/COMMITMENT",
								processor: ""
							})
						);
					}
				}

				if (poItem[i].KNTTP === "" || poItem[i].KNTTP === "-") {

					// Functional Area
					if (!poItem[i].FKBER) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
								description: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
								target: "/FKBER",
								processor: ""
							})
						);
					}

					// Fund Center
					if (!poItem[i].FISTL) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.FundCenter"),
								description: this.getView().getModel("i18n").getProperty("Label.FundCenter"),
								target: "/FISTL",
								processor: ""
							})
						);
					}

				} else if (poItem[i].KNTTP === "K") {

					// GL
					if (!poItem[i].PoAccAssignment.results[0].SAKTO) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.GlAccount"),
								description: this.getView().getModel("i18n").getProperty("Label.GlAccount"),
								target: "/SAKTO",
								processor: ""
							})
						);
					}

					// Business Area
					if (!poItem[i].PoAccAssignment.results[0].GSBER) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.BusinessArea"),
								description: this.getView().getModel("i18n").getProperty("Label.BusinessArea"),
								target: "/GSBER",
								processor: ""
							})
						);
					}

					// Cost Center
					if (!poItem[i].PoAccAssignment.results[0].KOSTL) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.CostCenter"),
								description: this.getView().getModel("i18n").getProperty("Label.CostCenter"),
								target: "/KOSTL",
								processor: ""
							})
						);
					}

					// Fund
					if (!poItem[i].PoAccAssignment.results[0].GEBER) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.Fund"),
								description: this.getView().getModel("i18n").getProperty("Label.Fund"),
								target: "/GEBER",
								processor: ""
							})
						);
					}

					// Functional Area
					if (!poItem[i].PoAccAssignment.results[0].FKBER) {
						this._MessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: this.getView().getModel("i18n").getProperty("Message.RequiredField"),
								code: this.getView().getModel("i18n").getResourceBundle().getText("Label.ItemList") + " " + ("" + parseInt(poItem[i].EBELP,
									0)),
								type: sap.ui.core.MessageType.Error,
								additionalText: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
								description: this.getView().getModel("i18n").getProperty("Label.FunctionalArea"),
								target: "/FKBER",
								processor: ""
							})
						);
					}

				}

			}

			setTimeout(function () {
				this.oMP.openBy(oButton);
			}.bind(this), 100);

			var message = this._MessageManager.getMessageModel().getData();
			if (message.length > 0) {
				isSuccess = false;
			}

			return isSuccess;

		},

		convertUndefinedValue: function (object) {

			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					if (object[key] === undefined) {
						object[key] = "";
					}
				}
			}

			return object;

		},

		createDataForSave: function (isHold, isCheck) {

			// var userLogin = sap.ushell.Container.getService("UserInfo").getId();
			var poHeaderData = $.extend({}, this.C_MODEL.poHeader.getData());
			var poItemData = $.extend([], this.C_MODEL.poItem.getData());
			var poHeaderTextData = $.extend([], this.C_MODEL.poHeaderText.getData());
			var poItem = [];
			var poHeaderText = [];

			// PO header text
			for (var i = 0; i < poHeaderTextData.length; i++) {
				var hdTextData = $.extend({}, poHeaderTextData[i]);
				var hdText = {};
				hdText.EBELN = "";
				hdText.TDID = hdTextData.TDID;
				hdText.DETAIL = hdTextData.DETAIL;
				poHeaderText.push(hdText);
			}

			// PO item data
			for (var i = 0; i < poItemData.length; i++) {

				var it = $.extend({}, poItemData[i]);

				var record = {};
				it = this.convertUndefinedValue(it);
				record.EBELN = "";
				record.EBELP = "" + it.EBELP;
				record.MATNR = it.MATNR;
				record.TXZ01 = it.TXZ01;
				record.MATKL = it.MATKL;
				record.WERKS = it.WERKS;
				record.LGORT = it.LGORT;
				record.KNTTP = it.KNTTP;
				record.PSTYP = it.PSTYP;
				if (record.PSTYP === 'D') {
					record.PSTYP = '9';
				}
				if (it.SUMLIMIT) {
					record.SUMLIMIT = "" + it.SUMLIMIT;
				} else {
					record.SUMLIMIT = "0.00";
				}
				if (it.COMMITMENT) {
					record.COMMITMENT = "" + it.COMMITMENT;
				} else {
					record.COMMITMENT = '0.00';
				}
				if (it.NOLIMIT) {
					record.NOLIMIT = 'X';
				} else {
					record.NOLIMIT = '';
				}

				record.MENGE = "" + it.MENGE;
				record.MEINS = it.MEINS;
				record.NETPR = "" + it.NETPR;
				record.PEINH = "" + it.PEINH;
				record.RLWRT = "" + it.RLWRT;
				record.WAERS = it.WAERS;
				record.EINDT = it.EINDT;
				record.MWSKZ = it.MWSKZ;
				record.BANFN = it.BANFN;
				record.BNFPO = it.BNFPO;
				record.IDNLF = it.IDNLF;
				if (it.ZVA2) {
					record.ZVA2 = it.ZVA2;
				} else {
					record.ZVA2 = false;
				}

				record.PoAccAssignment = [];
				if (record.KNTTP === "" || record.KNTTP === "-") {
					record.KNTTP = "";
					record.GEBER = it.GEBER;
					record.FKBER = it.FKBER;
					record.FISTL = it.FISTL;
					record.FIPOS = it.FIPOS;
					record.KBLNR = it.KBLNR;
					record.KBLPOS = it.KBLPOS;
					record.BWTAR = it.BWTAR;
				} else {

					if (poItemData[i].PoAccAssignment.results) {

						for (var j = 0; j < poItemData[i].PoAccAssignment.results.length; j++) {

							var itAcc = $.extend({}, poItemData[i].PoAccAssignment.results[j]);
							itAcc = this.convertUndefinedValue(itAcc);
							var recordAcc = {};
							recordAcc.EBELN = "";
							recordAcc.EBELP = "" + it.EBELP;
							recordAcc.ZEKKN = itAcc.ZEBKN;
							recordAcc.SAKTO = itAcc.SAKTO;
							recordAcc.GSBER = itAcc.GSBER;
							recordAcc.KOKRS = itAcc.KOKRS;
							recordAcc.KOSTL = itAcc.KOSTL;
							recordAcc.AUFNR = itAcc.AUFNR;
							recordAcc.GEBER = itAcc.GEBER;
							recordAcc.FKBER = itAcc.FKBER;
							recordAcc.FISTL = itAcc.FISTL;
							recordAcc.FIPOS = itAcc.FIPOS;
							recordAcc.KBLNR = itAcc.KBLNR;
							recordAcc.KBLPOS = itAcc.KBLPOS;
							recordAcc.ANLKL = itAcc.ANLKL;
							recordAcc.ORD41 = itAcc.ORD41;
							recordAcc.GDLGRP = itAcc.GDLGRP;
							recordAcc.ANLN1_NAME = itAcc.ANLN1_NAME;
							recordAcc.MEINS = itAcc.MEINS;

							recordAcc.GSBER = itAcc.GSBER;
							if (itAcc.ANLN1 === "NEW") {
								recordAcc.ANLN1 = "";
							} else {
								recordAcc.ANLN1 = itAcc.ANLN1;
							}
							recordAcc.ANLN2 = itAcc.ANLN2;

							if (!itAcc.MENGE) {
								itAcc.MENGE = 0;
							}
							recordAcc.MENGE = "" + itAcc.MENGE;

							recordAcc = this.convertUndefinedValue(recordAcc);
							record.PoAccAssignment.push(recordAcc);

						}

					}

				}

				record.PoItemText = [];
				if (poItemData[i].PoItemText.results) {

					for (var j = 0; j < poItemData[i].PoItemText.results.length; j++) {

						var itText = $.extend({}, poItemData[i].PoItemText.results[j]);
						itText = this.convertUndefinedValue(itText);
						var recordText = {};
						recordText.EBELN = "";
						recordText.EBELP = "" + it.EBELP;
						recordText.TDID = itText.TDID;
						recordText.DETAIL = itText.DETAIL;

						recordText = this.convertUndefinedValue(recordText);
						record.PoItemText.push(recordText);

					}

				}

				record = this.convertUndefinedValue(record);
				poItem.push(record);

			}

			// PO header data
			var poHeader = {};
			poHeader.EBELN = "";
			poHeader.BSART = poHeaderData.BSART;
			poHeader.LIFNR = poHeaderData.LIFNR;
			poHeader.BEDAT = poHeaderData.BEDAT;
			poHeader.BUKRS = poHeaderData.BUKRS;
			poHeader.EKORG = poHeaderData.EKORG;
			poHeader.EKGRP = poHeaderData.EKGRP;
			poHeader.UNSEZ = poHeaderData.UNSEZ;
			if (poHeader.UNSEZ) {
				poHeader.UNSEZ = poHeader.UNSEZ.slice(0, 12);
			} else {
				poHeader.UNSEZ = "";
			}
			poHeader.ZMMAPP_PERNR = poHeaderData.ZMMAPP_PERNR;
			poHeader.ZMMAPP_VORNA = poHeaderData.ZMMAPP_VORNA;
			poHeader.ZMMAPP_NACH2 = poHeaderData.ZMMAPP_NACH2;
			poHeader.ZMMAPP_PLANS = poHeaderData.ZMMAPP_PLANS;
			poHeader.ZMMAPP_STEXT = poHeaderData.ZMMAPP_STEXT;
			poHeader.ZMMACTO_PERNR = poHeaderData.ZMMACTO_PERNR;
			poHeader.ZMMACTO_VORNA = poHeaderData.ZMMACTO_VORNA;
			poHeader.ZMMACTO_NACH2 = poHeaderData.ZMMACTO_NACH2;
			poHeader.ZMMACTO_PLANS = poHeaderData.ZMMACTO_PLANS;
			poHeader.ZMMACTO_STEXT = poHeaderData.ZMMACTO_STEXT;
			poHeader.MEMORY = isHold;
			poHeader.TEST_RUN = isCheck;

			if (poHeaderData.KDATB) {
				poHeader.KDATB = poHeaderData.KDATB;
			} else {
				poHeader.KDATB = null;
			}
			if (poHeaderData.KDATE) {
				poHeader.KDATE = poHeaderData.KDATE;
			} else {
				poHeader.KDATE = null;
			}

			if (poHeaderData.ZVA2) {
				poHeader.ZVA2 = poHeaderData.ZVA2;
			} else {
				poHeader.ZVA2 = false;
			}

			if (poHeaderData.ZZMM_NO_ESIGN) {
				poHeader.ZZMM_NO_ESIGN = poHeaderData.ZZMM_NO_ESIGN;
			} else {
				poHeader.ZZMM_NO_ESIGN = false;
			}

			poHeader.ZZMM_J_1TPBUPL = poHeaderData.ZZMM_J_1TPBUPL;

			// Associations
			poHeader.PoItem = poItem;
			poHeader.PoHeaderText = poHeaderText;

			poHeader = GUtilities.AdjustDateTimeDataToSend(poHeader);
			return poHeader;

		},

		getPrItemData: function (pr, item) {

			var defer = new $.Deferred();
			var that = this;
			// var serviceUrl = "/sap/opu/odata/sap/ZLPUBA001_SRV";
			var serviceUrl = this.getView().getModel().sServiceUrl.replace("zlpuba002_srv", "zlpuba001_srv");
			var srvModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();

			var path = "/PrItemSet(BANFN='" + pr + "',BNFPO='" + item + "')";
			srvModel.read(path, {
				urlParameters: {
					"$expand": "PrItemText,PrAccAssignment"
				},
				success: function (s) {

					var rec = {};
					var it = $.extend({}, s);

					rec.BANFN = it.BANFN;
					rec.BNFPO = it.BNFPO;
					rec.MATNR = it.MATNR;
					rec.TXZ01 = it.TXZ01;
					rec.MATKL = it.MATKL;
					rec.MATKL_NAME = it.MATKL_NAME;
					rec.WERKS = it.WERKS;
					rec.WERKS_NAME = it.WERKS_NAME;
					rec.LGORT = it.LGORT;
					rec.LGORT_NAME = it.LGORT_NAME;
					rec.KNTTP = it.KNTTP;
					rec.KNTTP_NAME = it.KNTTP_NAME;
					if (rec.KNTTP === "") {
						rec.KNTTP_NAME = that.getView().getModel("i18n").getProperty("Label.AccountAssignment.None");
					}
					rec.PSTYP = it.PSTYP;
					rec.PSTYP_NAME = it.PSTYP_NAME;

					rec.MENGE = it.MENGE;
					rec.MEINS = it.MEINS;
					rec.MEINS_NAME = it.MEINS_NAME;
					rec.NETPR = it.PREIS;
					rec.PEINH = it.PEINH;
					rec.RLWRT = it.RLWRT;
					rec.WAERS = it.WAERS;
					rec.EINDT = it.LFDAT;
					rec.BWTAR = it.BWTAR;
					rec.BWTAR_NAME = it.BWTAR_NAME;

					rec.LIFNR = it.LIFNR;
					rec.LIFNR_NAME = it.LIFNR_NAME;
					rec.EKGRP = it.EKGRP;
					rec.EKGRP_NAME = it.EKGRP_NAME;

					rec.ZZMMEGP_PROJ = it.ZZMMEGP_PROJ;
					rec.ZZMMEGP_ITEM = it.ZZMMEGP_ITEM;
					rec.ZZMMEGP_YEAR = it.ZZMMEGP_YEAR;
					rec.ZZFM_YEAR = it.ZZFM_YEAR;

					if (rec.ZZMMEGP_ITEM === "00000") {
						rec.ZZMMEGP_ITEM = "";
					} else {
						rec.ZZMMEGP_ITEM = "" + parseInt(rec.ZZMMEGP_ITEM);
					}

					if (rec.ZZMMEGP_YEAR === "0000") {
						rec.ZZMMEGP_YEAR = "";
					}

					if (rec.PSTYP === '9') {
						rec.PSTYP = 'D';
					}
					rec.SUMLIMIT = it.SUMLIMIT;
					rec.COMMITMENT = it.COMMITMENT;
					if (it.NOLIMIT === 'X') {
						rec.NOLIMIT = true;
					} else {
						rec.NOLIMIT = false;
					}
					rec.IDNLF = it.IDNLF;

					rec.ExtItemText = it.PrItemText.results[0].DETAIL;
					rec.PoItemText = {
						results: []
					};

					rec.PoAccAssignment = {
						results: []
					};
					if (rec.KNTTP) {
						var arr = [];
						for (var k = 0; k < it.PrAccAssignment.results.length; k++) {
							it.PrAccAssignment.results[k].EBELN = "";
							it.PrAccAssignment.results[k].EBELP = it.PrAccAssignment.results[k].BNFPO;
							it.PrAccAssignment.results[k].ZEKKN = it.PrAccAssignment.results[k].ZEBKN;
							arr.push(it.PrAccAssignment.results[k]);
						}
						rec.PoAccAssignment.results = arr;
					} else {
						rec.GEBER = it.GEBER;
						rec.GEBER_NAME = it.GEBER_NAME;
						rec.FKBER = it.FKBER;
						rec.FKBER_NAME = it.FKBER_NAME;
						rec.FISTL = it.FISTL;
						rec.FISTL_NAME = it.FISTL_NAME;
						rec.FIPOS = it.FIPOS;
						rec.FIPOS_NAME = it.FIPOS_NAME;
						rec.KBLNR = it.KBLNR;
						rec.KBLPOS = it.KBLPOS;
					}

					for (var i = 0; i < poItemData.length; i++) {
						if (poItemData[i].BANFN === rec.BANFN && parseInt(poItemData[i].BNFPO, 0) === parseInt(rec.BNFPO, 0)) {
							rec.EBELN = poItemData[i].EBELN;
							rec.EBELP = poItemData[i].EBELP;
							rec.BSART = poItemData[i].BSART;
							poItemData[i] = rec;
						}
					}

					poItemModel.updateBindings();
					defer.resolve();

				},
				error: function (pError) {
					defer.resolve();
				}
			});

			return defer;

		},

		getPrItemDataAddItem: function (pr, item) {

			var defer = new $.Deferred();
			// var serviceUrl = this.oView.getModel().sServiceUrl;
			var serviceUrl = this.getView().getModel().sServiceUrl.replace("zlpuba002_srv", "zlpuba001_srv");
			var srvModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			var poItemModel = this.C_MODEL.poItem;
			var poItemData = poItemModel.getData();

			var path = "/PrItemSet(BANFN='" + pr + "',BNFPO='" + item + "')";
			srvModel.read(path, {
				urlParameters: {
					"$expand": "PrItemText,PrAccAssignment"
				},
				success: function (s) {

					var rec = {};
					var it = $.extend({}, s);

					rec.BANFN = it.BANFN;
					rec.BNFPO = it.BNFPO;
					rec.MATNR = it.MATNR;
					rec.TXZ01 = it.TXZ01;
					rec.MATKL = it.MATKL;
					rec.MATKL_NAME = it.MATKL_NAME;
					rec.WERKS = it.WERKS;
					rec.WERKS_NAME = it.WERKS_NAME;
					rec.LGORT = it.LGORT;
					rec.LGORT_NAME = it.LGORT_NAME;
					rec.KNTTP = it.KNTTP;
					rec.KNTTP_NAME = it.KNTTP_NAME;
					rec.PSTYP = it.PSTYP;
					rec.PSTYP_NAME = it.PSTYP_NAME;

					rec.MENGE = it.MENGE;
					rec.MEINS = it.MEINS;
					rec.MEINS_NAME = it.MEINS_NAME;
					rec.NETPR = it.PREIS;
					rec.PEINH = it.PEINH;
					rec.RLWRT = it.RLWRT;
					rec.WAERS = it.WAERS;
					rec.EINDT = it.LFDAT;

					rec.LIFNR = it.LIFNR;
					rec.LIFNR_NAME = it.LIFNR_NAME;
					rec.EKGRP = it.EKGRP;
					rec.EKGRP_NAME = it.EKGRP_NAME;

					rec.ZZMMEGP_PROJ = it.ZZMMEGP_PROJ;
					rec.ZZMMEGP_YEAR = it.ZZMMEGP_YEAR;
					rec.ZZMMEGP_ITEM = it.ZZMMEGP_ITEM;

					if (rec.PSTYP === '9') {
						rec.PSTYP = 'D';
					}

					rec.OLD = false;
					rec.LOEKZ = "";

					rec.PoItemText = {
						results: []
					};

					rec.PoAccAssignment = {
						results: []
					};
					if (rec.KNTTP) {
						var arr = [];
						for (var k = 0; k < it.PrAccAssignment.results.length; k++) {
							arr.push(it.PrAccAssignment.results[k]);
						}
						rec.PoAccAssignment.results = arr;
					} else {
						rec.GEBER = it.GEBER;
						rec.GEBER_NAME = it.GEBER_NAME;
						rec.FKBER = it.FKBER;
						rec.FKBER_NAME = it.FKBER_NAME;
						rec.FISTL = it.FISTL;
						rec.FISTL_NAME = it.FISTL_NAME;
						rec.FIPOS = it.FIPOS;
						rec.FIPOS_NAME = it.FIPOS_NAME;
						rec.KBLNR = it.KBLNR;
						rec.KBLPOS = it.KBLPOS;
					}

					poItemData.push(rec);
					poItemModel.setData([]);
					poItemModel.setData(poItemData);

					poItemModel.updateBindings();
					defer.resolve();

				},
				error: function (pError) {
					defer.resolve();
				}
			});

			return defer;

		},

		// handleAddItem: function(oEvent){

		// 	var that = this;
		// 	if (!that._oAddItemDialog) {
		// 		that._oAddItemDialog = sap.ui.xmlfragment("com.cu.s4hana.zlpuba002_1.view.fragment.PrItemList2", that);
		// 	}
		// 	that._oAddItemDialog.setModel(that.getView().getModel());
		// 	jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._oAddItemDialog);
		// 	that.getView().addDependent(that._oAddItemDialog);

		// 	that._oAddItemDialog.open();

		// },

		handleAfterAddItemDialogOpen: function (oEvent) {
			var that = this;
			that.settingScreenCriteriaDialog();
			LocalUtilities.addValidator(that._criterias);
			var loSmtFilter = sap.ui.getCore().byId("smartFilterBarAddItem");
			if (loSmtFilter) loSmtFilter.clear();

			// Default Filter Values
			var dateSelectControl = sap.ui.getCore().byId("idDialogDatePeriod");
			var dateRangeControl = sap.ui.getCore().byId("idDialogCreateDate");
			dateSelectControl.setSelectedKey("1M");
			dateRangeControl.setEnabled(false);

			var userParam = this.getOwnerComponent().getModel("userParam").getData();
			if (userParam.WERKS) {
				var oToken = GUtilities.CreateToken(false, "WERKS", "EQ", userParam.WERKS);
				sap.ui.getCore().byId("idDialogPlant").setTokens([oToken]);
			}
			sap.ui.getCore().byId("idSmartTablePrItemList").rebindTable(true);
		},

		settingScreenCriteriaDialog: function () {
			for (var lvFname in this._criterias) {
				this._criterias[lvFname].control = sap.ui.getCore().byId(this._criterias[lvFname].id);
			}
		},

		onChangeDatePeriod: function (oEvent) {
			var dateRangeControl = sap.ui.getCore().byId("idDialogCreateDate");
			var selectedPeriod = oEvent.getParameters().selectedItem.getProperty("key");
			if (selectedPeriod === "-") {
				dateRangeControl.setEnabled(true);
			} else {
				dateRangeControl.setEnabled(false);
				dateRangeControl.setDateValue(null);
			}
		},

		checkDateFormatPeriod: function (oEvent) {
			var dateSelectControl = sap.ui.getCore().byId("idDialogDatePeriod");
			var bValid = oEvent.getParameter("valid");
			var oDRS = oEvent.getSource();
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);

				if (!oEvent.getSource().getDateValue()) {
					dateSelectControl.setEnabled(true);
				} else {
					dateSelectControl.setEnabled(false);
					dateSelectControl.setSelectedKey("-");
				}

			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		checkDateFormat: function (oEvent) {
			var bValid = oEvent.getParameter("valid");
			var oDRS = oEvent.getSource();
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		handleCloseAddItemDialog: function (oEvent) {
			this._oAddItemDialog.close();
			this._oAddItemDialog.destroy();
			this._oAddItemDialog = null;
		},

		handleAddItemFromPrList: function (oEvent) {

			var that = this;
			var dialog = oEvent.getSource().getParent();
			var lvEgpNoDoc = this.C_MODEL.poItem.getData()[0].ZZMMEGP_PROJ;
			var lvDocType = "";
			var lvEgpNo = "";
			var lvEgpYear = "";
			var isEgpDiff = false;
			var oList = sap.ui.getCore().byId("idTablePrItemList");
			var aContexts = oList.getItems().map(function (oItem) {
				return oItem.getBindingContext().getPath();
			});

			var arr = [];
			var model = sap.ui.getCore().byId("idSmartTablePrItemList").getModel();
			aContexts.forEach(function (sPath) {
				if (model.getProperty(sPath + '/CHK_BOX')) {
					if (lvEgpNo !== "" && lvEgpNo !== model.getProperty(sPath + '/ZZMMEGP_PROJ')) {
						isEgpDiff = true;
					} else {
						lvEgpNo = model.getProperty(sPath + '/ZZMMEGP_PROJ');
						lvEgpYear = model.getProperty(sPath + '/ZZMMEGP_YEAR');
					}
					arr.push(model.getProperty(sPath));
					lvDocType = model.getProperty(sPath + '/BSART');
				}
			});

			if (dialog.getBusy() === false) {
				dialog.setBusyIndicatorDelay(0);
				dialog.setBusy(true);
			}

			if (lvDocType === "1A31") {

				if (lvEgpNoDoc && lvEgpNoDoc !== lvEgpNo) {
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					MessageBox.error(that.getView().getModel("i18n").getProperty("Message.DiffEgpAddItem"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					});
					if (dialog.getBusy()) {
						dialog.setBusy(false);
					}
					return;
				} else {
					that.getDatafromPrListAddItem(arr, dialog, "", []);
				}

			} else {

				// e-GP number must be the same
				if (isEgpDiff || lvEgpNo !== lvEgpNoDoc) {
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					MessageBox.error(that.getView().getModel("i18n").getProperty("Message.DiffEgpAddItem"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					});
					if (dialog.getBusy()) {
						dialog.setBusy(false);
					}
					return;
				}

				var aDefer = [];
				aDefer.push(that.callEgpService("EGPWS0022", lvEgpNo, lvEgpYear));
				aDefer.push(that.getMaterialUnitData());
				$.when.apply($, aDefer).then(function (ret, materialUnit) {

					if (ret === "ERROR") {
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.warning(that.getView().getModel("i18n").getProperty("Message.CannotReachEgp"), {
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === sap.m.MessageBox.Action.OK) {
									that.getDatafromPrListAddItem(arr, dialog, "", materialUnit);
								} else {
									if (dialog.getBusy()) {
										dialog.setBusy(false);
									}
								}
							}
						});

					} else {
						that.getDatafromPrListAddItem(arr, dialog, ret, materialUnit);
					}

				});

			}

		},

		getDatafromPrListAddItem: function (arr, dialog, egpData, materialUnit) {

			var that = this;
			var aDefer = [];
			for (var i = 0; i < arr.length; i++) {
				aDefer.push(that.getPrItemDataAddItem(arr[i].BANFN, arr[i].BNFPO));
			}
			$.when.apply($, aDefer).then(function (status) {

				var poHeader = that.C_MODEL.poHeader.getData();
				var poItemModel = that.C_MODEL.poItem;
				var poItemData = poItemModel.getData();
				var lvLastItemNo = 10;

				for (var i = 0; i < poItemData.length; i++) {
					if (poItemData[i].EBELN && poItemData[i].EBELN !== "") {
						lvLastItemNo = parseInt(poItemData[i].EBELP, 0);
					} else {
						var newItemNo = lvLastItemNo + 10;
						poItemModel.setProperty("/" + i + "/EBELN", "" + poHeader.EBELN);
						poItemModel.setProperty("/" + i + "/EBELP", "" + newItemNo);
						lvLastItemNo = newItemNo;

						// Adopt e-Gp data
						if (egpData !== "") {
							for (var x = 0; x < egpData.contractdetail4.length; x++) {
								var rec = egpData.contractdetail4[x];
								if (!rec) {
									return;
								}

								// Item Net Price
								var totalVal = parseFloat(rec.field12);
								var qty = parseFloat(rec.field7);
								var netVal = 0;
								if (qty > 0) {
									netVal = totalVal / qty;
								}

								// Condition Type ZVA2
								var zva2 = false;
								if (rec.field10 === "Y") {
									zva2 = true;
								}

								// Update to Item
								for (var j = 0; j < poItemData.length; j++) {
									if (!poItemData[j].OLD && parseInt(poItemData[j].ZZMMEGP_ITEM, 0) === parseInt(rec.field3, 0)) {
										poItemModel.setProperty("/" + j + "/NETPR", netVal);
										poItemModel.setProperty("/" + j + "/ZVA2", zva2);
										var totalAmount = (netVal / poItemData[j].PEINH) * poItemData[j].MENGE;
										poItemModel.setProperty("/" + j + "/RLWRT", totalAmount);
										// Item unit
										if (poItemData[j].MATNR !== "") {
											for (var k = 0; k < materialUnit.length; k++) {
												if (parseInt(materialUnit[k].EGP_UNIT, 0) === parseInt(rec.field8, 0)) {
													poItemModel.setProperty("/" + j + "/MEINS", materialUnit[k].SAP_UNIT);
													poItemModel.setProperty("/" + j + "/MEINS_NAME", materialUnit[k].SAP_UNIT_DESC);
													return;
												}
											}
										}
									}
								}

							}
						}

						// PO Item Account Assignment
						for (var j = 0; j < poItemData[i].PoAccAssignment.results.length; j++) {
							poItemModel.setProperty("/" + i + "/PoAccAssignment/results/" + j + "/EBELN", "" + poHeader.EBELN);
							poItemModel.setProperty("/" + i + "/PoAccAssignment/results/" + j + "/EBELP", "" + newItemNo);
						}

						// PO Item Text
						var textArr = [];
						for (var j = 0; j < poItemData[0].PoItemText.results.length; j++) {
							var text = $.extend({}, poItemData[0].PoItemText.results[j]);
							text.EBELN = "" + poHeader.EBELN;
							text.EBELP = "" + newItemNo;
							text.DETAIL = "";
							textArr.push(text);
						}
						poItemModel.setProperty("/" + i + "/PoItemText/results", textArr);

					}
				}
				poItemModel.updateBindings();

				if (dialog.getBusy()) {
					dialog.setBusy(false);
				}
				that.handleCloseAddItemDialog();

			});

		},

		onDataRecieved: function (oEvent) {
			var that = this;
			var oList = oEvent.getSource().getTable();
			var aContexts = oList.getItems().map(function (oItem) {
				return oItem.getBindingContext().getPath();
			});

			var currentPr;
			var model = oEvent.getSource().getModel();
			aContexts.forEach(function (sPath) {
				model.setProperty(sPath + '/CHK_ALL', false);
				model.setProperty(sPath + '/CHK_BOX', false);
				model.setProperty(sPath + '/CHK_HIDE', true);
				if (model.getProperty(sPath + '/BANFN') === currentPr) {
					model.setProperty(sPath + '/CHK_HIDE', false);
				}
				currentPr = model.getProperty(sPath + '/BANFN');
			});
			model.updateBindings();

			that.C_MODEL.addItemModel.setProperty("/Count", 0);
			that.C_MODEL.addItemModel.updateBindings();

		},

		handleClickAllPr: function (oEvent) {

			var that = this;
			var select = oEvent.getSource().getSelected();
			var index = oEvent.getSource().getBindingContext().getObject();

			var oList = oEvent.getSource().getParent().getParent().getParent();
			var aContexts = oList.getItems().map(function (oItem) {
				return oItem.getBindingContext().getPath();
			});

			var count;
			var model = oList.getParent().getModel();
			aContexts.forEach(function (sPath) {
				if (model.getProperty(sPath + '/BANFN') === index.BANFN) {

					if (model.getProperty(sPath + '/CHK_BOX') === select) {
						return;
					}

					model.setProperty(sPath + '/CHK_BOX', select);

					if (select) {
						count = that.C_MODEL.addItemModel.getProperty("/Count");
						count++;
						that.C_MODEL.addItemModel.setProperty("/Count", count);
					} else {
						count = that.C_MODEL.addItemModel.getProperty("/Count");
						count--;
						that.C_MODEL.addItemModel.setProperty("/Count", count);
					}

				}
			});
			model.updateBindings();

		},

		handleClickEachPr: function (oEvent) {

			var that = this;
			var select = oEvent.getSource().getSelected();
			var index = oEvent.getSource().getBindingContext().getObject();
			var count;

			if (select) {
				count = that.C_MODEL.addItemModel.getProperty("/Count");
				count++;
				that.C_MODEL.addItemModel.setProperty("/Count", count);
			} else {
				count = that.C_MODEL.addItemModel.getProperty("/Count");
				count--;
				that.C_MODEL.addItemModel.setProperty("/Count", count);
			}

			var oList = oEvent.getSource().getParent().getParent().getParent();
			var aContexts = oList.getItems().map(function (oItem) {
				return oItem.getBindingContext().getPath();
			});
			var bContexts = aContexts;

			var model = oList.getParent().getModel();
			aContexts.forEach(function (sPath) {
				if (model.getProperty(sPath + '/BANFN') === index.BANFN) {
					if (!select) {
						model.setProperty(sPath + '/CHK_ALL', select);
					} else {
						var isAll = true;
						var path0;
						bContexts.forEach(function (sPath2) {
							if (model.getProperty(sPath2 + '/BANFN') === index.BANFN) {
								if (model.getProperty(sPath2 + '/CHK_HIDE')) {
									path0 = sPath2;
								}
								if (!model.getProperty(sPath2 + '/CHK_BOX')) {
									isAll = false;
								}
							}
						});
						if (isAll) {
							model.setProperty(path0 + '/CHK_ALL', true);
						}

					}
				}
			});
			model.updateBindings();

		},

		onbeforeRebindTable: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			this.adjustDateFilter(mBindingParams.filters);
			var loFilters = this.getFilterBar(mBindingParams.filters);
			mBindingParams.filters = loFilters;
		},

		getFilterBar: function (pFilterParam) {
			var laFilters = [];
			var loSmtFilter = sap.ui.getCore().byId("smartFilterBarAddItem");
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

						if (!lvDateTo) {
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
						} else {

							if (lvFname !== "BADAT") {
								break;
							}

							var selectedPeriod = sap.ui.getCore().byId("idDialogDatePeriod").getSelectedKey();

							if (selectedPeriod !== '-') {

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
								lvDateFrom.setHours(7, 0, 0, 0);
								lvDateTo.setHours(7, 0, 0, 0);

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
								if (lvFname === "KNTTP" && laTokens[i] === '-') {
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
					};
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

		callEgpService: function (serviceNo, lvEgpNo, lvEgpYear) {

			var that = this;
			var defer = new $.Deferred();
			// var prEgpInfo = this.C_MODEL.prEgpInfo.getData();

			if(!this.C_MODEL.egpTime){			//CH09: Ins
				defer.resolve("ERROR");
				return defer;
			}

			var request = {
				"ProjectDatas": {
					"LoginDatas": {
						"FIELD1": that.getOwnerComponent().egp.username,
						"FIELD2": that.getOwnerComponent().egp.password
					},
					"Request": {
						"FIELD1": lvEgpNo,
						"FIELD2": lvEgpYear
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
					var result = that.xmlToJson(data, serviceNo);
					if (result.contractdatas.responsecode.field1 === "000") {
						defer.resolve(result.contractdatas);
					} else {
						defer.resolve("ERROR");
					}
				},
				error: function (error) {
					defer.resolve("ERROR");
				}
			});

			return defer;

		},

		OBJtoXML: function (obj) {
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
			var text = $(node).contents().filter(function (x) {
				return this.nodeType === 3;
			});
			if (text[0] && text[0].nodeValue.trim()) {
				cur = text[0].nodeValue;
			} else {
				cur = {};
				$.each(node.attributes, function () {
					if (this.name.indexOf('xmlns:') !== 0) {
						cur[this.name.replace(/^.+:/, '')] = this.value;
					}
				});
				$.each(node.children, function () {
					that.parsexml(this, cur, serviceNo);
				});
			}

			// j[nodeName] = cur;

			if (nodeName === "contractdetail4") {
				if (!j[nodeName]) {
					j[nodeName] = [];
				}
				j[nodeName].push(cur);
			} else {
				j[nodeName] = cur;
			}

		},

		xmlToJson: function (xml, serviceNo) {
			var roots = $(xml);
			var root = roots[roots.length - 1];
			var json = {};
			this.parsexml(root, json, serviceNo);
			return json['#document'];
		},

		onBeforeExport: function (oEvent) {
			var that = this;
			var oExport = oEvent.mParameters.exportSettings;
			that._checkPropertyType(oExport);
		},

		_checkPropertyType: function (oValue) {
			// Be careful, There are Static variables for ONLY this file and Page1ProjectList.view.xml .
			var arr = oValue.workbook.columns;
			for (var i in arr) {
				switch (arr[i].property) {
				case "BADAT":
					arr[i].type = sap.ui.export.EdmType.Date;
					break;
				}
			}
		},

		handleDeleteItem: function (oEvent) {
			var that = this;
			var list = oEvent.getSource().getParent().getParent();
			var selectedData = list.getSelectedItems();

			if (selectedData.length === 0) {
				var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(that.getView().getModel("i18n").getProperty("Message.Selected1Line"), {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				});
				return;
			};

			var poItemModel = this.C_MODEL.poItem;
			var poItemData = $.extend([], poItemModel.getData());
			for (var i = 0; i < selectedData.length; i++) {
				var itemNumber = selectedData[i].getBindingContext("poItem").getObject().EBELP;
				var idx = that.findIndexPo(itemNumber, poItemData);
				poItemData.splice(idx, 1);
			}

			// Re-run index number
			for (var i = 0; i < poItemData.length; i++) {
				poItemData[i].EBELP = (i + 1) * 10;

				for (var j = 0; j < poItemData[i].PoItemText.results.length; j++) {
					poItemData[i].PoItemText.results[j].EBELP = (i + 1) * 10;
				}

				for (var k = 0; k < poItemData[i].PoAccAssignment.results.length; k++) {
					poItemData[i].PoAccAssignment.results[k].EBELP = (i + 1) * 10;
				}

			}

			that.C_MODEL.poItem.setData([]);
			that.C_MODEL.poItem.setData(poItemData);
			that.C_MODEL.poItem.updateBindings();
			list.removeSelections();

		},

		findIndexPo: function (itemNumber, poItemData) {
			var idx = -1;
			for (var i = 0; i < poItemData.length; i++) {
				if (poItemData[i].EBELP === itemNumber) {
					idx = i;
				}
			}
			return idx;
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
					defer.resolve();

				},

				error: function (pError) {
					defer.resolve();
				}

			});
			return defer;
		}
		//CH09: Ins End

	});
}, /* bExport= */ true);
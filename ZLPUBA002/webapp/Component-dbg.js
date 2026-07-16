/*
* ------------------------------------------------------------------------------------------------------------------
* CHANGED LOG
* ------------------------------------------------------------------------------------------------------------------
* TR no.		| CHANGE-ID	| DATE		    | OWNER	    | DESCRIPTION
* ------------------------------------------------------------------------------------------------------------------
*  FEDK901543	| CH01	| 10/03/2020	| Sirirat S.	| Fix Limit for table item in poheader
*  FEDK901640	| CH02	| 13/04/2020	| Sirirat S.	| Fix set default date	
*  FEDK901779	| CH03	| 05/10/2020	| Sirirat S.	| Fix case delete
*  FEDK902974	| CH04	| 09/11/2022	| Jarinya V.	| Fix bug thai language purchase group
*  FEDK903167	| CH05	| 04/04/2024	| Tunpisith V.	| Add e-GP connection time check
*  FEDK903189   | CH06  | 18/07/2024    | Jarinya V.    | Fix cannot find asset
*  FEDK903393	| CH07	| 10/10/2025	| Tunpisith V.	| Add condition for egp error message
*  FEDK904032	| CH08	| 21/05/2026	| Wanrat L.		| Add warning popup when attachment fail to upload
* ------------------------------------------------------------------------------------------------------------------
*/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/cu/s4hana/zlpuba002/model/models",
	"./model/errorHandling"
], function (UIComponent, Device, models, errorHandling) {
	"use strict";

	var navigationWithContext = {
		"PrHeaderSet": {
			"PrHeaderEdit": "",
			"PrItemEdit": "ToPrItem",
			"SaveSuccessDialog": "",
			"Dialog2": ""
		},
		"PrItemSet": {
			"PrItemEdit": ""
		},
		"PrListSet": {
			"PrList": ""
		},
		"MaterialGroupSet": {
			"AddItemToCart": "",
			"DialogCart": "ToMaterial"
		},
		"MaterialSet": {
			"DialogCart": ""
		}
	};

	return UIComponent.extend("com.cu.s4hana.zlpuba002.Component", {

		metadata: {
			manifest: "json",
		config: {
				fullWidth: true
			}
		},
		
		egp: {
			username: "CUERP_EGP",
			password: "Rmk5dWRdaDtwc3YsMTk="
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({
				"uri": "/here/goes/your/serviceUrl/local/"
			}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// delegate error handling
			// errorHandling.register(this);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		createContent: function () {
			var app = new sap.m.App({
				id: "zlpuba002"
			});
			var appType = "App";
			var appBackgroundColor = "";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function (sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});

});
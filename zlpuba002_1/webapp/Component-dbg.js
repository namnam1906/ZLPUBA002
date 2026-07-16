/*
* ------------------------------------------------------------------------------------------------------------------
* CHANGED LOG
* ------------------------------------------------------------------------------------------------------------------
* TR no.		| CHANGE-ID	| DATE		    | OWNER	    | DESCRIPTION
* ------------------------------------------------------------------------------------------------------------------
* FEDK901567	| CH01	| 20/03/2020	| Sirirat S.	| Fix set limitsize of poitem table	
* FEDK901585    | CH02	| 25/03/2020	| Sirirat S.	| Fix set unit from PR not EGP
* FEDK901648    | CH03	| 13/04/2020	| Sirirat S.	| Fix set default date
* FEDK901670    | CH04	| 28/04/2020	| Sirirat S.	| Fix lenght text from EGP
* FEDK901699	| CH05	| 27/05/2020	| Sirirat S.	| Fix not set headertext F47 from EGP
* FEDK901711	| CH05-2| 27/05/2020	| Sirirat S.	| Fix clear headertext F47 from EGP
* FEDK901730	| CH06	| 13/07/2020	| Pagon T.		| INC0009933: ZLPUBA002 Change filed name
* FEDK901889	| CH07	| 04/12/2020	| Sirirat S.	| Fix check null call service EGP
* FEDK902974 	| CH08	| 04/11/2022	| Jarinya V.	| Fix bug thai language purchase group
* FEDK903167 	| CH09	| 03/04/2024	| Tunpisith V.	| Add e-GP connection time check
* FEDK903189    | CH10  | 17/07/2024    | Jarinya V.    | Fix cannot find asset
* FEDK903391 	| CH11	| 10/10/2025	| Tunpisith V.	| Add condition for egp error message
* FEDK904034	| CH12	| 21/05/2026	| Wanrat L.		| Add warning popup when attachment fail to upload
* ------------------------------------------------------------------------------------------------------------------
*/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/cu/s4hana/zlpuba002_1/model/models",
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

	return UIComponent.extend("com.cu.s4hana.zlpuba002_1.Component", {

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
				id: "zlpuba002_1"
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
sap.ui.define([
        "iam/bc/utilities/Utilities"
    ],
    function (LibUtilities) {
        "use strict";
        return {
            /**
             * Function for Adjust Date Time before sent to SAP
             * @param datas, Object that adjust time by time zone
             */
            adjustTimezone: function (datas) {
                for (var data in datas) {
                    var val = datas[data];
                    if (val instanceof Date) {
                        var now = new Date();
                        datas[data] = new Date(val.getTime() - (now.getTimezoneOffset() * 1000 * 60));
                    } else if (val instanceof Object)
                        this.adjustTimezone(val);
                }
            },
            addValidator: function (aMultiInputs) {
                var that = this;
                for (var lvInd in aMultiInputs) {
                    var loMultiInput = aMultiInputs[lvInd];
                    loMultiInput = $.extend(true, {
                        id: null,
                        keyfield: null
                    }, loMultiInput);
                    (function (oMultiInput) {
                    	if (oMultiInput.type === "MultiInput") {
	                        var oControl = oMultiInput.control;
	                        oControl.addValidator(function (args) {
	                            try {
	                                args.text = args.text.toUpperCase();
	                            } catch (e) {
	                            }
	                            var loToken = LibUtilities.CreateToken(false, oMultiInput.keyfield, "EQ", args.text);
	                            return loToken;
	                        });
                    	}
                    }.bind(this))(loMultiInput);
                }
            },
            navCrossAppToMyEzPay: function (ezPayNo, ezPayYear, ezCompCode, appState) {
                var hash = "#zezpay-zezb009_appr&/EzPayWorklist/EzPayDetail/(CompCode='{0}',EzPayNo='{1}',FiscalYear='{2}')".format(
                    ezCompCode, ezPayNo, ezPayYear);
                var context = "(CompCode='{0}',EzPayNo='{1}',FiscalYear='{2}')".format(
                    ezCompCode, ezPayNo, ezPayYear);
                context = btoa(context);
                var hash = "#zezpay-zezb009_appr&/EzPayWorklist/EzPayDetail/" + context;
                // var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                // oCrossAppNavigator.toExternal({
                // 	target: {
                // 		shellHash: hash
                // 	},
                // 	appStateKey:  appState ? appState : ""
                // });
                var url = window.location.href.split('#')[0] + hash;
                sap.m.URLHelper.redirect(url, true);
            },
            navCrossAppToApr: function (AprNo, AprYear, AprCompCode, appState) {
                // BEGIN INS BY CH02
                var context = "(ApprovalComp='{0}',ApprovalNo='{1}',ApprovalYear='{2}')".format(
                    AprCompCode, AprNo, AprYear);
                var context = {ApprovalComp: AprCompCode, ApprovalNo: AprNo, ApprovalYear: AprYear};
                context = btoa(JSON.stringify(context));
                // example nav context zezpay-zezb016&/HistoryDetailApprovalRequest/eyJBcHBNb2RlIjoiSU5JVElBVE9SIiwiRXpQYXlObyI6IjIwMDAzMzMiLCJDb21wQ29kZSI6IjExMDAiLCJGaXNjYWxZZWFyIjoiMjAxOCIsIkFwcHJvdmFsTm8iOiI1MDAwNDk0IiwiQXBwcm92YWxDb21wIjoiMTEwMCIsIkFwcHJvdmFsWWVhciI6IjIwMTgifQ==
                var hash = "#zezpay-zezb016&/HistoryDetailApprovalRequest/" + context;
                // END INS BY CH02
                // DEL BY CH02
                // var hash = "#zezpay-zezb009_appr&/EzPayWorklist/EzPayDetail/(CompCode='{0}',EzPayNo='{1}',FiscalYear='{2}')".format(
                // 	ezCompCode, ezPayNo, ezPayYear);
                var url = window.location.href.split('#')[0] + hash;
                sap.m.URLHelper.redirect(url, true);
            }
        };
    }
);
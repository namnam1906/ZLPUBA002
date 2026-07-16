sap.ui.define([
	"./Formatter"
], function() {
	"use strict";

	return {
		formatterResultCreateAp: function (pResultText, pHoldDocNo) {
			return pResultText.format(pHoldDocNo);
		},
		dateFormatterGW: function (date) {
			var oFormatter = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd"
			});
			if (date) {
				return "datetime'" + oFormatter.format(date) + encodeURIComponent("T00:00:00")+"'";
			}
			else{
				return "";
			}
		},
		parseInt: function(pValue){
			var oValue = 0;
			if(parseInt(pValue)){
				oValue = parseInt(pValue);
			}
			return oValue;
		},
		parseStatus: function(pStatus){
			var oStatus = "None";
			
			switch (pStatus) {
				case "INP":
					oStatus = "Warning";
					break;
				case "APP":
					oStatus = "Success";
					break;
				case "REJ":
					oStatus = "Error";
					break;
				default:
			}
			
			return oStatus;
		},
		
		parseCurrency: function(pCurrency){
			var oCurrency = "บาท";
			
			switch (pCurrency) {
				case "THB":
					oCurrency = "บาท";
					break;
				case "USD":
					oCurrency = "ดอลลาร์";
					break;
				case "EUR":
					oCurrency = "ยูโร";
					break;
				default:
			}
			
			return oCurrency;
		},
		
		parseEgp: function(egpNo,egpItem){
			
			var text;
			// if(egpNo && egpItem){
			// 	text = egpNo + " / " + parseInt(egpItem,0);
			// }else{
			// 	text = "-";
			// }
			text = egpNo + " / " + egpItem;
			
			return text;
		},
		
		parseRefDoc: function(pr,prItem, oa, oaItem){
			
			var refDoc;
			if(pr){
				refDoc = pr + ' / ' + ("" + parseInt(prItem,0));
			}else if(oa){
				refDoc = oa + ' / ' + ("" + parseInt(oaItem,0));
			}else{
				refDoc = "-";
			}
			
			return refDoc;
		},
		
		parseStatusText: function(pStatus){
			var oStatus = "ไม่พบเงื่อนไข";
			
			switch (pStatus) {
				case "INP":
					oStatus = "รออนุมัติ";
					break;
				case "APP":
					oStatus = "อนุมัติแล้ว";
					break;
				case "REJ":
					oStatus = "ปฏิเสธอนุมัติ";
					break;
				default:
			}
			
			return oStatus;
		},
		
		parseCodeName: function(pCode,pName){
			
			var text;
			if(pCode && pCode !== '0'){
				text = pName + " (" + pCode + ")";
			}else{
				text = pName;
			}
			
			return text;
		},
		
		parseCodeNameItemCat: function(pCode,pName){
			
			var text;
			
			if(pCode === '9'){
				pCode = 'D';
			}
			
			if(pCode && pCode !== '0'){
				text = pName + " (" + pCode + ")";
			}else{
				text = pName;
			}
			
			return text;
		},
		
		parseCodeNameKnttp: function(pCode,pName){
			
			var text;
			if(pCode && pCode !== '0'){
				text = pName + " (" + pCode + ")";
			}else{
				text = pName;
			}
			
			if(pCode === "" || pCode === "-"){
				text = "วัสดุคงคลัง (สต็อก)";
			}
			
			return text;
		},
		
		parseDocWithDocItem: function(pDoc,pDocItem){
			return pDoc + '/' + pDocItem;
		},
		
		parseValue: function(val) {

			var oFloatNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true
			}, sap.ui.getCore().getConfiguration().getLocale());

			if (oFloatNumberFormat.format(val) === "") {
				val = 0;
			}

			return oFloatNumberFormat.format(val);
		},
		
		parseUploadDateTime: function(date,time){
			
			var now = new Date();
			var newTime = new Date(time.ms + (now.getTimezoneOffset() * 1000 * 60));
			var newDate = date;
			newDate.setHours(newTime.getHours());
			newDate.setMinutes(newTime.getMinutes());
			newDate.setSeconds(newTime.getSeconds());
			
			var oDateFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd.MM.YYYY HH:mm:ss"
			});
			var pDatetime = oDateFormatter.format(newDate);
		
			return pDatetime;
			
		},
		
		formatFileSize :  function (sValue) {
		   if (jQuery.isNumeric(sValue)) {
		    return sap.ui.core.format.FileSizeFormat.getInstance({
		     maxFractionDigits : 1,
		     maxIntegerDigits : 3
		    }).format(sValue);
		   } else {
		    return sValue;
		   }
		},
		
		formatRowHighlight: function (oValue) {
			// Your logic for rowHighlight goes here
			if (oValue) {
				return "Error";
			} else {
				return "None";
			}
			// return oValue;
		},
		
		parseRefDocLink: function(refDoc,item){
			
			var url = "";
			if(refDoc !== "" && refDoc !== undefined){
				switch (refDoc[0]) {
					case "1": case "W":
						url = "/sap/bc/ui2/flp#ZFIORI-ZLPUBA101_NAV&/PrItem/" + refDoc + "/" + item;
						break;
					case "3": case "4": case "5": case "X": case "Y": case "Z":
						url = "/sap/bc/ui2/flp#ZFIORI-ZLPUBA102_NAV&/PoItem/" + refDoc + "/" + item;
						break;
					case "2":
						url = "/sap/bc/ui2/flp#ZFIORI-ZLPUBA103_NAV&/OaItem/" + refDoc + "/" + item;
						break;
					default:
				}
			}
			return url;
			
		}
		
	};
});
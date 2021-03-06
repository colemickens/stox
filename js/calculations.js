var calculations = {
  periods : {
    title: "Periods Shown",
    options: {  },
    calculation: function(data) {
      return appdata.stockPrices.length;
    }
  },
  simpleMovingAverage : {
    title: "Simple Moving Average",
    options: { periods: 4 },
    calculation: function(data) {
      try {
        var answer = simpleMovingAverage(data.periods, appdata.stockPrices.length-1);
        return Math.round(answer * 100) / 100;
      } catch(e) {
        return "[error]";
      }
    }
  },
  exponentialMovingAverage : {
    title: "Exponential Moving Average",
    options: { periods: 50 },
    calculation: function(data) {
      try { 
        var answer = exponentialMovingAverage(data.periods);
        return Math.round(answer*100)/100;
      } catch(e) {
        return "[error]";
      }
    }
  },
  macd : {
    title: "MACD",
    options: { period_1: 12, period_2: 26, period_3: 9 },
    calculation: function(data) {
      try {
        var answer = movingAverageConvergenceDivergence(data.period_1, data.period_2, data.period_3);
        for(var i=0; i<answer.length; i++) {
          answer[i] = (Math.round(answer[i]*100)/100);
        } 
        return answer.join(", ");
      } catch(e) {
        return "[error]";
      }
    }
  },
  bollingerBands : {
    title: "Bollinger Bands",
    options: { periods: 20 },
    calculation: function(data) {
      try {
        var answer = bollingerBands(data.periods);
        for(var i=0; i<answer.length; i++) {
          answer[i] = (Math.round(answer[i]*100)/100);
        }
        return answer.join(", ");
      } catch(e) {
        return "[error]";
      }
    }
  },
  relativeStrengthIndex : {
    title: "Relative Strength Index",
    options: { periods: 14 },
    calculation: function(data) {
      try {
        var answer = relativeStrengthIndex(data.periods);
        answer = Math.round(answer*100)/100;
        if(answer > 70) {
          answer += " (overbought)";
        } else if(answer < 30) {
          answer += " (oversold)";
        }
        return answer;
      } catch(e) {
        return "[error]";
      }
    }
  },
  sharpeRatio : {
    title: "Sharpe Ratio",
    options: { risk_free_rate_of_return_as_decimal: 0/*, periods: 10 */},
    calculation: function(data) {
      try{
        var answer = sharpeRatio(data.risk_free_rate_of_return_as_decimal/*, data.periods*/);
        answer = answer * 100;
        return Math.round(answer*100)/100 + "%";
      } catch(e) {
        return "[error]";
      }
    }
  },
  annualizedMean : {
    title: "Annualized Mean Rate of Return",
    options: { /* periods: 10 */ },
    calculation: function(data) {
      try {
        var answer = annualizedMean(/*data.periods*/);
        return Math.round(answer*10000)/100 + "%";
      } catch(e) {
        return "[error]";
      }
    }
  },
  annualizedStandardDeviation : {
    title: "Annualized Standard Deviation",
    options: { /* periods: 10 */ },
    calculation: function(data) {
      try {
        var answer = annualizedStandardDeviation(/*data.periods*/);
        return Math.round(answer*10000)/10000;
      } catch(e) {
        return "[error]";
      }
    }
  },
  standardDeviationOfRatesOfReturn : {
    title: "Standard Deviation (RoR)",
    options: { /* periods: 10 */ },
    calculation: function(data) {
      try {
        //var answer = standardDeviationRoR(/*data.periods*/);
        var answer = genericStandardDeviation(getRateOfReturns(appdata.stockPrices));
        return Math.round(answer*10000)/10000;
      } catch(e) {
        return "[error]";
      }
    }
  },
  meanRateOfReturn : {
    title: "Mean Rate of Return",
    options: { /* periods: 10 */ },
    calculation: function(data) {
      try{
        var answer = meanRateOfReturn(appdata.stockPrices);
        answer = answer*100;
        return Math.round(answer*100)/100 + "%";
      } catch(e) {
        return "[error]";
      }
    }
  },
  autocorrelationOfStock: {
    title: "Autocorrelation of Stock",
    options: {  },
    calculation: function(data) {
      try {
		var answer = autocorrelationValue(appdata.stockPrices);
        return Math.round(answer*10000)/10000;
      } catch(e) {
        return "[error]";
      }
    }
  },
  autocorrelationOfSpx: {
    title: "Autocorrelation of SPX",
    options: {  },
    calculation: function(data) {
      try {
		var answer = autocorrelationValue(appdata.spxPrices);
		return Math.round(answer*10000)/10000;
      } catch(e) {
        return "[error]";
      }
    }
  },
  correlationBetweenReturnRates: {
    title: "Correlation between Return Rates",
    options: {  },
    calculation: function(data) {
      try {
		var answer = correlationValue();
        return Math.round(answer*10000)/10000;
      } catch(e) {
        return "[error]";
      }
    }
  },
  beta : {
    title: "Beta",
    options: {  },
    calculation: function(data) {
      try {
        return beta();
      } catch(e) {
        return "[error]";
      }
    }
  },
  expectedCostOfEquity: {
    title: "Expected Cost of Equity",
    options: { risk_free_rate_of_return_as_decimal: .25 },
    calculation: function(data) {
      try {
        return expectedCostOfEquity(data.risk_free_rate_of_return_as_decimal);
      } catch(e) {
        return "[error]";
      }
    }
  },
  skew : {
    title: "Skew",
    options: {  },
    calculation: function(data) {
      try {
		var answer = skew();
        return Math.round(answer*100)/100;
      } catch(e) {
        return "[error]";
      }
    }
  },
  excessKurtosis : {
    title: "Excess Kurtosis",
    options: {  },
    calculation: function(data) {
      try {
		var answer = excessKurtosis();
		return Math.round(answer*100)/100;
      } catch(e) {
        return "[error]";
      }
    }
  },
  jargueBera : {
    title: "Jarque Bera",
    options: {  },
    calculation: function(data) {
      try {
		var answer = jarqueBera();
        answer = Math.round(answer*100)/100;
        if(answer <= 9.2103) {
          answer += " (more than a 1% chance of incorrectly rejecting normality)";
        }else{
		  answer += " (less than a 1% chance of incorrectly rejecting normality)";
		}
        return answer;
      } catch(e) {
        return "[error]";
      }
    }
  },
};

var calculator = {
  calculate : function() {
    $("#calculationsArea").html("");

    for(var k in calculations) {
      var link = $(document.createElement("a"));
      link.html(calculations[k].title);
      link.attr("id", calculations[k].title.replace(/ /g,"_"));
      link.attr("key", k);
      link.attr("class", "calclink");
      link.click(function() {
        var k = $(this).attr("key");
        // display dialog
        var optsDialog = $(document.createElement("div"));
        optsDialog.attr("id", "dialog_"+calculations[k].title.replace(/ /g,"_"));
        for(var opt in calculations[k].options) {
          optsDialog.append(opt.replace(/_/g," ") + ': <input type="text" id="' + opt + 'var" value="' + calculations[k].options[opt] + '"/>');
          optsDialog.append("<br/>");
        }
        
        $(document.body).append(optsDialog);
        optsDialog.dialog({
          height: 300,
          width: 350,
          modal: true,
          title: calculations[k].title,
          buttons: {
            "Save" : function() {
              for(var opt in calculations[k].options) {
                calculations[k].options[opt] = parseFloat($("#"+opt+"var").val());
              }
              calculator.calculate();
              $(this).dialog("close");
              $(this).dialog("destroy");
              $(this).remove();
            },
            Cancel : function() {
              $(this).dialog("close");
              $(this).dialog("destroy");
              $(this).remove();
            }
          },
        });
      });
      
      var options = calculations[k].options;
      var result = calculations[k].calculation(options);
      $("#calculationsArea").append('<div class="calculation">').append(link).append(" = ").append(result);
      for(var opt in options) {
        $("#calculationsArea").append("<br/>"+opt.replace(/_/g, " ") +": "+options[opt]);
      }
      $("#calculationsArea").append('</div>');
    }
  }
}

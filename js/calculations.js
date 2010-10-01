var calculations = {
  simpleMovingAverage : {
    title: "Simple Moving Average",
    options: { periods: 4 },
    calculation: function(data) {
      return simpleMovingAverage(data.periods, appdata.historicalData.length-1);
    }
  },
  exponentialMovingAverage : {
    title: "Exponential Moving Average",
    options: { periods: 50 },
    calculation: function(data) {
      return exponentialMovingAverage(data.periods);
    }
  },
  macd : {
    title: "MACD",
    options: { period1: 12, period2: 26 },
    calculation: function(data) {
      return movingAverageConvergenceDivergence(data.period1, data.period2);
    }
  },
  bollingerBands : {
    title: "Bollinger Bands",
    options: { periods: 20 },
    calculation: function(data) {
      var answer = bollingerBands(data.periods);
      return answer.join(",");
    }
  },
  relativeStrengthIndex : {
    title: "Relative Strength Index",
    options: { periods: 14 },
    calculation: function(data) {
      var answer = relativeStrengthIndex(data.periods);
      if(answer > 70) {
        answer += " (overbought)";
      } else if(answer < 30) {
        answer += " (oversold)";
      }
      return answer;
    }
  },
  sharpeRatio : {
    title: "Sharpe Ratio",
    options: { riskFreeRateOfReturnAsADecimal: 0, periods: 10 },
    calculation: function(data) {
      return sharpeRatio(data.riskFreeRateOfReturnAsADecimal, data.periods);
    }
  },
  annualizedMean : {
    title: "Annualized Mean",
    options: { periods: 10 },
    calculation: function(data) {
      return annualizedMean(data.periods);
    }
  },
  annualizedStandardDeviation : {
    title: "Annualized Standard Deviation",
    options: { periods: 10 },
    calculation: function(data) {
      return annualizedStandardDeviation(data.periods);
    }
  },
  standardDeviation : {
    title: "Standard Deviation",
    options: { periods: 10 },
    calculation: function(data) {
      return standardDeviation(data.periods);
    }
  },
  meanRateOfReturn : {
    title: "Mean Rate of Return",
    options: { periods: 10 },
    calculation: function(data) {
      return meanRateOfReturn(data.periods);
    }
  }
};

var calculator = {
  calculate : function() {
    $("#calculationsArea").html("");

    for(var k in calculations) {
      console.log("***");
      var link = $(document.createElement("a"));
      link.html(calculations[k].title);
      link.attr("id", calculations[k].title.replace(/ /g,"_"));
      link.attr("key", k);
      link.click(function() {
        var k = $(this).attr("key");
        console.log(k);
        // display dialog
        var optsDialog = $(document.createElement("div"));
        optsDialog.attr("id", "dialog_"+calculations[k].title.replace(/ /g,"_"));
        for(var opt in calculations[k].options) {
          optsDialog.append(opt + ': <input type="text" id="' + opt + 'var" value="' + calculations[k].options[opt] + '"/>');
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
                calculations[k].options[opt] = $("#"+opt+"var").val();
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
      $("#calculationsArea").append("<p>").append(link).append(" = ").append(result).append("</p>");
    }
  }
}

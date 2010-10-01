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
      link.click(function() {
        // display dialog
        var optsDialog = $(document.createElement("div"));
        optsDialog.attr("id", "dialog_"+calculations[k].title.replace(/ /g,"_"));
        for(var opt in calculations[k].options) {
          optsDialog.append(opt + ': <input type="text" id="' + opt + 'var" value="' + calculations[k].options[opt] + '"/>');
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

var vals = ["a", "b", "c"];
var testa = {
  test : function() {
    for(var v in vals) {
      link = $(document.createElement("a"));
      link.html(vals[v]);
      link.click(function() {
        alert(vals[v]);
      });
      $("#graphArea").append(link);
    }
  }
}

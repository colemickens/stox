/* TODO

 - disable dates before it
 - frequency, only let them select frequency in start date picker

 - convert to using one list to track prices (And other stuff)
 - multiple (types of) options for config boxes 


 FOR CHRIS
 - show periods in view


  Add blocking ot JSONP plugin
*/

var appdata = {
  constituents: [],
  stockPrices: [],
  spxPrices: [],
  symbol: "",
  startDate: undefined,
  getFrequency : function() {
    if( $("#frequencySelect").val() == "daily") { return 251; }
    if( $("#frequencySelect").val() == "weekly") { return 52; }
    if( $("#frequencySelect").val() == "monthly") { return 12; }
    else { return 0; }
  },
  log: true,
}
/*
var init = {
  init : function(indexSymbol) {
    blocker.block("Loading initial data from Yahoo!");
    init.loadConstituents(indexSymbol);
  },


  loadConstituents : function(indexSymbol) {
    var url = "http://uk.old.finance.yahoo.com/d/quotes.csv?s=" + indexSymbol + "&f=s&e=.csv";
    $.jsonpProxy(url, function(symbols) {
      symbols = symbols.split('\n');
      symbols = $.grep(symbols, function(value) { return value != ""; })
      for(var i=0; i<symbols.length; i++) {
        if(symbols[i].trim() != "") {
          appdata.constituents.push(symbols[i].trim());
        }
      }
      init.finish();
    });
  },

  finish : function() {
    blocker.message("Done!");
    blocker.unblock();
  }
}
*/


var utility = {
  flatten: function(data) {
    var tableData = new Array();
    for(var i=0; i<data.length; i++) {
      tableData.push(new Array(data[i].date, data[i].price));
    }
    return tableData;
  },
};

var lookuper = {
  lookup : function(symbol) {
    var url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query="+symbol+"&callback=YAHOO.Finance.SymbolSuggest.ssCallback";
    var potentials = new Array();

    $.jsonpRewrap(url, function(data) {
      for(var i=0; i<data.ResultSet.Result.length; i++) {
        var result = data.ResultSet.Result[i];
          var exchDisp = ((result.exchDisp == undefined) ? "Other" : result.exchDisp);
          var entry = {
            label: "(" + exchDisp + ": " + result.symbol + ") " + result.name,
            value: result.symbol
          }
          potentials.push(entry);
      }

      var selectedLabel = "";

      $("#symbolLookupBox").autocomplete({
        source: potentials,
        select: function(event, ui) {
          selectedLabel = ui.item.label;
          appdata.symbol = ui.item.value;
          yahoo.updatePrices();
        },
        close: function(event, ui) {
          $("#symbolLookupBox").val(selectedLabel);
        }
      });
    });
  }
}

var yahoo = {
  _blockStatus: false,
  _unblock: function() {
    if(yahoo._blockStatus == false) {
      yahoo._blockStatus = true;
    } else {
      grapher.showGraph();
      calculator.calculate();
      blocker.unblock();
    }
  },
  _block: function(symbol) {
    yahoo._blockStatus = false;
    blocker.block("Loading data for " + symbol + " and the S&P 500 from Yahoo!");
  },
  _processData: function(data) {
    var processedData = new Array();
    var rows = data.split("\n").reverse();
    
    for(var i=1; i<rows.length-1; i++) {
      var cols = rows[i].split(",");
      var entry = {
        date: new Date(cols[0]),
        price: parseFloat(cols[6]), 
      };
      processedData.push(entry);
    }

    return processedData;
  },
  updatePrices: function() {
    var symbol = appdata.symbol;
    var frequency = appdata.frequency;
    var g = $("#frequencySelect").val()[0];
    
    yahoo._block(symbol);

    var url = "http://ichart.finance.yahoo.com/table.csv?g="+g;
    if(appdata.startDate) {
      url += "&a=" + appdata.startDate.getMonth();
      url += "&b=" + appdata.startDate.getDate();
      url += "&c=" + appdata.startDate.getFullYear();
    }

    var urlStock = url + "&s=" + symbol;
    var urlSpx = url + "&s=^GSPC";

    $.jsonpProxy(urlStock, function(data) {
      appdata.stockPrices = yahoo._processData(data);
      
      // set the default start date
      if(appdata.startDate == undefined) {
        console.log(appdata.stockPrices[0].date + ": " + appdata.stockPrices[0].price);
        appdata.startDate = appdata.stockPrices[0].date;
        $("#startDatePicker").datepicker("setDate", new Date(appdata.startDate));
      }

      yahoo._unblock();
    });
    
    $.jsonpProxy(urlSpx, function(data) {
      appdata.spxPrices = yahoo._processData(data);
      yahoo._unblock();
    });
  }
}

var tabler = {
  _renderDate: function(date) {
  },
  showTable: function() {
    var tableData = utility.flatten(appdata.stockPrices);

    var table = $(document.createElement("table"))
    .attr("cellpadding","0")
    .attr("cellspacing","0")
    .attr("border","0")
    .attr("class","display")
    .attr("width", "100%")
    .attr("id","pricesTable");
    
    dialog = $(document.createElement('div'));
    dialog.attr("id", "tableDialog");
    dialog.attr("title", "Stock Prices");
    dialog.html(table);

    $("body").append(dialog);

    $("#pricesTable").dataTable( {
      "aaData": tableData,
      "aoColumns": [
        { "sTitle": "Date", "sType": "html" },
        { "sTitle": "Adjusted Closing Price" },
      ],
      "aoColumnDefs": [{
        "fnRender": function(oObj) {
          function pad(n) { return n<10 ? '0'+n : n; }
	  var date = oObj.aData[0];
          return date.getUTCFullYear() + '-' + pad(date.getUTCMonth()+1)+'-' + pad(date.getUTCDate());
	},
	"aTargets": [0],
      }],
      "bJQueryUI": true,
      "sPaginationType": "full_numbers",
      "bDestroy": true,
      "bLengthChange": false,
      "iDisplayLength": 25,
    });
    
    $("#tableDialog").dialog({
      height: 700,
      width: 900,
      modal: true,
    });
  }
}

var grapher = {
  showGraph : function() {
    $("#graphHolder").html("");
    var data = [ { color: "#1fcd1f", data: utility.flatten(appdata.stockPrices), label: "price" } ];
    var options = {
      xaxis: {
        mode: "time",
        timeformat: "%y/%m/%d",
      },
      legend: {
        show: true,
        position: "ne",
        noColumns: 1,
        margin: 10,
	backgroundOpacity: 0.5,
      }
    };

    $.plot( $("#graphHolder"), data, options );
  }
}

$(document).ready(function() {
  $(window).resize(function() {
    grapher.showGraph();
  });

  $("#symbolLookupBox").keyup(function() {
    lookuper.lookup( $("#symbolLookupBox").val() );
  }).css("width", "500px");

  $("#showTableButton").click(function() {
    console.log("showing table");
    tabler.showTable();
  });

  $("#startDatePicker").datepicker({
    changeMonth: true,
    changeYear: true,
    onSelect: function() {
      appdata.startDate = $("#startDatePicker").datepicker("getDate");
      yahoo.updatePrices();
    }
  });

  $("#frequencySelect").change(function() {
    yahoo.updatePrices();
  });
  
  $("#rateMethodSelect").change(function() {
    if($("#rateMethodSelect").val() == "logrithmic") {
      appdata.log = true;
    } else {
      appdata.log = false;
    }
    calculator.calculate();
  });
  
  $("#rateMethodSelect").val("logrithmic");
  appdata.log = true;

  $.ui.autocomplete.prototype._renderItem = function( ul, item) {
    var re = new RegExp("" + this.term, "i") ;
    var t = item.label.replace(re, "<span style='text-decoration:underline; font-weight:bold;'>" + this.term + "</span>");
    return $( "<li></li>" )
      .data( "item.autocomplete", item )
      .append( "<a>" + t + "</a>" )
      .appendTo( ul );
  };
});

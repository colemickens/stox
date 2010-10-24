/* TODO

 - pretty/basicStockPrices / stockPrices
 - fix table rendering (you know, to make it not look like shit and such
 - redraw flot on resize window
 - sizing/positioning
 - load default date (from stock)
 - disable dates before it
 - frequency, only let them select frequency in start date picker
 - underscores in option/calc names -> " "
 - show input var (periods) next to calc results

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
  basicStockPrices: [],
  prettyStockPrices: [],
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

var blocker = {
  block : function(message) {
    dialog = $(document.createElement('div'));
    dialog.attr("id", "blockerModalDialog");
    dialog.attr("title", "Loading");
    dialog.html(message);
    
    $("body").append(dialog);
    dialog.dialog({
      height: 140,
      modal: true,
      closeOnEscape: false,
      open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }
    });
  },

  message : function(msg) {
     dialog.html(msg);
  },

  unblock : function() {
    dialog.remove();
  },
}

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
          yahoo.historicalPrices();
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
    if(yahoo._blockStatus = false) {
      yahoo._blockStatus = true;
    } else {
      grapher.showGraph();
      calculator.calculate();
      blocker.unblock();
    }
  },
  _block: function() {
    yahoo._blockStatus = false;
    blocker.block("Loading data for " + symbol + " and the S&P 500 from Yahoo!");
  },
  _processData: function() {
  },
  updatePrices: function() {
    yahoo._block();
 
    var symbol = appdata.symbol;
    var frequency = appdata.frequency;
    var url = _getUrl(symbol);
    var g = $("#frequencySelect").val()[0];

    var url = "http://ichart.finance.yahoo.com/table.csv?g="+g;
    if(appdata.startDate) {
      url += "&a=" + appdata.startDate.getMonth();
      url += "&b=" + appdata.startDate.getDate();
      url += "&c=" + appdata.startDate.getFullYear();
    }

    var urlStock = _url + "&s=" + symbol;
    var urlSpx = _url + "&s=^GSPC";

    $.jsonpProxy(urlStock, function(data) {
      appdata.stockPrices = new Array();
      appdata.basicStockPrices = new Array();
      appdata.prettyStockPrices = new Array();

    });
    
    $.jsonpProxy(urlSpx, function(data) {
      appdata.
    });

      var rows = data.split("\n").reverse();
      appdata.stockPrices = new Array();
      appdata.basicStockPrices = new Array();
      appdata.prettyStockPrices = new Array();

      for(var i=1; i<rows.length-1; i++) {
        var cols = rows[i].split(",");
        var entry = {
          date: Date.parse(cols[0]),
          price: parseFloat(cols[6]), 
        };
        var basicEntry = new Array(Date.parse(cols[0]), parseFloat(cols[6]));
        var prettyEntry = new Array(cols[0], parseFloat(cols[6]));
        appdata.stockPrices.push(entry);
        appdata.basicStockPrices.push(basicEntry);
        appdata.prettyStockPrices.push(prettyEntry);
      }
      // set the default start date
      if(appdata.startDate == undefined) {
        console.log(appdata.stockPrices[0].date + ": " + appdata.stockPrices[0].price);
        appdata.startDate = appdata.stockPrices[0].date;
        $("#startDatePicker").datepicker("setDate", new Date(appdata.startDate));
      }

      yahoo._unblock();
    });
  }
}

var tabler = {
  showTable : function() {
    var table = $(document.createElement("table"))
    .attr("cellpadding","0")
    .attr("cellspacing","0")
    .attr("border","0")
    .attr("class","display")
    .attr("id","pricesTable");
    
    dialog = $(document.createElement('div'));
    dialog.attr("id", "tableDialog");
    dialog.attr("title", "Stock Prices");
    dialog.html(table);

    $("body").append(dialog);

    $("#pricesTable").dataTable( {
      "aaData": appdata.prettyStockPrices,
      "aoColumns": [
        { "sTitle": "Date" },
        { "sTitle": "Adjusted Closing Price" },
      ],
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
    var data = [ { color: "#1fcd1f", data: appdata.basicStockPrices, label: "price" } ];
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
  init.init("@^GSPC");
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
      yahoo.historicalPrices();
    }
  });

  $("#frequencySelect").change(function() {
    yahoo.historicalPrices();
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

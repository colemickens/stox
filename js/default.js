var appdata = {
  constituents: [],
  historicalData: [],
}

var blocker = {
  block : function() {
    $blockelem = $(document.createElement('div')).html("Test").css("background-color", "black").css("width", "100%").css("height", "100%").show();
    $("body").append($blockelem);
  },

  message : function(msg) {
     $blockelem.html(msg);
  },

  unblock : function() {
    $blockelem.remove();
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
      console.log(appdata.constituents);
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
    var potentials = new Array();
    var url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query="+symbol+"&callback=YAHOO.Finance.SymbolSuggest.ssCallback";
    $.jsonpRewrap(url, function(data) {
      for(var i=0; i<data.ResultSet.Result.length; i++) {
        var result = data.ResultSet.Result[i];
        if(result.exch == "NMS") {
          potentials["(" + result.exchDisp + ") (" + result.symbol + "): " + result.name] = result.symbol;
          potentials[result.symbol + ": " + result.name] = result.symbol;
          console.log(result);
        }
      }
    });
  }
}

var yahoo = {
  historicalPrices : function(symbol, frequency) {
    var g;
    if(frequency == "daily") {
      g="d";
    } else if(frequency == "weekly") {
      g="w";
    } else if(frequency == "monthly") {
      g="m";
    }

    var url = "http://ichart.finance.yahoo.com/table.csv?s="+symbol+"&g="+g;

    $.jsonpProxy(url, function(data) {
      var rows = data.split("\n");
      appdata.historicalData = new Array();
      for(var i=1; i<rows.length-1; i++) {
        var cols = rows[i].split(",");
        appdata.historicalData.push(new Array(cols[0], cols[6]));
      }
      //console.log(appdata.historicalData);
    });
  }
}

var tabler = {
  showTable : function() {
    console.log("attempting to render the table");
    var table = $(document.createElement("table"))
    .attr("cellpadding","0")
    .attr("cellspacing","0")
    .attr("border","0")
    .attr("class","display")
    .attr("id","pricesTable");

    // add to the dom
    $("#pricesTableContainer").append(table);
    console.log("added #pricesTable to #pricesTableContainer");

    $("#pricesTable").dataTable( {
      "aaData": appdata.historicalData,
      "aoColumns": [
        { "sTitle": "Date" },
        { "sTitle": "Adjusted Closing Price" },
      ],
      "bJQueryUI": true,
      "sPaginationType": "full_numbers",
    });
    
    console.log("Done constructing datatables table.");
    return "I'm so cool!";
  }
}

var grapher = {
  graph : function() {
    alert("hello grapher world");
  }
}

$(document).ready(function() {
  init.init("@^GSPC");
  var avail = [ "microsoft", "google" ];
  $("input#symbolLookupBox")
    /*.keyup(function() {
      lookuper.lookup( $("#symbolLookupBox").val() );
    })*/
    .css("width", "500px")
    .autocomplete({
      //source: potentials,
      source: ["microsoft", "google"]
    });
});

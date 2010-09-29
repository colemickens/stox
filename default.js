var appdata = {
	constituents: [],
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
    var potentials = [];
    var url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query="+symbol+"&callback=YAHOO.Finance.SymbolSuggest.ssCallback";
    $.jsonpRewrap(url, function(data) {
      for(var i=0; i<data.ResultSet.Result.length; i++) {
        var result = data.ResultSet.Result[i];
        if(result.exch == "NMS") {
          potentials.push(result);
          console.log(result);
        }
      }
      // now setup autocomplete on the text box!
    });
  }
}

var yahoo = {
  historicalPrices : function(symbol) {
    var url = "http://ichart.finance.yahoo.com/table.csv?s="+symbol+"&g=d";
    $.jsonpProxy(url, function(data) {
      console.log(data);
    });
  }
}

var grapher = {
  graph : function() {
    alert("hello grapher world");
  }
}

$(document).ready(function() {
  init.init("@^GSPC");
  $("#symbol_lookup_box").keyup(function() {
    lookuper.lookup( $("#symbol_lookup_box").val() );
  });
});

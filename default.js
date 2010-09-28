var constituents = [];

var blocker = {
  block : function() {
    $blockelem = $(document.createElement('div')).html("Test").css("background-color", "black").css("width", "100%").css("height", "100%").show();
    $("body").append($blockelem);
  },

  unblock : function() {
    $blockelem.remove();
  },
}

var init = {
  init : function(indexSymbol) {
    blocker.block();
    init.loadConstituents(indexSymbol);
  },

  loadConstituents : function(indexSymbol) {
    var url = "http://uk.old.finance.yahoo.com/d/quotes.csv?s=" + indexSymbol + "&f=s&e=.csv";
    $.jsonp(url, function(symbols) {
      var symbolsArray = symbols.split('\n');
      init.loadConstituentNames(symbolsArray);
    });
  },

  /*
    setup a batching and recrusive thingy-majig here.
  */
  loadConstituentNames : function(symbols) {
    var symbolsArr = [];
    for(var s in symbols) {
      symbolsArr.push("\"" + symbols[s].trim() + "\"");
    }

    var query = "select symbol, CompanyName from yahoo.finance.stocks where symbol in (" + symbolsArr.join(",") + ")";

    $.yql(query, {}, function(data) {
      console.log(data);
      // persist to global `constituents`
      init.finish();
    });
  },

  finish : function() {
    blocker.unblock();
  }
}

var grapher = {
  graph : function() {
    alert("hello grapher world");
  }
}

$(document).ready(function() {
  init.init("@^GSPC");
});

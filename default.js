function getConstituents(symbol) {
   var url = "http://uk.old.finance.yahoo.com/d/quotes.csv?s=" + symbol + "&f=s&e=.csv";
   var constituents;

   $.jsonp(url, function(data) {
      constituents = data;
   });

   return constituents;
}

function getConstituentName(symbol) {
  var query = "select CompanyName from yahoo.finance.stocks where symbol = " + symbol;
  var rdata;
  $.yql(query, { username: "cmickens", repository: "jquery-yql" }, function(data) {
    rdata = data;
  });

  return rdata;
}

$(document).ready(function() {
  //var constituentSymbols = getConstituents("@^GSPC");
  //console.log(constituentSymbols);
  console.log(getConstituentName("MSFT"));
});

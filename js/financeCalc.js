// UTILITY
function average(input) {
  var sum = 0;
  for(var i=0; i<input.length; i++) {
    sum += input[i];
  }
  return sum/input.length;
}

// CALCULATION: ? TEST
function meanRateOfReturn(dataSet){
  return average(getRateOfReturns(dataSet));
}

// UTILITY
function getRateOfReturns(dataSet) {
  var current = dataSet.length-1;
  var arrayOfRateOfReturns = [];
  var rorMethod = (appdata.log ? logRoR : simpleRoR);
  for(var i=current, j=0; i>0; i--, j++) {
    var Vf = dataSet[i].price;
    var Vi = dataSet[i-1].price;
    arrayOfRateOfReturns[j] = rorMethod(Vf, Vi);
  }
  return arrayOfRateOfReturns;
}

// UTILITY
function simpleRoR(Vf, Vi){
  var RoR = (Vf-Vi)/Vi;
  return RoR;
}

// UTILITY	
function logRoR(Vf, Vi){
  var RoR = Math.log(Vf/Vi);
  return RoR;
}

// UTILITY
function priceAdapter(pricedDataSet) {
  var fixedDataSet = new Array();
  for(var i in pricedDataSet) {
    fixedDataSet.push(pricedDataSet[i].price);
  }
  return fixedDataSet;
}

// CALCULATION & UTILITY
function genericStandardDeviation(dataSet) {
  var mean = average(dataSet);
  var deviants = 0;
  for(var i=0; i<dataSet.length; i++) {
    deviants += Math.pow((dataSet[i]-mean), 2);
  }
  var standardDev = Math.sqrt(deviants/dataSet.length);
  return standardDev;
}

function annualizedMean(){
  var frequency = appdata.getFrequency();
  var annualMean = meanRateOfReturn(appdata.stockPrices)*frequency;
  return annualMean;
}
	
function annualizedStandardDeviation(){
  var frequency = appdata.getFrequency();
  // var annualSTDV = standardDeviationRoR()*Math.sqrt(frequency);
  var annualSTDV = genericStandardDeviation(getRateOfReturns(appdata.stockPrices)) * Math.sqrt(frequency);
  return annualSTDV;
}
	
function sharpeRatio(riskFreeRate){
  var R = annualizedMean();
  var sigma = annualizedStandardDeviation();
  var sharpe = (R-riskFreeRate)/sigma;
  return sharpe;
}
	
function relativeStrengthIndex(periods){
  //RSI > 70 is overbought, RSI < 30 is oversold
  //default of 14 periods
  var current = appdata.stockPrices.length-1;
  var InitialGain = 0;
  var InitialLoss = 0;
  
  for(var i = periods; i>0; i--){
    var change = appdata.stockPrices[i].price - appdata.stockPrices[i-1].price;
    if(change >= 0){
      InitialGain += change;
    } else {
      InitialLoss += Math.abs(change);
    }
  }

  var AverageGain = InitialGain/periods;
  var AverageLoss = InitialLoss/periods;
  for(var i = periods+1; i<=current; i++){
    var currentGain = 0;
    var currentLoss = 0;
    
    var change = appdata.stockPrices[i].price - appdata.stockPrices[i-1].price;
    if(change >= 0){
      currentGain += change;
    } else {
      currentLoss += Math.abs(change);
    }
    
    AverageGain = ((AverageGain*(periods-1))+currentGain)/periods;
    AverageLoss = ((AverageLoss*(periods-1))+currentLoss)/periods;
  }
  
  var RS = AverageGain/AverageLoss;
  var RSI = 100 - (100/(1+RS));
  return RSI;
}

function simpleMovingAverage(periods, startPoint) {
  // replace with slice and then average....
  var sum = 0;
  for(var i = startPoint; (i>startPoint-periods && i>=0); i--){
    sum += appdata.stockPrices[i].price;
  }
  var SMA = sum/periods;
  return SMA;
}
	
function exponentialMovingAverage(periods){
  var current = appdata.stockPrices.length-1;
  var ema = simpleMovingAverage(periods, current-periods);
  var multiplier = 2/(periods+1);
  for(var i = current-periods; i<=current; i++){
    ema += ((appdata.stockPrices[i].price-ema)*multiplier);
  }
  return ema;
}

function movingAverageConvergenceDivergence(periods1, periods2, periods3){
  var MACD = exponentialMovingAverage(periods1)-exponentialMovingAverage(periods2);
  var signalLine = exponentialMovingAverage(periods3);
  var MACDHistogram = MACD - signalLine;

  var results = [];
  results[0] = MACD;
  results[1] = signalLine;
  results[2] = MACDHistogram;
  return results;
}

function bollingerBands(periods){
  var current = appdata.stockPrices.length-1;
  var middleBand = simpleMovingAverage(periods, current);
  var startOfSlice = appdata.stockPrices.length-periods;
  var truncatedStockPrices = appdata.stockPrices.slice(startOfSlice);
  var deviation = genericStandardDeviation(priceAdapter(truncatedStockPrices));
  var upperBand = middleBand + (deviation * 2);
  var lowerBand = middleBand - (deviation * 2);
  
  var bands = [];
  bands[0] = lowerBand;
  bands[1] = middleBand;
  bands[2] = upperBand;
  return bands;
}

// CALCULATION
function autocorrelationValue(dataSet) {
  var x = getRateOfReturns(dataSet);
  var xbar = average(x);
  var N = x.length;
  var m = 1;

  var autocovariance = 0;
  for(var i=0; i<(N-m); i++) {
    autocovariance += ((x[i] - xbar)*(x[i+m]-xbar))
  }
  autocovariance /= N;
  
  var varianceValue = variance(x);
  
  var autocorrelation = autocovariance/varianceValue;
  return autocorrelation;
}

// CALCULATION
function correlationValue() {
  var stockRateOfReturns = getRateOfReturns(appdata.stockPrices);
  var spxRateOfReturns = getRateOfReturns(appdata.spxPrices);
  var N = stockRateOfReturns.length;
  var xbar = average(stockRateOfReturns);
  var ybar = average(spxRateOfReturns);
  var periods = stockRateOfReturns.length;
  var Sx = genericStandardDeviation(stockRateOfReturns);
  var Sy = genericStandardDeviation(spxRateOfReturns);
  var correlation = 0;
  for(var i=0; i<N; i++) {
    correlation += (stockRateOfReturns[i]-xbar)*(spxRateOfReturns[i]-ybar);
  }
  correlation /= (N*Sx*Sy);
  return correlation;
}

// CALCULATION
// the std dev's may need to be of RoRs instead of prices
function beta() {
  var correlation = correlationValue();
  var stockRateOfReturns = getRateOfReturns(appdata.stockPrices);
  var spxRateOfReturns = getRateOfReturns(appdata.spxPrices);
  
  var periods = stockRateOfReturns.length;
  var Sx = genericStandardDeviation(stockRateOfReturns);
  var Sy = genericStandardDeviation(spxRateOfReturns);
  
  var beta = correlation * (Sx/Sy);
  return beta;
}


// UTILITY
function covariance(x, y) {
  var N = x.length;

  var xbar = average(x);
  var ybar = average(y);

  var xybar = 0;
  for(var i=0; i<N-1; i++) {
    xybar += (x[i] * y[i]);
  }
  xybar /= N;

  var covariance = xybar - (xbar * ybar);
  return covariance;
}

// UTILITY
function variance(values) {
  var variance = 0;
  var xbar = average(values);
  var x = values;
  for(var i=0; i<values.length; i++) {
    variance += Math.pow((x[i] - xbar), 2);
  }
  variance /= values.length;
  return variance;
}

function expectedCostOfEquity(riskFreeRate) {
  var betaVal = beta();
  var rateOfReturnOfStock = meanRateOfReturn(appdata.stockPrices);
  var expectedCostOfEquity = riskFreeRate + betaVal*(rateOfReturnOfStock-riskFreeRate);
  expectedCostOfEquity *= appdata.getFrequency();
  return expectedCostOfEquity;
}
	
function skew(){
  var rateOfReturns = getRateOfReturns(appdata.spxPrices);
  var meanRoR = average(rateOfReturns);
  var deviants = 0;
  var cubeddeviants = 0;
  
  for(var i=0; i<rateOfReturns.length; i++){
    deviants += Math.pow((rateOfReturns[i]-meanRoR), 2);
    cubeddeviants += Math.pow((rateOfReturns[i]-meanRoR), 3);
  }
		
  deviants /= rateOfReturns.length;
  cubeddeviants /= rateOfReturns.length;
		
  var skew = cubeddeviants/Math.pow(deviants, 3/2);
  return skew;
}

function excessKurtosis(){
  var rateOfReturns = getRateOfReturns(appdata.stockPrices);
  var meanRoR = average(rateOfReturns);
  var deviants = 0;
  var fourthdeviants = 0;
		
  for(var i=0; i<rateOfReturns.length; i++){
    deviants += Math.pow((rateOfReturns[i]-meanRoR), 2);
    fourthdeviants += Math.pow((rateOfReturns[i]-meanRoR), 4);
  }
		
  deviants /= rateOfReturns.length;
  fourthdeviants /= rateOfReturns.length;
		
  var kurtosis = (fourthdeviants/Math.pow(deviants, 2))-3;
  return kurtosis;
}

function jarqueBera(){
  var n = 2;
  var JB = (n/6)*(Math.pow(skew(), 2) + (.25*Math.pow(excessKurtosis(), 2)));
  return JB;
}

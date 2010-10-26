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
  if(dataSet == undefined) {
    console.log("error!!!");
  }
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

// CALCULATION/UTILITY : ? CHECK
function standardDeviation(periods, dataSet) { // <-- use
  if(dataSet == undefined) {
    dataSet = appdata.stockPrices;
  }
  var current = dataSet.length-1;
  var sum = 0;
  for(var i = current; i>current-periods; i--){
    sum += dataSet[i].price;
  }
  var mean = sum/periods;
  var deviants = 0;
  for(var i = current; i>current-periods; i--){
    deviants += Math.pow((dataSet[i].price-mean), 2);
  }
  var standardDev = Math.sqrt(deviants/periods);
  return standardDev;
}
	function standardDeviationRoR(){
		var current = appdata.stockPrices.length-1;
		var sum = 0;
		var rorMethod = (appdata.log ? logRoR : simpleRoR); 
//		if(appdata.log){
			for(var i = current; i>0; i--){
				sum += logRoR(appdata.stockPrices[i].price, appdata.stockPrices[i-1].price);
			}
			var mean = sum/appdata.stockPrices.length;
			var deviants = 0;
			for(var i = current; i>0; i--){
				deviants += Math.pow((rorMethod(appdata.stockPrices[i].price, appdata.stockPrices[i-1].price)-mean), 2);
//				deviants += Math.pow((simpleRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price)-mean), 2);
			}
			var standardDev = Math.sqrt(deviants/appdata.stockPrices.length);
//		}else{
//			for(var i = current; i>0; i--){
//				sum += simpleRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price);
//			}
//			var mean = sum/appdata.historicalData.length;
//			var deviants = 0;
//			for(var i = current; i>0; i--){
//				deviants += Math.pow((simpleRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price)-mean), 2);
//			}
//			var standardDev = Math.sqrt(deviants/appdata.historicalData.length);
//		}
		return standardDev;
	}
	
	
	function annualizedMean(){
		var frequency = appdata.getFrequency();
		var annualMean = meanRateOfReturn(appdata.stockPrices)*frequency;
		return annualMean;
	}
	
	
	function annualizedStandardDeviation(){
		var frequency = appdata.getFrequency();
		var annualSTDV = standardDeviationRoR()*Math.sqrt(frequency);
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
			}else{
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
				}else{
					currentLoss += Math.abs(change);
				}
			
			AverageGain = ((AverageGain*(periods-1))+currentGain)/periods;
			AverageLoss = ((AverageLoss*(periods-1))+currentLoss)/periods;

		}
		var RS = AverageGain/AverageLoss;
		var RSI = 100 - (100/(1+RS));
		return RSI;
	}

	function simpleMovingAverage(periods, historic){
		var sum = 0;
		var current = appdata.stockPrices.length-1;
		if(historic != current){
			current = historic;
		}
		for(var i = current; i>current-periods; i--){
			sum += appdata.stockPrices[i].price;
			
		}
		var SMA = sum/periods;
		return SMA;
	}
	
	function exponentialMovingAverage(periods){
		var current = appdata.stockPrices.length-1;
		var EMAprevious = simpleMovingAverage(periods, current-periods);
		var multiplier = 2/(periods+1);
		for(var i = current-periods; i<=current; i++){
			EMAprevious = ((appdata.stockPrices[i].price-EMAprevious)*multiplier)+EMAprevious;
		}
		var EMA = EMAprevious;
		return EMA;
	}

	function movingAverageConvergenceDivergence(periods1, periods2, periods3){
		//default to 12 day and 26 day
		//periods1 < periods2
		//histogram is different than this calculation
		//period3 default to 9
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
		//default to 20
		var current = appdata.stockPrices.length-1;
		var middleBand = simpleMovingAverage(periods, current);
		var upperBand = middleBand + (standardDeviation(periods)*2);
		var lowerBand = middleBand - (standardDeviation(periods)*2);
		
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

// UTILITY - DISGUSTING HACK
function adapter(input) {
  var retVal = new Array();
  for(var i=0; i<input.length; i++) {
    var entry = { price: input[i] };
    retVal.push(entry);
  }
  return retVal;
}

function rAdapter(input) {
  var retVal = new Array();
  for(var i=0; i<input.length; i++) {
    retVal.push(input[i].price);
  }
  return retVal;
}

// CALCULATION
function correlationValue() {
  var stockRateOfReturns = getRateOfReturns(appdata.stockPrices);
  var spxRateOfReturns = getRateOfReturns(appdata.spxPrices);
  var N = stockRateOfReturns.length;
  var xbar = average(stockRateOfReturns);
  var ybar = average(spxRateOfReturns);
  // var periods = 1; // ??????
  var periods = stockRateOfReturns.length;
  var Sx = standardDeviation(periods, adapter(stockRateOfReturns));
  var Sy = standardDeviation(periods, adapter(spxRateOfReturns));
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
  var Sx = standardDeviation(periods-1, adapter(stockRateOfReturns));
  var Sy = standardDeviation(periods-1, adapter(spxRateOfReturns));
  
  //var stdDevStock = standardDeviation(stockRateOfReturns.length-1, stockRateOfReturns);
  //var stdDevSpx = standardDeviation(spxRateOfReturns.length-1, spxRateOfReturns);

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
  // whatever fun hell this is going to be
  var expectedCostOfEquity = 0;
  var beta = keckBeta();
  var rateOfReturnOfStock = meanRateOfReturn(appdata.stockPrices);
  expectedCostOfEquity = riskFreeRate + beta*(rateOfReturnOfStock-riskFreeRate);
  return expectedCostOfEquity;
}
	
	function skew(){
	    var rateOfReturns = getRateOfReturns(appdata.stockPrices);
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
		var n = 2; //degree of freedom
		var JB = (n/6)*(Math.pow(skew(), 2) + (.25*Math.pow(excessKurtosis(), 2)));
		return JB;
	}

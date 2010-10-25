// UTILITY
function average(input) {
  var sum = 0;
  for(var i=0; i<input.length; i++) {
    sum += input[i];
  }
  return sum/i;
}

// DEPRECATED
function meanRateOfReturn() {
  console.log("Deprecated");
  return meanRateOfReturn(appdata.stockPrices);
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
  var rateOfReturns = getRateOfReturns(dataSet);
  var N = rateOfReturns.length;
  var m = 1;
  var xbar = average(rateOfReturns);
  var autocovariance = 0;
  for(var i=0; i<(N-m); i++) {
    autocovariance += ((rateOfReturns[i] - xbar)*(rateOfReturns[i+m]-xbar))
  }
  autocovariance /= N;
  
  var variance = variance(rateOfReturns);

  
  var autocorrelation = autocovariance/variance;
  return autocorrelation;
}

// UTILITY - DISGUSTING HACK
function adapter(input) {
  var retVal;
  for(var i=0; i<input.length; i++) {
    retVal[i].price = input[i];
  }
  return retVal;
}

// CALCULATION
function correlationValue() {
  var stockRateOfReturns = getRateOfReturns(appdata.historicalPrices);
  var spxRateOfReturns = getRateOfReturns(appdata.spxPrices);
  var N = stockRateOfReturns.length - 1;
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
function keckBeta() {
  var correlation = correlationValue();
  var stdDevStock = standardDeviation(appdata.stockPrices, appdata.stockPrices.length);
  var stdDevSpx = standardDeviation(appdata.spxPrices, appdata.spxPrices.length);

  var beta = correlation * (stdDevStock/stdDevSpx);
  return beta;
}

// CALCULATION
function internetBeta() {
  var numerator = covariance(appdata.stockPrices, appdata.spxPrices);
  var denominator = variance(appdata.spxPrices);

  var beta = numerator/denominator;
  return beta;
}

// UTILITY
function covariance(x, y) {
  var N = x.length;

  var xbar = average(x);
  var ybar = average(y);

  var xybar;
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
  for(var i=0; i<values.length; i++) {
    variance += Math.pow((rateOfReturns[i] - xbar), 2);
  }
  variance /= values.length;
  return variance;
}
	
	function skew(){
		var current = appdata.stockPrices.length-1;
		var sum = 0;
		for(var i = current; i>=0; i--){
			sum += appdata.stockPrices[i].price;
		}
		var mean = sum/appdata.stockPrices.length;
		var deviants = 0;
		var cubeddeviants = 0;
		for(var i = current; i>=0; i--){
			deviants += Math.pow((appdata.stockPrices[i].price-mean), 2);
			cubeddeviants += Math.pow((appdata.stockPrices[i].price-mean), 3);
		}
		var standardDev = Math.sqrt(deviants/appdata.stockPrices.length);
		var skew = (cubeddeviants/appdata.stockPrices.length)/((appdata.stockPrices.length-1)*Math.pow(standardDev, 3));
		return skew;
	}
	
	function excessKurtosis(){
		var current = appdata.stockPrices.length-1;
		var sum = 0;
		for(var i = current; i>=0; i--){
			sum += appdata.stockPrices[i].price;
		}
		var mean = sum/appdata.stockPrices.length;
		var fourthdeviants = 0;
		var deviants = 0;
		for(var i =0; i<current; i++){
			fourthdeviants += Math.pow((appdata.stockPrices[i].price-mean), 4);
			deviants += Math.pow((appdata.stockPrices[i].price-mean), 2);
		}
		
		var meanDevSquared = Math.pow((deviants/appdata.stockPrices.length), 2);
		var kurtosis = (fourthdeviants/meanDevSquared)-3;
		return kurtosis;
		
	}


	//CORRECT
	function meanRateOfReturn(){
		var current = appdata.historicalData.length-1;
		var meanRoR = 0;
		if (appdata.log){
			for(var i = current; i>0; i--){
				var Vf = appdata.historicalData[i].price;
				var Vi = appdata.historicalData[i-1].price;
				meanRoR+=logRoR(Vf, Vi);
			}
		}else{
			for(var i = current; i>0; i--){
				var Vf = appdata.historicalData[i].price;
				var Vi = appdata.historicalData[i-1].price;
				meanRoR+=simpleRoR(Vf, Vi);
			}
		}
		meanRoR = (1/appdata.historicalData.length)*meanRoR;
		return meanRoR;
	}
	
	function simpleRoR(Vf, Vi){
		var RoR = (Vf-Vi)/Vi;
		return RoR;
	}
	
	function logRoR(Vf, Vi){
		var RoR = Math.log(Vf/Vi);
		return RoR;
	}

	//CORRECT
	function standardDeviation(periods){
		var current = appdata.historicalData.length-1;
		var sum = 0;
		for(var i = current; i>current-periods; i--){
			sum += appdata.historicalData[i].price;
		}
		var mean = sum/periods;
		var deviants = 0;
		for(var i = current; i>current-periods; i--){
			deviants += Math.pow((appdata.historicalData[i].price-mean), 2);
		}
		var standardDev = Math.sqrt(deviants/periods);
		return standardDev;
	}
	
	function standardDeviationRoR(){
		var current = appdata.historicalData.length-1;
		var sum = 0;
		if(appdata.log){
			for(var i = current; i>0; i--){
				sum += logRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price);
			}
			var mean = sum/appdata.historicalData.length;
			var deviants = 0;
			for(var i = current; i>0; i--){
				deviants += Math.pow((logRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price)-mean), 2);
			}
			var standardDev = Math.sqrt(deviants/appdata.historicalData.length);
		}else{
			for(var i = current; i>0; i--){
				sum += simpleRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price);
			}
			var mean = sum/appdata.historicalData.length;
			var deviants = 0;
			for(var i = current; i>0; i--){
				deviants += Math.pow((simpleRoR(appdata.historicalData[i].price, appdata.historicalData[i-1].price)-mean), 2);
			}
			var standardDev = Math.sqrt(deviants/appdata.historicalData.length);
		}
		return standardDev;
	}
	
	
	function annualizedMean(){
		var frequency = appdata.getFrequency();
		var annualMean = meanRateOfReturn()*frequency;
		return annualMean;
	}
	
	
	function annualizedStandardDeviation(){
		var frequency = appdata.getFrequency();
		var annualSTDV = standardDeviationRoR()*Math.sqrt(frequency);
		return annualSTDV;
	}
	
	//CORRECT
	function sharpeRatio(riskFreeRate, periods){
		var R = meanRateOfReturn(periods, appdata.historicalData.length-1);
		var sigma = standardDeviationRoR(periods);
		var sharpe = (R-riskFreeRate)/sigma;
		return sharpe;
	}
	
	//CORRECT
	function relativeStrengthIndex(periods){
	//RSI > 70 is overbought, RSI < 30 is oversold
	//default of 14 periods
	
		var current = appdata.historicalData.length-1;
		var InitialGain = 0;
		var InitialLoss = 0;
		
		for(var i = periods; i>0; i--){
			var change = appdata.historicalData[i].price - appdata.historicalData[i-1].price;
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
		
				var change = appdata.historicalData[i].price - appdata.historicalData[i-1].price;
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

	//CORRECT
	function simpleMovingAverage(periods, historic){
		var sum = 0;
		var current = appdata.historicalData.length-1;
		if(historic != current){
			current = historic;
		}
		for(var i = current; i>current-periods; i--){
			sum += appdata.historicalData[i].price;
			
		}
		var SMA = sum/periods;
		return SMA;
	}
	
	//CORRECT
	function exponentialMovingAverage(periods){
		var current = appdata.historicalData.length-1;
		var EMAprevious = simpleMovingAverage(periods, current-periods);
		var multiplier = 2/(periods+1);
		for(var i = current-periods; i<=current; i++){
			EMAprevious = ((appdata.historicalData[i].price-EMAprevious)*multiplier)+EMAprevious;
		}
		var EMA = EMAprevious;
		return EMA;
	}

	//CORRECT
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
	
	//CORRECT
	function bollingerBands(periods){
		//default to 20
		var current = appdata.historicalData.length-1;
		var middleBand = simpleMovingAverage(periods, current);
		var upperBand = middleBand + (standardDeviation(periods)*2);
		var lowerBand = middleBand - (standardDeviation(periods)*2);
		
		var bands = [];
		bands[0] = lowerBand;
		bands[1] = middleBand;
		bands[2] = upperBand;
		
		return bands;
	}

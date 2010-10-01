
	//CORRECT
	function meanRateOfReturn(periods){
		var current = appdata.historicalData.length-1;
		var Vf = appdata.historicalData[current].price;
		var meanRoR = 0;
		for(var i = current; i>current-periods; i--){
			var Vi = appdata.historicalData[i].price;
			meanRoR+=Math.log(Vf/Vi);
		}
		meanRoR = (1/periods)*meanRoR;
		return meanRoR;
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
	
	
	function annualizedMean(periods){
		var frequency = appdata.getFrequency;
		var current = appdata.historicalData.length-1;
		
		var product = 1;
		var periodNumber = periods;
		var Vf = appdata.historicalData[current].price;
		for(var i = current; i>current-periods; i--){
			var Vi = appdata.historicalData[i].price;
			product *= Math.pow((1 + (Vf/Vi)), periodNumber);
			periodNumber--;
			
		}
		var annualMean = Math.pow(product, (1/periods))-1;
		return annualMean;
	}
	
	//CORRECT
	function annualizedStandardDeviation(periods){
		var frequency = appdata.getFrequency;
		var annualSTDV = standardDeviation(periods)*Math.sqrt(frequency/periods);
		return annualSTDV;
	}
	
	//CORRECT
	function sharpeRatio(riskFreeRate, periods){
		var R = meanRateOfReturn(periods);
		var sigma = standardDeviation(periods);
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
	
	//CORRECT w/ some ERROR
	function exponentialMovingAverage(periods){
		var current = appdata.historicalData.length-1;
		var EMAprevious = simpleMovingAverage(periods, current-periods);
		var multiplier = 2/(periods+1);
		for(var i = current-periods; i<current; i++){
			EMAprevious = ((appdata.historicalData[i].price-EMAprevious)*multiplier)+EMAprevious;
		}
		var EMA = EMAprevious;
		return EMA;	
	}

	//CORRECT - SAVE FOR MINOR ERROR PROPAGATED THROUGH EMA
	function movingAverageConvergenceDiveregence(periods1, periods2){
		//default to 12 day and 26 day
		//periods1 < periods2
		//histogram is different than this calculation
		var MACD = exponentialMovingAverage(periods1)-exponentialMovingAverage(periods2);
		return MACD;
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
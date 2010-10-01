
	//will probably need to convert period information to a time & date value for reference
	function meanRateOfReturn(periods){
		var current = appdata.historicalData.length-1;
		var Vf = appdata.historicalData[current].price;
		var meanRoR;
		for(var i = current; i>current-periods; i--){
			var Vi = appdata.historicalData[i].price;
			meanRoR+=Math.log(Vf/Vi);
		}
		meanRoR = (1/periods)*meanRoR;
		return meanRoR;
	}

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
		var current = appdata.historicalData.length-1;
		var product = 1;
		var sumPeriods = 0;
		var Vf = appdata.historicalData[current].price;
		for(var i = current; i>current-periods; i--){
			var Vi = appdata.historicalData[i].price;
			product *= Math.pow((1 + (Vf/Vi)), i);
			sumPeriods += i;
		}
		var annualMean = Math.pow(product, (1/sumPeriods))-1;
		return annualMean;
	}
	
	function annualizedStandardDeviation(periods){
	//annualized means by year and thus months value in equation, idk how it fits with periodic stdv
		var annualSTDV = standardDeviation(periods)*Math.sqrt(12/months);
		return annualSTDV;
	}
	
	function sharpeRatio(riskFreeRate){
		var R = meanRateOfReturn(periods);
		var sigma = standardDeviation(periods);
		var sharpe = (R-riskFreeRate)/sigma;
		return sharpe;
	}
	
	function relativeStrengthIndex(periods){
	//again, timing and period info is suspect to formatting issues
	//also, stockcharts mentions that doing continuous calculations of this is slightly different
	//also, also, RSI > 70 is overbought, RSI < 30 is oversold
	//default of 14 periods
		var current = appdata.historicalData.length-1;
		var AverageGain = 0;
		var AverageLoss = 0;
		
		for(var i = current-periods; i<current; i++){
			var change = appdata.historicalData[i].price-appdata.historicalData[i-1].price;
			if(change >= 0){
				AverageGain += change;
			}else{
				AverageLoss += change;
			}
		}
		var RS = AverageGain/AverageLoss
		var RSI = 100-(100/1+RS);
		return RSI;
	}

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
	
	function exponentialMovingAverage(periods){
		var current = appdata.historicData.length-1;
		var EMAprevious = simpleMovingAverage(periods, current-periods-1);
		console.log(EMAprevious);
		var multiplier = 2/(periods+1);
		for(var i = current-periods; i<current; i++){
			EMAprevious = ((appdata.historicalData[i].price-EMAprevious)*multiplier)+EMAprevious;
		}
		var EMA = EMAprevious;
		return EMA;	
	}

	function movingAverageConvergenceDiveregence(periods1, periods2){
		//default to 12 day and 26 day
		//periods1 < periods2
		//histogram is different than this calculation
		var MACD = exponentialMovingAverage(periods1)-exponentialMovingAverage(periods2);
		return MACD;
	}
	
	function bollingerBands(periods){
		//default to 20
		var middleBand = simpleMovingAverage(periods);
		var upperBand = middleBand + (standardDeviation(periods)*2);
		var lowerBand = middleBand - (standardDeviation(periods)*2);
		
		var bands = [];
		bands[0] = lowerBand;
		bands[1] = middleBand;
		bands[2] = upperBand;
		
		return bands;
	}
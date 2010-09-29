
	//will probably need to convert period information to a time & date value for reference
	function meanRateOfReturn(periods){
		var Vi = getInitialInvestment();
		var meanRoR;
		for(var i=1; i<=periods; i++){
			var Vf = getFinalInvestment(currentPeriod);
			meanRoR+=Math.log(Vf/Vi);
		}
		meanRoR = (1/periods)*meanRoR;
		return meanRoR;
	}

	function relativeStrengthIndex(periods){
	//again, timing and period info is suspect to formatting issues
	//also, stockcharts mentions that doing continuous calculations of this is slightly different
	//also, also, RSI > 70 is overbought, RSI < 30 is oversold
	//default of 14 periods
		var current = today;
		var AverageGain = 0;
		var AverageLoss = 0;
		
		for(var i = current-periods; i<=current; i++){
			var change = getPrice(stock, i)-getPrice(stock, i-1);
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

	function simpleMovingAverage(periods){
		var sum = 0;
		for(var i = current; i>=current-periods; i--){
			sum += getPrice(stock, i);
		}
		var SMA = sum/periods;
		return SMA;
	}
	
	function exponentialMovingAverage(periods){
		var EMAprevious = simpleMovingAverage(current-periods-1, periods);
		var multiplier = 2/(periods+1);
		for(var i = current-periods; i<=current; i++){
			EMAprevious = ((getPrice(stock, i)-EMAprevious)*multiplier)+EMAprevious;
		}
		var EMA = EMAprevious;
		return EMA;	
	}

	function movingAverageConvergenceDiveregence(periods1, periods2){
		//default to 12 day and 26 day
		//periods1 < periods2
		//histogram is different than this calculation
		var MACD = exponentialMovingAverage(current, periods1)-exponentialMovingAverage(current, periods2);
		return MACD;
	}
	
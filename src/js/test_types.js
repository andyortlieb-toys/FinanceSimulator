// Make some accounts
0;
(function(globals){
	"use strict";

	function yesno(prob){
		var prob = prob || (prob===0?0:1);
		var reach = Math.abs(prob)+1;
		var val = Math.floor((Math.random() * reach) + 1)-1;
		if (prob < 0){ return val==0; }
		return !!val;
	}

	function rndVal(low, high, precision){
		return parseFloat((Math.random() * (high - low) + low).toFixed(precision))
	}

	function makeFred(date){
		date = date || new Date();
		return new _fisim.types.Person({
			accounts: [
				// Revenue
				new _fisim.types.accounts.Revenue({name: "employer", date:date}),

				// Assets
				new _fisim.types.accounts.Asset({name:"checking", startingBalance:200, date:date}),
				new _fisim.types.accounts.Asset({name:"savings", startingBalance:1026.32, apr:0.2, date:date}),
				new _fisim.types.accounts.Asset({name:"cd", startingBalance:2026.32, apr:2.1, date:date}),

				// Retirement
				new _fisim.types.accounts.Asset({name:"401k", startingBalance:6215.59, date:date}),

				// Liabilities
				new _fisim.types.accounts.CreditCard({name:"citi", startingBalance:62.32, apr:20.1, date:date}),
				new _fisim.types.accounts.CreditCard({name:"discover", startingBalance:25.12, apr:18.9, date:date}),
				new _fisim.types.accounts.Liability({name:"auto", startingBalance:8115.32, apr:3.2, date:date}),
				new _fisim.types.accounts.Liability({name:"mortgage", startingBalance:103014.81, apr:3.9, date:date}),

				// Durable Assets
				new _fisim.types.accounts.Asset({name:"vehicle", startingBalance:7000.00, apr:3.2, date:date}),
				new _fisim.types.accounts.Asset({name:"home", startingBalance:110000.00, apr:3.2, date:date}),

				// Expenses
				new _fisim.types.accounts.Expense({name: "Utilities", date:date}),
				new _fisim.types.accounts.Expense({name: "Maintenance", date:date}),
				new _fisim.types.accounts.Expense({name: "Entertainment", date:date})
			]
		});
	}

	function figureItOut(){

		var fred = makeFred();

		// console.log("Intitial worth", fred.worth())

		fred.findAccount('discover').give(200)
		// console.log("Worth after paying 200 to discover", fred.worth())
		
		fred.findAccount('citi').take(300)
		// console.log("Worth after taking 300 from citi", fred.worth())

		fred.findAccount("CD Account").give(500)
		// console.log("Worth after depositing 500 to CD", fred.worth())

		fred.findAccount("Checking Account").take(83.50)
		// console.log("Worth after withdrawing 84.50 from the checking account", fred.worth())


		// Test out some transaction stuff
		var citi = fred.findAccount("citi");

		// console.log("Before exception", fred.worth());
		var before = fred.worth();
		assertException( _fisim.types.exc.Exception, function(){
			var yesterday = new Date()
			yesterday.setDate(yesterday.getDate()-1)
			citi.take(83.50, yesterday)
		});
		var after = fred.worth();
		// console.log("After exception", fred.worth());
		assert(before == after);

		var day0 = new Date();
		day0.setDate(day0.getDate()-1);

		var day1_0 = new Date();
		day1_0.setSeconds(day1_0.getSeconds()-5)

		var day1_1 = new Date();
		day1_1.setSeconds(day1_1.getSeconds()+1)

		// Advance a day
		var day2 = new Date();
		day2.setDate(day2.getDate()+1);
		var day2balanceprop = citi.balance;
		var day2balancemeth = citi.calcBalance();
		var day2balancemethdate = citi.calcBalance(day2);

		// console.log("Starting balance on day2", day2balanceprop, day2balancemeth, day2balancemethdate);
		assertEq(day2balanceprop, day2balancemeth, day2balancemethdate);

		// Make a transaction
		var day2_2 = new Date(day2);
		day2_2.setHours(day2_2.getHours()+2)
		citi.take(30, day2_2);

		// Advance another day
		var day3 = new Date();
		day3.setDate(day3.getDate()+2);
		var day3balanceprop = citi.balance;
		var day3balancemeth = citi.calcBalance();
		var day3balancemethdate = citi.calcBalance(day3);

		console.log("Starting balance on day3", day3balanceprop, day3balancemeth, day3balancemethdate);
		assertEq(day3balanceprop, day3balancemeth, day3balancemethdate);

		assert(day2balanceprop < day3balanceprop);
		assertEq(day3balanceprop, day2balanceprop+30);

	    // Pay the balance off
		var day3_2 = new Date(day3);
		day3_2.setHours(day3_2.getHours()+1);
		citi.give(citi.balance, day3_2);

		// Advance another day
		var day4 = new Date(day3);
		day4.setDate(day4.getDate()+1);

		assert(citi.balance == 0);

		citi.take("35.22", day4);

		// test calcBalance history.
		console.log(day1_0, citi.calcBalance(day1_0), day1_1, citi.calcBalance(day1_1), day2, citi.calcBalance(day2), day3, citi.calcBalance(day3), day4, citi.calcBalance(day4));

		// Advance another day
		var day5 = new Date(day4);
		day5.setDate(day5.getDate()+1);

		// Get the value of the period between day 3 and day4
		console.log("Period between day3 and day4");
		console.log("getPeriod", day1_0, day4, citi.getPeriod(day1_0, day4));
		console.log("getPeriodNet", day1_0, day4, citi.getPeriodNet(day1_0, day4));
		console.log("getPeriodNetWorth", day1_0, day4, citi.getPeriodNetWorth(day1_0, day4));
		console.log("citi balance, now.", citi.balance, citi.calcBalance());
		console.log(citi.transactionHistory);

	};

	function timelineTest(quiet){
		var konsole = console;
		if (quiet){
			konsole = {
				log: function(){}
			};
		}
		konsole.log("Starting timeline test");
		var
			today = new Date("2010-01-01T00:00:01-0600"),
			fred = makeFred(today),
			days = [],
			gains = 0,
			losses = 0,
			startingBalance = fred.worth(),
			balance = startingBalance,
			payweek = 0,
			morning, noon, evening,

			paycheck = 1300,
			mortgage = 600,
			txcount = 0,
			tmpval,

			samplePeriodTestStartDate = new Date("2010-06-01T00:00:01-0600"),
			samplePeriodTestEndingDate = new Date("2010-08-15T22:59:59-0600"),
			samplePeriodTestStartBal = 0,
			samplePeriodTestAdj = 0,
			samplePeriodHistory = [],
			completeHistory = []
		;

		function isSamplePeriodStartDate(){
			return (
				(today.getYear()==samplePeriodTestStartDate.getYear())
				&&
				(today.getMonth()==samplePeriodTestStartDate.getMonth())
				&&
				(today.getDate()==samplePeriodTestStartDate.getDate())
			);
		}


		function isSamplePeriod(){
			return (samplePeriodTestStartDate <= today) && (today <= samplePeriodTestEndingDate);
			//return (samplePeriodTestStartDate.getDate() <= today.getDate()) && (today.getDate() <= samplePeriodTestEndingDate.getDate());
		}

		function EARN(amount, timestamp, message){
			balance += amount;
			today.balance += amount;
			gains += amount;
			today.gains += amount;
			++txcount;

			var tx = {
					date : new Date(timestamp),
					message: message,
					count: txcount,
					change: amount,
					balance: balance
				}

			completeHistory.push(tx);

			//samplePeriodTest
			if (isSamplePeriod()){
				samplePeriodTestAdj += amount;
				samplePeriodHistory.push(tx)
			}
		}

		function LOSE(amount, timestamp, message){
			balance -= amount;
			today.balance -= amount;
			losses += amount;
			today.losses += amount;
			++txcount;

			var tx = {
					date : new Date(timestamp),
					message: message,
					count: txcount,
					change: -amount,
					balance: balance
				}

			completeHistory.push(tx);

			//samplePeriodTest
			if (isSamplePeriod()){
				samplePeriodTestAdj -= amount;
				samplePeriodHistory.push(tx)
			}
		}

		// Set up day-zero
		today = new Date(today);
		today.setDate(today.getDate()-1);
		days.push(today);

		// Create two years worth of dates
		for (var i=0; i<(365*2); ++i){
			// Initialize a new day
			today = new Date(today);
			today.setDate(today.getDate()+1);
			today.balance = balance
			today.gains = 0
			today.losses = 0
			days.push(today);

			morning = new Date(today); morning.setHours(7);
			noon = new Date(today); noon.setHours(12);
			evening = new Date(today); evening.setHours(18);

			// Do we want to get the start balance for the sample period?
			if (isSamplePeriodStartDate()){ samplePeriodTestStartBal = balance; }


			// Does Fred get paid this week?
			if (today.getDay()==1){	payweek = (payweek + 1) % 2; }

			// Run a couple years worth of finances scenarios...
			switch (today.getDay()){

				// Monday
				case 1:
					// We have a case of the mondays--too tired to go out to lunch.
					// Fill up on gas.
					tmpval = rndVal(50,65,2);
					fred.findAccount("checking").take(tmpval, evening, "Gas up!");
					fred.findAccount("Maintenance").give(tmpval, evening, "Gas up!");
					LOSE(tmpval, evening, "Gas Up!");
					break;

				// Tu-Th, ordinary week days.
				case 2:
				case 3:
				case 4:
					// Go out for lunch?
					if (yesno(-3)){
						tmpval = rndVal(13,28,2);
						fred.findAccount("checking").take(tmpval, noon, "Going out with colleagues for lunch.")
						fred.findAccount("Entertainment").give(tmpval, noon, "Going out with colleagues for lunch.")
						LOSE(tmpval, noon, "Going out with golleagues for lunch");
					}

					// Order pizza to bring home?
					if (yesno(-6)){
						tmpval = rndVal(29,38,2);
						fred.findAccount("checking").take(tmpval, evening, "Too tired to cook, order pizza!")
						fred.findAccount("Entertainment").give(tmpval, evening, "Too tired to cook, order pizza!")
						LOSE(tmpval, evening, "Too tired to cook, order pizza!");
					}
					break;

				// Fr
				case 5:
					if (payweek){
						// F.B.G.P!!!
						konsole.log("PAy Day!");
						fred.findAccount("employer").take(paycheck, today, "Pay Day!");
						fred.findAccount("checking").give(paycheck, today, "Pay Day!");
						EARN(paycheck, today, "Pay Day!");

					} else {
						// Normal business
					}

					// Should we take the whole family out for dinner?
					if (yesno(-2)){
						tmpval = rndVal(30,55,2);
						fred.findAccount("checking").take(tmpval, evening, "Whole family, going out to eat!");
						fred.findAccount("Entertainment").give(tmpval, evening, "Whole family, going out to eat!");
						LOSE(tmpval, evening, "Whole family, going out to eat!");
					}

					break;

				// Sa
				case 6:
					if (payweek){ // We got paid, so let's pay bills
						if (today.getDate() < 8){ // Get all the monthly bills
							// Mortgage
							fred.findAccount("checking").take(mortgage, morning, "Mortgage payment");
							fred.findAccount("mortgage").give(mortgage, morning, "Mortgage payment");

							// Energy
							tmpval = rndVal(80,200,2);
							fred.findAccount("checking").take(tmpval, evening, "Energy");
							fred.findAccount("Utilities").give(tmpval, evening, "Energy");
							LOSE(tmpval, evening, "Energy");

						}
					} else {
						//
					}
					break;

				// Sunday
				case 0:
					if (yesno(-2)){
						tmpval = rndVal(16,30,2);
						fred.findAccount("checking").take(tmpval, morning, "Sunday Brunch");
						fred.findAccount("Entertainment").give(tmpval, morning, "Sunday Brunch");
						LOSE(tmpval, morning, "Sunday Brunch");
					}

					break;
			}
		}

		try {

			assertEq(
				// The running tally
				parseFloat((balance).toFixed(2)),
				_fisim.types.currency.USD(balance),
				// The sum of everything we know happened.
				parseFloat((startingBalance+gains-losses).toFixed(2)),
				_fisim.types.currency.USD(startingBalance+gains-losses),
				// The aggregate of accounts.
				parseFloat(fred.worth().toFixed(2)),
				_fisim.types.currency.USD(fred.worth())
			);
			konsole.log("Ending balances are good")

			// does calcBalance with date work?
			assertEq(
				_fisim.types.currency.USD(samplePeriodTestStartBal),
				_fisim.types.currency.USD(fred.calcBalance(samplePeriodTestStartDate))
			)
			konsole.log("Snapshot is good")

			assertEq(
				_fisim.types.currency.USD(samplePeriodTestAdj),
				_fisim.types.currency.USD(fred.getPeriodNetWorth(samplePeriodTestStartDate, samplePeriodTestEndingDate))
			)
			konsole.log("Snapshot & period ranges passed", samplePeriodTestStartBal, samplePeriodTestAdj);

			konsole.log("\n*\n*\n*\n   -- Tests Passed -- \n*\n*\n*\n")

		} catch(err) {

			konsole.error("Aww shoot, tests failed")

		}

		function samplePeriodReport(){
			var bal = 0;
			for (var hk in samplePeriodHistory){
				var item = samplePeriodHistory[hk];
				var itemdate = new Date(item.date);
				var omg = new Date(samplePeriodTestStartDate);
				omg.setHours(4)
				var rangeWorth = fred.getPeriodNetWorth(omg, itemdate);
				bal += item.change
				console.log(
					(rangeWorth==bal?"   :) ":":(    "), 
					"\ndate:", item.date, "message:", item.message, ", change:", item.change,
					",\n obj bal:", item.balance, ", expect bal:", bal, ", range worth:", rangeWorth, "\n\n")
			}
		}

		return {
			days: days,
			fred: fred,
			balance: balance,
			gains: gains,
			losses: losses,
			startingBalance: startingBalance,
			txcount: txcount,

			samplePeriodTestAdj: samplePeriodTestAdj,
			samplePeriodTestStartBal: samplePeriodTestStartBal,
			samplePeriodTestStartDate: samplePeriodTestStartDate,
			samplePeriodHistory: samplePeriodHistory,

			samplePeriodReport: samplePeriodReport,

			completeHistory: completeHistory
		}
	};

	function testRangeOperations(quiet){
		var konsole = console;
		if (quiet){
			konsole = {
				log: function(){}
			};
		}
		konsole.log("Starting timeline test");
		var
			today = new Date("2010-01-01T00:00:01-0600"),
			fred = makeFred(today),
			days = [],
			gains = 0,
			losses = 0,
			startingBalance = fred.worth(),
			balance = startingBalance,
			payweek = 0,
			morning, noon, evening,

			paycheck = 1300,
			mortgage = 600,
			txcount = 0,
			tmpval,

			samplePeriodTestStartDate = new Date("2010-06-01T00:00:01-0600"),
			samplePeriodTestEndingDate = new Date("2010-06-04T00:00:01-0600"),
			samplePeriodTestStartBal = 0,
			samplePeriodTestAdj = 0
		;

		function getSamplePeriodWorth(){
			return fred.getPeriodNetWorth(samplePeriodTestStartDate, samplePeriodTestEndingDate);
		}

		konsole.log(
			"Sample Period: ",
			samplePeriodTestStartDate,
			"-",
			samplePeriodTestEndingDate,
			"Starting Sample Period Worth",
			getSamplePeriodWorth()
		);

		fred.findAccount("savings").give(1, new Date("2010-06-01T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 0);

		fred.findAccount("savings").give(1, new Date("2010-06-01T00:00:01-0600"));
		assertEq(getSamplePeriodWorth(), 1);

		fred.findAccount("savings").give(1, new Date("2010-06-01T12:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 2);

		fred.findAccount("savings").give(1, new Date("2010-06-02T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 3);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 4);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 5);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 6);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 7);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 8);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 9);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 10);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 11);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 12);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 13);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:00-0600"));
		assertEq(getSamplePeriodWorth(), 14);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:01-0600"));
		assertEq(getSamplePeriodWorth(), 15);

		fred.findAccount("savings").give(1, new Date("2010-06-04T00:00:02-0600"));
		assertEq(getSamplePeriodWorth(), 15);

	}

	globals.test_fisim = {
		makeFred: makeFred,
		figureItOut: figureItOut,
		timelineTest: timelineTest,
		testRangeOperations: testRangeOperations,
		yesno: yesno,
		rndVal: rndVal
	};
 
})(this);



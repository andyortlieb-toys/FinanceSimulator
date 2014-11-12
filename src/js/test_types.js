// Make some accounts
0;
(function(globals){
	"use strict";

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

	function timelineTest(){
		console.log("Starting timeline test");
		var
			today = new Date("2010-01-01T00:00:01-0600"),
			fred = makeFred(today),
			days = [],
			gains = 0,
			losses = 0,
			balance = 0,
			startingBalance = fred.worth(),
			payweek = 0,
			morning, noon, evening
		;

		function EARN(amount){
			balance += amount;
			today.balance += amount;
			gains += amount;
			today.gains += amount;
		}

		function LOSE(amount){
			balance -= amount;
			today.balance -= amount;
			losses += amount;
			today.losses += amount;
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


			// Does Fred get paid this week?
			if (today.getDay()==1){	payweek = (payweek + 1) % 2; }

			// Run some scenarios...
			switch (today.getDay()){

				// Monday
				case 1:
					break;

				// Tu
				case 2:
					break;

				// We
				case 3:
					break;

				// Th
				case 4:
					break;

				// Fr
				case 5:
					if (payweek){
						// F.B.G.P!!!

					} else {
						// Normal business
					}
					break;

				// Sa
				case 6:
					if (payweek){
						// Pay some bills
					} else {
						//
					}
					break;

				// Sunday
				case 0:
					break;
			}
		}

		return {
			days: days,
			fred: fred,
			balance: balance,
			gains: gains,
			losses: losses,
			startingBalance: startingBalance
		}
	};

	globals.test_fisim = {
		makeFred: makeFred,
		figureItOut: figureItOut,
		timelineTest: timelineTest
	};
})(this);



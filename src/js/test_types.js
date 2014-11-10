// Make some accounts
0;
(function(globals){
	"use strict";
	var fred;

	fred = new _fisim.types.Person({
		accounts: [
			new _fisim.types.accounts.Revenue({name: "Employer"}),

			new _fisim.types.accounts.Asset({name:"Checking Account", startingBalance:200}),
			new _fisim.types.accounts.Asset({name:"Savings Account", startingBalance:1026.32, apr:0.2}),
			new _fisim.types.accounts.Asset({name:"CD Account", startingBalance:2026.32, apr:2.1}),

			new _fisim.types.accounts.Asset({name:"401k", startingBalance:6215.59}),

			new _fisim.types.accounts.CreditCard({name:"citi", startingBalance:62.32, apr:20.1}),
			new _fisim.types.accounts.CreditCard({name:"discover", startingBalance:11005.12, apr:18.9}),

			new _fisim.types.accounts.Expense({name: "Utilities"}),
			new _fisim.types.accounts.Expense({name: "Entertainment"})
		]

	});

	console.log("Intitial worth", fred.worth())

	fred.findAccount('discover').give(200)
	console.log("Worth after paying 200 to discover", fred.worth())
	
	fred.findAccount('citi').take(300)
	console.log("Worth after taking 300 from citi", fred.worth())

	fred.findAccount("CD Account").give(500)
	console.log("Worth after depositing 500 to CD", fred.worth())

	fred.findAccount("Checking Account").take(83.50)
	console.log("Worth after withdrawing 84.50 from the checking account", fred.worth())


	// Test out some transaction stuff
	var citi = fred.findAccount("citi");

	console.log("Before exception", fred.worth());
	var before = fred.worth();
	assertException( _fisim.types.exc.Exception, function(){
		var yesterday = new Date()
		yesterday.setDate(yesterday.getDate()-1)
		citi.take(83.50, yesterday)
	});
	var after = fred.worth();
	console.log("After exception", fred.worth());
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
	var day2balancemeth = citi.getBalance();
	var day2balancemethdate = citi.getBalance(day2);

	console.log("Starting balance on day2", day2balanceprop, day2balancemeth, day2balancemethdate);
	assertEq(day2balanceprop, day2balancemeth, day2balancemethdate);

	// Make a transaction
	var day2_2 = new Date(day2);
	day2_2.setHours(day2_2.getHours()+2)
	citi.take(30, day2_2);

	// Advance another day
	var day3 = new Date();
	day3.setDate(day3.getDate()+2);
	var day3balanceprop = citi.balance;
	var day3balancemeth = citi.getBalance();
	var day3balancemethdate = citi.getBalance(day3);

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

	// test getBalance history.
	console.log(day1_0, citi.getBalance(day1_0), day1_1, citi.getBalance(day1_1), day2, citi.getBalance(day2), day3, citi.getBalance(day3), day4, citi.getBalance(day4));

	// Advance another day
	var day5 = new Date(day4);
	day5.setDate(day5.getDate()+1);

	// Get the value of the period between day 3 and day4
	console.log("Period between day3 and day4");
	console.log(citi.getPeriod(day2, day5));

	return fred;
})(this);


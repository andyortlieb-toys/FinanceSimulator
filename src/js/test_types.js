// Make some accounts

function run(){

	var Exception = Class();
	var AssertionError = Class(Exception);



	function assertException(expected, callback){
		var err;
		try {
			callback();
			throw new AssertionError()
		}
		catch (caught){
			err = caught;
			console.log("Err thing", err);
		}

		if (typeof expected == "function" && err instanceof expected){
			console.log("passed1");
			return;
		}
		if (err == expected){
			console.log("passed")
			return;
		}

		console.warn("assertException failed", err);
		throw err;
	}

	function assert(val, message){
		if (typeof val == 'function'){
			val = val();
		}
		if (!val){
			throw new AssertionError(message || "assert() failed");
		}
		console.info("assert() passed");
	}

	me = new _fisim.types.Person({
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

	})

	console.log("Intitial worth", me.worth())

	me.findAccount('discover').give(200)
	console.log("Worth after paying 200 to discover", me.worth())
	
	me.findAccount('citi').take(300)
	console.log("Worth after taking 300 from citi", me.worth())

	me.findAccount("CD Account").give(500)
	console.log("Worth after depositing 500 to CD", me.worth())

	me.findAccount("Checking Account").take(83.50)
	console.log("Worth after withdrawing 84.50 from the checking account", me.worth())

	console.log("Before exception", me.worth());
	var before = me.worth();
	assertException( _fisim.types.exc.Exception, function(){
		console.log("This should fail:")
		yesterday = new Date()
		yesterday.setDate(yesterday.getDate()-1)
		me.findAccount("citi").take(83.50, yesterday)
	});
	var after = me.worth();
	console.log("After exception", me.worth());
	assert(before == after);




	return me;
}

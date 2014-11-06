// Make some accounts

function run(){
	my = {};

	my.Checking = new _fisim.types.accounts.Asset({name:"Checking Account", startingBalance:200});
	my.Savings = new _fisim.types.accounts.Asset({name:"Savings Account", startingBalance:1026.32, apr:0.2});
	my.CD = new _fisim.types.accounts.Asset({name:"CD Account", startingBalance:2026.32, apr:2.1});
	my.Retirement = new _fisim.types.accounts.Asset({name:"401k", startingBalance:6215.59});

	my.CCard1 = new _fisim.types.accounts.CreditCard({name:"citi", startingBalance:62.32, apr:20.1});
	my.CCard2 = new _fisim.types.accounts.CreditCard({name:"discover", startingBalance:11005.12, apr:18.9});

	return my;
}

/*

 @source
 ## Types
 Types for use by FinanceSimulator

 This module is AMD compatible, and also works without it.

*/	

// Self calling anonymous function
(function(){

	/*
		@function
		@private 

		typesLib as a function allows us to decide whether or not to invoke it as AMD.

	*/
	function typesLib(){
		var 
			exports = {accounts:{}}
		;

		with (exports){

			/*
				@object BalanceTypes
			*/
			// Balance Types (Account Types) (Credit/Debit)
			exports.BalanceTypes = {
				Expense:0,
				Asset:1,
				Liability:-1
			}

			exports.Account = Class({
				// @constructor
				init: function(){
					console.log("To run init?")
					if (this._initialized) return;
					console.log("apparently so...")
					this._initialized = true;
					this._type = this._type;
					this.transactionHistory = [];
					this.startingBalance = this.startingBalance || 0;
					this.balance = this.balance || this.startingBalance;
				},

				// @method
				// Stores the transaction and adjusts the balance
				transaction: function(amount, date){
					this.init()
					this.balance += amount * this.balanceType
					this.transactionHistory.push(new Transaction({amount:amount, date:date}))
				},

				// @method
				// What does this account net for the owner's worth?
				worth: function(){
					return this.balance * this.balanceType;
				},

				// @prop
				_type: "Account",
				// @prop
				name: "Unnamed Account",
				// @prop
				startingBalance: 0,
				// @prop
				balance: 0,
				// @prop
				apr: 0

			});

			exports.accounts.Asset = Class(Account, {
				_type: "Asset",
				balanceType: BalanceTypes.Asset,
				init: function(){
					console.log("Asset init!");
					this.SuperApply("init", arguments);
				}
			});

			exports.accounts.Liability = Class(Account, {
				_type: "Liability",
				balanceType: BalanceTypes.Liability
			});

			exports.accounts.Expense = Class(Account, {
				_type: "Expense",
				balanceType: BalanceTypes.Expense
			})

			exports.accounts.Service = Class(exports.accounts.Expense, {
				_type: "Service"
			});

			exports.accounts.CreditCard = Class(exports.accounts.Liability, {
				_type: "Credit Card"
			});

			exports.accounts.BudgetItem = Class(exports.accounts.Expense, {
				_type: "Budget Item"
			});

			exports.accounts.Allowance = Class(exports.accounts.BudgetItem, {
				_type: "Allowance"
			});

			exports.accountTypes = (function(){
				var res = []
				for (k in exports.accounts){
					if (exports.accounts[k].prototype._type){
						res.push(exports.accounts[k].prototype._type);
					}
				}
				return res;
			})();

			exports.initAccount = function(accountobj){
				var acct = new exports.accounts[accountobj._type];

				for (var k in accountobj){
					acct[k] = accountobj[k];
				}

				return acct;
			}

			exports.initAccounts = function(accountlist){
				newaccounts = [];

				for (var i=0; i<accountlist.length; ++i){
					newaccounts.push(exports.initAccount(accountlist[i]));
				}

				return newaccounts;
			}
		}

		return exports;
	}

	console.log("FIXME: Test AMD style")
	if (typeof require!=="undefined" && typeof define!=="undefined" ){
		// Do this AMD style:

		define([], typesLib);
		return;

	} else {
		// Do this cowboy style.

		if (typeof _fisim ==='undefined') _fisim = {};
		_fisim.types = typesLib();
		return;
	}


})();
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

			// @class
			exports.Transaction = Class({
				init: function(){
					if (typeof this.amount != "number") this.amount = 0;
					if (!(this.date instanceof Date)) this.date = new Date();
				}
			})

			exports.Account = Class({
				// @constructor
				init: function(){
					if (this._initialized) return;
					this._initialized = true;
					this._type = this._type;
					this.transactionHistory = [];
					this.startingBalance = this.startingBalance || 0;
					this.balance = this.balance || this.startingBalance;

					this.transactionHistory.push(new Transaction({amount: this.startingBalance, note: "Starting Balance"}));
					if (this.startingBalance != this.balance) {
						this.transactionHistory.push(new Transaction({amount: this.balance-this.startingBalance, note: "Balance Adjustment"}))
					}
				},

				// @method
				// Stores the transaction and adjusts the balance
				transaction: function(amount, date, note){
					this.init()
					this.balance += amount * this.balanceType
					this.transactionHistory.push(new Transaction({amount:amount, date:date, note:note}))
				},

				// @method
				// What does this account net for the owner's worth?
				worth: function(){
					return this.balance * this.balanceType;
				},

				// @method
				// Returns the sum of all transactions in the history
				sum: function(){
					var val = 0;
					for (i in self.transactionHistory) val += self.transactionHistory.amount;
					return val;
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

			exports.Asset = exports.accounts.Asset = Class(Account, {
				_type: "Asset",
				balanceType: BalanceTypes.Asset,
				init: function(){
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

			exports.Entity = Class({
				// @constructor
				init: function(){
					this.accounts = this.accounts || {}
					for (k in this.accounts) if (!(this.accounts[k] instanceof exports.Account)) throw "This is not an Account: "+k
				},
				// @method
				// Calculates the current worth of this Entity
				worth: function(){
					var val = 0;
					for (k in this.accounts){
						val += this.accounts[k].worth();
					}
					return val;
				},
				// @method
				// Adds an account to the thing.
				addAccount: function(acct){
					if (acct.name in this.accounts){
						throw ""
					}
				}
			})
			exports.Person = Class(exports.Entity)

			exports.accountTypes = (function(){
				var res = []
				for (k in exports.accounts){
					if (exports.accounts[k].prototype._type){
						res.push(exports.accounts[k].prototype._type);
					}
				}
				return res;
			})();

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
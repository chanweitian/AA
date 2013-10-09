// import
var bidModule = require("./Bid");
var askModule = require("./Ask");
var matchedTransactionModule = require("./MatchedTransaction");
var connection = require("./connection");

var addUnfulfilledBid = function(newBid, next){
	console.log("adding bid");
<<<<<<< HEAD
	connection.addBuyOrder(newBid, function(stock) {
		next(stock);
	});
=======
	connection.addBuyOrder(newBid);
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
} 

var addUnfulfilledAsk = function(newAsk, next){
	console.log("adding ask");
<<<<<<< HEAD
	connection.addSellOrder(newAsk, function(stock) {
		next(stock);
	});
=======
	connection.addSellOrder(newAsk);
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

var getLowestAsk = function(stockID, next){
	console.log("Searching for the lowest ask");
	connection.getLowestAsk(stockID, function(lowestAsk) {
		next(null, lowestAsk);
	});
}

var removeUnfulfilledBid = function(bid){
	console.log("removing bid "+bid.getStock());
	connection.removeBuyOrder(bid);
}

var removeUnfulfilledAsk = function(ask){
	console.log("removing ask "+ask.getStock());
	connection.removeSellOrder(ask);
	/*console.log("Simultaing hanging function");
	setTimeout(function() { 
		console.log("Completed hanging function");
	}, 1000);*/
}

var addMatchedTransaction = function(match){
	console.log("adding match "+match.getStock());	
	connection.addMatchedTransaction(match);
}

// updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
// based on the MatchedTransaction object passed in
var updateLatestPrice = function(matched) {
	console.log("updating the lastest price: "+matched.toString());
	var stock = matched.getStock();
	var price = matched.getPrice();
	connection.updateLatestPrice(stock, price);
}

var attemptBidMatch = function(err, newBid, lowestAsk, next){
	// step 5: check if there is a match.
	// A match happens if the highest bid is bigger or equal to the lowest ask
	if (lowestAsk!=null && newBid.getPrice() >= lowestAsk.getPrice()) {
		// a match is found
		//removeUnfulfilledBid(newBid);
<<<<<<< HEAD
		removeUnfulfilledAsk(lowestAsk);
=======
		removeUnfulfilledAsk(lowestAsk)
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
		// this is a BUYING trade - the transaction happens at the higest bid's timestamp, and the transaction price happens at the lowest ask
		var match = new matchedTransactionModule.MatchedTransaction(newBid.getUserId(), lowestAsk.getUserId(), new Date(), lowestAsk.getPrice(), newBid.getStock());
		addMatchedTransaction(match);	
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		updateLatestPrice(match);
		logMatchedTransactions();
	} else {
<<<<<<< HEAD
		addUnfulfilledBid(newBid, function(stockName) {
			//insert code
		});
=======
		addUnfulfilledBid(newBid);
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
	}
	next();
}

// call this method immediatley when a new bid (buying order) comes in
// this method returns false if this buy order has been rejected because of a credit limit breach
// it returns true if the bid has been successfully added
var placeNewBidAndAttemptMatch = function(newBid, next) {
	validateCreditLimit(newBid, function(err, okToContinue){
		if (!okToContinue) {
			console.log("bid unsuccessful - not enough credit");
			next(null,false);
		} else {
			// step 1: insert new bid into unfulfilledBids
			//addUnfulfilledBid(newBid);
			// step 2: check if there is any unfulfilled asks (sell orders) for the new bid's stock. if not, just return
			// count keeps track of the number of unfulfilled asks for this stock
			getLowestAsk(newBid.getStock(), function(err, lowestAsk){	
				attemptBidMatch(err, newBid, lowestAsk, function(err, matchStatus){ 
					if (!err){
						console.log("bid is successuful");
						next(null,true);
					} else {
						console.log("error occured");
						next(err, null);
					}
				});
			});
		}
	});
}


var attemptAskMatch = function(newAsk, highestBid, next){
	if (highestBid!=null && newAsk.getPrice() <= highestBid.getPrice()) {
		// a match is found
		removeUnfulfilledBid(highestBid);
		removeUnfulfilledAsk(newAsk)
		// this is a SELLING trade - the transaction happens at the lowest ask's timestamp, and the transaction price happens at the highest bid
		var match = new matchedTransactionModule.MatchedTransaction(highestBid.getUserId(), newAsk.getUserId(), new Date(), highestBid.getPrice(), newAsk.getStock());
		addMatchedTransaction(match);
		
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		updateLatestPrice(match);
		logMatchedTransactions();
	} 
	next();
}


var getHighestBid = function(stockID, next){
	console.log("Searching for the highest bid");
	connection.getHighestBid(stockID, function(highestBid) {
		next(null, highestBid);
	});
	//var lowestAsk = null;
}

// call this method immediatley when a new ask (selling order) comes in
var placeNewAskAndAttemptMatch = function(newAsk, next) {
	// step 1: insert new highest ask into unfulfilledAsks
	var counter = 0;
	var TOTAL_COUNTER = 2;
	var lowestAsk;
	var highestBid;

	// step 1a: insert new ask into unfulfilledAsks
	addUnfulfilledAsk(newAsk, function(stockName){
		// step 2: identify the current/lowest ask in unfulfilledAsks of the same stock
		console.log("Done with adding ask");
		getLowestAsk(stockName, function(err,ask){
			lowestAsk = ask;
			counter++;
			if (counter == TOTAL_COUNTER){
				processAttemptAskMatch();
			}
		});
	});
	
<<<<<<< HEAD
	// step 1b: identify the current/highest bid in unfulfilledBids of the same stock
	getHighestBid(newAsk.getStock(), function(err, bid){
		if(bid == null) {
			next(null);
		}
		highestBid = bid;
		counter++;
		if (counter == TOTAL_COUNTER){
				processAttemptAskMatch();
		}
	});
	// step 3: check if there is a match.
	// A match happens if the lowest ask is <= highest bid
	function processAttemptAskMatch(){
		attemptAskMatch(lowestAsk, highestBid, function(err, matchStatus){
=======
	// step 2: identify the current/highest bid in unfulfilledBids of the same stock
	getHighestBid(newAsk.getStock(), function(err, highestBid){
		// step 3: check if there is a match.
		// A match happens if the lowest ask is <= highest bid
		attemptAskMatch(err, newAsk, highestBid, function(err, matchStatus){ 
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
			if (!err){
				console.log("ask is successful");
				next(null);
			} else {
				console.log("error occured");
				next(err);
	    	}
	    });
	}
	
}


// check if a buyer is eligible to place an order based on his credit limit
// if he is eligible, this method adjusts his credit limit and returns true
// if he is not eligible, this method logs the bid and returns false
var validateCreditLimit = function(bid, next) {
	var totalPriceOfBid = bid.getPrice() * 1000; //each bid is for 1000 shares
	
	buyerId = bid.getUserId();
	getCreditRemaining(buyerId, function (err, remainingCredit, newRecord){
		var newRemainingCredit = remainingCredit - totalPriceOfBid;

		if (newRemainingCredit < 0) {
			// no go - log failed bid and return false
			//this.logRejectedBuyOrder(bid);
			next (null,false);
			console.log("rejected");
		} else {
			console.log("approved");
			// it's ok - adjust credit limit and return true
			if (newRecord) {
				connection.addUserCredit(buyerId, newRemainingCredit);
			} else {
				connection.updateUserCredit(buyerId, newRemainingCredit);
			}
			next (null,true);
		}


	});
	
}

var getCreditRemaining = function(buyerUserId, next) {
	
	console.log("checking "+buyerUserId+" creditLimit");
	connection.retrieveUserCredit(buyerUserId, function(userCredit) {
		if (userCredit == null) {
<<<<<<< HEAD
=======
			// this buyer is not in the hash table yet. Hence create a new entry for him
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
			next(undefined, 1000000, true);
		} else {
			next(undefined,userCredit, false);
		}
	});
	
}



 // returns a String of unfulfilled bids for a particular stocks
 // returns an empty string if no such bid
 // bods are separated by <br> for display on HTML page
 var getUnfulfilledBidsForDisplay = function(stock, next) {
	console.log("retrieving all bids: "+stock);
	connection.retrieveBuyOrders(stock,function(list) {
		next(null,list);
	});

 }

  // return a String of unfilled asks for a particular stock
 // returns an empty string if no such ask
 // asks are separated by <br> for display on HTML page
 var getUnfulfilledAsks = function(stock,next) {
	console.log("retrieving all asks: "+stock);
	connection.retrieveSellOrders(stock,function(list) {
		next(null,list);
	});
 }



var getAllCreditRemainingForDisplay = function(next) {
	console.log("retrieving all credits:");
<<<<<<< HEAD
	connection.retrieveAllUserCredit(function(allUser, allCredit) {
		next(null,allUser,allCredit);
=======
	connection.retrieveAllUserCredit(function(allUserCredit) {
		next(null,allUserCredit);
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
	});
}



// updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
// based on the MatchedTransaction object passed in
var getLatestPrice = function(stock, next) {
	console.log("get latest price from DB");
	connection.retrieveLatestPrice(stock, function(latestPrice) {
<<<<<<< HEAD
		if (latestPrice == null) {
=======
		if (latestPrice == 0) {
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
			next(null,"N/A");
		} else {
			next(null,latestPrice);
		}
	});
	//cannot find stock pass error
	//next(err,null);
}

// returns the highest bid for a particular stock
// return N/A there is no bid at all
var getHighestBidPrice = function(stock, next) {
	console.log("get highest bid price from DB stock: "+ stock);
	connection.getHighestBidPrice(stock, function(highestBid) {
		if (highestBid == null) {
			next(null,"N/A");
		} else {
			next(null,highestBid);
		}
	});
}


// returns the lowest ask for a particular stock
// returns -1 if there is no ask at all
var getLowestAskPrice = function(stock, next) {
	console.log("get lowest ask price from DB stock: "+ stock);
	connection.getLowestAskPrice(stock, function(lowestAsk) {
		if (lowestAsk == null) {
			next(null,"N/A");
		} else {
			next(null,lowestAsk);
		}
	});
<<<<<<< HEAD
}

//reset database
var processEndDay = function(next) {
	connection.flushdb(function() {
		next();
	});
=======
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

// call this to append all matched transactions in matchedTransactions to log file and clear matchedTransactions
var logMatchedTransactions = function() {

	console.log("writing to log file");

	/*
	var log_File = this.MATCH_LOG_FILE;
	this.matchedTransactions.forEach(function(transaction) {
		
		fs.appendFile(log_File, transaction.toString() + "\n", function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("The file was saved!");
			}
		});
	});
	this.matchedTransactions = []; */
}


/*

	ExchangeBean.prototype.endTradingDay = function() {
	// reset attributes
	this.latestPriceForSmu = -1;
	this.latestPriceForNus = -1;
	this.latestPriceForNtu = -1;
	
	//dump all unfulfilled buy and sell orders
	this.unfulfilledAsks = [];
	this.unfulfilledBids = [];
	
	// reset all credit limits of users
	this.creditRemaining = [];
}

 
// call this to append all rejected buy orders to log file
ExchangeBean.prototype.logRejectedBuyOrder = function(bid) {
	fs.appendFile(this.REJECTED_BUY_ORDERS_LOG_FILE, bid.toString() + "\n", function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
}





*/






module.exports.placeNewBidAndAttemptMatch = placeNewBidAndAttemptMatch;
module.exports.placeNewAskAndAttemptMatch = placeNewAskAndAttemptMatch;
module.exports.getUnfulfilledBidsForDisplay = getUnfulfilledBidsForDisplay;
module.exports.getUnfulfilledAsks = getUnfulfilledAsks;
module.exports.getAllCreditRemainingForDisplay = getAllCreditRemainingForDisplay;
module.exports.getLatestPrice = getLatestPrice;
module.exports.getHighestBidPrice = getHighestBidPrice;
module.exports.getLowestAskPrice = getLowestAskPrice;
module.exports.processEndDay = processEndDay;



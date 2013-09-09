// import
var bidModule = require("./Bid");
var askModule = require("./Ask");
//var matchedTransactionModule = require("./MatchedTransaction");

var addUnfulfilledBid = function(newBid){
	console.log("adding bid");
} 



var retrieveAllAsks = function( newBid, next){
	console.log("Searching for all ask with stock: "+newBid.getStock());

	//log on to database and retrieve array of ask
	var askList = {};

	next(null, askList);
}


var findLowestAsk = function(askList, next){
	console.log("Searching for the lowest ask");
	var lowestAsk = new askModule.Ask("smu",30,"wt.chan.2011");
	//var lowestAsk = null;

	next(null, lowestAsk)
}

var removeUnfulfilledBid = function(bid){
	console.log("removing bid "+bid.getStock());
}

var removeUnfulfilliedAsk = function(ask){
	console.log("removing ask "+ask.getStock());
	console.log("Simultaing hanging function");
	setTimeout(function() { 
		console.log("Completed hanging function");
	}, 1000);
}

var addMatchedTransaction = function(match){
	console.log("adding match "+match.getStock());	
}

// updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
// based on the MatchedTransaction object passed in
var updateLatestPrice = function(matched) {
	console.log("updating the lastest price: "+matched.toString());
	var stock = matched.getStock();
	var price = matched.getPrice();
	// update the correct attribute
	if (stock == "smu") {
		this.latestPriceForSmu = price;
	} else if (stock == "nus") {
		this.latestPriceForNus = price;
	} else if (stock = "ntu") {
		this.latestPriceForNtu = price;
	}
}




var attemptMatch = function(err, newBid, lowestAsk, next){
	// step 5: check if there is a match.
	// A match happens if the highest bid is bigger or equal to the lowest ask
	if (newBid.getPrice() >= lowestAsk.getPrice()) {
		// a match is found
		removeUnfulfilledBid(newBid);
		removeUnfulfilliedAsk(lowestAsk)
		// this is a BUYING trade - the transaction happens at the higest bid's timestamp, and the transaction price happens at the lowest ask
		//var match = new matchedTransactionModule.MatchedTransaction(highestBid, lowestAsk, highestBid.getDate(), lowestAsk.getPrice());
		//this.matchedTransactions.push(match);
		
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		//updateLatestPrice(match);
		logMatchedTransactions();
	}
	next();
}


var placeNewBidAndAttemptMatch = function(newBid, next) {

	validateCreditLimit(newBid, function(err, okToContinue){

		if (!okToContinue) {
			console.log("bid unsuccessful - not enough credit");
			next(null,false);
		}

		// step 1: insert new bid into unfulfilledBids
		addUnfulfilledBid(newBid);

		// step 2: check if there is any unfulfilled asks (sell orders) for the new bid's stock. if not, just return
	    // count keeps track of the number of unfulfilled asks for this stock
	    retrieveAllAsks(newBid, function(err, askList){
	    	findLowestAsk(askList, function(err, lowestAsk ){
	    		attemptMatch(err, newBid, lowestAsk, function(err, matchStatus){ 
	    			if (!err){
	    				console.log("bid is successuful");
	    				next(null,true);
	    			} else {
	    				console.log("error occured");
	    				next(err, null);
	    			}
	    		});
	    	});
	    });

	});
}


// check if a buyer is eligible to place an order based on his credit limit
// if he is eligible, this method adjusts his credit limit and returns true
// if he is not eligible, this method logs the bid and returns false
var validateCreditLimit = function(bid, next) {
	var totalPriceOfBid = bid.getPrice() * 1000; //each bid is for 1000 shares
	
	getCreditRemaining(bid.getUserId(), function (err, remainingCredit){
		var newRemainingCredit = remainingCredit - totalPriceOfBid;

		if (newRemainingCredit < 0) {
			// no go - log failed bid and return false
			//this.logRejectedBuyOrder(bid);
			next (null,false);
		} else {
			// it's ok - adjust credit limit and return true
			// this.creditRemaining[bid.getUserId()] = newRemainingCredit;
			next (null,true);
		}


	});
	
}

var getCreditRemaining = function(buyerUserId, next) {
	
	console.log("checking "+buyerUserId+" creditLimit");
/*
	if (creditRemaining[buyerUserId] === undefined) {
		// this buyer is not in the hash table yet. Hence create a new entry for him
		creditRemaining[buyerUserId] = this.DAILY_CREDIT_LIMIT_FOR_BUYERS;
	}*/
	next(undefined,99999999);
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

 // returns a String of unfulfilled bids for a particular stocks
 // returns an empty string if no such bid
 // bods are separated by <br> for display on HTML page
 ExchangeBean.prototype.getUnfulfilledBidsForDisplay = function(stock) {
 	var returnString = "";
 	console.log(this.unfulfilledBids.length);
 	for ( var i = 0; i < this.unfulfilledBids.length; i++) {
 		var bid = this.unfulfilledBids[i];

 		if (bid.getStock() == stock) {
 			returnString = returnString + bid.toString() + "<br/>"; 
 		}
 	}

 	return returnString;
 }
 
 // return a String of unfilled asks for a particular stock
 // returns an empty string if no such ask
 // asks are separated by <br> for display on HTML page
 ExchangeBean.prototype.getUnfulfilledAsks = function(stock) {
 	var returnString = "";
 	for (var i = 0; i < this.unfulfilledAsks.length; i++) {
 		var ask = this.unfulfilledAsks[i];
 		if (ask.getStock() == stock) {
 			returnString = returnString + ask.toString() + "<br/>";
 		}		
 	}

 	return returnString;
 }
 
// returns the highest bid for a particular stock
// return -1 if there is no bid at all
ExchangeBean.prototype.getHighestBidPrice = function(stock) {
	var highestBid = this.getHighestBid(stock);
	if (highestBid === undefined) {
		return -1;
	} else {
		return highestBid.getPrice();
	}
}

// retrieve unfulfiled current (highest) bid for a particular stock
// return null if there is no unfulfiled bid for this stock
ExchangeBean.prototype.getHighestBid = function(stock) {
	var highestBid = new bidModule.Bid(undefined, 0, undefined);
	for(var i = 0; i < this.unfulfilledBids.length; i++) {
		var bid = this.unfulfilledBids[i];
		if (bid.getStock() == stock && bid.getPrice() >= highestBid.getPrice()) {
			// if there are 2 bids of the same amount, the earlier one is considered the highest bid
			if (bid.getPrice() == highestBid.getPrice()) {
				if (bid.getDate().getTime() < highestBid.getDate().getTime()) {
					highestBid = bid;
				}
			} else {
				highestBid = bid;
			}
		} 
	}
	if (highestBid.getUserId() === undefined) {
		return undefined;
	}
	return highestBid;
}

// returns the lowest ask for a particular stock
// returns -1 if there is no ask at all
ExchangeBean.prototype.getLowestAskPrice = function(stock) {
	var lowestAsk = this.getLowestAsk(stock);
	if (lowestAsk === undefined) {
		return -1;
	} else {
		return lowestAsk.getPrice();
	}
}

// retrieve unfulfiled current (lowest) ask for a particular stock
// returns null if there is no unfulfiled asks for this stock
ExchangeBean.prototype.getLowestAsk = function(stock) {
	var lowestAsk = new askModule.Ask(undefined, Number.MAX_VALUE, undefined);
	for (var i = 0; i < this.unfulfilledAsks.length; i++) {
		var ask = this.unfulfilledAsks[i];
		if (ask.getStock() == stock && ask.getPrice() <= lowestAsk.getPrice()) {
			// there are 2 asks of the same ask amount, the earlier one is considered the highest ask
			if (ask.getPrice() == lowestAsk.getPrice()) {
				//compares dates
				if (ask.getDate().getTime() < lowestAsk.getDate().getTime()) {
					lowestAsk = ask;
				}
			}  else {
				lowestAsk = ask;
			}
		}
	}
	if (lowestAsk.getUserId() === undefined) {
		return undefined;
	}
	return lowestAsk;
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


// returns a string of HTML table rows code containing the list of user IDs and their remaining credits
// this method is used by viewOrders.jsp for debugging purposes
ExchangeBean.prototype.getAllCreditRemainingForDisplay = function() {
	var returnString = "";

	for (var key in this.creditRemaining) {
		var value = this.creditRemaining[key];
		returnString = returnString + "<tr><td>" + key + "</td><td>" + value + "</td></tr>";
	}
	return returnString;
}



// call this method immediatley when a new bid (buying order) comes in
// this method returns false if this buy order has been rejected because of a credit limit breach
// it returns true if the bid has been successfully added


// call this method immediatley when a new ask (selling order) comes in
ExchangeBean.prototype.placeNewAskAndAttemptMatch = function(newAsk) {
	// step 1: insert new ask into unfulfilledAsks
	this.unfulfilledAsks.push(newAsk);
	
	// step 2: check if there is any unfulfilled bids (buy orders) for the new ask's stock. if not, just return
    // count keeps track of the number of unfulfilled bids for this stock
    var count = 0;
    for (var i = 0; i < this.unfulfilledBids.length; i++) {
    	if (this.unfulfilledBids[i].getStock() == newAsk.getStock()) {
    		count++;
    	}
    }
    if (count == 0) {
		return; //true; // no unfulfilled asks of the same stock
	}
	
	 // step 3: identify the current/highest bid in unfulfilledBids of the same stock
	 var highestBid = this.getHighestBid(newAsk.getStock());
	 
	 // step 4: identify the current/lowest ask in unfulfilledAsks of the same stock
	 var lowestAsk = this.getLowestAsk(newAsk.getStock());
	 
	 // step 5: check if there is a match.
    // A match happens if the lowest ask is <= highest bid
    if (lowestAsk.getPrice() <= highestBid.getPrice()) {
		// a match is found
		this.unfulfilledBids.splice(highestBid, 1);
		this.unfulfilledAsks.splice(lowestAsk, 1);
		// this is a SELLING trade - the transaction happens at the lowest ask's timestamp, and the transaction price happens at the highest bid
		var match = new matchedTransactionModule.MatchedTransaction(highestBid, lowestAsk, lowestAsk.getDate(), highestBid.getPrice());
		this.matchedTransactions.push(match);
		
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		this.updateLatestPrice(match);
		this.logMatchedTransactions();
	}
	
	//return true;
}


// updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
// based on the MatchedTransaction object passed in
ExchangeBean.prototype.getLatestPrice = function(stock) {
	if (stock == "smu") {
		return this.latestPriceForSmu;
	} else if (stock == "nus") {
		return this.latestPriceForNus;
	} else if (stock = "ntu") {
		return this.latestPriceForNtu;
	}
	return -1 // no such stock
}


*/
module.exports.placeNewBidAndAttemptMatch = placeNewBidAndAttemptMatch;
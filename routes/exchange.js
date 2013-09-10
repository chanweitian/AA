// import
var bidModule = require("./Bid");
var askModule = require("./Ask");
var matchedTransactionModule = require("./MatchedTransaction");

var addUnfulfilledBid = function(newBid){
	console.log("adding bid");
} 

var addUnfulfilledAsk = function(newAsk){
	console.log("adding ask");
}

var getLowestAsk = function(newBid, next){
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

var attemptBidMatch = function(err, newBid, lowestAsk, next){
	// step 5: check if there is a match.
	// A match happens if the highest bid is bigger or equal to the lowest ask
	if (newBid.getPrice() >= lowestAsk.getPrice()) {
		// a match is found
		removeUnfulfilledBid(newBid);
		removeUnfulfilliedAsk(lowestAsk)
		// this is a BUYING trade - the transaction happens at the higest bid's timestamp, and the transaction price happens at the lowest ask
		var match = new matchedTransactionModule.MatchedTransaction(newBid, lowestAsk, newBid.getDate(), lowestAsk.getPrice());
		addMatchedTransaction(match);	
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		updateLatestPrice(match);
		logMatchedTransactions();
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
		} 
		// step 1: insert new bid into unfulfilledBids
		addUnfulfilledBid(newBid);
		// step 2: check if there is any unfulfilled asks (sell orders) for the new bid's stock. if not, just return
	    // count keeps track of the number of unfulfilled asks for this stock
	    getLowestAsk(newBid, function(err, lowestAsk){	
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
	});
}


var attemptAskMatch = function(err, newAsk, highestBid, next){
	if (newAsk.getPrice() >= highestBid.getPrice()) {
		// a match is found
		removeUnfulfilledBid(highestBid);
		removeUnfulfilliedAsk(newAsk)
		// this is a SELLING trade - the transaction happens at the lowest ask's timestamp, and the transaction price happens at the highest bid
		var match = new matchedTransactionModule.MatchedTransaction(highestBid, newAsk, newAsk.getDate(), highestBid.getPrice());
		addMatchedTransaction(match);
		
		// to be included here: inform Back Office Server of match
		// to be done in v1.0
		updateLatestPrice(match);
		logMatchedTransactions();
	}
	next();
}


var getHighestBid = function(newAsk, next){
	console.log("Searching for the highest bid");
	var highestBid = new bidModule.Bid("smu",30,"wt.chan.2011");
	//var lowestAsk = null;
	next(null, highestBid)
}

// call this method immediatley when a new ask (selling order) comes in
var placeNewAskAndAttemptMatch = function(newAsk, next) {
	// step 1: insert nehighestw ask into unfulfilledAsks
	addUnfulfilledAsk(newAsk);
	
	// step 2: identify the current/highest bid in unfulfilledBids of the same stock
	getHighestBid(newAsk, function(err, highestBid){
		// step 3: check if there is a match.
		// A match happens if the lowest ask is <= highest bid
		attemptAskMatch(err, newAsk, highestBid, function(err, matchStatus){ 
			if (!err){
				console.log("ask is successuful");
				next(null);
			} else {
				console.log("error occured");
				next(err);
	    	}
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



 // returns a String of unfulfilled bids for a particular stocks
 // returns an empty string if no such bid
 // bods are separated by <br> for display on HTML page
 var getUnfulfilledBidsForDisplay = function(stock, next) {
	console.log("retrieving all bids: "+stock);
	var b1 = new bidModule.Bid("smu",10,"b1");
	var b2 = new bidModule.Bid("smu",10,"b2");
	var b3 = new bidModule.Bid("smu",10,"b3");

	var bidList = {
		"result" : [
			b1.toString(),
			b2.toString(),
			b3.toString()
		]
	}
	next(null, bidList);

 }

  // return a String of unfilled asks for a particular stock
 // returns an empty string if no such ask
 // asks are separated by <br> for display on HTML page
 var getUnfulfilledAsks = function(stock,next) {
	console.log("retrieving all asks: "+stock);
	var a1 = new askModule.Ask("smu",30,"a1");
	var a2 = new askModule.Ask("smu",30,"a2");
	var a3 = new askModule.Ask("smu",30,"a3");

	var askList = {
		"result" : [
			a1.toString(),
			a2.toString(),
			a3.toString()
		]
	}
	next(null, askList);
 }



var getAllCreditRemainingForDisplay = function(next) {
	console.log("retrieving all credits:");

	var u1 = {
		id:"u1",
		credit:50
	};
	var u2 = {
		id:"u2",
		credit:50
	};
	var u3 = {
		id:"u3",
		credit:50
	};
	var list = [u1,u2,u3];

	next(null,list)
}



// updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
// based on the MatchedTransaction object passed in
var getLatestPrice = function(stock, next) {
	console.log("get latest price from DB");
	if (stock == "smu") {
		next(null,20);
	} else if (stock == "nus") {
		next(null,30);
	} else if (stock == "ntu") {
		next(null,40);
	}
	//cannot find stock pass error
	//next(err,null);
}

// returns the highest bid for a particular stock
// return -1 if there is no bid at all
var getHighestBidPrice = function(stock, next) {
	console.log("get highest bid price from DB stock: "+ stock);
	next(null,30);
}


// returns the lowest ask for a particular stock
// returns -1 if there is no ask at all
var getLowestAskPrice = function(stock, next) {
	console.log("get lowest ask price from DB stock: "+ stock);
	next(null,50);
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





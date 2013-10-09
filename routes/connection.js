var mysql = require("mysql");
var bidModule = require("./Bid");
var askModule = require("./Ask");

// Create the conn. 
var conn = mysql.createConnection({ 
   host: "127.0.0.1",
   user: "root", 
   password: "", 
   database: "exchange"
}); 
	
var addBuyOrder = function(bid){
	var buyerID = bid.getUserId();
	var stockID = bid.getStock();
	var bidPrice = bid.getPrice();
	var date = bid.getDate(function() {
		var dateTime = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var query = conn.query("INSERT INTO buyOrder SET buyerID = '" + buyerID + "', stockID = '" + stockID + "', bidPrice =  '" + bidPrice + "', dateTime = '" + dateTime + "'",
		  function(err, result) { 
			if (err) throw err;
		  });
		  
		console.log(query.sql);
	});
}

var addSellOrder = function(ask){
	var sellerID = ask.getUserId();
	var stockID = ask.getStock();
	var askPrice = ask.getPrice();
	var date = ask.getDate(function() {;
		var dateTime = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var query = conn.query("INSERT INTO sellOrder SET sellerID = '" + sellerID + "', stockID = '" + stockID + "', askPrice =  '" + askPrice + "', dateTime = '" + dateTime + "'",
		  function(err, result) { 
			if (err) throw err;
		  });
		  
		console.log(query.sql);
	});
}

var addUserCredit = function(userID, credit){
	var query = conn.query("INSERT INTO userCredit SET userID = '" + userID + "', remainingCredit = '" + credit + "'",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

//returns null if user is not in usercredit table yet
var retrieveUserCredit = function(userID, next) {
	var query = conn.query("SELECT remainingCredit FROM userCredit where userID = '" + userID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['remainingCredit']);
	  });
}

//returns 0 if no latest price
var retrieveLatestPrice = function(stockID, next) {
	var query = conn.query("SELECT price FROM latestPrice where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['price']);
	  });
}

//returns null if no bids for stock yet
var getHighestBidPrice = function(stockID, next) {
	var query = conn.query("SELECT MAX(bidPrice) AS highestBidPrice FROM buyOrder where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['highestBidPrice']);
	  });
}

//returns null if no asks for stock yet
var getLowestAskPrice = function(stockID, next) {
	var query = conn.query("SELECT MIN(askPrice) AS lowestAskPrice FROM sellOrder where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['lowestAskPrice']);
	  });
}

var getHighestBid = function(stockID, next) {
	var query = conn.query("SELECT buyerID, stockID, highestBidPrice, dateTime FROM buyOrder INNER JOIN "
					+ "(SELECT highestBidPrice, MIN(dateTime) AS earliestDateTime FROM  buyorder INNER JOIN ("
					+ "SELECT MAX(bidPrice) AS highestBidPrice FROM buyOrder WHERE stockID = '" + stockID
					+ "' )t1 ON stockID = '" + stockID + "' AND bidPrice = highestBidPrice)t2 ON bidPrice = highestBidPrice "
					+ "AND dateTime = earliestDateTime",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(new bidModule.Bid(result[0]['buyerID'], result[0]['stockID'], result[0]['highestBidPrice'], result[0]['dateTime']));
	  });
}

var getLowestAsk = function(stockID, next) {
	var query = conn.query("SELECT sellerID, stockID, lowestAskPrice, dateTime FROM sellOrder INNER JOIN "
					+ "(SELECT lowestAskPrice, MIN(dateTime) AS earliestDateTime FROM  sellorder INNER JOIN ("
					+ "SELECT MIN(askPrice) AS lowestAskPrice FROM sellOrder WHERE stockID = '" + stockID
					+ "' )t1 ON stockID = '" + stockID + "' AND askPrice = lowestAskPrice)t2 ON askPrice = lowestAskPrice "
					+ "AND dateTime = earliestDateTime",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 console.log(result);
		 next(new askModule.Ask(result[0]['sellerID'], result[0]['stockID'], result[0]['lowestAskPrice'], result[0]['dateTime']));
	  });
}

var retrieveAllUserCredit = function(next) {
	var query = conn.query("SELECT * FROM userCredit",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result);
	  });
}

var retrieveBuyOrders = function(stockID, next) {
	var query = conn.query("SELECT * FROM buyOrder where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 var list = new Array();
		 for (var i=0;i<result.length;i++) {
			list[i] = new bidModule.Bid(result[i]['stockID'], result[i]['bidPrice'], result[i]['buyerID'], result[i]['dateTime']);
			if (i == result.length-1) {
				next(list);
			}
		 }
		 if (result.length==0) {
			next(list);
		 }
	  });
}

var retrieveSellOrders = function(stockID, next) {
	var query = conn.query("SELECT * FROM sellOrder where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 var list = new Array();
		 for (var i=0;i<result.length;i++) {
			list[i] = new askModule.Ask(result[i]['stockID'], result[i]['askPrice'], result[i]['sellerID'], result[i]['dateTime']);
			if (i == result.length-1) {
				next(list);
			}
		 }
		 if (result.length==0) {
			next(list);
		 }
	  });
}

var updateUserCredit = function(userID, credit) {
	var query = conn.query("UPDATE userCredit SET remainingCredit = '" + credit + "' WHERE userID = '" + userID + "'",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

var updateLatestPrice = function(stockID, latestPrice) {
	var query = conn.query("UPDATE latestPrice SET price = '" + latestPrice + "' WHERE stockID = '" + stockID + "'",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

var removeBuyOrder = function(bid,next) {
	var buyerID = bid.getUserId();
	var stockID = bid.getStock();
	var date = bid.getDate(function() {
		var dateTime = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var query = conn.query("DELETE FROM buyOrder WHERE buyerID = '" + buyerID + "', stockID = '" + stockID + "', dateTime = '" + dateTime + "'",
		  function(err, result) { 
			if (err) {
				throw err;
			} else {
				next();
			}
		  });
		  
		console.log(query.sql);
		next();
	});
}

var removeSellOrder = function(ask) {
	var sellerID = ask.getUserId();
	var stockID = ask.getStock();
	var date = ask.getDate(function() {;
		var dateTime = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var query = conn.query("DELETE FROM sellOrder WHERE sellerID = '" + sellerID + "', stockID = '" + stockID + "', dateTime = '" + dateTime + "'",
		  function(err, result) { 
			if (err) {
				throw err;
			} else {
				next();
			}
		  });
		  
		console.log(query.sql);

	});
}

var clearBuyOrder = function() {
	var query = conn.query("DELETE * FROM buyOrder",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

var clearSellOrder = function() {
	var query = conn.query("DELETE * FROM sellerOrder",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

var clearUserCredit = function() {
	var query = conn.query("DELETE * FROM userCredit",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

var resetLatestPrice = function() {
	var query = conn.query("UPDATE latestPrice SET latestPrice = 0",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
}

module.exports.addBuyOrder = addBuyOrder;
module.exports.addSellOrder = addSellOrder;
module.exports.addUserCredit = addUserCredit;

module.exports.retrieveUserCredit = retrieveUserCredit;
module.exports.retrieveLatestPrice = retrieveLatestPrice;
module.exports.getHighestBidPrice = getHighestBidPrice;
module.exports.getLowestAskPrice = getLowestAskPrice;
module.exports.getHighestBid = getHighestBid;
module.exports.getLowestAsk = getLowestAsk;
module.exports.retrieveAllUserCredit = retrieveAllUserCredit;
module.exports.retrieveBuyOrders = retrieveBuyOrders;
module.exports.retrieveSellOrders = retrieveSellOrders;

module.exports.updateUserCredit = updateUserCredit;
module.exports.updateLatestPrice = updateLatestPrice;

module.exports.removeBuyOrder = removeBuyOrder;
module.exports.removeSellOrder = removeSellOrder;
module.exports.clearBuyOrder = clearBuyOrder;
module.exports.clearSellOrder = clearSellOrder;
module.exports.clearUserCredit = clearUserCredit;
module.exports.resetLatestPrice = resetLatestPrice;
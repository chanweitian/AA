<<<<<<< HEAD
var redis = require("redis");
var bidModule = require("./Bid");
var askModule = require("./Ask");

var client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});
	
var convertDateToDateTime = function(date, next) {
	next(date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}

var getNextBuyIndex = function(next) {
	client.setnx("integer buyIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			client.incr("integer buyIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addBuyOrder = function(bid, next){
	var stock = bid.getStock();
	var price = bid.getPrice();
	getNextBuyIndex(function(buyId) {
		client.zadd("sortedList buyId"+stock, price, buyId);
		client.hset("hash buyOrder"+buyId, "buyerID", bid.getUserId());
		client.hset("hash buyOrder"+buyId, "stockID", stock);
		client.hset("hash buyOrder"+buyId, "bidPrice", price);
		
		convertDateToDateTime(bid.getDate(), function(dateTime) {
			client.hset("hash buyOrder"+buyId, "dateTime", dateTime);
			next(stock);
		});
	});
}

var getNextSellIndex = function(next) {
	client.setnx("integer sellIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			client.incr("integer sellIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addSellOrder = function(ask, next){
	var stock = ask.getStock();
	var price = ask.getPrice();
	getNextSellIndex(function(sellId) {
		client.zadd("sortedList sellId"+stock, price, sellId);
		client.hset("hash sellOrder"+sellId, "sellerID", ask.getUserId());
		client.hset("hash sellOrder"+sellId, "stockID", stock);
		client.hset("hash sellOrder"+sellId, "askPrice", price);
		
		convertDateToDateTime(ask.getDate(), function(dateTime) {
			client.hset("hash sellOrder"+sellId, "dateTime", dateTime);
			next(stock);
		});
=======
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
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
	});
}

var addUserCredit = function(userID, credit){
<<<<<<< HEAD
	client.hset("hash userCredit", userID, credit);
}

var getNextMatchedIndex = function(next) {
	client.setnx("integer matchedIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			client.incr("integer matchedIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addMatchedTransaction = function(matched){
	getNextMatchedIndex(function(matchedId) {
		client.rpush("list matchedId", matchedId);
		client.hset("hash matchedTransaction"+matchedId, "buyerID", matched.getBuyerId());
		client.hset("hash matchedTransaction"+matchedId, "sellerID", matched.getSellerId());
		client.hset("hash matchedTransaction"+matchedId, "price", matched.getPrice());
		client.hset("hash matchedTransaction"+matchedId, "stockID", matched.getStock());
		
		convertDateToDateTime(matched.getDate(), function(dateTime) {
			client.hset("hash matchedTransaction"+matchedId, "dateTime", dateTime);
		});
	});
=======
	var query = conn.query("INSERT INTO userCredit SET userID = '" + userID + "', remainingCredit = '" + credit + "'",
	  function(err, result) { 
		if (err) throw err;
	  });
	  
	console.log(query.sql);
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

//returns null if user is not in usercredit table yet
var retrieveUserCredit = function(userID, next) {
<<<<<<< HEAD
	client.hget("hash userCredit", "userID", function (err, reply) {
		next(reply);
	});
=======
	var query = conn.query("SELECT remainingCredit FROM userCredit where userID = '" + userID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['remainingCredit']);
	  });
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

//returns 0 if no latest price
var retrieveLatestPrice = function(stockID, next) {
<<<<<<< HEAD
	client.hget("hash latestPrice", stockID, function(err, reply) {
		next(reply);
	});
=======
	var query = conn.query("SELECT price FROM latestPrice where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['price']);
	  });
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

//returns null if no bids for stock yet
var getHighestBidPrice = function(stockID, next) {
<<<<<<< HEAD
	client.zrange("sortedList buyId"+stockID, -1, -1, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			client.zscore("sortedList buyId"+stockID, reply[0], function(err, highestBidPrice) {
				next(highestBidPrice);
			});
		}
	});
=======
	var query = conn.query("SELECT MAX(bidPrice) AS highestBidPrice FROM buyOrder where stockID = '" + stockID + "'",
	  function(err, result) {
	     if (err) throw err;
		 console.log(query.sql);
		 next(result[0]['highestBidPrice']);
	  });
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

//returns null if no asks for stock yet
var getLowestAskPrice = function(stockID, next) {
<<<<<<< HEAD
	client.zrange("sortedList sellId"+stockID, 0, 0, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			client.zscore("sortedList sellId"+stockID, reply[0], function(err, lowestAskPrice) {
				next(lowestAskPrice);
			});
		}
	});
}

var getHighestBid = function(stockID, next) {
	client.zrange("sortedList buyId"+stockID, -1, -1, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			
			client.hgetall("hash buyOrder"+reply[0], function(err, reply2) {
				next(new bidModule.Bid(reply2["stockID"], reply2["bidPrice"], reply2["buyerID"], reply2["dateTime"], reply[0]));
			});
		}
	});
}

var getLowestAsk = function(stockID, next) {
	client.zrange("sortedList sellId"+stockID, 0, 0, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			
			client.hgetall("hash sellOrder"+reply[0], function(err, reply2) {
				next(new askModule.Ask(reply2["stockID"], reply2["askPrice"], reply2["sellerID"], reply2["dateTime"], reply[0]));
			});
		}
	});

}

var retrieveAllUserCredit = function(next) {
	var userArr;
	var creditArr;
	var counter = 0;
	
	client.hkeys("hash userCredit", function(err, reply1) {
		userArr = reply1;
		counter++;
		
		if (counter==2) {
			next(userArr, creditArr);
		}
	});
	
	client.hvals("hash userCredit", function(err, reply2) {
		creditArr = reply2;
		counter++;
		if (counter==2) {
			next(userArr, creditArr);
		}
	});
	
}

var retrieveBuyOrders = function(stockID, next) {
	var list = new Array();
	client.zrange("sortedList buyId"+stockID, 0, -1, function (err, allBuyId) {
		allBuyId.forEach(function (buyId, i) {
			client.hgetall("hash buyOrder"+buyId, function (err, reply) {
				list[i] = reply;
				if (i == allBuyId.length-1) {
					next(list);
				}
			});
		});
		if (allBuyId.length==0) {
			next(list);
		}
	});
		
}

var retrieveSellOrders = function(stockID, next) {
	var list = new Array();
	client.zrange("sortedList sellId"+stockID, 0, -1, function (err, allSellId) {
		allSellId.forEach(function (sellId, i) {
			client.hgetall("hash sellOrder"+sellId, function (err, reply) {
				list[i] = reply;
				if (i == allSellId.length-1) {
					next(list);
				}
			});
		});
		if (allSellId.length==0) {
			next(list);
		}
	});
}

var updateUserCredit = function(userID, credit) {
	client.hset("hash userCredit", userID, credit);
}

var updateLatestPrice = function(stockID, latestPrice) {
	client.hset("hash latestPrice", stockID, latestPrice);
}

var removeBuyOrder = function(bid) {
	client.zrem("sortedList buyId"+bid.getStock(), bid.getBuyId());
	client.del("buyOrder"+bid.getBuyId());
}

var removeSellOrder = function(ask) {
	client.zrem("sortedList sellId"+ask.getStock(), ask.getSellId());
	client.del("sellOrder"+ask.getSellId());
}

/*
var removeMatchedTransaction = function(ask) {
	client.zrem("sortedList sellId"+ask.getStock(), ask.getBuyID());
	client.del("sellOrder"+sellId);
}
*/

var flushdb = function(next) {
	client.flushdb();
	next();
=======
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
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8
}

module.exports.addBuyOrder = addBuyOrder;
module.exports.addSellOrder = addSellOrder;
module.exports.addUserCredit = addUserCredit;
<<<<<<< HEAD
module.exports.addMatchedTransaction = addMatchedTransaction;
=======
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8

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
<<<<<<< HEAD
module.exports.flushdb = flushdb;
=======
module.exports.clearBuyOrder = clearBuyOrder;
module.exports.clearSellOrder = clearSellOrder;
module.exports.clearUserCredit = clearUserCredit;
module.exports.resetLatestPrice = resetLatestPrice;
>>>>>>> 84707d54824231fdc2b732dfb59ba044f31039d8

//var redis = require("redis");
var bidModule = require("./Bid");
var askModule = require("./Ask");
var matchedTransactionModule = require("./MatchedTransaction");

var sentinel = require('redis-sentinel');

// List the sentinel endpoints
var endpoints = [
    {host: '127.0.0.1', port: 26379},
    {host: '127.0.0.1', port: 26380}
];

var opts = {}; // Standard node_redis client options
var masterName = 'mymaster';

// An equivalent way of doing the above (if you don't want to have to pass the endpoints around all the time) is
var writeClient = sentinel.createClient(endpoints, masterName, {role: 'master'}); 
var readClient = sentinel.createClient(endpoints, masterName, {role: 'slave'});

readClient.on("error", function (err) {
    console.log("Error coming from ReadClient " + err);
});

writeClient.on("error", function (err) {
    console.log("Error coming from WriteClient" + err);
});

var convertDateToDateTime = function(date, next) {
	next(date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " "  + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}

var getNextBuyIndex = function(next) {
	writeClient.setnx("integer buyIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			writeClient.incr("integer buyIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addBuyOrder = function(bid, next){
	var stock = bid.getStock();
	var price = bid.getPrice();
	getNextBuyIndex(function(buyId) {
		writeClient.zadd("sortedList buyId"+stock, price, buyId);
		writeClient.hset("hash buyOrder"+buyId, "buyerID", bid.getUserId());
		writeClient.hset("hash buyOrder"+buyId, "stockID", stock);
		writeClient.hset("hash buyOrder"+buyId, "bidPrice", price);
		
		convertDateToDateTime(bid.getDate(), function(dateTime) {
			writeClient.hset("hash buyOrder"+buyId, "dateTime", dateTime);
			next(stock);
		});
	});
}

var getNextSellIndex = function(next) {
	writeClient.setnx("integer sellIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			writeClient.incr("integer sellIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addSellOrder = function(ask, next){
	var stock = ask.getStock();
	var price = ask.getPrice();
	getNextSellIndex(function(sellId) {
		writeClient.zadd("sortedList sellId"+stock, price, sellId);
		writeClient.hset("hash sellOrder"+sellId, "sellerID", ask.getUserId());
		writeClient.hset("hash sellOrder"+sellId, "stockID", stock);
		writeClient.hset("hash sellOrder"+sellId, "askPrice", price);
		
		convertDateToDateTime(ask.getDate(), function(dateTime) {
			writeClient.hset("hash sellOrder"+sellId, "dateTime", dateTime);
			next(stock);
		});
	});
}

var addUserCredit = function(userID, credit){
	writeClient.hset("hash userCredit", userID, credit);
}

var getNextMatchedIndex = function(next) {
	writeClient.setnx("integer matchedIndex", 1, function (err, reply) {
		if (reply == 1) {
			next(1);
		} else {
			writeClient.incr("integer matchedIndex", function(err, incrReply) {
				next(incrReply);
			});
		}
	});
}

var addMatchedTransaction = function(matched,multi,next){
	getNextMatchedIndex(function(matchedId) {
		matched.setMatchedId(matchedId);
		multi.sadd("set matchedId", matchedId);
		multi.hset("hash matchedTransaction"+matchedId, "buyerID", matched.getBuyerId());
		multi.hset("hash matchedTransaction"+matchedId, "sellerID", matched.getSellerId());
		multi.hset("hash matchedTransaction"+matchedId, "price", matched.getPrice());
		multi.hset("hash matchedTransaction"+matchedId, "stockID", matched.getStock());
		
		convertDateToDateTime(matched.getDate(), function(dateTime) {
			multi.hset("hash matchedTransaction"+matchedId, "dateTime", dateTime);
			next(true,matched);
		});
	});
}

//returns null if user is not in usercredit table yet
var retrieveUserCredit = function(userID, next) {
	readClient.hget("hash userCredit", userID, function (err, reply) {
		next(reply);
	});
}

//returns 0 if no latest price
var retrieveLatestPrice = function(stockID, next) {
	readClient.hget("hash latestPrice", stockID, function(err, reply) {
		next(reply);
	});
}

//returns null if no bids for stock yet
var getHighestBidPrice = function(stockID, next) {
	readClient.zrange("sortedList buyId"+stockID, -1, -1, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			readClient.zscore("sortedList buyId"+stockID, reply[0], function(err, highestBidPrice) {
				next(highestBidPrice);
			});
		}
	});
}

//returns null if no asks for stock yet
var getLowestAskPrice = function(stockID, next) {
	readClient.zrange("sortedList sellId"+stockID, 0, 0, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			readClient.zscore("sortedList sellId"+stockID, reply[0], function(err, lowestAskPrice) {
				next(lowestAskPrice);
			});
		}
	});
}

var getHighestBid = function(stockID, next) {
	readClient.zrange("sortedList buyId"+stockID, -1, -1, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			
			readClient.hgetall("hash buyOrder"+reply[0], function(err, reply2) {
				next(new bidModule.Bid(reply2["stockID"], reply2["bidPrice"], reply2["buyerID"], reply2["dateTime"], reply[0]));
			});
		}
	});
}

var getLowestAsk = function(stockID, next) {
	readClient.zrange("sortedList sellId"+stockID, 0, 0, function (err, reply) {
		if (reply[0] == null) {
			next(null);
		} else {
			
			readClient.hgetall("hash sellOrder"+reply[0], function(err, reply2) {
				next(new askModule.Ask(reply2["stockID"], reply2["askPrice"], reply2["sellerID"], reply2["dateTime"], reply[0]));
			});
		}
	});

}

var retrieveAllUserCredit = function(next) {
	var userArr;
	var creditArr;
	var counter = 0;
	
	readClient.hkeys("hash userCredit", function(err, reply1) {
		userArr = reply1;
		counter++;
		
		if (counter==2) {
			next(userArr, creditArr);
		}
	});
	
	readClient.hvals("hash userCredit", function(err, reply2) {
		creditArr = reply2;
		counter++;
		if (counter==2) {
			next(userArr, creditArr);
		}
	});
	
}

var retrieveBuyOrders = function(stockID, next) {
	var list = new Array();
	readClient.zrange("sortedList buyId"+stockID, 0, -1, function (err, allBuyId) {
		allBuyId.forEach(function (buyId, i) {
			readClient.hgetall("hash buyOrder"+buyId, function (err, reply) {
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
	readClient.zrange("sortedList sellId"+stockID, 0, -1, function(err, allSellId) {
		allSellId.forEach(function (sellId, i) {
			readClient.hgetall("hash sellOrder"+sellId, function(err, reply) {
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

var retrieveMatchedTransactions = function(next) {
	var list = new Array();
	readClient.smembers("set matchedId", function(err, allMatchedId) {
		allMatchedId.forEach(function (matchedId, i) {
			readClient.hgetall("hash matchedTransaction"+matchedId, function(err, reply) {
				list[i] = new matchedTransactionModule.MatchedTransaction(reply.BuyerID, reply.SellerID, reply.dateTime, reply.price, reply.stockID);
				if (i == allMatchedId.length-1) {
					next(list);
				}
			});
		});
		if (allMatchedId.length==0) {
			next(list);
		};
	});
}

var updateUserCredit = function(userID, credit) {
	writeClient.hset("hash userCredit", userID, credit);
}

var updateLatestPrice = function(stockID, latestPrice) {
	writeClient.hset("hash latestPrice", stockID, latestPrice);
}

var removeBuyOrder = function(bid,multi,next) {
	multi.zrem("sortedList buyId"+bid.getStock(), bid.getBuyId());
	multi.del("hash buyOrder"+bid.getBuyId());
	next(true);
}

var removeSellOrder = function(ask,multi,next) {
	multi.zrem("sortedList sellId"+ask.getStock(), ask.getSellId());
	multi.del("hash sellOrder"+ask.getSellId());
	next(true);
}

var removeMatchedTransaction = function(matched) {
	writeClient.srem("set matchedId", matched.getMatchedId());
	writeClient.del("hash matchedTransaction"+matched.getMatchedId());
}

var flushdb = function(next) {
	writeClient.flushdb();
	next();
}

var startMatchingTransaction = function(sellId, buyId, next) {
	writeClient.watch("buyOrder"+buyId);
	writeClient.watch("sellOrder"+sellId);
	var multi = writeClient.multi();
	next(multi);
}

var executeMatchingTransaction = function(multi,next) {
	multi.exec(function(err,replies) {
		next(err,replies);
	});
}
	

module.exports.addBuyOrder = addBuyOrder;
module.exports.addSellOrder = addSellOrder;
module.exports.addUserCredit = addUserCredit;
module.exports.addMatchedTransaction = addMatchedTransaction;

module.exports.retrieveUserCredit = retrieveUserCredit;
module.exports.retrieveLatestPrice = retrieveLatestPrice;
module.exports.getHighestBidPrice = getHighestBidPrice;
module.exports.getLowestAskPrice = getLowestAskPrice;
module.exports.getHighestBid = getHighestBid;
module.exports.getLowestAsk = getLowestAsk;
module.exports.retrieveAllUserCredit = retrieveAllUserCredit;
module.exports.retrieveBuyOrders = retrieveBuyOrders;
module.exports.retrieveSellOrders = retrieveSellOrders;
module.exports.retrieveMatchedTransactions = retrieveMatchedTransactions;
module.exports.updateUserCredit = updateUserCredit;
module.exports.updateLatestPrice = updateLatestPrice;

module.exports.removeBuyOrder = removeBuyOrder;
module.exports.removeSellOrder = removeSellOrder;
module.exports.removeMatchedTransaction = removeMatchedTransaction;
module.exports.flushdb = flushdb;

module.exports.startMatchingTransaction = startMatchingTransaction;
module.exports.executeMatchingTransaction = executeMatchingTransaction;

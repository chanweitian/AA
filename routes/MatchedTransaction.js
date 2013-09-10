// constructor function
function MatchedTransaction (bid, ask, date, price) {
 	this.bid = bid;
 	this.ask = ask;
 	this.date = date;
 	this.price = price;
 	this.stock = bid.getStock();
}

MatchedTransaction.prototype.getStock = function(){
	return this.stock;
}

MatchedTransaction.prototype.getPrice = function(){
	return this.price;
}

MatchedTransaction.prototype.getBuyerId = function(){
	return this.bid.getUserId;
}

MatchedTransaction.prototype.getSellerId = function(){
	return this.ask.getUserId;
}

MatchedTransaction.prototype.getDate = function(){
	return this.date;
}

MatchedTransaction.prototype.toString = function(){
	return "stock: " + this.stock + ", amt: " + this.price + ", bidder userId: " + this.bid.getUserId() + ", seller userId: " + this.ask.getUserId() + ", date: " + this.date;
}

module.exports.MatchedTransaction = MatchedTransaction;
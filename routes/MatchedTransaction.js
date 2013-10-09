// constructor function
function MatchedTransaction (buyerId, sellerId, date, price, stock) {
 	this.buyerId = buyerId;
 	this.sellerId = sellerId;
	this.date = date;
	this.price = price;
	this.stock = stock;
}

MatchedTransaction.prototype.getStock = function(){
	return this.stock;
}

MatchedTransaction.prototype.getPrice = function(){
	return this.price;
}

MatchedTransaction.prototype.getBuyerId = function(){
	return this.buyerId;
}

MatchedTransaction.prototype.getSellerId = function(){
	return this.sellerId;
}

MatchedTransaction.prototype.getDate = function(){
	return this.date;
}

MatchedTransaction.prototype.toString = function(){
	return "stock: " + this.stock + ", amt: " + this.price + ", bidder userId: " + this.buyerId + ", seller userId: " + this.sellerId + ", date: " + this.date;
}

module.exports.MatchedTransaction = MatchedTransaction;
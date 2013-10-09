// constructor function
function Bid (stock, price, userId, date, buyId) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = date;
	this.buyId = buyId;
}

Bid.prototype.getStock = function(){
	return this.stock;
}

Bid.prototype.getPrice = function(){
	return this.price;
}

Bid.prototype.getUserId = function(){
	return this.userId;
}

Bid.prototype.getDate = function(){
	return this.date;
}

Bid.prototype.getBuyId = function(){
	return this.buyId;
}

Bid.prototype.toString = function(){
	return "stock: " + this.stock + ", price: " + this.price + ", userId: " + this.userId + ", date: " + this.date; 
}

module.exports.Bid = Bid;
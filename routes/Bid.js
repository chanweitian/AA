// constructor function
function Bid (stock, price, userId) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = new Date();
}

// constructor function
function Bid (stock, price, userId, date) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = date;
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

Bid.prototype.toString = function(){
	return "stock: " + this.stock + ", price: " + this.price + ", userId: " + this.userId + ", date: " + this.date; 
}

module.exports.Bid = Bid;
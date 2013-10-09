// constructor function
function Ask (stock, price, userId) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = new Date();
}

// constructor function
function Ask (stock, price, userId, date) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = date;
}

Ask.prototype.getStock = function(){
	return this.stock;
}

Ask.prototype.getPrice = function(){
	return this.price;
}

Ask.prototype.getUserId = function(){
	return this.userId;
}

Ask.prototype.getDate = function(){
	return this.date;
}

Ask.prototype.toString = function(){
	return "stock: " + this.stock + ", price: " + this.price + ", userId: " + this.userId + ", date: " + this.date; 
}

module.exports.Ask = Ask;
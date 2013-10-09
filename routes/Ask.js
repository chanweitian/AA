// constructor function
function Ask (stock, price, userId, date, sellId) {
 	this.stock = stock;
 	this.price = price;
 	this.userId = userId;
 	this.date = date;
	this.sellId = sellId;
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

Ask.prototype.getSellId = function(){
	return this.sellId;
}

Ask.prototype.toString = function(){
	return "stock: " + this.stock + ", price: " + this.price + ", userId: " + this.userId + ", date: " + this.date; 
}

module.exports.Ask = Ask;
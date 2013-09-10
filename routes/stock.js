 var bidModule = require("./Bid");
 var askModule = require("./Ask");
 var exchange = require("./exchange");

 function displayBuyPage(req, res) {
 	res.render('buy',{user_id: req.session.user_id});
 }

 function processBuy(req,res){
 	var user_id = req.session.user_id;
 	var stock = req.body.stock;
 	var bidPrice = req.body.bidprice;

 	/*submit buy request 
 	 to replace with 
	- boolean bidIsAccepted */

	var newBid = new bidModule.Bid(stock, bidPrice, user_id);

	exchange.placeNewBidAndAttemptMatch(newBid, function(err, bidIsAccepted){
		req.session.stock = stock;
		req.session.bidPrice = bidPrice;
		
		if (bidIsAccepted){
			res.redirect('buySuccess');
		} else {
			res.redirect('buyFail');
		}
	}); 
}

function displayBuySuccessPage(req,res){
	res.render('buySuccess', {
		user_id: req.session.user_id,
		stock: req.session.stock,
		bidPrice: req.session.bidPrice
	});;
}

function displayBuyFailPage(req,res){
	res.render('buyFail', {
		user_id: req.session.user_id,
		stock: req.session.stock,
		bidPrice: req.session.bidPrice
	});
}

function displaySellPage(req, res) {
	res.render('sell',{user_id: req.session.user_id});
}

function processSell(req,res){
	var user_id = req.session.user_id;
	var stock = req.body.stock;
	var askPrice = req.body.askprice;

	var newAsk = new askModule.Ask(stock, askPrice, user_id);

 	exchange.placeNewAskAndAttemptMatch(newAsk, function(err){
 		res.render('sellSuccess', {
	 		user_id: req.session.user_id,
	 		stock: stock,
	 		askPrice: askPrice
 		});
 	});
 }

 function displayCurrentPage(req,res){

 	var TOTAL_COUNTER = 9;
 	var counter = 0;
	var latestPrice_SMU;
	var highestBidPrice_SMU;
	var lowestAskPrice_SMU;
	var latestPrice_NUS;
	var highestBidPrice_NUS;
	var lowestAskPrice_NUS;
	var latestPrice_NTU;
	var highestBidPrice_NTU;
	var lowestAskPrice_NTU;

 	exchange.getLatestPrice("smu", function(err, price){
 		latestPrice_SMU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	exchange.getHighestBidPrice("smu", function(err,price){
 		highestBidPrice_SMU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});


 	exchange.getLowestAskPrice("smu", function(err,price){
 		lowestAskPrice_SMU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	exchange.getLatestPrice("nus", function(err, price){
 		latestPrice_NUS = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	exchange.getHighestBidPrice("nus", function(err,price){
 		highestBidPrice_NUS = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});


 	exchange.getLowestAskPrice("nus", function(err,price){
 		lowestAskPrice_NUS = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	exchange.getLatestPrice("ntu", function(err, price){
 		latestPrice_NTU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	exchange.getHighestBidPrice("ntu", function(err,price){
 		highestBidPrice_NTU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});


 	exchange.getLowestAskPrice("ntu", function(err,price){
 		lowestAskPrice_NTU = price;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

 	
	function finalNext(){
	 	res.render('current', {
	 		latestPrice_SMU: latestPrice_SMU,
	 		highestBidPrice_SMU: highestBidPrice_SMU,
	 		lowestAskPrice_SMU: lowestAskPrice_SMU,
	 		latestPrice_NUS: latestPrice_NUS,
	 		highestBidPrice_NUS: highestBidPrice_NUS,
	 		lowestAskPrice_NUS: lowestAskPrice_NUS,
	 		latestPrice_NTU: latestPrice_NTU,
	 		highestBidPrice_NTU: highestBidPrice_NTU,
	 		lowestAskPrice_NTU: lowestAskPrice_NTU
	 	});
 	}
 }

 function displayOrdersPage(req,res){

 	var TOTAL_COUNTER = 7;
 	var counter = 0;
 	var unfulfilledBids_SMU;
 	var unfulfilledAsks_SMU;
 	var unfulfilledBids_NUS;
	var unfulfilledAsks_NUS;
	var unfulfilledBids_NTU;
	var unfulfilledAsks_NTU;
	var creditRemaining;



 	exchange.getUnfulfilledBidsForDisplay("smu", function(err, list){
 		unfulfilledBids_SMU = list.result;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});
	
	exchange.getUnfulfilledAsks("smu", function(err, list){
		unfulfilledAsks_SMU = list.result;
		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
	});

	exchange.getUnfulfilledBidsForDisplay("nus", function(err, list){
 		unfulfilledBids_NUS = list.result;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});
	
	exchange.getUnfulfilledAsks("nus", function(err, list){
		unfulfilledAsks_NUS = list.result;
		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
	});

 	exchange.getUnfulfilledBidsForDisplay("ntu", function(err, list){
 		unfulfilledBids_NTU = list.result;
 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});
	
	exchange.getUnfulfilledAsks("ntu", function(err, list){
		unfulfilledAsks_NTU = list.result;
		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
	});

 	exchange.getAllCreditRemainingForDisplay(function (err,list){
 		creditRemaining = list;
 		console.log("creditRemaining: "+creditRemaining[1].id);

 		counter++;
 		if (counter == TOTAL_COUNTER){
 			finalNext();
 		}
 	});

	

	function finalNext(){
		console.log("rendering view: "+unfulfilledBids_SMU[1]);
	 	
	 	res.render('viewOrders', {
	 		unfulfilledBids_SMU:unfulfilledBids_SMU,
	 		unfulfilledAsks_SMU:unfulfilledAsks_SMU,
	 		unfulfilledBids_NUS:unfulfilledBids_NUS,
	 		unfulfilledAsks_NUS:unfulfilledAsks_NUS,
	 		unfulfilledBids_NTU:unfulfilledBids_NTU,
	 		unfulfilledAsks_NTU:unfulfilledAsks_NTU,
	 		creditRemaining:creditRemaining
	 	});
 	}
 }

 module.exports.displayBuyPage = displayBuyPage;
 module.exports.processBuy = processBuy;
 module.exports.displayBuySuccessPage = displayBuySuccessPage;
 module.exports.displayBuyFailPage = displayBuyFailPage;

 module.exports.displaySellPage = displaySellPage;
 module.exports.processSell = processSell;

 module.exports.displayCurrentPage = displayCurrentPage;

 module.exports.displayOrdersPage = displayOrdersPage;

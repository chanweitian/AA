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

 	/*

 	latestPrice_SMU: exchange.getLatestPrice("smu");
 	highestBidPrice_SMU: exchange.getHighestBidPrice("smu");
 	lowestAskPrice_SMU: exchange.getLowestAskPrice("smu");
 	latestPrice_NUS: exchange.getLatestPrice("nus");
 	highestBidPrice_NUS: exchange.getHighestBidPrice("nus");
 	lowestAskPrice_NUS: exchange.getLowestAskPrice("nus");
 	latestPrice_NTU: exchange.getLatestPrice("ntu");
 	highestBidPrice_NTU: exchange.getHighestBidPrice("ntu");
 	lowestAskPrice_NTU: exchange.getLowestAskPrice("ntu");

 	*/

 	res.render('current', {
 		latestPrice_SMU: 0,
 		highestBidPrice_SMU: 0,
 		lowestAskPrice_SMU: 0,
 		latestPrice_NUS: 0,
 		highestBidPrice_NUS: 0,
 		lowestAskPrice_NUS: 0,
 		latestPrice_NTU: 0,
 		highestBidPrice_NTU: 0,
 		lowestAskPrice_NTU: 0
 	});
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

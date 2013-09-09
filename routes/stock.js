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

 	//exchange.placeNewAskAndAttemptMatch(newAsk);

 	res.render('sellSuccess', {
 		user_id: req.session.user_id,
 		stock: req.session.stock,
 		askPrice: req.session.askPrice
 	});;
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

 /*	unfulfilledBids_SMU:exchange.getUnfulfilledBidsForDisplay("smu");
 	unfulfilledAsks_SMU:exchange.getUnfulfilledAsks("smu");
 	unfulfilledBids_NUS:exchange.getUnfulfilledBidsForDisplay("nus");
 	unfulfilledAsks_NUS:exchange.getUnfulfilledAsks("nus");
 	unfulfilledBids_NTU:exchange.getUnfulfilledBidsForDisplay("ntu");
 	unfulfilledAsks_NTU:exchange.getUnfulfilledAsks("ntu");
 	creditRemaining:exchange.getAllCreditRemainingForDisplay();

*/
 	res.render('viewOrders', {
 		unfulfilledBids_SMU:0,
 		unfulfilledAsks_SMU:0,
 		unfulfilledBids_NUS:0,
 		unfulfilledAsks_NUS:0,
 		unfulfilledBids_NTU:0,
 		unfulfilledAsks_NTU:0,
 		creditRemaining:0
 	});
 }

 module.exports.displayBuyPage = displayBuyPage;
 module.exports.processBuy = processBuy;
 module.exports.displayBuySuccessPage = displayBuySuccessPage;
 module.exports.displayBuyFailPage = displayBuyFailPage;

 module.exports.displaySellPage = displaySellPage;
 module.exports.processSell = processSell;

 module.exports.displayCurrentPage = displayCurrentPage;

 module.exports.displayOrdersPage = displayOrdersPage;

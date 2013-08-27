 function displayBuyPage(req, res) {
 	res.render('buy',{user_id: req.session.user_id});
 }

 function processBuy(req,res){
 	var user_id = req.session.user_id;
 	var stock = req.body.stock;
 	var bidPrice = req.body.bidprice;
 	
 	/*submit buy request 
 	 to replace with 
	- boolean bidIsAccepted 
			= exchangeBean.placeNewBidAndAttemptMatch(newBid); */
 	var bidIsAccepted = true;

 	if (bidIsAccepted){

 		req.session.stock = stock;
 		req.session.bidPrice = bidPrice;
 		res.redirect('buySuccess');
 	} else {
 		res.redirect('buyFail');
 	}
 }

 function displayBuySuccessPage (req, res) {
 	var user_id = req.session.user_id;
 	var stock = req.session.stock;
 	var bidPrice = req.session.bidPrice;

 	res.render('buySuccess', {
 		user_id: user_id,
 		stock: stock,
 		bidPrice: bidPrice
 	});
 }

 function displayBuyFailPage (req,res) {

 }





 module.exports.displayBuyPage = displayBuyPage;
 module.exports.processBuy = processBuy;
 module.exports.displayBuySuccessPage = displayBuySuccessPage;
 module.exports.displayBuyFailPage = displayBuyFailPage;
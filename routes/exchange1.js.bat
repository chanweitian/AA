





function Exchange(){

  // location of log files - change if necessary
  //this.MATCH_LOG_FILE = "c:\\temp\\matched.log";
  //this.REJECTED_BUY_ORDERS_LOG_FILE = "c:\\temp\\rejected.log";

  // used to calculate remaining credit available for buyers
  this.DAILY_CREDIT_LIMIT_FOR_BUYERS = 1000000;

  // used for keeping track of unfulfilled asks and bids in the system.
  // once asks or bids are matched, they must be removed from these arraylists.
  this.unfulfilledAsks = new Array();
  this.unfulfilledBids = new Array();

  // used to keep track of all matched transactions (asks/bids) in the system
  // matchedTransactions is cleaned once the records are written to the log file successfully
  this.matchedTransactions = new Array();

  // keeps track of the latest price for each of the 3 stocks


  this.latestPriceForSmu = -1;
  this.latestPriceForNus = -1;
  this.latestPriceForNtu = -1;

  // keeps track of the remaining credit limits of each buyer. This should be
  // checked every time a buy order is submitted. Buy orders that breach the
  // credit limit should be rejected and logged
  // The key for this Hashtable is the user ID of the buyer, and the corresponding value is the REMAINING credit limit
  // the remaining credit limit should not go below 0 under any circumstance!
  this.creditRemaining = new Array();



}

  // This function is to simulate query of DB.
  Exchange.prototype.queryDB = function(arg, callback){
    console.log('do something with \''+arg+'\', return 1 sec later');
    setTimeout(function() { callback(arg * 2); }, 1000);
  }

  // this method is called once at the end of each trading day. It can be called manually, or by a timed daemon
  // this is a good chance to "clean up" everything to get ready for the next trading day
	function endTradingDay(){
    // reset attributes
    latestPriceForSmu = -1;
    latestPriceForNus = -1;
    latestPriceForNtu = -1;

    // dump all unfulfilled buy and sell orders
    unfulfilledAsks = [];
    unfulfilledBids = [];

    // reset all credit limits of users
    creditRemaining = {};

	}

  // returns a String of unfulfilled bids for a particular stock
  // returns an empty string if no such bid
  // bids are separated by <br> for display on HTML page
  function getUnfulfilledBidsForDisplay(stock) {
    var returnString = "";
    for (var i = 0; i < unfulfilledBids.length(); i++) {
      var bid = unfulfilledBids[i];
      if (bid.stock.equals(stock)) {
        returnString += bid + "<br />";
      }
    }
    return returnString;
  }

  // returns a String of unfulfilled asks for a particular stock
  // returns an empty string if no such ask
  // asks are separated by <br> for display on HTML page
  function getUnfulfilledAsks(stock) {
    var returnString = "";
    for (var i = 0; i < unfulfilledAsks.length(); i++) {
      var ask = unfulfilledAsks[i];
      if (ask.stock().equals(stock)) {
        returnString += ask + "<br />";
      }
    }
    return returnString;
  }


  // returns the highest bid for a particular stock
  // returns -1 if there is no bid at all
  function getHighestBidPrice(stock) {
    var highestBid = getHighestBid(stock);
    if (highestBid == null) {
      return -1;
    } else {
      return highestBid.price();
    }
  }

  // retrieve unfulfiled current (highest) bid for a particular stock
  // returns null if there is no unfulfiled bid for this stock
  function getHighestBid(stock) {
    var highestBid = {};
    for (int i = 0; i < unfulfilledBids.size(); i++) {
      Bid bid = unfulfilledBids.get(i);
      if (bid.stock().equals(stock) && bid.price() >= highestBid.price()) {
        // if there are 2 bids of the same amount, the earlier one is considered the highest bid
        if (bid.price() == highestBid.price()) {
          // compare dates
          if (bid.getDate().getTime() < highestBid.getDate().getTime()) {
            highestBid = bid;
          }
        } else {
          highestBid = bid;
        }
      }
    }
    if (highestBid.userId() == null) {
      return null; // there's no unfulfilled bid at all!
    }
    return highestBid;
  }

  // returns the lowest ask for a particular stock
  // returns -1 if there is no ask at all
  function getLowestAskPrice (stock) {
    var lowestAsk = getLowestAsk(stock);
    if (lowestAsk == null) {
      return -1;
    } else {
      return lowestAsk.price();
    }
  }

  // retrieve unfulfiled current (lowest) ask for a particular stock
  // returns null if there is no unfulfiled asks for this stock
  function getLowestAsk(stock) {
    var lowestAsk = {};
    for (var i = 0; i < unfulfilledAsks.size(); i++) {
      var ask = unfulfilledAsks.get(i);
      if (ask.stock().equals(stock) && ask.price() <= lowestAsk.price()) {
        // if there are 2 asks of the same ask amount, the earlier one is considered the highest ask
        if (ask.price() == lowestAsk.price()) {
          // compare dates
          if (ask.getDate().getTime() < lowestAsk.getDate().getTime()) {
            lowestAsk = ask;
          }
        } else {
          lowestAsk = ask;
        }
      }
    }
    if (lowestAsk.userId() == null) {
      return null; // there's no unfulfilled asks at all!
    }
    return lowestAsk;
  }

  // get credit remaining for a particular buyer
  function getCreditRemaining(buyerUserId){
    if (!(creditRemaining.hasOwnProperty(buyerUserId))){
      // this buyer is not in the hash table yet. hence create a new entry for him
      creditRemaining[buyerUserId] = DAILY_CREDIT_LIMIT_FOR_BUYERS;
    }
    return creditRemaining[buyerUserId];
  }

  // check if a buyer is eligible to place an order based on his credit limit
  // if he is eligible, this method adjusts his credit limit and returns true
  // if he is not eligible, this method logs the bid and returns false
  function validateCreditLimit(bid){
    // calculate the total price of this bid
    int totalPriceOfBid = bid.price * 1000; // each bid is for 1000 shares
    int remainingCredit = getCreditRemaining(bid.userId());
    int newRemainingCredit = remainingCredit - totalPriceOfBid;

    if (newRemainingCredit < 0){
      // no go - log failed bid and return false
      logRejectedBuyOrder(bid);
      return false;
    }
    else {
      // it's ok - adjust credit limit and return true
      // [DB] Write new credit limit to database 
      creditRemaining[b.userId()] = newRemainingCredit;
      return true;
    }
  }

  // call this to append all rejected buy orders to log file
  /*
  function logRejectedBuyOrder(b) {
    try {
      PrintWriter outFile = new PrintWriter(new FileWriter(REJECTED_BUY_ORDERS_LOG_FILE, true));
      outFile.append(b.toString() + "\n");
      outFile.close();
    } catch (IOException e) {
      // Think about what should happen here...
      System.out.println("IO EXCEPTIOn: Cannot write to file");
      e.printStackTrace();
    } catch (Exception e) {
      // Think about what should happen here...
      System.out.println("EXCEPTION: Cannot write to file");
      e.printStackTrace();
    }
  }

  // call this to append all matched transactions in matchedTransactions to log file and clear matchedTransactions
  private void logMatchedTransactions() {
    try {
      PrintWriter outFile = new PrintWriter(new FileWriter(MATCH_LOG_FILE, true));
      for (MatchedTransaction m : matchedTransactions) {
        outFile.append(m.toString() + "\n");
      }
      matchedTransactions.clear(); // clean this out
      outFile.close();
    } catch (IOException e) {
      // Think about what should happen here...
      System.out.println("IO EXCEPTIOn: Cannot write to file");
      e.printStackTrace();
    } catch (Exception e) {
      // Think about what should happen here...
      System.out.println("EXCEPTION: Cannot write to file");
      e.printStackTrace();
    }
  }

  // returns a string of HTML table rows code containing the list of user IDs and their remaining credits
  // this method is used by viewOrders.jsp for debugging purposes
  function getAllCreditRemainingForDisplay(){
    String returnString = "";

    Enumeration items = creditRemaining.keys();

    while (items.hasMoreElements()){
      String key = (String)items.nextElement();
      int value = creditRemaining.get(key);
      returnString += "<tr><td>" + key + "</td><td>" + value + "</td></tr>";
    }
    return returnString;
  }*/

  // call this method immediatley when a new bid (buying order) comes in
  // this method returns false if this buy order has been rejected because of a credit limit breach
  // it returns true if the bid has been successfully added
  function placeNewBidAndAttemptMatch(newBid) {
    // step 0: check if this bid is valid based on the buyer's credit limit

    validateCreditLimit(newBid, err, )

    boolean okToContinue = validateCreditLimit(newBid);
    if (!okToContinue){
      return false;
    }

    // step 1: insert new bid into unfulfilledBids
    // Write to DB!!
    unfulfilledBids.add(newBid);

    // step 2: check if there is any unfulfilled asks (sell orders) for the new bid's stock. if not, just return
    // count keeps track of the number of unfulfilled asks for this stock
    /*
        database.query('something', function(err, result){
          
        })
    */

    int count = 0;
    for (int i = 0; i < unfulfilledAsks.size(); i++) {
      if (unfulfilledAsks[i].stock().equals(newBid.stock())) {
        count++;
      }
    }
    if (count == 0) {
      return true; // no unfulfilled asks of the same stock
    }

    // step 3: identify the current/highest bid in unfulfilledBids of the same stock
    Bid highestBid = getHighestBid(newBid.stock());

    // step 4: identify the current/lowest ask in unfulfilledAsks of the same stock
    Ask lowestAsk = getLowestAsk(newBid.stock());

    // step 5: check if there is a match.
    // A match happens if the highest bid is bigger or equal to the lowest ask
    if (highestBid.price() >= lowestAsk.price()) {
      // a match is found!
      unfulfilledBids.remove(highestBid);
      unfulfilledAsks.remove(lowestAsk);
      // this is a BUYING trade - the transaction happens at the higest bid's timestamp, and the transaction price happens at the lowest ask
      MatchedTransaction match = new MatchedTransaction(highestBid, lowestAsk, highestBid.getDate(), lowestAsk.price());
      matchedTransactions.add(match);

      // to be included here: inform Back Office Server of match
      // to be done in v1.0

      updateLatestPrice(match);
      logMatchedTransactions();
    }

    return true; // this bid is acknowledged
  }

  // call this method immediatley when a new ask (selling order) comes in
  function placeNewAskAndAttemptMatch(Ask newAsk) {
    // step 1: insert new ask into unfulfilledAsks
    unfulfilledAsks.add(newAsk);

    // step 2: check if there is any unfulfilled bids (buy orders) for the new ask's stock. if not, just return
    // count keeps track of the number of unfulfilled bids for this stock
    int count = 0;
    for (int i = 0; i < unfulfilledBids.size(); i++) {
      if (unfulfilledBids.get(i).stock().equals(newAsk.stock())) {
        count++;
      }
    }
    if (count == 0) {
      return; // no unfulfilled asks of the same stock
    }

    // step 3: identify the current/highest bid in unfulfilledBids of the same stock
    Bid highestBid = getHighestBid(newAsk.stock());

    // step 4: identify the current/lowest ask in unfulfilledAsks of the same stock
    Ask lowestAsk = getLowestAsk(newAsk.stock());


    // step 5: check if there is a match.
    // A match happens if the lowest ask is <= highest bid
    if (lowestAsk.price() <= highestBid.price()) {
      // a match is found!
      unfulfilledBids.remove(highestBid);
      unfulfilledAsks.remove(lowestAsk);
      // this is a SELLING trade - the transaction happens at the lowest ask's timestamp, and the transaction price happens at the highest bid
      var match = new MatchedTransaction(highestBid, lowestAsk, lowestAsk.getDate(), highestBid.price());
      matchedTransactions.add(match);

      // to be included here: inform Back Office Server of match
      // to be done in v1.0

      updateLatestPrice(match);
      logMatchedTransactions();
    }
  }

  // updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
  // based on the MatchedTransaction object passed in
  function updateLatestPrice(m) {
    var stock = m.stock();
    var price = m.price();
    // update the correct attribute
    if (stock.equals("smu")) {
      latestPriceForSmu = price;
    } else if (stock.equals("nus")) {
      latestPriceForNus = price;
    } else if (stock.equals("ntu")) {
      latestPriceForNtu = price;
    }
  }

  // updates either latestPriceForSmu, latestPriceForNus or latestPriceForNtu
  // based on the MatchedTransaction object passed in
  function getLatestPrice(stock) {
    if (stock.equals("smu")) {
      return latestPriceForSmu;
    } else if (stock.equals("nus")) {
      return latestPriceForNus;
    } else if (stock.equals("ntu")) {
      return latestPriceForNtu;
    }
    return -1; // no such stock
  }































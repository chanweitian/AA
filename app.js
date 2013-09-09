
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

var authentication = require('./routes/authentication');
var stock = require('./routes/stock');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'HOLYCOW'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/login', authentication.displayLoginPage);
app.post('/processLogin',authentication.processLogin);
app.get('/loginSuccess',authentication.checkAuth, authentication.displayLoginSuccessPage);
app.get('/logout', authentication.displayLogout);      

app.get('/buy', authentication.checkAuth,stock.displayBuyPage);
app.post('/processBuy',authentication.checkAuth,stock.processBuy);
app.get('/buySuccess', authentication.checkAuth,stock.displayBuySuccessPage);
app.get('/buyFail', authentication.checkAuth,stock.displayBuyFailPage);

app.get('/sell', authentication.checkAuth,stock.displaySellPage);
app.post('/processSell',authentication.checkAuth,stock.processSell);

app.get('/current',authentication.checkAuth,stock.displayCurrentPage);

app.get('/viewOrders',authentication.checkAuth,stock.displayOrdersPage);

//all other pages will get directed to login page
app.get('*', authentication.displayLoginPage);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

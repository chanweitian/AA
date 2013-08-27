
/*
 * GET home page.
 */
 function checkAuth(req, res, next) {
 	if (!req.session.user_id) {
 		res.redirect('/login');
 	} else {
 		next();
 	}
 }



 function displayLoginPage(req,res){
 	res.render('login');
 }

 function authenticate(req,res){
 	var id = req.body.id;
 	var password = req.body.password;
 	if (id == 'john' && password == 'password') {
 		req.session.id = id;
 		res.redirect('/loginSuccess');
 	} else {
 		res.redirect('/login');
 	}
 }

 module.exports.displayLoginPage = displayLoginPage;
 module.exports.authenticate = authenticate;
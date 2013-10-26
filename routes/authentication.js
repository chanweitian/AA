
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

 function processLogin(req,res){
 	var user_id = req.body.user_id;
 	var password = req.body.password;

 	if (password == 'password') {
 		req.session.user_id = user_id;
 		res.redirect('/loginSuccess');
 	} else {
 		res.redirect('/login');
 	}
 }


function displayLoginPage(req,res){
	if (!req.session.user_id) {
		res.render('login');
	} else {
		res.redirect('/loginSuccess')
	}
}

function displayLoginSuccessPage(req,res){
	res.render('loginSuccess', {user_id: req.session.user_id});
}

function displayLogout(req,res){
	req.session.destroy();
  	res.render('logout');
}


 module.exports.checkAuth = checkAuth;
 module.exports.processLogin = processLogin;
 module.exports.displayLoginPage = displayLoginPage;
 module.exports.displayLoginSuccessPage = displayLoginSuccessPage;
 module.exports.displayLogout = displayLogout;
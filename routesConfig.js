/** routes.js
  */
var passport = require('passport');

// Route methods
var userRoute = require('./routes/user');

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }
  response.redirect('/login')
}

module.exports = function(app) {
    
    app.get('/', userRoute.index);
    
    // Display login page
    app.get('/login', userRoute.login);
    
    // GET /auth/foursquare
    app.get('/auth/foursquare', passport.authenticate('foursquare'), function(request, response){
    // The request will be redirected to Foursquare for authentication, so this
    // function will not be called.
    });
    
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/foursquare/callback', passport.authenticate('foursquare', { failureRedirect: '/login' }), function(request, response) {
        //console.log("------------------Inside Foursquare Auth Callback----------- User Is:" + request.user.name.givenName);
        console.log("****************************************************************");
        console.log("****************************************************************");
        // redirect
        response.redirect('/dogparks');    
    });
    
    //Account page
    app.get('/account', ensureAuthenticated, userRoute.getAccount);
    
    //User Pawtrackr Account Info
    app.get('/user/:fsID', ensureAuthenticated, userRoute.userFSID);
    
    //Display user profile
    app.get('/profile/:fsID', ensureAuthenticated, userRoute.profile);
    
    //User Friends
    app.get('/user/:fsID/friends', ensureAuthenticated, userRoute.userFriends);
    
    //User Parks
    app.get('/user/:fsID/myparks', ensureAuthenticated,  userRoute.userParks);
    
    //Add dogs
    app.get('/user/:fsID/add_dogs', ensureAuthenticated, userRoute.addDogs);
    app.post('/ajax/add_dog', ensureAuthenticated, userRoute.postDogs);
    
    // Logout user
    app.get('/logout', userRoute.logout);
    
    //dogParks
    app.get('/dogparks', ensureAuthenticated, userRoute.dogParks);
    
    //singlePark
    app.get('/dogpark/:parkID', ensureAuthenticated, userRoute.singlePark);

    //app.get('/getusers', userRoute.getUsers);
    
    //app.post('/upload', ensureAuthenticated, userRoute.uploadPost);    
    //app.get('/deleteimage/:imageID', ensureAuthenticated, userRoute.deleteImage);
}

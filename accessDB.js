// Module dependencies - do we need to call this here if mongoose was called in web.js?
var mongoose = require('mongoose'), // include Mongoose MongoDB library
    schema = mongoose.Schema;
    
//include passport-foursquare
var passport = require('passport'),
    util = require('util'),
    FoursquareStrategy = require('passport-foursquare').Strategy;

// Foursquare App Info - commented is live app info
var FOURSQUARE_CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
var FOURSQUARE_CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;


// Include models.js - this file includes the database schema and defines the models used
require('./models').configureSchema(schema, mongoose);

//logo image stored in /static/img

// Define your DB Model variables
var User = mongoose.model('User');
var Image = mongoose.model('Image');
var Dog = mongoose.model('Dog');
var Parks = mongoose.model('ParkData');

/************* END DATABASE CONFIGURATION *********/

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into the session.
passport.serializeUser(function(user, done) {
  console.log("***************INSIDE SERIALIZE USER******************");
  console.log(user);
  console.log("*******************************************************");
  done(null, user);
});

//deserialize users out of session - find user by ID.
passport.deserializeUser(function(obj, done) {
    User.findById(obj._id, function(err, user) {
        done(err, user);
    });
});

// Use the FoursquareStrategy within Passport.
passport.use(new FoursquareStrategy({
    clientID: FOURSQUARE_CLIENT_ID,
    clientSecret: FOURSQUARE_CLIENT_SECRET,
    // this is where you would put the live callbackURL, using local URL here for dev purposes
    callbackURL: "http://127.0.0.1:5000/auth/foursquare/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    
    // asynchronous verification, for effect...
    process.nextTick(function () {
        console.log("inside callback");
        var newUser = new Boolean();
        newUser = false;
              
        //check for an existing user and return done(null, user) where user is the existing user/doc from my database
        User.findOne({fsID:profile.id}, function(err,user){
    
            if (user) {
                console.log("****************************");
                console.log("found existing user");
                console.log(user);
                console.log("*****************************");
                
                return done(null, user);
    
            //create new user with my schema
            } else {
              newUser = true;
              console.log(profile);
                user = new User({
                    fsID : profile.id,
                    name : {
                        givenName: profile.name.givenName,
                        familyName: profile.name.familyName
                    },
                    email : profile.emails[0].value,
                    location : profile.city,
                    tok : accessToken
                    
                })
                
                user.save(function(err) {
                    console.log("*********************************");
                    console.log("created new user");
                    console.log(user);
                    console.log("******Token**********");
                    console.log(user.tok);
                    
                    if (err == null) {
                        return done(null, user, newUser); //Return the new user you created
                    }    
                })
            }
        })
    });
  }
));

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }
  response.redirect('/login')
}
//**************************************************************************************************************//

// connect to database
module.exports = {
  
  //include all Models
  // you can access models with db.User or db.ModelName
  Image: Image,
  User : User,
  Dog : Dog,
  Parks : Parks,
  
  // DB Helper functions
  // initialize DB
  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 
  },

    // save a user
    saveUser: function(profile, callback) {
        user = new User({
                    fsID : profile.id,
                    name : {
                        givenName: profile.name.givenName,
                        familyName: profile.name.familyName
                    },
                    email : profile.email[0].value,
                    location : profile.city,
                    tok : accessToken
        });

    newUser.save(function(err) {
      if (err) {throw err;}
      //console.log('Name: ' + newUser.name + '\nEmail: ' + newUser.email);
      callback(null, profile);
    });
  },
  
    // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },

  // get all the users
  getUsers: function(callback) {
    User.find({}, ['name', '_id'], function(err, users) {
      callback(null, users);
    });
  },

}



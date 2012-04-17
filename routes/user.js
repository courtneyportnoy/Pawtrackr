
/**
  * Module dependencies.
  */
var db = require('../accessDB');


module.exports = {

     // app.get('/login', ...
    login: function(request, response) {
        console.log("---------------------FOURSQUARE LOGIN--------------------------");
        response.render("login.html", {user: request.user});
    },
    
    getAccout: function(request,response) {
        console.log("----------------------------This is the Account Info from Foursquare-------------------");
        console.log(request.user);
        console.log("****************************************************************");
        response.render('account.html', {user: request.user});
        
    },
    
    userFSID: function(request,response) {
        console.log("-----------------This is supposed to be the Mongo User Info--------------------");
        console.log(request.user.fsID);
        console.log("----------------MONGO INFO---------------------" + request.user.fsID);
        console.log("****************************************************************");
        
        response.render('mongoUser.html', {user:request.user});
    },
    
    profile: function(request,response) {
        response.render("profile_display.html", {user:request.user});
    },
    
    userFriends: function(request,response) {
        console.log("Made it to my friends page");
        db.User.findOne({fsID: request.user.fsID}, function(err, user){
              if(err) {
                console.log('error' + err);
                response.send("uh oh, can't find that user");
            }
            if(user){
                var templateData = {
                    user: user
                }
            }
            response.render('view_friends.html', templateData);
        })
    },
    
    userParks: function(request,response) {
        console.log("Made it to add dogs page");
        // Get the requested user by username
        db.User.findOne({fsID:request.user.fsID}, function(err,user){
            if (err) {
                console.log('error');
                console.log(err);
                response.send("uh oh, can't find that profile");
            }       
            //package in "envelope" - don't know why I do this.
            if (user) {
                var templateData = {
                    user : user
                };
                //templateData.layout = 'layout_loggedIn.html';
                response.render('view_parks.html', templateData);
            }
        });
    },
    
    addDogs: function(request,response) {
        //this is where the form to add dogs goes?
        console.log("Made it to add dogs GET page - User Is: " + request.user.name.givenName);
    
        // Get the requested user by username
        db.User.findOne({fsID:request.user.fsID}, function(err,user){
            if (err) {
                console.log('error');
                console.log(err);
                response.send("uh oh, can't find that profile");
            }
    
            //package in "envelope" 
            if (user) {
                var templateData = {
                    user : user
                };
                console.log("********************fsID = " + user.fsID + "************************");
                // since we created the templateData var above, insert templateData into function here.
                //Alternatively, it will run just fine if you type "user" here and change the html code (remove the word user)
                response.render("add_dogs.html", templateData);
            }
        });
    },
    
    postDogs: function(request,response) {
        //get the user
        console.log("POSTING user's dog");
        console.log("********************fsID = " + request.user.fsID + "************************");
        console.log("********************Dogs = " );
        console.log(request.user.dogs);
        console.log(request.body);
        
        db.User.findOne({fsID:request.user.fsID}, function(err,user){
            // if there was an error...
            if (err) {
                console.log('There was an error');
                console.log(err);
                
                // display message to user
                response.send("uh oh, can't find that user"); 
            }
    
            //Create Dog Object   - need way to add dogname1,2,3,...etc. based on dynamic form 
            var dog = {
                dogname : request.body.dogname,
                breed : request.body.breed,
                gender : request.body.gender,
                birthday : {
                    month: request.body.DateOfBirth_Month,
                    day : request.body.DateOfBirth_Day,
                    year : request.body.DateOfBirth_Year
                }
            };
            
            //add the dog to the user
            user.dogs.push(dog);
            
            //save user
            user.save( function(err) {
                console.log("user save callback");
                console.log(err);
            });
            console.log(user);
            console.log("***************************************");
            
            //if request is AJAX
            if (request.xhr) {
                response.json({
                    status :'OK',
                    dog : {
                        dogname : dog.dogname,
                        breed : dog.breed,
                        gender : dog.gender,
                        birthday : {
                            month: dog.birthday.month,
                            day: dog.birthday.day,
                            year: dog.birthday.year
                        }
                    }
                });
                    
            } else {
                    
                // redirect to index page
                //response.redirect('/');
            }
        });
    },
    
    logout: function(request,response) {
        request.logout();
        response.redirect('/');
    },
    
    dogParks: function(request,response) {
        latlng = "40.788616,-73.96069";  
        foursquareURL = "https://api.foursquare.com/v2/venues/search?ll="+latlng+"&limit=200&client_id=IBF35MPMOADU1K0TM1GNLOHIP31VUJ0ISMBW4ULCNOX3D5IT&client_secret=ZF5ES1GE0IHPT0TZLTMLWWO1GBIRAOOVWX0Z1KVXXOTMLMY3&query=dog_run";
        
        // make the request
        requestURL(foursquareURL, function(err, httpResponse, data) {
            
            if (err || httpResponse.statusCode != 200) {
                console.log(err);
                response.send("Something went wrong");
            }
            
            if (httpResponse.statusCode == 200) {
                
                //convert JSON string  from 4sq into JS Object
                dogParkData = JSON.parse(data);
                
                console.log("-------- DATA RECEIVED -------");
                console.log("------------------------------");
                
                //create empty array to hold park location data
                var mapParks = [];
                
                // add data to array of dogpark info for mapping
                for(i = 0; i < dogParkData.response.groups[0].items.length; i++) {
                    
                    currPark = dogParkData.response.groups[0].items[i];
                    mapParks.push({
                        title : currPark.name,
                        lat : currPark.location.lat,
                        lng : currPark.location.lng
                    })             
                }            
                
                templateData = {
                    mapParks : JSON.stringify(mapParks),
                    pageTitle : "Pawtrackr",
                    dogParks : dogParkData.response.groups[0].items,
                    requestedURL : foursquareURL,
                    user: request.user
                }
                //templateData.layout = 'layout_loggedIn.html';
                response.render('dogparks.html', templateData);
            }
                   
        })
    },
    
    singlePark: function(request,response) {
        var venueID = request.params.parkID;
        console.log("----------Venue ID--------------");
        console.log(venueID);
        var ACCESS_TOKEN = request.user.tok;
        foursquareURL = "https://api.foursquare.com/v2/venues/"+venueID+"?oauth_token="+ACCESS_TOKEN;
        
        requestURL(foursquareURL, function(err, httpResponse, pdata) {
            if(err || httpResponse.statusCode != 200) {
                console.log(err);
                response.send("Something went wrong");            
            }
            if (httpResponse.statusCode == 200) {
                parkData = JSON.parse(pdata);
                console.log("--------------DATA RECEIVED--------------");
                console.log(pdata);
                
                var mapParks= [{
                    title : parkData.response.venue.name,
                    lat : parkData.response.venue.location.lat,
                    lng : parkData.response.venue.location.lng
                }]
                
                templateData = {
                    mapParks : JSON.stringify(mapParks),
                    park : parkData.response,
                    user: request.user,
                    requestedURL : foursquareURL,
                    lat : parkData.response.venue.location.lat,
                    lng : parkData.response.venue.location.lng
                }
                response.render('single_park_display.html', templateData)
            }
        })
    }
};
    
    
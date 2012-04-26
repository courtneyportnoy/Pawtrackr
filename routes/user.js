
/**
  * Module dependencies.
  */
var db = require('../accessDB');
var requestURL = require('request');
var format = require('util').format;
var fs = require('fs');

// YOUR BUCKET NAME
var myBucket = 'pawtrackr_photos';

var knox = require('knox');

var S3Client = knox.createClient({
      key: process.env.AWS_KEY
    , secret: process.env.AWS_SECRET
    , bucket: myBucket
});



module.exports = {
    
    index: function(request,response) {
        templateData = {
        pageTitle : "Pawtrackr",
        user: request.user
        }
        console.log("------------------INDEX PAGE----------- User Is:" + request.user);
        console.log("****************************************************************");
        response.render('index.html', templateData);  
    },
    
    signup: function(request, response) {
        console.log("---------------------FOURSQUARE SIGNUP--------------------------");
        response.render("signup.html", {user: request.user});
    },

     // app.get('/login', ...
    login: function(request, response) {
        console.log("---------------------FOURSQUARE LOGIN--------------------------");
        response.render("login.html", {user: request.user});
    },
    
    getAccount: function(request,response) {
        console.log("----------------------------This is the Account Info from Foursquare-------------------");
        console.log(request.user);
        console.log("****************************************************************");
        response.render('account.html', {user: request.user});
        
    },
    
    userFSID: function(request,response) {
        console.log("----------------MONGO INFO---------------------" + request.user.fsID);
        console.log("****************************************************************");    
        response.render('mongoUser.html', {user:request.user});
    },
    
    profile: function(request,response) {
        templateData = {
            user : request.user,
            s3bucket : S3Client.bucket,
            dogs : request.user.dogs
        }
        console.log("*********PROFILE************");
        console.log(templateData);
        console.log("*********PROFILE************");
        response.render("profile_display.html", templateData);
    },
    
    singleDog: function(request, response) {
        var dogID = request.params.dogID;
        console.log("----------Dog photo--------------");
        console.log(request.user.dogs.id(dogID));
        
        var templateData = {
            s3bucket: S3Client.bucket,
            dog: request.user.dogs.id(dogID),
            user : request.user
        };
        response.render('singleDog.html', templateData);
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
                    //s3bucket : S3Client.bucket,
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
        console.log("*************FILES*****************");
        console.log(request.files);
        console.log("********************************");
        console.log("********************fsID = " + request.user.fsID + "************************");
        console.log("********************Dogs = " );
        console.log(request.user.dogs);
        //console.log(request.body);
        
        db.User.findOne({fsID:request.user.fsID}, function(err,user){
            // if there was an error...
            if (err) {
                console.log('There was an error');
                console.log(err);
                
                // display message to user
                response.send("uh oh, can't find that user"); 
            }
            
            // 1) Get file information from submitted form
            filename = request.files.dogphoto.filename; // actual filename of file
            path = request.files.dogphoto.path; //will be put into a temp directory
            type = request.files.dogphoto.type; // image/jpeg or actual mime type
                        
            // 2) create file name with logged in user id + cleaned up existing file name. function defined below.
            cleanedFileName = cleanFileName(request.user.fsID, filename);
            
            // 3a) We first need to open and read the file
            fs.readFile(path, function(err, buf){
                
                // 3b) prepare PUT to Amazon S3
                var req = S3Client.put(cleanedFileName, {
                  'Content-Length': buf.length
                , 'Content-Type': type
                });
                
                // 3c) prepare 'response' callback from S3
                req.on('response', function(res){
                    if (200 == res.statusCode) {
                        // create new Image
                        var newImage = {
                            filename : cleanedFileName
                        };
                         //Create Dog Object   - need way to add dogname1,2,3,...etc. based on dynamic form 
                        var dog = {
                            dogname : request.body.dogname,
                            breed : request.body.breed,
                            gender : request.body.gender,
                            profileImage: [newImage],
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
                        
                        response.redirect('/profile/:fsID');
                    
                    } else {
                    
                        response.send("an error occurred. unable to upload file to S3.");
                    
                    }
                });
            
                // 3d) finally send the content of the file and end
                req.end(buf);
            });

    
           
            console.log(user);
            console.log("***************************************");
            
         
        });
    },
    
    logout: function(request,response) {
        request.logout();
        response.redirect('/');
    },
    
    update: function(request, response) {
        
    },
    
    deleteDog : function(request, response) {
        //find dog by dogID
        dogID = request.params.dogID;
        
            console.log("*****************DOG_ID****************");
            console.log(dogID);
            console.log("*****************DOG_ID****************");
            
        db.User.findOne({fsID: request.user.fsID}, function(err, user){            
            
            if (err) {
                request.flash("message", "error, could not find user");
                response.redirect('/profile/:user.fsID');
            }
           
            if (user) {
                var dog = user.dogs.id(dogID);
                console.log("*************dog************");
                console.log(dog.profileImage[0].filename);
                console.log("*************dog************");
                
                S3Client.deleteFile(dog.profileImage[0].filename, function(err, s3response) {
                    console.log("Deleting from Amazon");
                    
                    if (err) {
                        request.flash("message","an error occurred trying to delete image from S3");
                        response.redirect('/profile/:fsID');
                    }
                    
                    if (204 == s3response.statusCode) {
                        //delete from Mongo
                        //user.dogs.id(dogID).remove();
                        console.log("*************dog************");
                        console.log(dog);
                        console.log("*************dog************");
                        
                        dog.remove();
                        user.save(function (err) {
                          // embedded comment with id `my_id` removed!
                        request.flash("message","Dog removed from S3 and Mongo");
                        response.redirect('/profile/:fsID'); 
                        });
                    }
                });
                
            } else {
                
                request.flash("message", "unable to delete image");
                response.redirect("/profile/:fsID");
            }
        })
    },
    
    deleteImage : function(request, response) {
        
        imageID = request.params.imageID;
        
        // get image from DB
        db.Images.findById(imageID, function(err, image) {
            
            if (err) {
                request.flash("message","error, could not find image");
                response.redirect('/account');
            }
            
            if (image && (image.user.toString() == request.user._id.toString()) ) {
                
                // user owns this image
                // 
                S3Client.deleteFile(image.filename, function(err, s3response){
                    if (err) {
                        request.flash("message","an error occurred trying to delete image from S3");
                        response.redirect('/account');

                    }
                    
                    if (204 == s3response.statusCode) {
                        //delete from Mongo
                        var query = db.Images.findById(imageID);
                        query.remove(function(err, queryResponse){
                            
                            request.flash("message","Image removed from S3 and Mongo");
                            response.redirect('/account');
                            
                        })
                    } 
                });
                
                
            } else {
                
                request.flash("message", "unable to delete image");
                response.redirect("/account");
            }
            
        })
        
        
    },
    
    dogParks: function(request,response) { // displays all nearby on google map and in list view
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
                        id : currPark.id,
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

var cleanFileName = function(userID, filename) {
    
    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    fileParts = filename.split(".");
    
    //get the file extension
    fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();
    
    //name without extension "My Pet Dog"
    newFileName = fileParts[0];
    
    return newFilename = userID + "_" + timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
    
}
    
    
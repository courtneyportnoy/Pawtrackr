/**
  * Module dependencies.
  */
var db = require('../accessDB');
var requestURL = require('request');


module.exports = {
    
    
    alldogsData: function(request, response){  // returns all dog entries in json format
        
        // define the fields you want to include in your json data
        includeFields = ['dogs.dogname','dogs.breed','dogs.gender', 'dogs.birthday'];
      
        // query for all dogs
        queryConditions = {}; //empty conditions - return everything
        var query = db.User.find( queryConditions, includeFields);
    
        //query.exec???
        query.exec(function (err, dogs) {
    
            // render the JSON data with the data above
            jsonData = {
              'status' : 'OK',
              'dogs' : dogs
            }
    
            response.json(jsonData);
        });
    },
       
    dogparkData: function(request,response) { //return all dog parks in json format
        
        //query for all dogparks    
        latlng = "40.788616,-73.96069";  
        foursquareURL = "https://api.foursquare.com/v2/venues/search?ll="+latlng+"&limit=200&client_id=IBF35MPMOADU1K0TM1GNLOHIP31VUJ0ISMBW4ULCNOX3D5IT&client_secret=ZF5ES1GE0IHPT0TZLTMLWWO1GBIRAOOVWX0Z1KVXXOTMLMY3&query=dog_run";
        
        // make the request
        requestURL(foursquareURL, function(err, httpResponse, data) {
            
            if (err || httpResponse.statusCode != 200) {
                console.log(err);
                response.send("Something went wrong");
            }
            
            if (httpResponse.statusCode == 200) {
                
                //convert JSON string into JS Object
                dogParkData = JSON.parse(data);
                dogParks = dogParkData.response.groups[0].items;
                //define fields to include
                //includeFields = ['dogParks[i].name', 'dogParks[i].location.lat', 'dogParks[i].location.lng', 'dogParks[i].categories.icon'];    
                
                //some way to only display the fields I want?
                for(i in dogParks){
                    dogParkNames = dogParks[i].name;
                }
                
                console.log("-------- DATA RECEIVED -------");
                
                jsonData = {
                    'status' : 'ok',
                    'dogParkList' : dogParks,
                    requestedURL : foursquareURL
                }            
                response.json(jsonData);
            }      
        })   
    }
};
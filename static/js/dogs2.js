//declare global variable map
var map;
var bounds;
var mapLocations = [];
var currMarker;
var currInfoWindow;

//run this code when the browser has loaded
   jQuery(document).ready(function() {
      
      //bind click event to the button #addAnother
      jQuery("button#addAnother").click( addAnother );
      initialize();
      
   });
   
   //code for AJAX form submission
   var addAnother = function(e) {
      console.log("AJAX BUTTON CLICKED");
      //serialize the form fields - put them into a string that can be sent to the server
      
      var formData = jQuery("form#add_dogs").serialize();
      console.log(formData);
        
        // POST comment via AJAX
        jQuery.ajax({
            
            url : '/ajax/add_dog',
            type : 'POST',
            data : formData, 
            dataType : 'json',
            
            success : function(response) {
                console.log(response);
                if (response.status == "OK") {
                    
                    console.log("dog added successfully, let's display it");
                    displayDog(response.dog);
                    
                    //reset the form
                    jQuery("input[name='dogname']").val('');
                    jQuery("select[name='gender']").val('');
                    jQuery("select[name='breed']").val('');
                    jQuery("select[name='DateOfBirth_Month']").val('');
                    jQuery("select[name='DateOfBirth_Day']").val('');
                    jQuery("select[name='DateOfBirth_Year']").val('');
                }
                
            }, 
            error : function(error) {
                console.log("There was an error");
                console.log(error);
            }
            
        });
        
        // prevent form from submitting as it would normally
        e.preventDefault();
        return false;
      }

var displayDog = function(dogData) {
    
    // generate html for new comment
    var dogHTML = "<div class='dog'><p>";
    dogHTML += "<b>" + dogData.dogname + " </b><br>";
    dogHTML += dogData.breed;
    dogHTML += " | " + dogData.gender + "<br/>";
    dogHTML += dogData.birthday.month + " " + dogData.birthday.day + ", " + dogData.birthday.year;
    
    //append new comment to DOM (rendered browser html)
    jQuery("div.login_container").prepend(dogHTML);
    
}

 //Google Maps Function  
function initialize() {
        var myOptions = {
          center: new google.maps.LatLng(40.788616,-73.96069),
         //center: new google.maps.LatLng(lat,lng),
         maxZoom: 16,
         zoom: 14,
         mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
        
        //function that loads dog park markers
        displayMarkers();
        
}
     
var displayMarkers = function() {
    
    //allows map to center around markers
    bounds = new google.maps.LatLngBounds();
    
    for(i = 0; i<parkLocations.length; i++) {
        
        currLocation= parkLocations[i];
        
        // create info window
        var infowindow = new google.maps.InfoWindow({
                content: "<h4>" + currLocation.title + "</h4>"
            });
        
        // create the map marker
        var tmpMarker = new google.maps.Marker({
                position: new google.maps.LatLng( currLocation.lat, currLocation.lng), 
                map: map,
                title: currLocation.title
            });
        
        //put new marker into the global mapMarkers array
        mapLocation = {
            marker : tmpMarker,
            infowindow: infowindow
        };
        
        //adding current marker to bounds
        bounds.extend(tmpMarker.position);
        
        //attach click event to marker, open info and close any open windows
        setupInfoWindowClick(mapLocation);
        
        //put the whole location into mapLocations
        mapLocations.push(mapLocation);
       
    }
    //set max zoom
    
    //fit map to bounds
    map.fitBounds(bounds);
}

function setupInfoWindowClick (location) {
   //so marker is associated with the closure created for the listenMarker function
   google.maps.event.addListener(location.marker, 'click', function() {
      if(currInfoWindow) {
         currInfoWindow.close(); //close any existing windows
      }
      location.infowindow.open(map, location.marker); //open the infowindow
      currInfoWindow = location.infowindow; //set this infowindow to the currInfoWindow
   });
}

      
   
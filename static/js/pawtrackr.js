//declare global variable map
var map;
var bounds;
var mapLocations = [];
var currMarker;
var currInfoWindow;

//run this code when the browser has loaded
   jQuery(document).ready(function() {
      
      //initialize google maps
      initialize();
      
   });

 //Google Maps Function  
function initialize() {
      var myOptions = {
         center: new google.maps.LatLng(40.788616,-73.96069),
         //center: new google.maps.LatLng(lat,lng),
         maxZoom: 16,
         zoom: 15,
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
                content: "<h4><a href='/dogpark/"+ currLocation.id + "'>"+ currLocation.title + "</a></h4>"
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

      
   
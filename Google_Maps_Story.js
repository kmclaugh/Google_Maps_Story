start_point = new point(-4.2988547931769014, 34.24683859375001, zoom=5, marker=false, content=false);
var point0 = new point(-2.500342, 32.686780, 8, marker=true, content='test', index=0);
var point1 = new point(3.157547, 38.750983, 8, marker=false, content=false, index=1);
var point2 = new point(-6.051057, 39.207935, 8, marker=true, content='test2', index=2);
var the_points = [point0, point1, point2];

var map;

function initMap(map_id) {
    //Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: start_point.position,
        zoom: start_point.zoom
    });
    
    //Right click print map info to the console to make it easier to create stories
    google.maps.event.addListener(map, "rightclick", function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var center = map.getCenter();
        var zoom = map.getZoom();
        // populate yor box/field with lat, lng
        console.log("Click " + lat + ", " + lng);
        console.log("Center " + center);
        console.log("Zoom " + zoom);
    });//close righ click function
    
}//close initMap

$(window).load(function () {
    
    $(document).ready(function () {
    
        //init the story stuff
        var the_story = new story(map=map, start_point=start_point, points=the_points);
        the_story.plot_path();
        the_story.plot_markers();
        
        //move_to_next when clicking next
        $('body').on('click', "[name='next']", function(){
            var current_index = Number($(this).attr('index'));
            the_story.move_to_next(current_index);
        });
        
    });//close document ready
    
});//close window load

function story(map, start_point, points) {
    /*This class has the data and functions for creating the stoy*/
    
    //Init variable
    var self = this;
    this.start_point = start_point;
    this.points = points;
    this.map = map
    
    this.move_to_next = function(current_index) {
        /*pan and zooms to the next point if the next point has a marker then it stops
         *if not, then it calls itself (recursive) and pans to the next point*/
        
        //close the current markers infowindow
        var current_point = this.points[current_index];
        if (current_point.marker != false) {
                current_point.marker.infowindow.close();
        }
        
        //If this isn't the last point in the story,
        if (current_point.index < this.points[this.points.length-1].index) {
            //get the next point and pan to it
            current_point = this.points[current_point.index+1];
            map.panTo(current_point.position);
            
            //After panning to the next point, 
            google.maps.event.addListenerOnce(map, 'idle', function(){
                
                //if the next point does NOT has a marker call move_to_next again 
                if (current_point.marker == false) {
                    self.move_to_next(current_point.index);
                }
                
                //If it does have a marker,
                else{
                    //Wait for half a second then set the zoom and show the infowindow
                    window.setTimeout(function() {
                        self.map.setZoom(current_point.zoom);
                        google.maps.event.addListenerOnce(self.map, 'idle', function(){
                            google.maps.event.trigger(current_point.marker, 'click');//kinda HACKy
                        });
                    }, 500);
                }
                
            });//close addListenerOnce
        }//close if last point
        
        
    }//close move_to_next
    
    this.plot_path = function(){
        /*plots the path of the story from the points*/
        var path_coordinates = []
        for (var i = 0; i < this.points.length; i++) {
            point = this.points[i]
            path_coordinates.push(point.position)
        }
        var path = new google.maps.Polyline({
            path: path_coordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        path.setMap(this.map);
    }//close plot_path
    
    this.plot_markers = function(){
        /*Loops through all the points with marker, plots them, and adds their info windows with the next button*/
        for (var i = 0; i < this.points.length; i++) {
            point = this.points[i];
            if (point.marker == true) {
                var marker = new google.maps.Marker({
                    position: point.position,
                    map: this.map,
                    title: 'Click me!'
                });
                marker.infowindow =  new google.maps.InfoWindow({
                    content: ""
                });
                this.bind_info_window(marker, this.map, marker.infowindow, point);
                point.marker = marker;       
            }//close if
        }//close for
    }//close plot_markers
    
    this.bind_info_window = function(marker, map, infowindow, point) {
        /*Binds the given info window to the marker and adds the given content using a closure*/
        google.maps.event.addListener(marker, 'click', function() {
            marker.infowindow.setContent(point.content);
            marker.infowindow.open(map, marker);
        });
        marker.infowindow.close();
    }//close bind_info_window
    
}//close story

function point(latitude, longitude, zoom, marker, content, index){
    this.position = {lat: latitude, lng: longitude};
    this.zoom = zoom;
    this.marker = marker;
    this.index = index;
    this.content = content+'<p><button type="button" name="next" index="'+this.index+'">Next</button></p>';

}
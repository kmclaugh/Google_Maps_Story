   
function create_the_points(data_points){
    /*Transforms data_points given in [[latitude, longitude, zoom, market,content],...] format
     *into the start_point and the_points. Assumes the first data_point in the array is the start point*/
    var the_points = [];
    for (var i = 0; i < data_points.length; i++) {
        var datum = data_points[i];
        if (i == 0) {
            start_point = new point(datum[0], datum[1], datum[2], datum[3], datum[4], i-1);
        }
        else{
            the_point = new point(datum[0], datum[1], datum[2], datum[3], datum[4], i-1);
            the_points.push(the_point);
        }
    }//end for
    return the_points;
}//end create_the_points

$(window).load(function () {
    
    $(document).ready(function () {
        
        //move_to_next when clicking next
        $('body').on('click', "[name='next']", function(){
            var current_index = Number($(this).attr('index'));
            the_story.move_to_next(current_index);
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
        
    });//close document ready
    
});//close window load

function story(map, start_point, points) {
    /*This class has the data and functions for creating the stoy*/
    
    //Init variable
    var self = this;
    this.start_point = start_point;
    this.points = points;
    this.map = map;
    this.intro_infowindow;
    
    this.start_intro = function(){
        /*Creates the introduction window*/
        var latitude = self.map.getBounds().getNorthEast().lat();
        var longitude = self.start_point.position['lng'];
        var intro_position = {lat: latitude, lng: longitude};
        
        this.intro_infowindow = new google.maps.InfoWindow({
            content: start_point.content,
            position: intro_position
        });
        this.intro_infowindow.open(self.map);
    }
    
    this.move_to_next = function(current_index) {
        /*pan and zooms to the next point if the next point has a marker then it stops
         *if not, then it calls itself (recursive) and pans to the next point*/
        
        //close the current markers infowindow
        if (current_index == -1) {
            this.intro_infowindow.close();
            current_point = self.start_point;
        }
        else{
            var current_point = this.points[current_index];
            if (current_point.marker != false) {
                    current_point.marker.infowindow.close();
            }
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
                        if (self.map.getZoom() != current_point.zoom) {
                            self.map.setZoom(current_point.zoom);
                            google.maps.event.addListenerOnce(self.map, 'idle', function(){
                                google.maps.event.trigger(current_point.marker, 'click');//kinda HACKy
                            });
                        }
                        else{
                            google.maps.event.trigger(current_point.marker, 'click');//kinda HACKy
                        }
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
    if (index == -1) {
        this.content = content+'<p><button type="button" name="next" index="-1">Start</button></p>';
    }
    else{
        this.content = content+'<p><button type="button" name="next" index="'+this.index+'">Next</button></p>';
    }
}
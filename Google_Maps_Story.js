   
function create_the_points(data_points){
    /*Transforms data_points given in [[latitude, longitude, zoom, market,content],...] format
     *into the start_point and the_points. Assumes the first data_point in the array is the start point*/
    var the_points = [];
    var marker_index = 0;
    
    for (var i = 0; i < data_points.length; i++) {
        var datum = data_points[i];
        
        if (datum[3] == true){
            the_point = new point(datum[0], datum[1], datum[2], datum[3], datum[4], i, marker_index);
            marker_index += 1;
        }
        
        else{
            the_point = new point(datum[0], datum[1], datum[2], datum[3], datum[4], i, false);
        }
        
        the_points.push(the_point);
    }//end for
    return the_points;

}//end create_the_points

$(window).load(function () {
    
    $(document).ready(function () {
        
        //move_to_next when clicking next
        $('body').on('click', "[name='next']", function(){
            var current_point_index = Number($(this).attr('index'));
            if (current_point_index == -1){
                var story_index = 0;
                start_point.infowindow.close();
            }
            else{
                var story_index = Number($(this).attr('story_index'));
            }
            
            var the_story = story_list[story_index];
            
            the_story.move_to_next(current_point_index);
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

function start_intro(the_start_point, map){
    /*Creates the introduction window*/
    var latitude = map.getBounds().getNorthEast().lat();
    var longitude = the_start_point.position['lng'];
    var intro_position = {lat: latitude, lng: longitude};
    var content = the_start_point.content + '<p><button type="button" name="next" index="-1">Start</button></p>'
    the_start_point.infowindow = new google.maps.InfoWindow({
        content: content,
        position: intro_position
    });
    the_start_point.infowindow.open(map);
}

function story(map, points, on_end) {
    /*This class has the data and functions for creating the stoy*/
    
    //Init variable
    var self = this;
    this.points = points;
    this.map = map;
    this.content_list = [];
    this.index = story_list.length;
    this.on_end = on_end;
    story_list.push(this);
    
    this.make_content_list = function(content_wrapper_id){
        $('#'+content_wrapper_id).children().each(function(){
            var_the_html = $(this).html();
            self.content_list.push(var_the_html);
        });
    }
    
    this.move_to_next = function(current_index) {
        /*pan and zooms to the next point if the next point has a marker then it stops
         *if not, then it calls itself (recursive) and pans to the next point*/
        
        //close the current markers infowindow
        if (current_index != -1){
            var current_point = this.points[current_index];
            if (current_point.marker != false) {
                    current_point.marker.infowindow.close();
            }
        }
        
        //If this isn't the last point in the story,
        if (current_index < this.points.length-1) {
            //get the next point and pan to it
            current_point = this.points[current_index+1];
            self.map.panTo(current_point.position);
            
            //After panning to the next point, 
            google.maps.event.addListenerOnce(map, 'idle', function(){
                
                //if the next point does NOT have a marker call move_to_next again 
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
                    }, 1000);
                    
                }
                
            });//close addListenerOnce
        }//close if last point
        
        //If this is the last point run the on_end function if there is one
        else{
            if (self.on_end != false){
                self.on_end();
            }
        }
        
    }//close move_to_next
    
    this.plot_path = function(color){
        /*plots the path of the story from the points*/
        var path_coordinates = []
        for (var i = 0; i < this.points.length; i++) {
            point = this.points[i]
            path_coordinates.push(point.position)
        }
        var path = new google.maps.Polyline({
            path: path_coordinates,
            geodesic: true,
            strokeColor: color,
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
        var content = self.content_list[point.marker_index];
        content = content+'<p><button type="button" story_index='+self.index+' name="next" index="'+point.index+'">Next</button></p>';
        google.maps.event.addListener(marker, 'click', function() {
            marker.infowindow.setContent(content);
            marker.infowindow.open(map, marker);
        });
        marker.infowindow.close();
    }//close bind_info_window
    
}//close story

function point(latitude, longitude, zoom, marker, content, index, marker_index){
    this.position = {lat: latitude, lng: longitude};
    this.zoom = zoom;
    this.marker = marker;
    this.index = index;
    this.marker_index = marker_index
    
}
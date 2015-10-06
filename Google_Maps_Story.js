

//var map;
//function initMap() {
//    map = new google.maps.Map(document.getElementById('map'), {
//        center: {lat: -2.500342, lng: 32.686780},
//        zoom: 8
//    });
//    var contentString = "<p>Livingston is at Lake Victoria</p>"+'<p><button type="button" onclick="pan()">Click Me!</button></p>'
//    var infowindow = new google.maps.InfoWindow({
//        content: contentString
//    });
//    var marker = new google.maps.Marker({
//        position: {lat: -2.500342, lng: 32.686780},
//        map: map,
//        title: 'Hello World!'
//    });
//    marker.addListener('click', function() {
//        infowindow.open(map, marker);
//    });
//    var flightPlanCoordinates = [
//        {lat: -2.500342, lng: 32.686780},
//        {lat: -6.102010, lng: 39.229138}
//    ];
//    var flightPath = new google.maps.Polyline({
//        path: flightPlanCoordinates,
//        geodesic: true,
//        strokeColor: '#FF0000',
//        strokeOpacity: 1.0,
//        strokeWeight: 2
//    });
//
//    flightPath.setMap(map);
//    
//}

//function pan(){
//    map.panTo({lat: -6.102010, lng: 39.229138});
//    google.maps.event.addListenerOnce(map, 'idle', function(){
//        setTimeout(function() {
//            map.setZoom(12);
//        }, 1000);
//    });
//    //
//}
start_point = point(latitude=-2.500342, longitude=32.686780, zoom=4, marker=false, content=false);
var map;
function initMap(map_id) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -2.500342, lng: 32.686780},
        zoom: 6
    });
}
$(window).load(function () {
    
    $(document).ready(function () {
        var point0 = new point(-2.500342, 32.686780, 8, marker=true, content='test');
        var point1 = new point(-3.763143, 34.743022, 8, marker=false, content=false);
        var point2 = new point(-6.051057, 39.207935, 8, marker=true, content='test2');
        
        var the_points = [point0, point1, point2];
        var the_story = new story(map=map, start_point=start_point, points=the_points);
        the_story.plot_path();
        the_story.plot_markers();
    });
});

function story(map, start_point, points) {
    this.start_point = start_point;
    this.points = points;
    this.map = map
    
    this.plot_path = function(){
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
    }
    
    this.plot_markers = function(){
            for (var i = 0; i < this.points.length; i++) {
                point = this.points[i]
                if (point.marker == true) {
                    var infowindow = new google.maps.InfoWindow({
                        content: point.content
                    });
                    var marker = new google.maps.Marker({
                        position: point.position,
                        map: map,
                        title: 'Click me!'
                    });
                    marker.addListener('click', function() {
                        infowindow.open(map, marker);
                    });
                }
            }
    }
}

function point(latitude, longitude, zoom, marker, content){
    this.position = {lat: latitude, lng: longitude};
    this.zoom = zoom;
    this.marker = marker;
    this.content = content;
    
}

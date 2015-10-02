

var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -2.500342, lng: 32.686780},
        zoom: 8
    });
    var contentString = "<p>Livingston is at Lake Victoria</p>"+'<p><button type="button" onclick="pan()">Click Me!</button></p>'
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    var marker = new google.maps.Marker({
        position: {lat: -2.500342, lng: 32.686780},
        map: map,
        title: 'Hello World!'
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
    var flightPlanCoordinates = [
        {lat: -2.500342, lng: 32.686780},
        {lat: -6.102010, lng: 39.229138}
    ];
    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);
}

function pan(){
    map.panTo({lat: -6.102010, lng: 39.229138})
}


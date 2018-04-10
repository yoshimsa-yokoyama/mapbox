/*
	engine.js
*/

(function(){

	var _world;
	var _plane;
	var _rgbImage;
	var _canvas, _ctx;
	var _grid = 16;


	var _zoom = 15;
	var _lng = 139.760668;
	var _lat = 35.67326;

	$('#siteBody').addClass('open');


	mapboxgl.accessToken = 'pk.eyJ1IjoibnVsbGRlc2lnbiIsImEiOiJjamZrcGdtbnowODdlMndzMmE2ZHc5anlrIn0.fsWuly11P-SWfGz9VntnSg';

	var _style = 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g';
	_style = 'mapbox://styles/mapbox/dark-v9';
	//_style = 'mapbox://styles/mapbox/satellite-v9';

	var map = new mapboxgl.Map({
		style: _style,
	    center: [_lng, _lat],
	    zoom: _zoom,
	    pitch: 75,
	    bearing: -17.6,
	    hash: false,
	    container: 'siteBody'
	});

	// The 'building' layer in the mapbox-streets vector source contains building-height
	// data from OpenStreetMap.
	map.on('load', function() {
	    // Insert the layer beneath any symbol layer.
	    var layers = map.getStyle().layers;

	    var labelLayerId;
	    for (var i = 0; i < layers.length; i++) {
	        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
	            labelLayerId = layers[i].id;
	            break;
	        }
	    }

	    //	3D Building
	    map.addLayer({
	        'id': '3d-buildings',
	        'source': 'composite',
	        'source-layer': 'building',
	        'filter': ['==', 'extrude', 'true'],
	        'type': 'fill-extrusion',
	        'minzoom': 15,
	        'paint': {
	            'fill-extrusion-color': '#aaa',

	            // use an 'interpolate' expression to add a smooth transition effect to the
	            // buildings as the user zooms in
	            'fill-extrusion-height': [
	                "interpolate", ["linear"], ["zoom"],
	                15, 0,
	                15.05, ["get", "height"]
	            ],
	            'fill-extrusion-base': [
	                "interpolate", ["linear"], ["zoom"],
	                15, 0,
	                15.05, ["get", "min_height"]
	            ],
	            'fill-extrusion-opacity': .8
	        }
	    }, labelLayerId);


	    //	hillshading
	    map.addSource('dem', {
	        "type": "raster-dem",
	        "url": "mapbox://mapbox.terrain-rgb"
	    });
	    map.addLayer({
	        "id": "hillshading",
	        "source": "dem",
	        "type": "hillshade"
	    // insert below waterway-river-canal-shadow;
	    // where hillshading sits in the Mapbox Outdoors style
	    }, 'waterway-river-canal-shadow');




	    //	pin
	    var geojson = {
	    "type": "FeatureCollection",
	    "features":
		    [
		        {
		            "type": "Feature",
		            "properties": {
		                "message": "Foo",
		                "iconSize": [32, 32]
		            },
		            "geometry": {
		                "type": "Point",
		                "coordinates": [
		                    139.760668, 
		                    35.67326
		                ]
		            }
		        },
		        {
		            "type": "Feature",
		            "properties": {
		                "message": "Bar",
		                "iconSize": [32, 32]
		            },
		            "geometry": {
		                "type": "Point",
		                "coordinates": [
		                    139.760660, 
		                    35.67326
		                ]
		            }
		        }
		    ]
		};

		// add markers to map
		geojson.features.forEach(function(marker) {
		    // create a DOM element for the marker
		    var el = document.createElement('div');
		    el.className = 'marker';
		    //el.style.backgroundImage = 'url(https://placekitten.com/g/' + marker.properties.iconSize.join('/') + '/)';
		    el.style.backgroundImage = 'url(ico_human02.png)';
		    el.style.width = marker.properties.iconSize[0] + 'px';
		    el.style.height = marker.properties.iconSize[1] + 'px';

		    el.addEventListener('click', function() {
		        window.alert(marker.properties.message);
		    });

		    // add marker to map
		    new mapboxgl.Marker(el)
		        .setLngLat(marker.geometry.coordinates)
		        .addTo(map);
		});


	});


})();



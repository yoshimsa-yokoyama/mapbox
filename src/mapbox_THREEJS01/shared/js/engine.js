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

	/*

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

*/
	var _fieldList = [];
	_fieldList.push({	zoom: 12, lng: 138.72437, lat: 35.358901});
	_fieldList.push({	zoom: 9, lng: -122.104322, lat: 42.939281});
	_fieldList.push({	zoom: 12, lng: -112.1392999, lat: 36.0996616});


	var _id = Math.floor( Math.random() * _fieldList.length );
	var _zoom = _fieldList[_id].zoom;
	var _lng = _fieldList[_id].lng;
	var _lat = _fieldList[_id].lat;

	//long: 180
	//lat:90


	// _zoom = 15;
	// _lng = 138.583292;
	// _lat = 35.8934647;


	// _zoom = 10;
	// _lng = 139.760668;
	// _lat = 35.67326;

	_zoom = 13;
	_lng = 131.0300536;
	_lat = -25.3493748;

	// _zoom = 10;
	// _lng = 86.9207024;
	// _lat = 27.9879535;

	// _zoom = 10;
	// _lng = -115.9973225;
	// _lat = 39.6677527;

	// _zoom = 5;
	// _lng = -84.622578;
	// _lat = 46.352223;

	// _zoom = 11;
	// _lng = 76.512451;
	// _lat = 35.881517;



	var _scaleHeight = 64.0 / Math.pow( 2, 24 - _zoom );

	var _x = long2tile( _lng, _zoom );
	var _y = lat2tile( _lat, _zoom );

	var _api = 'https://api.mapbox.com';
	var _accessToken = 'pk.eyJ1IjoibnVsbGRlc2lnbiIsImEiOiJjamZrcGdtbnowODdlMndzMmE2ZHc5anlrIn0.fsWuly11P-SWfGz9VntnSg';
	var _url = _api + '/v4/mapbox.terrain-rgb/'+_zoom+'/'+_x+'/'+_y+'.pngraw?access_token=' + _accessToken;
	var _imgUrl = _api + '/v4/mapbox.satellite/'+_zoom+'/'+_x+'/'+_y+'@2x.png256?access_token=' + _accessToken;
	
	//	_imgUrl = 'https://khms0.google.com/kh/v=794?x='+_x+'&y='+_y+'&z='+_zoom;


	var _img = new Image();
	_img.crossOrigin = 'anonymous';
	//$('body').append( _img );
	$( _img ).css({
		'position':'fixed',
		'z-index':100,
		'left':'0px',
		'top':'0px'
	});
	_img.onload = function(e){
		console.log( this.width, this.height );

		_rgbImage = this;

		init();
		setup();
		update();
	}
	_img.src = _url;



	var __img = new Image();
	__img.crossOrigin = 'anonymous';
	//$('body').append( __img );
	$( __img ).css({
		'position':'fixed',
		'z-index':100,
		'left':'512px',
		'top':'0px',
		'zoom': '0.5'
	});
	__img.src = _imgUrl;


	function init(){
		_world = new world('webglView');
		_world.render();
	}

	function setup(){
		var _canvas = document.createElement('canvas');
		_canvas.width = _rgbImage.width;
		_canvas.height = _rgbImage.height;

		_ctx = _canvas.getContext('2d');
		_ctx.drawImage( _rgbImage, 0, 0 );

		var _imagedata = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
		var _data = _imagedata.data;

		var _geometry = new THREE.PlaneGeometry( 100, 100, _canvas.width-1, _canvas.height-1 );
		_geometry.rotateX( - Math.PI * 0.5 );


		//	Use this equation to decode pixel values to height values:
		//	var _height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)

		var _minOffset = Number.POSITIVE_INFINITY;

		var len = _geometry.vertices.length;
		for( var i = 0; i < len; i++ ){
			var _r = _data[ i * 4 + 0 ];
			var _g = _data[ i * 4 + 1 ];
			var _b = _data[ i * 4 + 2 ];
			var _a = _data[ i * 4 + 3 ];
			var _y = - 10000 + ((_r * 256 * 256 + _g * 256 + _b) * 0.1);
			_geometry.vertices[i].y = _y * _scaleHeight;

			_minOffset = _minOffset<_geometry.vertices[i].y?_minOffset:_geometry.vertices[i].y;
		}
		for( var i = 0; i < len; i++ ){
			_geometry.vertices[i].y -= _minOffset;
		}


		// _geometry.colorsNeedUpdate = true;
		// _geometry.elementsNeedUpdate = true;
		// _geometry.uvsNeedUpdate = true;
		_geometry.verticesNeedUpdate = true;
		_geometry.normalsNeedUpdate = true;

		_geometry.computeBoundingBox();
		_geometry.computeBoundingSphere();
		// _geometry.computeFlatVertexNormals();
		_geometry.computeFaceNormals();

		var _texture = new THREE.TextureLoader().load( _imgUrl );
		var _mapHeight = new THREE.TextureLoader().load( _rgbImage.src );
		var _material = new THREE.MeshStandardMaterial({
			map: _texture,
			color: 0xFFFFFF,
			roughness: 1.0,
			metalness: 0.0,
			bumpMap: _mapHeight,
			bumpScale: 16,
			side: THREE.DoubleSide,
			wireframe: false
		});
		_plane = new THREE.Mesh( _geometry, _material );
		_world.add( _plane );

		var _material = new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.1});
		var _wire = new THREE.Mesh( _geometry, _material );
		_wire.position.y = -2;
		//	_world.add( _wire );

		var _geometry = new THREE.PlaneGeometry(100,100,1,1);
		_geometry.rotateX( - Math.PI * 0.5 );
		var _material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, transparent: true, opacity: 0.4});
		var _wire = new THREE.Mesh( _geometry, _material );
		_wire.position.y = -2;
		_world.add( _wire );

	}

	function update(){
		window.requestAnimationFrame( update );
	}

	function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
 	function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

	function tile2long(x,z) {
		return (x/Math.pow(2,z)*360-180);
	}
	function tile2lat(y,z) {
		var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	}

})();



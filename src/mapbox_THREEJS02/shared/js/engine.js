/*
	engine.js
*/

(function(){

	var _world;
	var _plane;
	var _rgbImage;
	var _canvas, _ctx;

	var _zoom = 15;
	var _lng = 139.760668;
	var _lat = 35.67326;

	$('#siteBody').addClass('open');

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

		_zoom = 14;
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


	var _timeStamp = new Date().getTime();



	var _scaleHeight = 64.0 / Math.pow( 2, 24 - _zoom );

	var _x = long2tile( _lng, _zoom );
	var _y = lat2tile( _lat, _zoom );

	var _api = 'https://api.mapbox.com';
	var _accessToken = 'pk.eyJ1IjoibnVsbGRlc2lnbiIsImEiOiJjamZrcGdtbnowODdlMndzMmE2ZHc5anlrIn0.fsWuly11P-SWfGz9VntnSg';
	var _url = _api + '/v4/mapbox.terrain-rgb/'+_zoom+'/'+_x+'/'+_y+'.pngraw?access_token=' + _accessToken;
	var _imgUrl = _api + '/v4/mapbox.satellite/'+_zoom+'/'+_x+'/'+_y+'@2x.png256?access_token=' + _accessToken;

	var _dataSet = [];
	var _grid = 3;

	//	
	init();
	update();

	//	THREE.js with mapbox
	setData( _x, _y, _zoom );
	load();


	function setData( _x, _y, _zoom ){
		for( var i = 0; i < _grid; i++ ){
			for( var j = 0; j < _grid; j++ ){

				var _obj = {};
				_obj.x = _x + i - Math.floor( _grid * 0.5 );
				_obj.y = _y + j - Math.floor( _grid * 0.5 );
				_obj.url = _api + '/v4/mapbox.terrain-rgb/'+_zoom+'/'+_obj.x+'/'+_obj.y+'.pngraw?access_token=' + _accessToken;
				_obj.src = _api + '/v4/mapbox.satellite/'+_zoom+'/'+_obj.x+'/'+_obj.y+'@2x.png256?access_token=' + _accessToken;
				_obj.index = {x:i,y:j};
				_obj.zoom = _zoom;
				_dataSet.push( _obj );
			}
		}

	}

	function load(){
		if( _dataSet.length ){
			var _data = _dataSet.pop();
			var _img = new Image();
			_img.crossOrigin = 'anonymous';
			_img.onload = function(e){
				var _t0 = this;
				var __img = new Image();
				__img.crossOrigin = 'anonymous';
				__img.onload = function(e){
					var _t1 = this;
					createPlane( _data, _t0, _t1 );
					load();
				}
				__img.src = _data.src;
			}
			_img.src = _data.url;
		}
	}

	function createPlane( _dataList, _t0, _t1 ){
		var _canvas = document.createElement('canvas');
		_canvas.width = _t0.width;
		_canvas.height = _t0.height;

		var _ctx = _canvas.getContext('2d');
		_ctx.drawImage( _t0, 0, 0 );

		var _imagedata = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
		var _data = _imagedata.data;

		var _geometry = new THREE.PlaneGeometry( 100, 100, _canvas.width-1, _canvas.height-1 );
		_geometry.rotateX( - Math.PI * 0.5 );

		var len = _geometry.vertices.length;
		for( var i = 0; i < len; i++ ){
			var _r = _data[ i * 4 + 0 ];
			var _g = _data[ i * 4 + 1 ];
			var _b = _data[ i * 4 + 2 ];
			var _a = _data[ i * 4 + 3 ];
			var _y = - 10000 + ((_r * 256 * 256 + _g * 256 + _b) * 0.1);
			_geometry.vertices[i].y = _y * _scaleHeight;
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

		var _texture = new THREE.TextureLoader().load( _t1.src );
		var _mapHeight = new THREE.TextureLoader().load( _t0.src );
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
		var _plane = new THREE.Mesh( _geometry, _material );
		_world.add( _plane );

		_plane.position.x = ( _dataList.index.x - Math.floor( _grid * 0.5 ) ) * 100;
		_plane.position.z = ( _dataList.index.y - Math.floor( _grid * 0.5 ) ) * 100;

	}

	function init(){
		_world = new world('webglView');
		_world.render();
	}

	function update(){

		var _current = new Date().getTime();
		var _duration = _current - _timeStamp;
		_timeStamp = _current;
		var _fps = Math.floor( 1000 / _duration );
		$('h2').text('FPS: ' + _fps);

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



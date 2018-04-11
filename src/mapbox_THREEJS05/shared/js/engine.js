/*
	engine.js
*/

(function(){

	var _world;		//	THREE.jsラッパーライブラリ。自作	
	var _plane;		//	地形Mesh

	//	以下数点が位置情報。lat,lng,zoomはGoogleMapに準じます	
	//	kagura
	var _zoom = 13;
	var _lng = 138.726655;
	var _lat = 36.862498;


	//	hakuba	
	var _zoom = 11;
	var _lng = 137.859266;
	var _lat = 36.695374;

	//	niseko
	// var _zoom = 14;
	// var _lng = 140.657851;
	// var _lat = 42.875400;


	//	AirsRock
	// var _zoom = 12;
	// var _lng = 131.034774;
	// var _lat = -25.344255;


	/*
		緯度経度から表示に使う画像タイルのインデックスを算出。
		zoomによって値が異なる。
		https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
	*/
	var _x = long2tile( _lng, _zoom );
	var _y = lat2tile( _lat, _zoom );

	//	FPS出すための変数。実質不要
	var _timeStamp = new Date().getTime();

	var _dataSet = [];	//	フィールド生成前のデータを格納しておく配列。96行目のsetData( _x, _y, _zoom )でインプット
	var _grid = 2;		//	地形データを表示するのに一変何ますのタイルを使うか。２なら 2*2で4つのタイルを使う
	var _gridSize = 100;	//	１タイルあたりのサイズ
	var _scaleHeight = 64.0 / Math.pow( 2, 24 - _zoom ) * _gridSize / 100;	//	高さの変数

	var _mainCanvas, _mainCtx;	//	テクスチャを保持するcanvas
	var _subCanvas, _subCtx;	//	地形データ画像を保持するcanvas

	var _api = 'https://api.mapbox.com';
	var _accessToken = 'pk.eyJ1IjoibnVsbGRlc2lnbiIsImEiOiJjamZrcGdtbnowODdlMndzMmE2ZHc5anlrIn0.fsWuly11P-SWfGz9VntnSg';





	/*
		execute();
	*/


	//	
	$('#siteBody').addClass('open');	//	フェードイン
	init();		//	THREE.jsとcanvasの初期化
	update();	//	FPS表示計算開始
	setData( _x, _y, _zoom );	//	先ほど出したタイルのインデックスとzoomからデータセットを生成
	load();	//	生成されたデータセットから画像を読み込み、3Dに変換。


	/*
		Method
	*/
	function init(){
		//	THREE.js
		_world = new world('webglView');
		_world.render();

		//	texture
		_mainCanvas = document.createElement('canvas');
		_mainCanvas.width = 512 * _grid;
		_mainCanvas.height = 512 * _grid;
		_mainCtx = _mainCanvas.getContext('2d');

		//	rgb
		_subCanvas = document.createElement('canvas');
		_subCanvas.width = 256 * _grid;
		_subCanvas.height = 256 * _grid;
		_subCtx = _subCanvas.getContext('2d');
	}

	function update(){
		var _current = new Date().getTime();
		var _duration = _current - _timeStamp;
		_timeStamp = _current;
		var _fps = Math.floor( 1000 / _duration );
		$('h2').text('FPS: ' + _fps);

		window.requestAnimationFrame( update );
	}

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


	//	meshが大きすぎるときに。荒れるので再考。
	function resizeCanvas(){
		var _canvas = document.createElement('canvas');
		_canvas.width = 256;
		_canvas.height = 256;
		var _ctx = _canvas.getContext('2d');

		_ctx.drawImage( _subCanvas, 0, 0, _subCanvas.width, _subCanvas.height, 0, 0, 256, 256 );
		_subCanvas = _canvas;
		_subCtx = _ctx;
	}

	//	画像を読み込んでCanvasに転写していく。
	//	一枚の大きなIMGを使うことで複数のmeshを使わなくて済む	
	//	エラー処理が抜けてるのであとでやる
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
					var _x = _data.index.x;
					var _y = _data.index.y;
					_subCtx.drawImage( _t0, _x * 256, _y * 256 );
					_mainCtx.drawImage( _t1, _x * 512, _y * 512 )

					setTimeout( load, 100 );
				}
				__img.src = _data.src;
			}
			_img.src = _data.url;
		} else {
			//resizeCanvas();
			createPlane();
		}
	}

	function createPlane(){
		//	地形用のIMGからピクセル単位で値を取得していく
		var _imagedata = _subCtx.getImageData(0, 0, _subCanvas.width, _subCanvas.height);
		var _data = _imagedata.data;

		var _geometry = new THREE.PlaneGeometry( _gridSize * _grid, _gridSize * _grid, _subCanvas.width-1, _subCanvas.height-1 );
		_geometry.rotateX( - Math.PI * 0.5 );

		var _posMin = Number.POSITIVE_INFINITY;	//	標高が高いところは見切れるので、均す作業

		var len = _geometry.vertices.length;
		for( var i = 0; i < len; i++ ){
			var _r = _data[ i * 4 + 0 ];
			var _g = _data[ i * 4 + 1 ];
			var _b = _data[ i * 4 + 2 ];
			var _a = _data[ i * 4 + 3 ];
			var _posy = - 10000 + ((_r * 256 * 256 + _g * 256 + _b) * 0.1);	//	色情報を高度に変換するおきまりの式
			_geometry.vertices[i].y = _posy * _scaleHeight;

			_posMin = _posMin < _posy ? _posMin : _posy;
		}
		for( var i = 0; i < len; i++ ){
			_geometry.vertices[i].y -= _posMin * _scaleHeight;
		}

		_geometry.verticesNeedUpdate = true;
		_geometry.normalsNeedUpdate = true;

		_geometry.computeBoundingBox();
		_geometry.computeBoundingSphere();
		_geometry.computeFaceNormals();

		/*
			各画像をTHREE.Materialにセット。

		*/
		var _t1 = _mainCanvas.toDataURL("image/png");
		var _t0 = _subCanvas.toDataURL("image/png");
		var _texture = new THREE.TextureLoader().load( _t1 );
		var _mapHeight = new THREE.TextureLoader().load( _t0 );
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

		//	頂点数とポリゴン数の表記。いらない
		var _vertices = _geometry.vertices.length;
		var _faces = _geometry.faces.length;
		$('#siteFoot p').text( 'Vertex: ' + _vertices + ', Faces: ' + _faces );

		//	check	
		//	ピンを立ててみる。
		//	エアーズロックと座標設定の点にピンを打つ。
		var _poslist = [
			[_lat, _lng],
			[-25.352173, 131.033198],
			[-25.342787, 131.021568],
			[-25.358921, 131.017362]
		];

		var len = _poslist.length;
		for( var i = 0; i < len; i++ ){
			var _pos = fromLatLngToPoint( _poslist[i][0], _poslist[i][1], _zoom);
			var _localX = ( _pos.x - ( _x * 256 ) );
			var _localY = ( _pos.y - ( _y * 256 ) );
			var _parX = _localX / 256;
			var _parY = _localY / 256;
			var _geometry = new THREE.PlaneGeometry( 3, 3 );
			_geometry.rotateX( - Math.PI * 0.5 );
			var _material = new THREE.MeshBasicMaterial({color: 0xFF0000, wireframe: true});
			var _offset = _grid%2==0?0.5:0;

			var _pos = {x:0,y:0,z:0};
			_pos.x = _parX * _gridSize - Math.floor( _gridSize * 0.5 ) + _gridSize * _offset;
			_pos.y = 0;
			_pos.z = _parY * _gridSize - Math.floor( _gridSize * 0.5 ) + _gridSize * _offset;

			//	pin
			var _pin = new THREE.Mesh( _geometry, _material );
			_pin.position.x = _pos.x;
			_pin.position.y = _pos.y;
			_pin.position.z = _pos.z;
			_world.add( _pin );

			//	Raycaster
			//	_planeの指定位置の高さを算出するため、Raycasterというものをつかう。
			var _start = new THREE.Vector3( _pos.x, 0, _pos.z );
			var _dir = new THREE.Vector3( 0, 1, 0 );
			var _ray = new THREE.Raycaster( _start, _dir );
			var objs = _ray.intersectObjects( [_plane] );
			var _pinOffset = 20;

			if (objs.length > 0) {
				_pin.position.y = objs[0].distance + _pinOffset;
			}

			var _geometry = new THREE.Geometry();
			_geometry.vertices[0] = new THREE.Vector3( 0, 0, 0 );
			_geometry.vertices[1] = new THREE.Vector3( 0, _pinOffset, 0 );
			var _material = new THREE.LineBasicMaterial({color: 0xFF0000});
			var _line = new THREE.Line( _geometry, _material );
			_line.position.x = _pos.x;
			_line.position.y = _pin.position.y - _pinOffset;
			_line.position.z = _pos.z;
			_world.add( _line );


		}
	}

	//	以下座標変換系

	function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
 	function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
	function tile2long(x,z) {
		return (x/Math.pow(2,z)*360-180);
	}
	function tile2lat(y,z) {
		var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	}
	function fromLatLngToPoint( _lat, _lng, z ){
		var L = 85.0511287798066;
		var PI = Math.PI;
		var _x = Math.pow( 2, z + 7 ) * ( _lng / 180 + 1 );
		var _sinLat = Math.sin( PI / 180 * _lat );
		var _sinL = Math.sin( PI / 180 * L );
		var _y = Math.pow( 2, z + 7 ) / PI * 
		(
			- 1/2 * Math.log( (1.0 + _sinLat)/(1.0 - _sinLat ) )
		+
			1/2 * Math.log( (1.0 + _sinL)/(1.0 - _sinL ) )
		);
		return {x:_x>>0,y:_y>>0};
	}

	/*
		参考URL
		https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
		http://www.trail-note.net/tech/coordinate/
		http://hosohashi.blog59.fc2.com/blog-entry-5.html
		https://ja.wikipedia.org/wiki/逆三角関数
		https://mathtrain.jp/invhyp
		https://www.mapbox.com/blog/tags/terrain/
	*/
})();



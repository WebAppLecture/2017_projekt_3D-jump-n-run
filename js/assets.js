class Assets{
    /*
    Klasse für alle verwendeten Bilder/3D-Modelle/Musik
     */

    /*
    Funktion zum Laden der verwendeten Daten
     */
	static loadAssets(){
		//Laden des Characters
		let loader= new THREE.ObjectLoader();//erstellen eines neuen Lade-Objekts
		loader.load( "assets/3d/character.json", function ( loadedObject ) {
			let mesh= loadedObject.children[0];
			//scene.add(mesh);
						
			mesh.scale.set(0.01,0.01,0.01);//Setzen der passenden Skalierung
					
			Assets.character=mesh;
            g.start();//Starten
        });

        //Laden der Audio-Dateien
		loader = new THREE.AudioLoader();
		loader.load( 'assets/music/bigjump.wav', function( buffer ) {
            Assets.jump=buffer;
            g.start();
        });
        loader.load( 'assets/music/forest_theme.mp3', function( buffer ) {
            Assets.forest_theme=buffer;
            g.start();
        });
        loader.load( 'assets/music/forest3.ogg', function( buffer ) {
            Assets.forest3=buffer;
            g.start();
        });
        loader.load( 'assets/music/fortress.ogg', function( buffer ) {
            Assets.fortress=buffer;
            g.start();
        });
        loader.load( 'assets/music/invincible_start.ogg', function( buffer ) {
            Assets.start=buffer;
            g.start();
        });
        loader.load( 'assets/music/leveldone.ogg', function( buffer ) {
            Assets.leveldone=buffer;
            g.start();
        });
        loader.load('assets/music/gameover.mp3',function(buffer){
        	Assets.gameover = buffer;
            g.start();
        });
        loader.load('assets/music/dead.mp3',function(buffer){
            Assets.dead = buffer;
            g.start();
        });

        //Laden der Texturen
		loader = new THREE.TextureLoader();
		loader.load('assets/textures/sky_up.jpg',
		function ( texture ) {
			Assets.sky_up=texture;
            g.start();
        });
		loader.load('assets/textures/sky_dn.jpg',
		function ( texture ) {
			Assets.sky_dn=texture;
            g.start();
        });
		loader.load('assets/textures/sky_bk.jpg',
		function ( texture ) {
			Assets.sky_bk=texture;
            g.start();
        });
		loader.load('assets/textures/sky_ft.jpg',
		function ( texture ) {
			Assets.sky_ft=texture;
		});
		loader.load('assets/textures/sky_rt.jpg',
		function ( texture ) {
			Assets.sky_rt=texture;
            g.start();
        });
		loader.load('assets/textures/sky_lf.jpg',
		function ( texture ) {
			Assets.sky_lf=texture;
            g.start();
        });
		loader.load('assets/textures/box1.jpg',
		function ( texture ) {
			Assets.tex_box1=texture;
            g.start();
        });
		loader.load('assets/textures/box2.jpg',
		function ( texture ) {
			Assets.tex_box2=texture;
            g.start();
        });
		loader.load('assets/textures/box3.jpg',
		function ( texture ) {
			Assets.tex_box3=texture;
            g.start();
        });
		loader.load('assets/textures/box0.jpg',
		function ( texture ) {
			Assets.tex_box0=texture;
            g.start();
        });
	}

	/*
	Funktion:
	Überprüfen, ob alles geladen wurde
	*/
	static notReady(){
		return !Assets.dead||!Assets.gameover||!Assets.character||!Assets.jump||!Assets.forest_theme||! Assets.forest3||!Assets.fortress||!Assets.start||!Assets.leveldone||!Assets.sky_up||!Assets.sky_dn||!Assets.sky_bk||!Assets.sky_ft||!Assets.sky_rt||!Assets.sky_lf||!Assets.tex_box1||!Assets.tex_box2||!Assets.tex_box3||!Assets.tex_box0;
	}

}

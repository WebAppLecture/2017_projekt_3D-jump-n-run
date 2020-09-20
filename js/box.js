class Box{
	/*
	Klasse zum Speichern der Boxen für das Spiel
	 */

	/*
	Funktion:
	Erzeugt eine neue Box an der Stelle x,y,z mit zufälligen Breiten; goal gibt an, ob es sich um die Zielbox handelt
	 */
    constructor(x=0,y=0,z=0,goal=false){
		this.position = new THREE.Vector3(x, y, z);//Speichern der Position der Box
        var geometry = new THREE.BoxGeometry(Math.random()*10+2, Math.random()*10+2, Math.random()*10+2);//Box mit zufälliger Breite
        if(goal){//Ist diese Box die Zielbox?
			var material = new THREE.MeshPhongMaterial({map: Assets.tex_box0});//Material für das Ziel
		}else{
			switch(Math.floor(Math.random()*3)){//zufällige Wahl einer anderen Textur
				case 0:
					var material = new THREE.MeshPhongMaterial({map: Assets.tex_box1});
					break;
				case 1:
					var material = new THREE.MeshPhongMaterial({map: Assets.tex_box2});
					break;
				case 2:
					var material = new THREE.MeshPhongMaterial({map: Assets.tex_box3});
					break;
			}
		}
        this.mesh = new THREE.Mesh(geometry, material);//Erzeugen des Mesh für die Box
        this.mesh.position.x = x;//Setzen der x-Koordinate
        this.mesh.position.y = y;//Setzen der y-Koordinate
        this.mesh.position.z = z;//Setzen der z-Koordinate

        this.bbox= new THREE.Box3().setFromObject(this.mesh);//Berechnung der Bounding-Box
        this.goal=goal;//Speichern, ob diese Box das Ziel ist
    }
}

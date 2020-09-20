class Player{
	/*
	Klasse zum Verwalten des Spielcharakters
	 */

	/*
	Konstruktor:
	Erzeugt einen neuen Spieler an der Position x,y,z mit dem Namen user
	 */
    constructor(user, x=0,y=0,z=0){
        this.position = new THREE.Vector3(x, y, z);//Position des Spielers speichern

        this.mesh=new THREE.Group();//Player-Mesh ist eine Gruppe von Meshes

        this.mesh.add(Assets.character);//geladenen Charakter hinzufügen
        this.mesh.position.x = x;//x-Koordinate zuweisen
        this.mesh.position.y = y;//y-Koordinate zuweisen
        this.mesh.position.z = z;//z-Koordinate zuweisen

		this.mixer = new THREE.AnimationMixer( this.mesh.children[0] );//AnimationMixer für Lauf-Animation erstellen

        //Aktionen des Spieler-Models definieren
		this.idleAction = this.mixer.clipAction( 'idle' );
		this.walkAction = this.mixer.clipAction( 'walk' );
		this.runAction = this.mixer.clipAction( 'run' );


		this.idleAction.play();//Idle action abspielen, Spieler steht still
        //Keine Aktion soll gerade pausiert sein
		this.idleAction.paused=false;
        this.runAction.paused=false;
		this.walkAction.paused=false;


        let light = new THREE.PointLight(0xffddff,1,100);//Erstellen einer Lichtquelle
		light.position.set(0,10,25);//Position des Lichts relativ zum Spieler
		light.target = this.mesh;//Licht soll auf den Spieler zeigen
		this.mesh.add(light);//Licht hinzufügen
		

        //Optionen für das TeilchenSystem
		this.particleOptions = {
			position: new THREE.Vector3(0,1.8,0.9),//Positon des Systems am Rücken des Models
			positionRandomness: 0,//Keine Variation der Position
			velocity: new THREE.Vector3(0,-10,0),//Ausstoß nach unten
			velocityRandomness: 1,//Zufallsgeschwindigkeit hinzufügen
			color: 0xaa88ff,//Farbe festlegen
			colorRandomness: .2,//Farbe soll leicht variieren
			turbulence: 0,//Keine Turbulenzeffekte
			lifetime: 0.1,//Lebensdauer einstellen
			size: 20,//Größe der Teilchen
			sizeRandomness: 10//zufällige Größe
		};

		//PartikelSystem erstellen
		this.particleSystem = new THREE.GPUParticleSystem( {
			maxParticles: 250000//Erlaube maximal 250.000 Teilchen
		});
			
		this.mesh.add( this.particleSystem );//Partikel System hinzufügen
		this.tick=0;//Zähler für das PartikelSystem auf 0 setzen

        this.cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);//Kamera ertellen, field of view: 75; aspect-Ratio; nearClipping:0.1; farClipping:1000
        this.cam.position.x=x;//x-Position setzen
        this.cam.position.y=y+2;//y-Position setzen
        this.cam.position.z=z+4;//z-Position setzen
        this.cam.lookAt(this.position);//Kamera soll auf Spielerposition schauen

        this.vy=0;//Geschwindigkeit des Charakters nach unten ist 0
        this.left=0;//Keine Geschwindigkeit nach links/rechts
        this.forward=0;//Keine Geschwindigkeit vor/zurück
        this.phi=0;//Keine Rotation des Charakters
        this.phi_alt=0;//Speichervariable für die vorherige Rotationsstellung
        
        this.lives=3;//Spieler hat 3 leben
        this.level=1;//level des Spielers ist 1
        this.user=user;//Spichern des Namens
        this.spawnParticle=false;//Keine Partikel erstellen
        this.jumpEnable=false;//Sprung nicht erlaubt
        
        $("#leben").empty();//Leben-Platzhalter leeren
        for(let i=0;i<this.lives;i++){
			$("<img>").attr("src","assets/images/heart.gif").attr("class","heart").appendTo($("#leben"));//Herzen hinzufügen
		}
    }

    /*
    Funtkion:
    updaten des Gesamten spielers (Umsetzen der Änderungen)
     */
    updateAll(){
		if(this.forward!==0){//Wenn sich der Charakter bewegt
            this.runAction.timeScale=-this.forward;//Zeitskala gegebenenfalls invertieren, sonst läuft Charakter falsch herum
			this.idleAction.stop();//idleAction stoppen
			this.runAction.play();//runAction starten
		}else{
			this.runAction.stop();//Runaction stoppen
			this.idleAction.play();//idleAction starten
		}
        //Mesh-Position updaten
        this.mesh.position.x=this.position.x;
        this.mesh.position.y=this.position.y;
        this.mesh.position.z=this.position.z;
        //Winkel übernehmen
        this.phi_alt=this.phi;
        //Kamera-Position updaten, => gegebenenfalls Rotation der Kamera
        this.cam.position.x=this.position.x+4*Math.sin(this.phi);
        this.cam.position.y=this.position.y+2;
        this.cam.position.z=this.position.z+4*Math.cos(this.phi);
        this.cam.lookAt(this.position);//Kamera soll zum Spieler zeigen
    }

    /*
    Funktion:
    Tostet ob eine Kollsion vorliegt, behandelt zudem das erfolgreiche Absolvieren eines Levels; Gibt true zurück, wenn eine Kollsion vorliegt ansonsten false
     */
	collisionDetect(objects){
		this.bbox= new THREE.Box3().setFromObject(this.mesh);//Berechne die Bounding Box des Charakters

		for(let i in objects){//Gehe alle Objekte (Boxen) durch
			if(objects[i].bbox.intersectsBox(this.bbox)){//Wenn sich die Boxen durchdringen
				if(objects[i].goal){//Ist die Box das Ziel?
                    let levelEndSound = new THREE.Audio(g.listener);//Erstellen des Sounds für den erfolgreichen Abschluss eines Levels
                    levelEndSound.setBuffer(Assets.leveldone);//Stezen des Buffers
                    levelEndSound.onEnded=function(){
                        g.levelSound.play();//Wenn der levelEndSound beendet ist, wird der levelSound wieder gestartet
                    };
                    levelEndSound.play();//levelEndSound abspielen
                    g.levelSound.pause();//levelSound pausieren

					$("#message_text").html("Level "+this.level+" Gewonnen. <br> Weiter zum nächsten Level!");//Meldung ausgeben
					$("#RGBA-overlay").show().unbind("click").click(function(){//alte behandlung des Klickens entfernen und neue hinzufügen
						g.reset();//Game zurücksetzen
						$("#RGBA-overlay").hide();//Schriftzug entfernen
						g.pause=false;//Spiel nicht mehr pausieren
						g.animate();//Animation wieder starten


						levelEndSound.stop();//levelEndSound stoppen
					});
					this.level+=1;//level erhöhen
					$("#level").text("Level "+this.level);//level in Titelleiste anzeigen

                    this.phi=0;//Winkel zurücksetzen
                    this.mesh.rotateY(this.phi-this.phi_alt);//Spieler zurückdrehen

					g.pause=true;//Spiel pausieren
				}
				return true;//Kollision --> true zurückgeben
			}
		}
		return false;//Keine Kollsion --> false zurückgeben
	}

	/*
	Funktion:
	Update des Spielers soll von außen aufgerufen werden, Übergabe der Objekte mit denen der Spieler kollidieren soll
	 */
    update(objects) {
        if(this.tick<0){//Ist der Zähler kleiner als 0, eventuell kann beim Hochzählen ein Überlauf auftreten
            this.tick = 0;//this.tick=0
        }else{
            this.tick+=1/60;//this.tick erhöhen
        }

		if(this.spawnParticle) {//Partikel erzeugen
            for (let x = 0; x < 100; x++) {//100 Partikel erzeugen
                this.particleSystem.spawnParticle(this.particleOptions);//1 Partikel erzeugen
            }
        }
		this.particleSystem.update(this.tick);//PartikelSystem updaten
		
		if(this.position.y<-30){//Ist der Spieler schon zu tief gefallen?
			this.vy=0;//vy auf 0 zurücksetzen

			this.updateAll();//Spieler updaten
			this.lives --;//ein Leben abziehen
			$("#leben").empty();//Leben-Platzhalter leeren
			if(this.lives===0){//Hat der Spieler keine Leben mehr?
                let gameOverSound = new THREE.Audio(g.listener);//GameOverSound erstellen
                gameOverSound.setBuffer(Assets.gameover);//Buffer setzen
                gameOverSound.play();//GameOverSound abspielen
                g.levelSound.pause();//levelSound pausieren

                let self = this;//Referenz auf den Spieler

				$("#message_text").text("Game over!");//GameOver Text anzeigen
				$("#RGBA-overlay").show().unbind( "click" ).click(function(){//Funktion beim klicken auf den Text ändern
					if(localStorageEnabled&&cookiesEnabled){//Wenn localStorage und cookies eingeschalten
						g.highscores.push({"name":self.user,"level":self.level-1});//Spielstand zum Highscore array hinzufügen
						g.highscores.sort(function(a,b){return b.level-a.level;});//Array sortieren
						if(g.highscores.length>6){//Wenn das Array zu lang, ein Element entfernen
							g.highscores.pop();//Element entfernen
						}
						localStorage.setItem("highscores",JSON.stringify(g.highscores));//highscores speichern
						for(let i in g.highscores){//Liste mit highscores auf dem Willkommensbildschirm anpassen
							$($("ol>li")[i]).empty().append($("<span>").attr("class","high_name").text(g.highscores[i].name)).append($("<span>").attr("class","high_level").text(g.highscores[i].level));
						}
					}
					if(gameOverSound.isPlaying){//GameOverSound pausieren, falls er noch spielt
                        gameOverSound.pause()
                    }
					g.destroy();//Spiel entfernen
					$("#RGBA-overlay").hide();//Text entfernen
				});
				g.pause=true;//Animation pausieren
			}else{
                let gameOverSound = new THREE.Audio(g.listener);//gameOverSound (in diesem fall für den Tod des Charakters) erstellen
                gameOverSound.setBuffer(Assets.dead);//Buffer setzen
                let self = this;//Referenz auf Player speichern
                gameOverSound.onEnded=function(){//Wenn der gameOverSound aus ist
                    g.pause=false;//pausieren beenden
                    //Position des Spielers zurücksetzen
                    self.position.x=0;
                    self.position.y=20;
                    self.position.z=0;
                    g.animate();//animation starten
                    g.levelSound.play();//levelSound sbspielen
                };
                gameOverSound.play();//gameOverSound abspielen
                g.levelSound.pause();//gameOverSound pausieren
                g.pause=true;//Animation pausieren
			}
			for(let i=0;i<this.lives;i++){//Leben neu zeichnen
				$("<img>").attr("src","assets/images/heart.gif").attr("class","heart").appendTo($("#leben"));
			}
			return; //beenden des Update-Steps
		}
		
		//Herunterfallabfrage - Gravitation
		this.vy-=0.0138435897;//Gravitation
		this.mesh.position.y+=this.vy;//nur Postion des Mesh aktualisieren
		if(this.collisionDetect(objects)){//ist Kollision aufgetreten
			this.updateAll();//updaten des Spielers, es ändert sich im Prinzip nichts, da der Mesh durch this.psoition überschrieben wird
			this.vy=0;//y-Geschwindigkeit zurücksetzen
			this.jumpEnable=true;//Spieler kann Springen
            this.tick_jump = this.tick;//Speichern der zeit der Kollision
		}else{
		    if(this.tick-this.tick_jump>0.1){//Ist ungefähr 1/10 Sekunde vergangen?
                this.jumpEnable=false;//Spieler kann nicht mehr springen
            }
			this.position.y+=this.vy;//positon des Charakters aktualisieren
		}
		
		this.phi -= this.left/30;//Winkel ändern, bei links/rechts
		this.mesh.rotateY(this.phi-this.phi_alt);//mesh um Winkeldifferenz rotieren
        //Charakter-Mesh von Kamera wegbewegen
		this.mesh.position.x-=this.forward * 0.2*this.cam.getWorldDirection().x;
        this.mesh.position.z-=this.forward * 0.2*this.cam.getWorldDirection().z;
        
        if(this.collisionDetect(objects)){//Kollsionsdetektion ausführen
			this.mesh.rotateY(-(this.phi-this.phi_alt));//Spieler zurückdrehen
			this.phi = this.phi_alt;//Winkel zrücksetzen
			this.updateAll();//Spieler updaten
			return;//Update-Step Beenden
		}

        //Chrakter von Kamera wegbewegen
        this.position.x -= this.forward * 0.2*this.cam.getWorldDirection().x;
        this.position.z -= this.forward * 0.2*this.cam.getWorldDirection().z;

        this.updateAll();//mesh und Kamera updaten
    }

    get camera(){
        return this.cam;//Kamera zurückgeben
    }

    /*
    Funktion:
    Springen des Spielers
     */
    jump(){
		if(this.jumpEnable){//Ist Springen erlaubt?
			this.vy=0.5;//Geschwindigkeit nach oben
			this.spawnParticle=true;//Teilchen erzeugen
			let self= this;//Speichern einer Player-Referenz
			setTimeout(function(){//nach einer halben Sekunde keine Teilchen mehr erzeugen
				self.spawnParticle=false;
			},500);

            let jumpSound = new THREE.Audio(g.listener);//jumpSound erzeugen
            jumpSound.setBuffer(Assets.jump);//buffer setzen
            jumpSound.play();//jumpSound abspielen
		}
	}
}

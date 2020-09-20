let cookiesEnabled = true;//Cookies eingeschaltet
let localStorageEnabled = true;//localStorage verfügbar

let g;//Variable für das Game-Objekt

function Game(){
    /*
    Hauptklasse des Projekts, verwaltet das gesamte Spiel
     */
    let scene, renderer, player, username, objects;//einige lokale Variablen
    this.pause = false;//legt fest, ob animation pausiert wird
    let clock = new THREE.Clock();//Clock, zur Messung der Zeit für die Update steps




    /*
    Funktion:
    Setzt nach erflogreichem Level Blöcke neu. Erzeugt Blöcke beim Starten des Spiels
     */
    this.reset = function(){
        scene.children = [];//Löschen der Szene

        objects = [];//Löschen der Objekte und Erzeugen eines neuen Arrays
        let startingBox = new Box();//Erzeugen der Startbox, auf dieser wird der Spieler beginnen
        objects.push(startingBox);//startingbox zum Objektarray hinzufügen
        scene.add(startingBox.mesh);//startingBox zur Szene hinzufügen

        //Erzeugen der Blöcke bis zur Zielbox
        let position = new THREE.Vector3();//Definition eines Positionsvektors
        for (let i = 0; i < player.level+2; i++) {//Erzeugen des Wegs in einer for-Schleife
            let diff = new THREE.Vector3();//Vektor zum Speichern der Differenz zur vorherigen Box
            if (Math.floor(Math.random() * 2) === 1) {//Soll eine Zufallsbox erzeugt werden?, Diese soll der Verwirrung dienen
                diff.x = Math.random() * 8 + 12; //Setzen der x-Koordinate des Differenzvektors
                diff.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() / 10 * Math.PI - 0.2);//Zufällige Rotation um z-Achse
                diff.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 2 * Math.PI);//zufällige Rotation um y-Achse
                position.add(diff);//Differenz zur aktuellen position hinzufügen
                let box = new Box(position.x, position.y, position.z);//Box erstellen
                objects.push(box);//box dem Objektarray hinzufügen
                scene.add(box.mesh);//box zur Szene hinzufügen
                position.sub(diff);//Differenzvektor wieder abzeihen, kehrt zum Ausgangspunkt zurück (als ob keine Verwirrungsbox erzeugt wurde)
            }
            //Erstellen der eigentlichen Box zum vorwärts gehen
            diff.x = -(Math.random() * 4 + 10);//Setzen der x-Koordinate
            diff.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() / 10 * Math.PI - 0.2);//Rotation um die z-Achse
            diff.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI / 2 - Math.PI / 4);//Rotation um die y-Achse
            position.add(diff);//Addieren der Differenz
            let box = new Box(position.x, position.y, position.z);//Box erstellen
            objects.push(box);//box dem Objektarray hinzufügen
            scene.add(box.mesh);//box zur Szene hinzufügen
        }

        //Zielbox erstellen
        let diff = new THREE.Vector3();//Vektor zum Speichern der Differenz zur vorherigen Box
        diff.x = Math.random() * 4 + 10;//Setzen der x-Koordinate
        diff.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() / 6 * Math.PI);//Rotation um die z-Achse
        diff.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 2 * Math.PI);//Rotation um die y-Achse
        position.add(diff);//Addieren der Differenz

        let box = new Box(position.x, position.y, position.z, true);//Box erstellen
        objects.push(box);//box dem Objektarray hinzufügen
        scene.add(box.mesh);//box zur Szene hinzufügen


        //Skybox erstellen
        //zunächst ein array für die Materialien, der 6 Flächen
        let materialArray = [];
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_ft,
            side: THREE.BackSide
        }));
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_bk,
            side: THREE.BackSide
        }));
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_up,
            side: THREE.BackSide
        }));
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_dn,
            side: THREE.BackSide
        }));
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_lf,
            side: THREE.BackSide
        }));
        materialArray.push(new THREE.MeshBasicMaterial({
            map: Assets.sky_rt,
            side: THREE.BackSide
        }));

        let skyGeometry = new THREE.CubeGeometry(500, 500, 500);//Erstellen der Skybox
        let skyMaterial = new THREE.MeshFaceMaterial(materialArray);//Hinzufügen des Materials
        let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);//Erstellen der Skybox
        scene.add(skyBox);//skyBox zur Szene hinzufügen

        let light = new THREE.AmbientLight(0x444444); // Erstellen eines AmbientLight zur Ausleuchtung der Umgebung
        scene.add(light);//Licht zur Szene hinzufügen

        player.left = 0;//Spieler soll sich noch nicht nach links bewegen
        player.forward = 0;//Spieler soll sich noch nicht nach rechts bewegen
        player.position = new THREE.Vector3(0, 20, 0);//Position des Spieler auf die Startposition setzen
        scene.add(player.mesh);//Spieler hinzufügen


        let StartSound = new THREE.Audio(this.listener);//einen neues Audio erstellen, Sound bei Beginn des Levels
        StartSound.setBuffer(Assets.start);//Audio-Buffer setzen

        if(this.levelSound.isPlaying){//Wenn levelSound gerade noch spielt,
            this.levelSound.stop();//diesen Stoppen
        }

        switch(Math.floor(Math.random()*3)){//Zufällig einen Sound auswählen, und als Buffer setzen
            case 0:
                this.levelSound.setBuffer( Assets.forest_theme );
                break;
            case 1:
                this.levelSound.setBuffer(Assets.forest3);
                break;
            case 2:
                this.levelSound.setBuffer(Assets.fortress);
        }

        this.levelSound.setLoop(true);//endlos spielen
        this.levelSound.setVolume(0.5);//Lautstärke auf 0.5 setzen
        let self = this;//Variable zum Zugriff auf das Game-Objekt
        StartSound.onEnded= function(){//Wenn der StartSound geendet hat,
            self.levelSound.play();//levelSound abspielen
        };
        StartSound.play();//StartSound abspielen
    };


    /*
    Funktion:
    Startet das Spiel, nach dem Laden aller Dateien
     */
    this.start = function() {
        if(Assets.notReady()){//Sind alle Dateien geladen?
            return;//Breche ab, wenn noch nicht alles geladen ist
        }

        $("#loader").remove();//Entferne Ladezeichen

        $("#audio")[0].pause();//Pausiere Musik, des Willkommensbildschirms
        $("#audio")[0].currentTime = 0;//Setze Zeit der Willkommensmusik auf 0 zurück

        player = new Player(username, 0, 20, 0);//Erstelle neuen Spieler

        this.listener = new THREE.AudioListener();//Erzeuge einen Audio Listener
        player.cam.add( this.listener );//Füge ihn der Kamera hinzu
        this.levelSound = new THREE.Audio(this.listener );//Erstelle ein levelSound Objekt, dieses spielt die Hintergrundmusik

        this.reset(); //generiere Szene (Blöcke, SkyBox, Sounds)

        this.animate();//Starte die Animation
    };

    /*
    Funktion:
    Erzeuge Renderer, Scene, KeyHandler
     */
    let initScene = function() {
        scene = new THREE.Scene({fixedTimeStep: 1 / 60});//Erstellen einer neuen Szene mit fixem TimeStep

        renderer = new THREE.WebGLRenderer({antialias: true});//Erzeuge einen neuen Renderer
        renderer.setSize(window.innerWidth, window.innerHeight);//Setze Breite und Höhe
        renderer.shadowMapEnabled = true;//Schatten
        renderer.shadowMapSoft = true;
        let domElement = renderer.domElement;//hole das domElement des Renderers (ist ein Canvas, welches über WebGL die Szene anzeigt)
        $("#game").append(domElement);//Füge dieses dem Game-div hinzu

        document.body.onresize = function () {//Wenn die Größe des Fensters geändert wird
            player.camera.aspect = window.innerWidth / (window.innerHeight - 40);//neuen Aspect ratio einstellen, -40 wegen der Kopfzeile
            player.camera.updateProjectionMatrix();//updaten der Camera
            domElement.width = window.innerWidth;//domElement bekommt neue width
            domElement.height = (window.innerHeight - 40);//domElement bekommt neue height
            renderer.setSize(window.innerWidth, (window.innerHeight - 40));//renderer wird die neue Größe mitgeteilt
        };

        //User Interaction
        $('body').keydown(function (e) {//KeyDown
            handleKeyDown(e.which || e.keyCode);//Funktionsaufruf: behandle KeyDownEvent
        }).keyup(function (e) {//KeyUp
            handleKeyUp(e.which || e.keyCode);//Funktionsaufruf: behandle KeyUpEvent
        });

        $("#game")[0].ondblclick = fullscreen;//beim Doppelklicken in den Vollbildmodus wechseln, Übergabe der entsprechenden Funktion

        if(Assets.notReady()) {//Wenn noch nicht alle Dateien geladen
            Assets.loadAssets();//Laden aller Dateien, führt nach dem Laden automatisch g.start() aus
        }else{
            g.start();//Andernfalls Starten des Programms
        }
    };

    /*
    Funktion:
    init wird sofort beim Start ausgeführt definiert notwendige JavaScript Aktionen beim Klicken auf Knöpfe
     */
    this.init = function() {
    	if (!navigator.cookieEnabled) {//Sind Cookies eingeschaltet?
            cookiesEnabled = false;//Setzen der cookiesEnabled Variable auf false, wenn Cookies ausgeschaltet
        } else if (typeof(localStorage) === 'undefined') {//Gibt es das localStorage Objekt (oder z.B. sessionStorage) Objekt nicht?
            localStorageEnabled = false;//localStorage ist nicht vorhanden
        }


        $("#game").hide();//Verstecken des game-divs
        $("#RGBA-overlay").hide().click(function () {//Definieren einer Funktion welche das RGBA-overlay versteckt sollte es angezeigt werden
            $("#RGBA-overlay").hide();
        });

        $("#start").click(function () {//Definition der Aktion beim Klicken auf den Startknopf
            username = $("#username").val();//Auslesen des Benutzernamens
            if (username.length > 15) {//Ist der Name zu lang
                $("#name_err").text("Der Name darf maximal 15 Zeichen enthalten");//Fehlermeldung ausgeben
                return;//Spielstart abbrechen
            }
            $("#welcome").hide();//Verstecken des Wilkommensbildschirms
            $("#game").show();//game-div anzeigen
            $("#level").text("Level 1");//Levelanzeige auf "Level 1" stellen
            $("#user").text(username);//username anzeigen
            $("<img>").attr("src", "assets/images/loader.gif").attr("id", "loader").insertAfter($("#titlebar")); //img-Tag für Loader erstellen erstellen, attribute Setzen und nach titlebar einfügen
            g.pause = false;//Keine Pause der Animation
            initScene();//Funktionsaufruf initScene
        });

        $("#help").click(function(){//Beim drücken des ?-Knopfes
           $("#welcome").hide();//Willkommensbildschirm verstecken
           $("#helpPage").show();//Hilfeseite anzeigen
        });

        $("#backToWelcome").click(function(){
            $("#welcome").show();//Willkommensbildschirm anzeigen
            $("#helpPage").hide();//Hilfeseite verstecken
        });

        $("#username").keyup(function () {//KeyUpEvent, live anzeige, ob Username zu lang ist
            username = $("#username").val();//Username auslesen
            if (username.length > 15) {//Username zu lang?
                $("#name_err").text("Der Name darf maximal 15 Zeichen enthalten");//Error anzeigen
            } else {
                $("#name_err").empty();//Error löschen
            }
        });

        g.highscores=[];//Initialisiern des Arrays
        if (cookiesEnabled && localStorageEnabled) {//Cookies und localStorage vorhanden
            let storage = JSON.parse(localStorage.getItem("highscores"));//Auslesen er Highscore-Daten
            if (storage !== null) {//Wenn etwas in localStorage steht, dann ...
                g.highscores = storage;//Storage in highscore-Array speichern
                for (let i in this.highscores) {//Daten in entsprechende Liste eintragen
                    $($("ol>li")[i]).append($("<span>").attr("class", "high_name").text(g.highscores[i].name));//Namen eintragen
                    $($("ol>li")[i]).append($("<span>").attr("class", "high_level").text(g.highscores[i].level));//zugehörigen highscore eintragen
                }
            }
        } else if (!cookiesEnabled) {///Keine Cookies eingeschalten
            $("<p id=\"no_highscore\">").text("Cookies erlauben um Highscore anzuzeigen.").insertAfter($("#highscore"));//Fehlermeldung ausgeben
            $("#highscore").remove();//Highscore-Anzeige entfernen
        } else {//Kein localStorage
            $("<p id=\"no_highscore\">").text("Ihr Browser unterstützt LocalStorage nicht. Bitte updaten Sie den Browser").insertAfter($("#highscore"));//Fehlermeldung ausgeben
            $("#highscore").remove();//Highscore-Anzeige entfernen
        }
    };

    /*
    Funktion:
    Haupt-Update-Routine des Spiels zeichnet alles und bewegt Spieler
     */
    this.animate = function () {
        player.update(objects);//Player updaten
        if (player.mixer) {//ist der mixer bereits erstellt
            player.mixer.update(clock.getDelta());//updaten der Player-Laufanimation
        }
        renderer.render(scene, player.camera);//Renderer rendern lassen
        if (g.pause) {//Wenn pause, dann...
            return;//... Endlosschleife beenden
        }
        requestAnimationFrame(g.animate);//animation wieder ausführen
    };

    /*
    Funktion:
    Kehre nach Game Over zum Anfangsbildschirm zurück
    */
    this.destroy = function() {
        $("#game").hide();//Game-div verstecken
        $("#welcome").show();//Wilkommensbildschirm anzeigen
        $("#game>canvas").remove();//3D-Canvas entfernen
        g.pause = true;//Spiel pausieren
        $("#audio")[0].play();//Audio des Willkommensbildschirms starten
        this.levelSound.stop();//levelSound stoppen
    };

    /*
    Funktion:
    Handler für KeyDownEvents
     */
    let handleKeyDown= function(code) {
        switch (code) {
            case 65://a
                player.left = -1;
                break;
            case 83://s
                player.forward = 1;
                break;
            case 68://d
                player.left = 1;
                break;
            case 87://w
                player.forward = -1;
                break;
            case 32://Leertaste
                player.jump();
                break;
        }
    };

    /*
    Funktion:
    Handler für KeyUpEvents
     */
    let handleKeyUp = function(code) {
        switch (code) {
            case 65://a
                player.left = 0;
                break;
            case 83://s
                player.forward = 0;
                break;
            case 68://d
                player.left = 0;
                break;
            case 87://w
                player.forward = 0;
                break;
        }
    };

    /*
    Funtkion:
    Wechsel in den Vollbildschrim-Modus
     */
    let fullscreen = function() {
        if (!document.mozFullScreen && !document.webkitFullScreen) {//Noch kein Fullscreen eingeschalten
            if ($("#game")[0].mozRequestFullScreen) {//Firefox?
                $("#game")[0].mozRequestFullScreen();//Fullscreen einschalten
            } else {
                $("#game")[0].webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);//Fullscreen einschalten
            }
        } else {
            if (document.mozCancelFullScreen) {//Firefox?
                document.mozCancelFullScreen();//Fullscreen ausschalten
            } else {
                document.webkitCancelFullScreen();//Fullscreen ausschalten
            }
        }
    };

    /*
    Funktion:
    Setze Material eines Meshs, und aller seiner children
     */
    let setMaterial = function(node, material) {
        node.material = material;//Material des node setzen
        if (node.children) {//Wenn der node ein Kind hat, dann ...
            for (let i = 0; i < node.children.length; i++) {//... für jedes Kind ...
                setMaterial(node.children[i], material);//... rekursiv das Material ändern
            }
        }
    };
}

g = new Game();//neues Game-Objekt
g.init();//initialiseren das Spiel

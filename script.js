////// should put these files to 'js' folder /////
import * as THREE from '../modules/three.module.js';
import {OrbitControls} from '../modules/OrbitControls.js';
import {GLTFLoader} from '../modules/GLTFLoader.js';

///// global variables /////
let scene, camera, renderer, orbit;
let doll, dollRotation, younghee;
let playGround, goalGround, startGround;
let oldTree, sphere, cube, triangular, progressBar;
let bgmSound, mugungwhaSound;
let lookBackTime, lookForwardTime, turningTime;
let player, playerRed, playerBlue;
let facingBack = false;
//let chaseCam, chaseCamPivot;
//let view = new THREE.Vector3();
let TIME_LIMIT = 60;
let gameStat = 'loading';
let DEAD_PLAYERS = 0;
let SAFE_PLAYERS = 0;

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const text = document.getElementById('text');
const modelLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const safePlayersCounter = document.getElementById('safe_players');
const deadPlayersCounter = document.getElementById('dead_players');
let playerKey = document.getElementById('playerkey');


///// init functions /////

initScene();
initLights();
initTree();
initGrid();
initWall();
initCone();
initSphere();
initCube();
initTriangular();
initPlayGround();
initGoalGround();
initStartGround();
initSound();
initOrbit();
initProgressBar();
//initChaseCamera();
//initGameStart();


///// init three.js /////

function initScene(){
     scene = new THREE.Scene();     
     scene.background = cubeTextureLoader.load([
          './assets/lightblue/right.png',
          './assets/lightblue/left.png',
          './assets/lightblue/top.png',
          './assets/lightblue/bot.png',
          './assets/lightblue/front.png',
          './assets/lightblue/back.png',          
     ]);

     camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth/window.innerHeight,
          1,
          12000
     )
     camera.position.set(0, 600, 2200); 
     //need cmtout when use chase camera
     
     renderer = new THREE.WebGLRenderer({
          antialias: true,
     })
     renderer.setPixelRatio(window.devicePixelRatio);
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.shadowMap.enabled = true;
     document.body.appendChild(renderer.domElement);    
}
 
function initOrbit(){      
      orbit = new OrbitControls(camera, renderer.domElement);
     orbit.enableDamping = true;
     orbit.dampingFactor = 0.05; 
     //orbit.maxPolarAngle = Math.PI - 0.001;
     orbit.target.set(0, 10, -900);       
}
     
// chase camera // can switch to initOrbit//
/* function initChaseCamera(){
     chaseCam = new THREE.Object3D();
     chaseCam.position.set(0, 700, 1500);

     chaseCamPivot = new THREE.Object3D();
     chaseCamPivot.position.set(0, 100, 900);

     chaseCam.add(chaseCamPivot); 
     scene.add(chaseCam);
} */

function initLights(){
     const dirLight = new THREE.DirectionalLight(0xffffff, 1);
     dirLight.position.set(400, 1000, 1000);
     dirLight.target.position.set(0, 0, 0);
     dirLight.castShadow = true;
     dirLight.shadow.bias = -0.001;
     dirLight.shadow.mapSize.width = 2048;
     dirLight.shadow.mapSize.height = 2048;
     dirLight.shadow.camera.near = 0.5;
     dirLight.shadow.camera.far = 2800;
     dirLight.shadow.camera.left = -2800;
     dirLight.shadow.camera.right = 2800;
     dirLight.shadow.camera.top = 2800;
     dirLight.shadow.camera.bottom = -2800;
     scene.add(dirLight);

     const ambientLight = new THREE.AmbientLight(0x555555, 1);
     scene.add(ambientLight);
}

///// init audio sounds  ////////////////////
function initSound(){
     const audioListener = new THREE.AudioListener();
     const audioLoader = new THREE.AudioLoader();
     bgmSound = new THREE.Audio(audioListener);
     mugungwhaSound = new THREE.Audio(audioListener);
     //younghee.add(audioListener);
     
     audioLoader.load('./sounds/squidgameremix2.mp3', function(buffer){
          bgmSound.setBuffer(buffer);
          bgmSound.setLoop(false);
          bgmSound.setVolume(0.25);
          //bgmSound.play();
     })
     audioLoader.load('./sounds/sas1009.mp3', function(buffer){
          mugungwhaSound.setBuffer(buffer);
          mugungwhaSound.setLoop(true);
          mugungwhaSound.setVolume(0.8);
     })
}

///// doll setup younghee/////

function timeUpdate(){
      lookBackTime = Math.random() * 5000 + 1500;
      lookForwardTime = Math.random() * 5000 + 2000;
      turningTime = Math.random() * 2.5 + 0.25;
}

async function delay(ms){
     return new Promise(resolve => setTimeout(resolve, ms))
}

class Doll {
     constructor(){
          modelLoader.load('./models/squid_game_-_giant_doll/scene.gltf', function(gltf){
               scene.add(gltf.scene);
               gltf.scene.traverse(function(node){
                    if(node.isMesh){ 
                         node.castShadow = true;
                         node.receiveShadow = true;
                    }  
               })        
               gltf.scene.scale.set(35, 35, 35);               
               gltf.scene.position.set(0, 170, -1050);
               doll = gltf.scene;
               dollRotation = doll.rotation;
               facingBack = false;
          })
     }
     lookBackward(){
          gsap.to(dollRotation, {y: -3.14, duration: turningTime});
          facingBack = true;          
          mugungwhaSound.play();
     }
     lookForward(){
          gsap.to(dollRotation, {y: 0, duration: turningTime});
          //mugungwhaSound.stop();
          mugungwhaSound.pause();
          setTimeout(() => {facingBack = false}, 950);
     }
     async start(){
          if(gameStat != 'gameOver'){
               this.lookBackward();
               await delay(lookBackTime);
               this.lookForward();
               await delay(lookForwardTime);          
               this.start();
          }
          
     }
     stop(){
          this.lookForward();
          facingBack = false;
     }
}

younghee = new Doll();

///// init game objects ///////////////////

function initGrid(){
     const gridGeometry = new THREE.BoxGeometry(2400, 2800, 1, 50);
     const gridMaterial = new THREE.MeshStandardMaterial({
          color: 0xc79997,
          wireframe: false,
          
     })
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.receiveShadow = true;
    grid.position.set(0, 0, 0);
    grid.rotation.x = -Math.PI/2;
     scene.add(grid);
}

function initPlayGround(){
     const groundGeometry = new THREE.PlaneGeometry(3600, 4000, 50, 50);
     const groundMaterial = new THREE.MeshLambertMaterial({
          //color: 0xc79997,
          //map: textureLoader.load('./assets/Sand_004_Height.png'),
          //map: textureLoader.load('../landspeeder/skyboxes/blue/bkg1_top.png'),
          map: textureLoader.load('../squidGameGlass/assets/glass-plate.webp'),
          wireframe: false,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
     })
     playGround = new THREE.Mesh(groundGeometry, groundMaterial);
     playGround.receiveShadow = true;
     playGround.rotation.x = -Math.PI/2;   
     playGround.position.set(0, -1, 0);
     scene.add(playGround);       
}

function initGoalGround(){
     const groundGeometry = new THREE.PlaneGeometry(2400, 600, 20, 20);
     const groundMaterial = new THREE.MeshStandardMaterial({
          color: 0x0c8900,
          //map: textureLoader.load('./assets/Sand_004_Height.png'),
          map: textureLoader.load('./assets/Wall_Stone_022_roughness.jpg'),
          wireframe: false,
          side: THREE.DoubleSide,
     })
     goalGround = new THREE.Mesh(groundGeometry, groundMaterial);
     goalGround.receiveShadow = true;
     goalGround.castShadow = true;
     goalGround.rotation.x = -Math.PI/2;
     goalGround.position.set(0, 3, -1250);
     scene.add(goalGround);
}

function initStartGround(){
     const groundGeometry = new THREE.PlaneGeometry(2400, 200, 5, 5);
     const groundMaterial = new THREE.MeshLambertMaterial({
          color: 0x333333,
          //map: textureLoader.load('./assets/Sand_004_Height.png'),
          //map: textureLoader.load('./assets/Wall_Stone_022_roughness.jpg'),
          wireframe: false,
          side: THREE.DoubleSide,
     })
     startGround = new THREE.Mesh(groundGeometry, groundMaterial);
     startGround.receiveShadow = true;
     startGround.castShadow = true;
     startGround.rotation.x = -Math.PI/2;
     startGround.position.set(0, 0, 1500);
     scene.add(startGround);
}

function initWall(){
     const wallGeometry = new THREE.BoxGeometry(2400, 800, 50);
     const wallMaterial = new THREE.MeshPhongMaterial({
          color: 0xcc9999,
          shininess: 50,
          //map: textureLoader.load('./assets/Squid-Game2.png'), 
          //map: textureLoader.load('./assets/Wall_Stone_022_normal.jpg'),
     })
     const wallEast = new THREE.Mesh(wallGeometry, wallMaterial);
     wallEast.position.set(1200, 200, 0);
     wallEast.rotation.y = Math.PI/2;
     wallEast.receiveShadow = true;
     //scene.add(wallEast);
     
     const wallWest = new THREE.Mesh(wallGeometry, wallMaterial);
     wallWest.position.set(-1200, 200, 0);
     wallWest.rotation.y = Math.PI/2;
     wallWest.receiveShadow = true;
     //scene.add(wallWest);

     const wallSouth = new THREE.Mesh(wallGeometry, wallMaterial);
     wallSouth.position.set(0, 250, 1200);
     wallSouth.receiveShadow = true;
     //scene.add(wallSouth);

     const wallNorth = new THREE.Mesh(wallGeometry, wallMaterial);
     wallNorth.position.set(0, 400, -1500);
     wallNorth.receiveShadow = true;
     scene.add(wallNorth);
}

function initCone(){
     const coneGeometry = new THREE.ConeGeometry(30, 20, 10);
     const coneMaterial = new THREE.MeshPhongMaterial({
          color: 0x555555,
     })
     const cone = new THREE.Mesh(coneGeometry, coneMaterial);
     cone.castShadow = true;
     cone.position.y = 20;
     cone.receiveShadow = true;
     scene.add(cone);
}

function initSphere(){
     const sphereGeometry = new THREE.SphereGeometry(80, 10, 5);
     const sphereMaterial = new THREE.MeshStandardMaterial({
          color: 0xff5f1f,
          wireframe: true
     })
     sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
     sphere.castShadow = true;
     sphere.receiveShadow = true;
     sphere.position.set(-900, 1100, -1000);
     scene.add(sphere);         
}

///// red light green light /////
/* if(facingBack){
     light.material.color = 0x00ff00;
     } else {
          light.material.color = 0xff0000;
     } 
*/

function initCube(){
     const cubeGeometry = new THREE.BoxGeometry(120, 120, 120, 2);
     const cubeMaterial = new THREE.MeshPhongMaterial({
          color: 0xff5f1f,
          wireframe: true
     })
     cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
     cube.castShadow = true;
     cube.receiveShadow = true;
     cube.position.set(1000, 1100, -1000);
     scene.add(cube);
}

function initTriangular(){
     const coneGeometry = new THREE.ConeGeometry(120, 120, 3);
     const coneMaterial = new THREE.MeshPhongMaterial({
          color: 0xff5f1f,
          wireframe: true
     })
     triangular = new THREE.Mesh(coneGeometry, coneMaterial);
     triangular.castShadow = true;
     triangular.receiveShadow = true;
     scene.add(triangular);
     triangular.position.set(0, 1100, -1000); 
}

function initTree(){
     modelLoader.load('./models/Old_tree/Tree old N091114.glb', function(gltf){
          oldTree = gltf.scene;
          oldTree.traverse( function(node){
             if(node.isMesh){ 
               node.castShadow = true;
               node.receiveShadow = true;
               }  
          })       
          oldTree.scale.set(0.2, 0.25, 0.2);
          //oldTree.rotation.x = Math.PI;
          oldTree.rotation.y = Math.PI/2;
          oldTree.position.set(-500, -4, -1050);
          scene.add(oldTree);
     })
}

///// player 456 // player one two //////////////////

let sizeD = 15;
let players = [];

class Player {
     constructor(sizeY, speed, color){
          let sizeX = Math.random() * 20 + 15;
          this.sizeY = sizeY;
          this.speed = speed;          
          ;
          this.color = color;
          //this.speedX = 1;
          this.markedForDeletion = false;
          const bodyGeometry = new THREE.BoxGeometry(sizeX, this.sizeY, sizeD);
          const bodyMaterial = new THREE.MeshPhongMaterial({
               color: color,
          })
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.x = Math.random() * 2100 - 1050;
          body.position.y = sizeY/2;
          body.position.z = 0;
          body.castShadow = true;
          body.receiveShadow = true;

          const headGeometry = new THREE.SphereGeometry(sizeX * 0.34, 20, 20);
          const headMaterial = new THREE.MeshLambertMaterial({
               color: color,
          })
          const head = new THREE.Mesh(headGeometry, headMaterial);
          head.position.x = body.position.x;
          head.position.y = sizeY * 1.075;
          head.position.z = body.position.z;          
          head.castShadow = true;
          head.receiveShadow = true;

          const group = new THREE.Object3D();
          group.add(body);
          group.add(head);
          group.position.z = 1400 + Math.random() * 200;         

         this.player = group;
         this.playerInfo = {
          rotX: group.rotation.x,
               posZ: group.position.z,
               velocity: 0,
               name: " ",
               isDead: false,
          }
          scene.add(this.player);
     }
     run(){
          if(this.playerInfo.isDead) return;
          gsap.to(this.playerInfo, { duration: 0.45, velocity: this.speed})
     }    
     stop(){
          gsap.to(this.playerInfo, {
               duration: 0.45, velocity: 0
          })
     }
     check(){ 
          if(!this.playerInfo.isDead) {
               if(this.playerInfo.velocity > 0 && !facingBack) {
               text.innerText = `${this.playerInfo.name} Lose!`;
               this.playerInfo.isDead = true;
               //DEAD_PLAYERS++;
               this.color = 0x222222;
               this.speed = 0;          
               }
          }         
         
         if(this.player.position.z < -920){
              //SAFE_PLAYERS++;
          text.innerText = `${this.playerInfo.name} Win!`;
          gameOver();
         }                   
     }
     update(){
          //this.check();         
         if(this.playerInfo.name === " "){
              if(facingBack) {
                    this.playerInfo.posZ -= this.playerInfo.velocity;
                    this.player.position.z = this.playerInfo.posZ;
               } 
          } else {
               this.playerInfo.posZ -= this.playerInfo.velocity;
               this.player.position.z = this.playerInfo.posZ;
          }          
          if(this.player.position.z < -920){               
               this.playerInfo.velocity = 0;
               gsap.to(this.playerInfo, {posZ: -Math.random() * 200 - 1200, duration: 0.8, ease: 'linear'});
                         
               this.markedForDeletion = true;                   
          }
          if(this.player.position.z <= -920 && 
               !this.playerInfo.isDead){  
                    SAFE_PLAYERS++;                    
                    this.playerInfo.isDead = true;
               } 
          safePlayersCounter.innerText = SAFE_PLAYERS;
          //deadPlayersCounter.innerText = DEAD_PLAYERS;
     } 
}

function initPlayers(){
     for(let i = 0; i < 456-2; i++){
          let speed = Math.random() * 3 + 0.25;
          let sizeY = Math.random() * 45 + 30;
          let color = 0x1fc700;
          player = new Player(sizeY, speed, color);          
          players.push(player);
     }
     playerRed = new Player(100, 5.250, 0xff0b00);
     playerRed.playerInfo.name = 'Player Red';
     //players.push(playerRed);

     playerBlue = new Player(100, 4.250, 0x000bff);
     playerBlue.playerInfo.name = 'Player Blue'; 
     //players.push(playerBlue);      
}


animate();

///// init game /////

async function initGameStart(){
     initPlayers();   
     startBtn.style.display = 'none';
     playerKey.style.display = 'none';
     await delay(2000);     
     text.innerText = 'Start in 3';
     await delay(1000);
     text.innerText = 'Ready! 2';
     await delay(1000);
     text.innerText = 'Set! 1';
     bgmSound.stop();    
     await delay(1000);
     text.innerText = 'GO!'     
     await delay(1000);
     text.innerText = ' ';
     gameStart();     
};

function initProgressBar(){
     progressBar = new THREE.Mesh(new THREE.BoxGeometry(2200, 50, 5), new THREE.MeshPhongMaterial({
          color: 0xff5f1f,
          shininess: 100
     }));
     progressBar.position.set(0, 870, -1400);
     scene.add(progressBar);     
}

function gameStart(){ 
     if(gameStat != 'gameOver' || gameStat != 'loading'){ 
          younghee.start();
          bgmSound.stop();
          gsap.to(progressBar.scale, {x: 0, duration: TIME_LIMIT, ease: 'none'});
          gameStat = 'started';  
          setTimeout(() => {    
               gameOver();
               text.innerText = 'Oops, Ran Out Of Time!';
          }, TIME_LIMIT * 1000);
     }    
}

startBtn.addEventListener('click', initGameStart);
restartBtn.addEventListener('click', restart);

function gameOver(){   
      /* players.forEach(p => {
          p.player.color = 0x222222; //no work
         // p.player.playerInfo.velocity = 0;
          p.player.markedForDeletion = true;
     }) */ 
     //can't access to property of player
     younghee.stop();
     bgmSound.play();
     gameStat = 'gameOver';    
     DEAD_PLAYERS = 456 - SAFE_PLAYERS;  
     // try again     
     restartBtn.style.display = 'block'; 

     //falling down -- no work??
     //gsap.to(players, {rotateX: -Math.PI / 2, duration: 0.8, ease: 'linear'});        
}

function restart(){    
     //players.forEach(p => !p.playerInfo.isDead);     
     //players = players.filter(p => !p.markedForDeletion);   
     // not accessable to players???
     
     players = [];     
        
    gameStat = 'loading'; 
    SAFE_PLAYERS = 0;
    DEAD_PLAYERS = 0;
    initProgressBar();
    restartBtn.style.display = 'none';
    //initPlayers();
    initGameStart();  
} 
console.log(players);
///// animation /////

function animate(){
     if(gameStat === 'started'){
        players.forEach(p => {
          p.update();
          p.run();
          })
          playerRed.update();
          playerBlue.update();
     playerRed.check();
     playerBlue.check();  
     }     
    
     timeUpdate();

     cube.rotation.z += 0.007;
     cube.rotation.x += 0.004;
     sphere.rotation.y += 0.001;
     //sphere.material.color = facingBack ? 0x00ff00 : 0xff0000;
     triangular.rotation.y += 0.01;
     triangular.rotation.z += 0.008;
     orbit.update(); 
     //updateChaseCamera();
     renderer.render(scene, camera);
     requestAnimationFrame(animate);
}

/* function updateChaseCamera(){     
     chaseCamPivot.getWorldPosition(view);
     if(view.y < 1) view.y = 1;
     camera.position.lerpVectors(camera.position, view, 0.05);
} */

window.addEventListener('resize', function(){
     camera.aspect  = window.innerWidth/ window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize(window.innerWidth, window.innerHeight);
})

///// player run key down event need to add left right arrow/////
window.addEventListener('keydown', (e) => {
     //if(gameStat !== 'started') return;     
     if(e.key == 'ArrowUp'){
           playerRed.run();
          }  else if(e.key === 'w'){
          playerBlue.run();
          } 
     
})

window.addEventListener('keyup', (e) => {
     //if(gameStat != 'started') return;
     if(e.key == "ArrowUp"){
          playerRed.stop();
     } else if(e.key == 'w'){
          playerBlue.stop();
     } 
     
})

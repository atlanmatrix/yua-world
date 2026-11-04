import * as THREE from 'three';
import {movePlayer} from './movement.js';
import {createClimate} from './climate.js';
import {createControls} from './controls.js';
import {createTown,SPAWN} from './town.js';
import {createCharacter} from './character.js';
import {createMinimap} from './minimap.js';
import {CHARACTER_SCALE} from './elevation.js';

const loading=document.querySelector('#loading');
try {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e6ebda');scene.fog=new THREE.Fog('#e6ebda',65,145);
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  document.querySelector('#world').appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.25,240);
  const ambient=new THREE.HemisphereLight('#fff7df','#788859',2.4);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff0d0',3.1);sun.position.set(-25,45,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:1,far:130});sun.shadow.normalBias=.035;scene.add(sun);
  const materials=new Map(),roofs=[];
  const town=createTown(scene,materials,roofs);
  const character=createCharacter(),player=character.root;player.scale.setScalar(CHARACTER_SCALE);scene.add(player);
  const obstacles=town.obstacles;
  const climate=createClimate({scene,sun,ambient,materials,roofs,renderer});
  let yaw=Math.PI/5,pitch=.61;
  const controls=createControls((dx,dy)=>{yaw-=dx*.005;pitch=THREE.MathUtils.clamp(pitch+dy*.003,.27,1.12);});
  const minimap=createMinimap(town,{onOpen:()=>controls.setEnabled(false),onClose:()=>controls.setEnabled(true)});
  function cameraTarget(){return new THREE.Vector3(player.position.x+Math.sin(yaw)*Math.cos(pitch)*24,1.4+Math.sin(pitch)*24+player.position.y,player.position.z+Math.cos(yaw)*Math.cos(pitch)*24);}
  player.position.set(SPAWN.x,town.groundHeight(SPAWN.x,SPAWN.z),SPAWN.z);player.rotation.y=Math.PI;camera.position.copy(cameraTarget());
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));});
  const clock=new THREE.Clock();let elapsed=0;const lookAt=new THREE.Vector3();
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
    const input=controls.read(),forward=-input.y,right=input.x;
    const direction={x:-Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward-Math.sin(yaw)*right};
    const previous=player.position.clone();
    const next=movePlayer(player.position,direction,dt*(input.sprint?10:7)*input.strength,obstacles,.45,(x,z)=>town.isBlocked(x,z,player.position.y));
    player.position.x=next.x;player.position.z=next.z;player.position.y=town.groundHeight(next.x,next.z,player.position.y);
    const walking=Math.hypot(previous.x-next.x,previous.z-next.z)>.001;
    if(walking){const target=Math.atan2(direction.x,direction.z);player.rotation.y+=Math.atan2(Math.sin(target-player.rotation.y),Math.cos(target-player.rotation.y))*Math.min(1,dt*14);}
    character.update(elapsed,walking,input.sprint);town.update(dt,elapsed,player.position,camera);minimap.update(dt,player.position,player.rotation.y);
    sun.position.set(player.position.x-25,45,player.position.z+20);sun.target.position.set(player.position.x,player.position.y,player.position.z);sun.target.updateMatrixWorld();
    climate.update(dt,elapsed,player.position);camera.position.lerp(cameraTarget(),1-Math.exp(-dt*5));lookAt.set(player.position.x,player.position.y+1.25,player.position.z);camera.lookAt(lookAt);renderer.render(scene,camera);loading.hidden=true;
  });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();loading.hidden=false;loading.dataset.error='true';loading.setAttribute('aria-label','图形连接中断，请刷新');});
}catch(error){console.error(error);loading.hidden=false;loading.dataset.error='true';loading.setAttribute('aria-label','图形加载失败，请检查浏览器是否支持 WebGL');}

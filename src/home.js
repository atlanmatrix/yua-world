import * as THREE from 'three';
import {createKit,batchScenery,batchLocalMeshes} from './scene-kit.js';
import {terrainSurfaceHeight} from './elevation.js';
import {HOME,homeLocal,onHomeSite,inHouse,stairHeight,homeHeight} from './home-layout.js';

export function createPlayerHome(scene,materials,roofMaterial){
  const kit=createKit(materials),{box,ball,cylinder,beam,group,mesh}=kit;
  const base=terrainSurfaceHeight(HOME.x,HOME.z)+.08,root=group(HOME.x,base,HOME.z,scene);root.name='player-home';
  const yard=group(0,0,0,root),lower=group(0,0,0,root),upper=group(0,HOME.floorRise,0,root),roof=group(0,0,0,root),dynamic=group(0,0,0,root);
  const colliders=[],walls=[[],[]],swingSeats=[],fish=[],pets=[];
  const upperY=base+HOME.floorRise+.2;
  function collider(x,z,w,d,minY=-1,maxY=12){colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:base+minY,maxY:base+maxY});}
  function fixedBox(w,h,d,c,x,y,z,p,solid=false,level=0){const o=box(w,h,d,c,x,y,z,p);if(solid)collider(x,z,w,d,level,level+h+1);return o;}
  // The garden is a separate plot with an open gate, never a solid house collider.
  box(40,.28,40,'#bcb299',0,-.14,0,yard);box(39.7,.055,39.7,'#b4c58a',0,.025,0,yard);
  box(3.4,.07,19,'#e4d7b7',0,.09,10.5,yard);box(19,.07,2.5,'#ded5bb',-7.2,.09,8,yard);box(16,.07,2.5,'#ded5bb',10,.09,8,yard);
  for(const side of [-1,1]){
    for(let z=-20;z<=20;z+=1.5)box(.13,1.25,.13,'#e2d4b6',side*20,.7,z,yard);
    for(const y of [.48,1.03])beam([side*20,y,-20],[side*20,y,20],.065,'#d4c6a6',yard);
    collider(side*20,0,.25,40);
    const length=17.7;box(length,1.05,.25,'#d1c4a5',side*(2.3+length/2),.55,20,yard);collider(side*(2.3+length/2),20,length,.25);
    box(.55,1.65,.55,'#c8bda2',side*2.6,.83,20,yard);ball(.26,'#f0dfac',side*2.6,1.85,20,yard);
  }
  box(40,1.05,.25,'#d1c4a5',0,.55,-20,yard);collider(0,-20,40,.25);
  const mailbox=group(3.7,0,18.5,yard);cylinder(.07,.08,1.1,'#8a7a5e',0,.55,0,mailbox);box(.7,.5,.5,'#789a8a',0,1.2,0,mailbox);
  // Floor slabs leave a real stairwell in the upper storey.
  box(16.4,.28,14.4,'#c0b59d',0,.06,-6,lower);box(15.8,.08,13.8,'#cfba96',0,.22,-6,lower);
  box(12.1,.2,14,'#c4b698',-1.95,.1,-6,upper);
  box(3.9,.2,2,'#c4b698',6.05,.1,-12.2,upper);box(3.9,.2,1.7,'#c4b698',6.05,.1,.15,upper);
  box(16.2,.2,2.4,'#c4b698',0,.1,2.2,upper);
  function window(g,x,y,z,w=2.1,h=1.8){box(w+.2,h+.2,.14,'#f4ead4',x,y,z,g);box(w,h,.15,'#9dbcb9',x,y,z+.04,g);box(.065,h,.18,'#f4ead4',x,y,z+.1,g);box(w,.065,.18,'#f4ead4',x,y,z+.11,g);}
  function wallSet(parent,floor){
    const front=group(0,0,0,parent),back=group(0,0,0,parent),left=group(0,0,0,parent),right=group(0,0,0,parent);walls[floor]=[front,back,left,right];
    for(const side of [-1,1])box(6.35,3.8,.26,'#e4d6bf',side*4.825,2.1,1,front);
    box(3.3,.65,.26,'#e4d6bf',0,3.67,1,front);
    box(16.25,3.8,.26,'#e4d6bf',0,2.1,-13,back);
    box(.26,3.8,14,'#e4d6bf',-8,2.1,-6,left);box(.26,3.8,14,'#e4d6bf',8,2.1,-6,right);
    for(const x of [-4.8,4.8])window(front,x,2.3,1.16);
    for(const x of [-4,3]){const rear=group(0,0,0,back,Math.PI);window(rear,x,2.3,13.16);}
    for(const side of [-1,1]){const sideWindow=group(0,0,0,side<0?left:right,side*Math.PI/2);for(const z of [-3,-9])window(sideWindow,side<0?z:-z,2.3,8.16,1.9,1.8);}
    box(.14,3.1,.2,'#af9370',-1.6,1.75,1.1,front);box(.14,3.1,.2,'#af9370',1.6,1.75,1.1,front);box(3.3,.15,.2,'#af9370',0,3.3,1.1,front);
    if(floor===0){collider(-4.825,1,6.35,.3,-.1,3.7);collider(4.825,1,6.35,.3,-.1,3.7);}else{collider(-4.825,1,6.35,.3,3.7,8);collider(4.825,1,6.35,.3,3.7,8);}
  }
  wallSet(lower,0);wallSet(upper,1);
  collider(0,-13,16.4,.3);collider(-8,-6,.3,14);collider(8,-6,.3,14);
  // Balcony balustrade remains solid on the upper floor only.
  for(let i=-8;i<=8;i++)cylinder(.035,.035,1.1,'#718b80',i,.83,3.3,upper,6);
  beam([-8,1.4,3.3],[8,1.4,3.3],.055,'#718b80',upper);collider(0,3.3,16,.22,3.6,6);
  for(const side of [-1,1]){beam([side*8,1.4,1],[side*8,1.4,3.3],.055,'#718b80',upper);collider(side*8,2.1,.22,2.4,3.6,6);}
  // Twenty-four individually modeled steps and continuous walkable elevation.
  const stairs=group(0,0,0,root),count=24,length=HOME.stairFrontZ-HOME.stairBackZ;
  for(let i=0;i<count;i++){
    const z=HOME.stairFrontZ-(i+.5)*length/count,h=.2+(i+1)*HOME.floorRise/count;
    box(2.65,h,length/count+.012,'#b99b72',5.95,h/2,z,stairs);box(2.7,.045,length/count,'#e0c9a1',5.95,h,z,stairs);
  }
  for(const x of [4.45,7.45]){
    collider(x,(HOME.stairFrontZ+HOME.stairBackZ)/2,.15,length+.1);
    beam([x,1.2,HOME.stairFrontZ],[x,HOME.floorRise+1.2,HOME.stairBackZ],.045,'#8d8168',stairs);
    for(let i=0;i<=8;i++){const t=i/8,z=HOME.stairFrontZ-t*length;cylinder(.025,.025,1,'#8d8168',x,.7+t*HOME.floorRise,z,stairs,5);}
  }
  const shape=new THREE.Shape();shape.moveTo(-9,0);shape.lineTo(0,3.3);shape.lineTo(9,0);shape.closePath();
  mesh(new THREE.ExtrudeGeometry(shape,{depth:16,bevelEnabled:false}),roofMaterial('#788f8a'),0,8.02,-14,roof);
  box(.8,2.1,.8,'#c1ad91',4,9.3,-6,roof);
  // A crescent above the entrance visually marks the visitor's own house.
  const crest=mesh(new THREE.TorusGeometry(.38,.075,8,24,Math.PI*1.6),'#d6bb7a',0,3.65,1.23,walls[0][0]);crest.rotation.z=.5;
  function furniture(w,h,d,c,x,y,z,parent,level){box(w,h,d,c,x,y,z,parent);collider(x,z,w,d,level,level+h+1);}
  // Downstairs: living room, dining corner and kitchen, leaving a broad central corridor.
  furniture(3.8,.8,1.7,'#91a49c',-4.7,.7,-3.1,lower,0);box(3.9,1.15,.4,'#91a49c',-4.7,1.25,-3.85,lower);
  for(const x of [-6,-3.3])box(.4,1.05,1.7,'#91a49c',x,.9,-3.1,lower);
  furniture(2.3,.6,1.15,'#b49b78',-4.6,.6,-.6,lower,0);box(4.7,.018,4.8,'#d6bb9d',-4.6,.27,-2,lower);
  furniture(5.8,1.1,.9,'#d4c8b0',-4.4,.8,-12.2,lower,0);box(6,.08,1,'#ede2ca',-4.4,1.4,-12.2,lower);
  const sink=cylinder(.38,.38,.04,'#91aeb0',-5.4,1.46,-12.2,lower,16);sink.scale.z=.7;
  for(const x of [-2.7,-1.6])cylinder(.25,.25,.04,'#636e66',x,1.46,-12.2,lower,12);
  furniture(1,2.5,1,'#e3e4d5',-7,1.5,-10.5,lower,0);box(.07,1.2,.06,'#929d91',-6.57,1.6,-9.96,lower);
  furniture(2.5,.18,1.7,'#b79d76',-3.4,1.25,-8.1,lower,0);
  for(const x of [-4.35,-2.45])for(const z of [-8.7,-7.5])box(.1,1,.1,'#987e5d',x,.72,z,lower);
  for(const x of [-4.2,-2.6])for(const z of [-9.2,-7]){box(.65,.1,.65,'#899c8d',x,.75,z,lower);box(.65,.65,.1,'#899c8d',x,1.1,z-.27,lower);collider(x,z,.7,.7,0,2);for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(.055,.46,.055,'#7d8e80',x+dx,.48,z+dz,lower);}
  // Upstairs: bedroom, reading nook and desk with books and a task lamp.
  furniture(3.7,.65,4.2,'#b79b79',-4.6,.65,-8.2,upper,3.7);box(3.5,.25,4,'#d1c6dc',-4.6,1.1,-8.2,upper);box(3.4,.11,2.3,'#9eafaa',-4.6,1.28,-7.4,upper);
  for(const x of [-5.5,-3.8])box(1.3,.25,.8,'#eee5d4',x,1.31,-9.5,upper);
  furniture(4.2,.15,1.2,'#b39a77',-.5,1.3,-11.8,upper,3.7);box(1,.08,.7,'#d4b97a',-.9,1.42,-11.8,upper);box(.6,.02,.8,'#f0e9cf',.4,1.42,-11.8,upper);
  cylinder(.09,.13,.7,'#7c948a',-2,1.75,-11.8,upper);mesh(new THREE.ConeGeometry(.35,.35,12),'#ddcc9f',-2,2.15,-11.8,upper);
  box(.12,2.5,3.2,'#b49c79',-7.45,1.45,-3.1,upper);for(const y of [.45,1.15,1.85,2.7])box(.75,.09,3.2,'#b49c79',-7.15,y,-3.1,upper);collider(-7.15,-3.1,.75,3.2,3.7,7);
  for(const x of [-2.3,1.3])for(const z of [-12.25,-11.35])box(.08,1.05,.08,'#987e5d',x,.75,z,upper);
  for(let i=0;i<18;i++)box(.18,.5+(i%3)*.08,.4,['#8d9c88','#b28e7d','#b5a16c'][i%3],-7.05,.75+Math.floor(i/6)*.7,-4.3+(i%6)*.45,upper);
  furniture(1.6,.65,1.5,'#b6a0b6',-3.8,.65,-1.8,upper,3.7);
  // Ornamental fishpond, with a raised stone rim and visible koi.
  const pond=group(HOME.pond.x,0,HOME.pond.z,yard),rx=HOME.pond.rx,rz=HOME.pond.rz;
  const basin=cylinder(1,1,.3,'#b3b3a0',0,.23,0,pond,48);basin.scale.set(rx+.35,1,rz+.35);
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#8fbdbe',transparent:true,opacity:.78,roughness:.25});
  const pool=cylinder(1,1,.04,waterMaterial,0,.43,0,pond,48);pool.scale.set(rx,1,rz);
  const rim=mesh(new THREE.TorusGeometry(1,.065,6,64),'#c3bea8',0,.48,0,pond);rim.rotation.x=Math.PI/2;rim.scale.set(rx,rz,2.5);
  for(let i=0;i<8;i++){
    const koi=group(0,.43,0,dynamic),body=ball(1,i%2?'#d3916a':'#e9d1a4',0,0,0,koi);body.scale.set(.13,.065,.37);
    const tail=mesh(new THREE.ConeGeometry(.15,.22,3),'#bd8d6c',0,0,-.42,koi);tail.rotation.x=Math.PI/2;fish.push({root:koi,tail,phase:i*.8});
  }
  // Garden pavilion, flower beds and vegetables.
  const gazebo=group(11.5,.12,7.8,yard);cylinder(3.5,3.7,.2,'#c9bfa4',0,.12,0,gazebo,8);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.sin(a)*3,z=Math.cos(a)*3;cylinder(.12,.16,3.2,'#d6c8a8',x,1.75,z,gazebo);collider(11.5+x,7.8+z,.35,.35);}
  mesh(new THREE.ConeGeometry(4.2,2.4,6),roofMaterial('#8d9e89'),0,4.2,0,gazebo);cylinder(.75,.75,.12,'#b99f79',0,.9,0,gazebo,16);
  for(const [cx,cz] of [[-12,-7],[-12.5,-1],[13,-7]]){
    box(6,.26,3.8,'#b69e75',cx,.18,cz,yard);collider(cx,cz,6,3.8,0,1);box(5.7,.03,3.5,'#938767',cx,.33,cz,yard);
    for(let i=0;i<25;i++){const x=cx-2.5+(i%5)*1.2,z=cz-1.4+Math.floor(i/5)*.7;cylinder(.025,.025,.5,'#78985f',x,.6,z,yard,4);const bloom=cylinder(.18,.1,.04,['#d99591','#edca7c','#c0a0bd'][i%3],x,.88,z,yard,5);}
  }
  // Twin swings: independent pendulums, fixed A-frame and clear access.
  const swings=group(11.6,0,16.4,yard);
  for(const side of [-1,1]){beam([side*3.1,.1,-1.1],[side*3.1,3.5,0],.1,'#a28d69',swings);beam([side*3.1,.1,1.1],[side*3.1,3.5,0],.1,'#a28d69',swings);collider(11.6+side*3.1,16.4,.35,2.4);}
  beam([-3.2,3.5,0],[3.2,3.5,0],.13,'#a28d69',swings);
  for(const side of [-1,1]){const pivot=group(side*1.3,3.4,0,swings);for(const x of [-.55,.55])beam([x,0,0],[x,-2.3,0],.025,'#88958a',pivot);box(1.25,.12,.65,'#8aab9a',0,-2.3,0,pivot);swingSeats.push(pivot);}
  // Neighborhood-style exercise equipment along the rear garden wall.
  for(const x of [-12,-4,4,12])cylinder(1.7,1.7,.05,'#c1c5aa',x,.12,-17,yard,24);
  for(const side of [-1,1]){cylinder(.09,.12,2.8,'#7f9f92',-12+side*1.5,1.5,-17,yard);}
  beam([-13.5,2.9,-17],[-10.5,2.9,-17],.09,'#c8b078',yard);collider(-13.5,-17,.3,.3);collider(-10.5,-17,.3,.3);
  for(const side of [-1,1]){for(const z of [-18,-16])cylinder(.07,.09,1.3,'#7f9f92',-4+side*.65,.8,z,yard);beam([-4+side*.65,1.5,-18],[-4+side*.65,1.5,-16],.075,'#c8b078',yard);collider(-4+side*.65,-17,.2,2.3);}
  const twister=group(4,0,-17,dynamic);cylinder(.1,.15,1.25,'#7f9f92',4,.8,-17,yard);beam([3.3,1.5,-17],[4.7,1.5,-17],.07,'#c8b078',yard);cylinder(.7,.7,.12,'#aebd99',0,.27,0,twister,24);collider(4,-17,.35,.35);
  for(const side of [-1,1]){cylinder(.075,.1,1.8,'#7f9f92',12+side*.7,1,-17,yard);beam([12+side*.7,1.8,-17],[12+side*.7,2.1,-16.5],.07,'#c8b078',yard);box(.45,.12,1.1,'#b8bb91',12+side*.4,.45,-17,yard);}collider(12,-17,2,2.2);
  function pet(type){const p=group(0,0,0,dynamic),color=type==='dog'?'#c6aa7d':'#b8b3b1';const body=ball(1,color,0,.48,0,p);body.scale.set(.25,.3,.45);ball(.23,color,0,.78,.35,p);ball(.08,'#4c5348',0,.75,.57,p);
    for(const side of [-1,1]){const ear=mesh(new THREE.ConeGeometry(.11,.27,3),color,side*.17,.99,.33,p);if(type==='dog')ear.rotation.z=side*.65;ball(.025,'#333d34',side*.14,.83,.51,p);for(const z of [-.25,.25])cylinder(.055,.07,.4,color,side*.17,.2,z,p,6);}
    const tail=group(0,.55,-.4,p);const fluff=ball(1,color,0,.1,-.18,tail);fluff.scale.set(.09,.1,.3);pets.push({root:p,tail,type});
  }
  pet('dog');pet('cat');
  for(const part of [lower,upper,stairs,roof])batchLocalMeshes(part);
  scene.updateMatrixWorld(true);const shellChunks=batchScenery(yard,scene);root.remove(yard); // World-space batches retain the home plot's elevation.
  const feature={type:'player-home',name:'我的家',x:HOME.x,z:HOME.z-6,width:16,depth:14,height:11.3,floors:2,doorHeight:3.1};
  function isBlocked(x,z,previousY=base+.2){
    if(!onHomeSite(x,z,1))return false;const p=homeLocal(x,z);
    if(((p.x-HOME.pond.x)/(HOME.pond.rx+.45))**2+((p.z-HOME.pond.z)/(HOME.pond.rz+.45))**2<1)return true;
    const h=stairHeight(x,z,base);if(h!==null&&Math.abs(h+.035-previousY)>.42)return true;
    return colliders.some(o=>p.x>o.minX-.4&&p.x<o.maxX+.4&&p.z>o.minZ-.4&&p.z<o.maxZ+.4&&previousY>=o.minY-.4&&previousY<o.maxY);
  }
  return {root,base,feature,colliders,upper,lower,roof,fish,pets,swingSeats,shellChunks,containsSite:onHomeSite,isBlocked,heightAt:(x,z,previousY)=>homeHeight(x,z,previousY??base+.2,base),update(dt,time,player,camera){
    const p=homeLocal(player.x,player.z),inside=p.x>-8.4&&p.x<8.4&&p.z>-13.4&&p.z<3.2;
    const onUpper=player.y>upperY-.45;roof.visible=!inside;upper.visible=!inside||onUpper;
    for(let f=0;f<2;f++){const set=walls[f];for(const wall of set)wall.visible=true;if(inside&&camera){const dx=camera.position.x-HOME.x,dz=camera.position.z-(HOME.z-6);set[dz>0?0:1].visible=false;set[dx>0?3:2].visible=false;}}
    for(let i=0;i<fish.length;i++){const f=fish[i],t=time*.45+f.phase;f.root.position.set(HOME.pond.x+Math.sin(t)*2.7,.43,HOME.pond.z+Math.cos(t)*1.7);f.root.rotation.y=Math.atan2(Math.cos(t)*2.7,-Math.sin(t)*1.7);f.tail.rotation.y=Math.sin(time*6+i)*.3;}
    swingSeats.forEach((s,i)=>{s.rotation.x=Math.sin(time*.95+i*1.4)*.23;});twister.rotation.y=Math.sin(time*.4)*.5;
    pets.forEach((pet,i)=>{const t=time*.22+i*2.7;pet.root.position.set((i?1:-1)*(4+Math.sin(t)*2.2),.12,10+Math.cos(t*.8)*3);pet.root.rotation.y=Math.atan2((i?1:-1)*Math.cos(t),-Math.sin(t*.8));pet.tail.rotation.y=Math.sin(time*5)*.45;});
  }};
}

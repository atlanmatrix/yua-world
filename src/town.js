import * as THREE from 'three';
import {createKit,batchScenery} from './scene-kit.js';
import {ROAD_ROUTES,SPAWN,riverX,BRIDGES,PONDS,isWater,isWaterBlocked,groundHeight} from './layout.js';
import {createWildlife} from './wildlife.js';
export {SPAWN} from './layout.js';

export function createTown(scene,materials,roofs) {
  const kit=createKit(materials),{mat,mesh,box,ball,cylinder,beam,group}=kit;
  const source=new THREE.Group();scene.add(source);const dynamic=new THREE.Group();scene.add(dynamic);
  const obstacles=[],paths=[],windmills=[],buildings=[];let seed=901;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const pick=a=>a[Math.floor(random()*a.length)];
  const roofMaterials=new Map();
  function roofMaterial(color){if(!roofMaterials.has(color)){const m=mat(color).clone();roofMaterials.set(color,m);roofs.push({material:m,color});}return roofMaterials.get(color);}
  const block=(x,z,w,d,angle=0)=>{const c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));const a=w*c+d*s,b=d*c+w*s;obstacles.push({minX:x-a/2,maxX:x+a/2,minZ:z-b/2,maxZ:z+b/2});};
  box(360,.3,360,'#97ac72',0,-.22,0,source);
  box(360,.08,360,'#b4c58a',0,-.04,0,source);
  function ribbon(curve,width,color,y,parent=source,samples=180){
    const p=[],indices=[];
    for(let i=0;i<=samples;i++){const v=curve.getPoint(i/samples),t=curve.getTangent(i/samples);const n=new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(width/2);p.push(v.x+n.x,y,v.z+n.z,v.x-n.x,y,v.z-n.z);}
    for(let i=0;i<samples;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(geometry,color,0,0,0,parent);
  }
  for(const route of ROAD_ROUTES){
    const curve=new THREE.CatmullRomCurve3(route.points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.35);
    paths.push({curve,width:route.width,samples:curve.getPoints(240),type:route.type});
    ribbon(curve,route.width,route.type==='stone'?'#dccba3':'#c5ac80',.035);
    if(route.type==='stone'){
      // Irregular cobbles follow the curves, with staggered rows and grass gaps.
      const length=curve.getLength(),count=Math.floor(length/1.6);
      for(let i=0;i<count;i++){
        const t=(i+.5)/count,v=curve.getPointAt(t),tangent=curve.getTangentAt(t),normal=new THREE.Vector3(-tangent.z,0,tangent.x);
        for(let j=-1;j<=1;j++){
          const offset=j*route.width*.25+(random()-.5)*.2;
          const stone=box(.52+random()*.28,.035,.7+random()*.25,pick(['#ded5bb','#d4c9af','#e5dbc1']),v.x+normal.x*offset,.064,v.z+normal.z*offset,source);
          stone.rotation.y=Math.atan2(tangent.x,tangent.z)+(random()-.5)*.16;
        }
      }
    }
  }
  // An oval promenade provides a walkable route around the fountain.
  const ring=new THREE.EllipseCurve(0,0,11,9,0,Math.PI*2,false,0);
  const ringCurve=new THREE.CatmullRomCurve3(ring.getPoints(64).slice(0,-1).map(p=>new THREE.Vector3(p.x,0,p.y)),true);
  ribbon(ringCurve,3,'#e4d7b7',.055,source,120);
  const pathDistance=(x,z)=>{let distance=Infinity;for(const path of paths)for(const p of path.samples)distance=Math.min(distance,Math.hypot(x-p.x,z-p.z)-path.width/2);return distance;};
  // A winding stream and two ponds, with reeds, fish and three bridges.
  const riverCurve=new THREE.CatmullRomCurve3(Array.from({length:49},(_,i)=>{const z=-180+i*7.5;return new THREE.Vector3(riverX(z),0,z);}));
  ribbon(riverCurve,11,'#a2b37e',.018,source,360);
  const water=mat('#83b5b2');water.transparent=true;water.opacity=.80;water.roughness=.3;
  ribbon(riverCurve,9,water,.055,source,360);
  for(const pond of PONDS){const pool=cylinder(1,1,.06,water,pond.x,.04,pond.z,source,48);pool.scale.set(pond.rx,1,pond.rz);}
  for(const z of BRIDGES){
    const x=riverX(z);
    for(let i=0;i<30;i++)box(.49,.18,5.2,i%3?'#b39771':'#c3a680',x-7.25+i*.5,.37,z,source);
    for(const side of [-1,1]){
      beam([x-7,.9,z+side*2.5],[x+7,.9,z+side*2.5],.075,'#9a805d',source);
      for(let i=-7;i<=7;i+=2)box(.13,1.1,.13,'#9a805d',x+i,.7,z+side*2.5,source);
      block(x,z+side*2.5,14,.2);
    }
    for(const sign of [-1,1]){const approach=new THREE.CatmullRomCurve3([new THREE.Vector3(x+sign*7,0,z),new THREE.Vector3(x+sign*10,0,z+sign*1.4)]);ribbon(approach,4.8,'#c5ac80',.04,source,12);}
  }
  function pitchedRoof(g,w,d,h,color){
    const shape=new THREE.Shape();shape.moveTo(-w/2-.5,0);shape.lineTo(0,2.5);shape.lineTo(w/2+.5,0);shape.closePath();
    mesh(new THREE.ExtrudeGeometry(shape,{depth:d+1,bevelEnabled:false}),typeof color==='string'?roofMaterial(color):color,0,h,-d/2-.5,g);
    for(const side of [-1,1])beam([0,h+2.55,-d/2-.55],[side*(w/2+.55),h-.04,-d/2-.55],.09,'#6f6755',g);
  }
  function cottage(x,z,angle=0,style='cottage',scale=1){
    const g=group(x,0,z,source,angle);g.scale.setScalar(scale);
    const w=style==='library'?7:style==='cafe'?6.5:5,d=style==='library'?6:4.5,h=3.5;
    const walls=style==='bakery'?'#edd2ad':style==='library'?'#cfdbc8':style==='cafe'?'#e5d6c9':pick(['#e7ddbf','#e7c8ae','#d8dfc4']);
    box(w+.5,.25,d+.5,'#b4aa92',0,.15,0,g);box(w,h,d,walls,0,h/2+.25,0,g);
    pitchedRoof(g,w,d,h+.1,pick(['#9f6555','#7e8c7e','#a77b5d']));
    for(const side of [-1,1]){
      box(.16,h,.18,'#806d56',side*w/2,h/2+.2,d/2+.04,g);
      box(1.15,1.25,.13,'#f8eed7',side*w*.3,2.25,d/2+.12,g);
      box(.9,1,.15,'#87a7a4',side*w*.3,2.25,d/2+.2,g);
      box(.07,1,.18,'#f8eed7',side*w*.3,2.25,d/2+.25,g);
      box(1.4,.26,.5,'#957b59',side*w*.3,1.48,d/2+.27,g);
      for(let i=0;i<4;i++)ball(.17,i%2?'#d99591':'#edca7c',side*w*.3-.45+i*.3,1.75,d/2+.3,g);
    }
    box(.95,2.1,.14,'#78624d',0,1.2,d/2+.1,g);
    box(w,.14,.15,'#806d56',0,3.2,d/2+.05,g);
    box(.6,1.65,.65,'#c6b59b',w*.3,5,0,g);
    if(style!=='cottage'){
      const canopy=box(w+.4,.12,1.8,style==='bakery'?'#bc7f75':'#75968c',0,2.8,d/2+.75,g);canopy.rotation.x=-.15;
      for(let i=0;i<8;i++)box((w+.4)/16,.125,1.8,'#f0e0bd',-w/2+i*(w+.4)/8,2.8,d/2+.75,g).rotation.x=-.15;
      for(const side of [-1,1])cylinder(.06,.07,2.6,'#826f52',side*(w/2+.1),1.3,d/2+1.4,g);
      if(style==='bakery')for(let i=0;i<6;i++){const loaf=ball(.28,'#d6a35f',-1+i*.4,.95,d/2+.9,g);loaf.scale.set(1,.7,.6);}
      if(style==='library')for(let i=0;i<9;i++)box(.18,.5+random()*.3,.28,pick(['#98705f','#768a80','#c1a169']),w/2-.5,1.1,d/2+.6-i*.35,g);
      if(style==='cafe')for(const side of [-1,1]){cylinder(.8,.8,.12,'#b59a74',side*2,.9,d/2+3,g);cylinder(.08,.12,.9,'#7e8067',side*2,.45,d/2+3,g);for(const dz of [-1,1]){box(.65,.1,.65,'#83917b',side*2,.55,d/2+3+dz,g);const lx=side*2*scale,lz=(d/2+3+dz)*scale;block(x+lx*Math.cos(angle)+lz*Math.sin(angle),z-lx*Math.sin(angle)+lz*Math.cos(angle),.7*scale,.7*scale,angle);}}
    }
    block(x,z,(w+.5)*scale,(d+.5)*scale,angle);buildings.push({type:style,x,z});return g;
  }
  // Landmarks are hand placed, rather than repeated on a grid.
  cottage(-16,18,.35,'bakery');cottage(18,26,-.8,'library');cottage(-27,-24,2.1,'cafe');
  const tower=group(-17,0,-7,source,.15);
  cylinder(2.8,3.2,.4,'#bdb9a4',0,.2,0,tower,12);box(4.5,10,4.5,'#e2d6b5',0,5.2,0,tower);
  for(const side of [-1,1])box(.2,10,.22,'#897b60',side*2.1,5.2,2.28,tower);
  mesh(new THREE.ConeGeometry(3.7,4.5,4),roofMaterial('#758a83'),0,12,0,tower).rotation.y=Math.PI/4;
  for(let i=0;i<4;i++){
    const clock=group(0,8,0,tower,i*Math.PI/2);
    const face=cylinder(1,1,.1,'#f5e8c7',0,0,2.3,clock,32);face.rotation.x=Math.PI/2;
    box(.055,.7,.045,'#5a6259',0,.25,2.38,clock);box(.5,.055,.045,'#5a6259',.2,0,2.39,clock);
    for(let j=0;j<12;j++){const a=j/12*Math.PI*2;ball(.055,'#8c7958',Math.sin(a)*.84,Math.cos(a)*.84,2.39,clock);}
  }
  block(-17,-7,5,5);buildings.push({type:'clocktower',x:-17,z:-7});
  // Glass conservatory, with timber ribs, planting beds and a domed crown.
  const greenhouse=group(18,0,-18,source,-.35);
  box(8,.35,6,'#b5b29a',0,.2,0,greenhouse);
  const glass=new THREE.MeshStandardMaterial({color:'#b2d5cc',transparent:true,opacity:.3,roughness:.18,side:THREE.DoubleSide,depthWrite:false});
  box(7.7,3.5,5.7,glass,0,2,0,greenhouse);pitchedRoof(greenhouse,8,6,3.7,glass);
  for(const z of [-3,-1.5,0,1.5,3])for(const side of [-1,1])beam([0,6.2,z],[side*4.5,3.7,z],.055,'#ecdfbe',greenhouse);
  for(let i=-4;i<=4;i+=2){box(.09,3.5,.1,'#ecdfbe',i,2,3,greenhouse);box(.09,3.5,.1,'#ecdfbe',i,2,-3,greenhouse);}
  for(const z of [-3,3])for(const y of [.5,2,3.6])box(8,.09,.12,'#ecdfbe',0,y,z,greenhouse);
  for(let i=-2;i<=2;i++)ball(.5,'#81985f',i*1.25,1.5,0,greenhouse);
  block(18,-18,8,6,-.35);buildings.push({type:'conservatory',x:18,z:-18});
  function gazebo(x,z,angle=0){const g=group(x,0,z,source,angle);cylinder(4.2,4.4,.3,'#c6baa0',0,.2,0,g,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(.1,.15,3.6,'#d3c7a5',Math.sin(a)*3.5,2,Math.cos(a)*3.5,g);block(x+Math.sin(a+angle)*3.5,z+Math.cos(a+angle)*3.5,.35,.35);}
    mesh(new THREE.ConeGeometry(5,2.8,8),roofMaterial('#8c9d83'),0,4.9,0,g);cylinder(.14,.2,1,'#b3a077',0,6.5,0,g);buildings.push({type:'gazebo',x,z});}
  gazebo(-33,30,.2);gazebo(92,92,.6);
  function windmill(x,z){const g=group(x,0,z,source,.1);cylinder(2.4,3,8,'#e4d8b9',0,4,0,g,12);mesh(new THREE.ConeGeometry(3,3,12),roofMaterial('#947159'),0,9,0,g);
    const sails=group(x,6.8,z+2.7,dynamic);
    for(let i=0;i<4;i++){const arm=group(0,0,0,sails,i*Math.PI/2);arm.rotation.set(0,0,i*Math.PI/2);box(.18,5.7,.18,'#817359',0,2.4,0,arm);box(1,3.7,.08,'#eee2c2',.4,3.1,.06,arm);for(let j=0;j<5;j++)box(1,.07,.12,'#9a8765',.4,1.6+j*.7,.1,arm);}
    windmills.push(sails);block(x,z,6,6);buildings.push({type:'windmill',x,z});}
  windmill(-55,55);windmill(-113,-93);
  // Riverside watermill and animated waterwheel.
  cottage(62,41,Math.PI/2,'cottage',1.3);
  const wheel=group(56,2.6,42,dynamic);wheel.rotation.y=Math.PI/2;
  for(const z of [-.55,.55]){const rim=mesh(new THREE.TorusGeometry(2.3,.14,6,24),'#8a7352',0,0,z,wheel);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam([0,0,z],[Math.sin(a)*2.3,Math.cos(a)*2.3,z],.08,'#8a7352',wheel);}}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const paddle=box(.8,.16,1.4,'#aa8e65',Math.sin(a)*2.3,Math.cos(a)*2.3,0,wheel);paddle.rotation.z=-a;}
  // Market tents, a well, an archway, standing stones and a tiny shrine.
  for(let i=0;i<3;i++){const g=group(-1+i*5,0,-18-i*.8,source,-.15+i*.12);
    for(const x of [-1.8,1.8])for(const z of [-1,1])cylinder(.07,.08,2.9,'#917b58',x,1.45,z,g);
    const canopy=mesh(new THREE.CylinderGeometry(0,2.7,1,4),pick(['#bc8c83','#8da59a','#b4a077']),0,3,0,g);canopy.scale.z=.65;canopy.rotation.y=Math.PI/4;
    box(3.8,.13,1.9,'#b09267',0,1,0,g);for(let j=0;j<12;j++)ball(.16,j%2?'#b6ba6b':'#d49c70',(j%6)*.5-1.3,1.2,Math.floor(j/6)*.5-.2,g);block(-1+i*5,-18-i*.8,4,2.3);buildings.push({type:'market',x:-1+i*5,z:-18-i*.8});}
  const well=group(-8,0,30,source);cylinder(1.3,1.4,1.1,'#b4b6a4',0,.6,0,well,12);cylinder(1,1,.04,'#83b5b2',0,1.18,0,well,16);
  for(const x of [-1.4,1.4])box(.15,3,.15,'#8c7757',x,1.6,0,well);pitchedRoof(well,3.4,2,3,'#9c7861');block(-8,30,3.2,3.2);
  const arch=group(-38,0,13,source,-.5);for(const x of [-3,3]){cylinder(.3,.4,4,'#cdc9ae',x,2,0,arch);ball(.43,'#d7d3b8',x,4,0,arch);block(-38+x*Math.cos(-.5),13-x*Math.sin(-.5),.8,.8);}
  const arc=mesh(new THREE.TorusGeometry(3,.24,8,32,Math.PI),'#cdc9ae',0,4,0,arch);
  for(let i=0;i<8;i++){const a=i/8*Math.PI;ball(.28,'#81985f',Math.cos(a)*3,4+Math.sin(a)*3,.1,arch);}
  const shrine=group(-41,0,-108,source,.7);cylinder(4,4.4,.4,'#c1bdad',0,.2,0,shrine,8);
  for(const x of [-2.4,2.4])for(const z of [-2.4,2.4])cylinder(.16,.2,4,'#a28a68',x,2.4,z,shrine);
  for(let i=0;i<2;i++){const roof=mesh(new THREE.ConeGeometry(5-i,2.2,4),roofMaterial('#6d8a83'),0,5+i*1.9,0,shrine);roof.rotation.y=Math.PI/4;}
  block(-41,-108,5.5,5.5,.7);buildings.push({type:'shrine',x:-41,z:-108});
  const ruin=group(119,-.05,-93,source,.2);for(let i=0;i<7;i++){const angle=i/7*Math.PI*2;const column=box(1,2+random()*2.5,1,'#b7b9a4',Math.sin(angle)*6,1,Math.cos(angle)*6,ruin);column.rotation.z=(random()-.5)*.2;const lx=Math.sin(angle)*6,lz=Math.cos(angle)*6;block(119+lx*Math.cos(.2)+lz*Math.sin(.2),-93-lx*Math.sin(.2)+lz*Math.cos(.2),1.4,1.4);}
  buildings.push({type:'ruins',x:119,z:-93});
  const mushroomHouse=group(-94,0,22,source);cylinder(2.8,3.3,4,'#e7d9bb',0,2,0,mushroomHouse,16);
  const cap=ball(1,roofMaterial('#b27969'),0,4.8,0,mushroomHouse);cap.scale.set(4.6,2,4.6);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(.35,'#e8d9b5',Math.sin(a)*3.7,5.5,Math.cos(a)*3.7,mushroomHouse);}
  box(1.2,2,.15,'#7b7056',0,1.1,2.8,mushroomHouse);block(-94,22,6.5,6.5);buildings.push({type:'mushroom-house',x:-94,z:22});
  // Fountain and sculptural village details.
  cylinder(2.6,2.8,.65,'#b7bbaa',0,.4,0,source,24);cylinder(2.3,2.3,.07,'#91bcc1',0,.76,0,source,32);
  cylinder(.35,.55,1.5,'#d9d6bc',0,1.4,0,source);cylinder(1.3,.3,.25,'#d9d6bc',0,2.2,0,source,16);block(0,0,5.6,5.6);
  const fountain=ball(.23,'#b3d7d6',0,2.65,0,dynamic);
  for(const [x,z,angle] of [[-7,7,.8],[9,-6,-.4],[-9,-2,1.4],[5,12,-.4]]){
    const bench=group(x,0,z,source,angle);box(2.4,.15,.8,'#a28b61',0,.75,0,bench);box(2.4,.6,.12,'#a28b61',0,1.08,-.36,bench);for(const dx of [-.85,.85])box(.14,.75,.65,'#6d7961',dx,.35,0,bench);block(x,z,2.4,.9,angle);
  }
  // Cottages turn toward their own meandering lane, with generous garden gaps.
  const reserved=buildings.map(b=>({x:b.x,z:b.z}));
  for(const path of paths){for(let i=0;i<8;i++){
    const t=.08+i*.115,v=path.curve.getPointAt(t),tangent=path.curve.getTangentAt(t),side=i%2?1:-1;
    const x=v.x-tangent.z*side*(9+random()*4),z=v.z+tangent.x*side*(9+random()*4);
    if(Math.abs(x)>167||Math.abs(z)>167||isWater(x,z)||isWater(x+5,z)||isWater(x-5,z)||reserved.some(b=>Math.hypot(x-b.x,z-b.z)<14)||pathDistance(x,z)<4)continue;
    cottage(x,z,Math.atan2(v.x-x,v.z-z),i%6===0?'bakery':'cottage',.8+random()*.35);reserved.push({x,z});
  }}
  function tree(x,z,type,scale=1){
    const g=group(x,0,z,source,random()*6.28);g.scale.setScalar(scale);
    if(type==='pine'){
      cylinder(.17,.35,4,'#887553',0,2,0,g,7);
      for(let i=0;i<3;i++)mesh(new THREE.ConeGeometry(2-i*.4,3.5-i*.4,7),['#81985f','#91a56a','#a2b77b'][i],0,3+i*1.25,0,g);
    }else if(type==='birch'){
      cylinder(.13,.23,5,'#ddd6bd',0,2.5,0,g,7);
      for(let i=0;i<4;i++){const branch=box(.2,.12,.08,'#7e7c66',0,1+i*.8,.2,g);branch.rotation.z=.3;}
      for(let i=0;i<3;i++){const crown=ball(1,['#81985f','#91a56a','#a2b77b'][i],(i-1)*.7,4.2+i*.4,0,g);crown.scale.set(1.2,1.7,1.1);}
    }else{
      cylinder(.2,.43,3.7,'#8c7854',0,1.85,0,g,8);
      for(const side of [-1,1])beam([0,2,0],[side*.95,3.5,.15],.14,'#8c7854',g);
      for(let i=0;i<3;i++){const crown=ball(1,type==='cherry'?'#c0a0bd':['#81985f','#91a56a','#a2b77b'][i],(i-1)*.95,3.9+Math.sin(i)*.5,(i%2)*.5,g);crown.scale.set(1.65,type==='willow'?1.7:1.4,1.6);}
      if(type==='willow')for(let i=0;i<10;i++){const a=i/10*Math.PI*2;beam([Math.sin(a)*1.6,4.3,Math.cos(a)*1.6],[Math.sin(a)*2.15,1.5,Math.cos(a)*2.15],.075,'#a2b77b',g);}
    }
    block(x,z,.7*scale,.7*scale);
  }
  const occupied=(x,z,margin=0)=>obstacles.some(o=>x>o.minX-margin&&x<o.maxX+margin&&z>o.minZ-margin&&z<o.maxZ+margin);
  // Curated groves close to the arrival path make the first view lush.
  for(const [x,z,type] of [[-8,20,'cherry'],[11,17,'birch'],[-23,31,'willow'],[24,13,'cherry'],[-6,-9,'cherry'],[9,-10,'birch'],[-30,5,'pine'],[22,-34,'pine']])if(!occupied(x,z,1))tree(x,z,type,1);
  for(let i=0;i<780;i++){
    const x=(random()-.5)*344,z=(random()-.5)*344;
    if(isWater(x,z)||occupied(x,z,2)||pathDistance(x,z)<3.8||Math.hypot(x,z)<14)continue;
    tree(x,z,pick(['oak','pine','birch','cherry','willow']),.7+random()*.65);
  }
  const flowerGeometry=new THREE.CylinderGeometry(.18,.1,.035,5),leafGeometry=new THREE.ConeGeometry(.08,.6,3);
  function flower(x,z,type=0){
    cylinder(.02,.025,.45,'#78985f',x,.23,z,source,4);
    const bloom=mesh(flowerGeometry,['#d99591','#edca7c','#c0a0bd'][type%3],x,.49,z,source);bloom.rotation.y=random()*6;
    ball(.055,'#edca7c',x,.53,z,source);
    const leaf=mesh(leafGeometry,'#91a56a',x+.09,.17,z,source);leaf.rotation.z=-.8;
  }
  // Flower drifts and fern fans soften the edges of the central paths.
  for(const [cx,cz] of [[-6,24],[14,10],[-22,12],[20,33],[-34,-5]]){
    for(let i=0;i<22;i++){
      const angle=random()*Math.PI*2,r=Math.sqrt(random())*2.8,x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r*.65;
      if(!isWater(x,z)&&!occupied(x,z,.25)&&pathDistance(x,z)>.1)flower(x,z,i%3);
    }
  }
  for(let i=0;i<85;i++){
    const x=(random()-.5)*170,z=(random()-.5)*170;
    if(isWater(x,z)||occupied(x,z,.4)||pathDistance(x,z)<1)continue;
    for(let j=0;j<7;j++){
      const a=j/7*Math.PI*2;
      beam([x,.05,z],[x+Math.cos(a)*.7,.5,z+Math.sin(a)*.7],.025,'#78985f',source);
      for(let k=1;k<4;k++){
        const frond=mesh(leafGeometry,'#91a56a',x+Math.cos(a)*k*.18,.15+k*.11,z+Math.sin(a)*k*.18,source);frond.rotation.set(.5,a,.6);frond.scale.set(1.6,.55,1.4);
      }
    }
  }
  for(let i=0;i<700;i++){
    const near=i<330,x=(random()-.5)*(near?90:335),z=(random()-.5)*(near?90:335);
    if(isWater(x,z)||occupied(x,z,.4)||pathDistance(x,z)<.3)continue;
    for(let j=0;j<3;j++)flower(x+(random()-.5)*1.4,z+(random()-.5)*1.4,i%3);
  }
  for(let i=0;i<2400;i++){
    const x=(random()-.5)*349,z=(random()-.5)*349;
    if(isWater(x,z)||occupied(x,z,.25)||pathDistance(x,z)<.2)continue;
    if(i%7===0){const bush=ball(1,'#81985f',x,.4,z,source);bush.scale.set(.7,.45,.6);}
    else if(i%11===0){cylinder(.08,.1,.35,'#d8c8a1',x,.2,z,source,5);const cap=ball(.23,'#bc8777',x,.4,z,source);cap.scale.y=.5;}
    else for(let j=0;j<3;j++){const blade=mesh(leafGeometry,i%2?'#a2b77b':'#91a56a',x+j*.12,.25,z,source);blade.rotation.z=(j-1)*.35;}
  }
  // Reeds, lily pads and stepping stones frame the water instead of straight banks.
  for(let i=0;i<170;i++){
    const z=-170+i*2,x=riverX(z)+(i%2?1:-1)*5.4;
    if(BRIDGES.some(b=>Math.abs(z-b)<5))continue;
    for(let j=0;j<3;j++){const dx=x+(random()-.5);cylinder(.025,.03,1.1,'#8c9a62',dx,.55,z+j*.3,source,4);cylinder(.07,.07,.3,'#9c7750',dx,1.1,z+j*.3,source,6);}
  }
  for(const pond of PONDS)for(let i=0;i<12;i++){const a=random()*6.28,r=.3+random()*.5;const lily=cylinder(.5,.5,.025,'#91a56a',pond.x+Math.cos(a)*pond.rx*r,.10,pond.z+Math.sin(a)*pond.rz*r,source,9);if(i%3===0)flower(lily.position.x,lily.position.z,2);}
  for(let i=0;i<30;i++){const x=-58+Math.sin(i*.5)*4,z=-18+i*.6;if(!isWater(x,z)){const rock=ball(.45,'#b8b9a3',x,.15,z,source);rock.scale.set(1.4,.35,1);}}
  // Lanterns, planters, timber carts, fences and stone decorations.
  for(const path of paths)for(let i=0;i<6;i++){
    const t=.08+i*.17,p=path.curve.getPointAt(t),tangent=path.curve.getTangentAt(t),x=p.x-tangent.z*4.5,z=p.z+tangent.x*4.5;
    if(isWater(x,z)||occupied(x,z,.3))continue;
    cylinder(.06,.12,3.2,'#69735c',x,1.6,z,source,6);box(.45,.6,.45,'#f0dfac',x,3.3,z,source);mesh(new THREE.ConeGeometry(.4,.3,4),'#69735c',x,3.75,z,source);
  }
  const cart=group(-12,0,23,source,-.5);box(2.5,.15,1.5,'#a38c64',0,.7,0,cart);for(const side of [-1,1]){box(2.5,.6,.1,'#a38c64',0,1,side*.75,cart);for(const x of [-.8,.8]){const tire=mesh(new THREE.TorusGeometry(.4,.07,5,12),'#746b52',x,.4,side*.9,cart);}}beam([-1,0,0],[-3,.5,0],.06,'#9c835c',cart);
  block(-12,23,3,2);
  for(let i=0;i<12;i++){const x=-49+i*1.1,z=46+Math.sin(i*.16);box(.12,1.1,.12,'#d1c4a2',x,.55,z,source);if(i<11)beam([x,.8,z],[x+1.1,.8,46+Math.sin((i+1)*.16)],.06,'#d1c4a2',source);}
  // Rolling perimeter hills soften the horizon while the walkable ground stays level.
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const hill=ball(1,i%2?'#91a56a':'#a2b77b',Math.sin(a)*195,-4,Math.cos(a)*195,source);hill.scale.set(25+random()*18,10+random()*15,28);}
  const chunks=batchScenery(source,scene);
  const wildlife=createWildlife(scene,kit,{isBlocked:(x,z)=>isWater(x,z)||occupied(x,z,.8),random});
  return {obstacles,chunks,buildings,paths,wildlife,isBlocked:isWaterBlocked,groundHeight,update(dt,elapsed,position){
    for(const sails of windmills)sails.rotation.z-=dt*.35;
    wheel.rotation.z+=dt*.5;fountain.position.y=2.65+Math.sin(elapsed*3)*.1;
    wildlife.update(dt,elapsed,position);
    for(const chunk of chunks){const sphere=chunk.geometry.boundingSphere;chunk.visible=Math.hypot(sphere.center.x-position.x,sphere.center.z-position.z)<145+sphere.radius;}
  }};
}

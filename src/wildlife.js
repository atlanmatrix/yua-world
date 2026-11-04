import * as THREE from 'three';
import {riverX,PONDS,isWater} from './layout.js';
import {terrainSurfaceHeight,WATER_LEVEL} from './elevation.js';

export function createWildlife(scene,kit,{isBlocked,random}) {
  const {box,ball,cylinder,beam,group,mesh}=kit;
  const residents=[];
  function creature(type,x,z,index){
    const root=group(x,0,z,scene),body=group(0,0,0,root);root.name=type;
    const limbs=[],wings=[];
    const ell=(px,py,pz,rx,ry,rz,color,parent=body)=>{const m=ball(1,color,px,py,pz,parent);m.scale.set(rx,ry,rz);return m;};
    const eye=(px,py,pz,parent=body)=>ell(px,py,pz,.045,.055,.025,'#343a35',parent);
    if(['deer','fox','rabbit','boar'].includes(type)){
      const deer=type==='deer',rabbit=type==='rabbit',fox=type==='fox';
      const color=deer?'#b3936c':fox?'#c48651':rabbit?'#ddd0b7':'#847c68';
      const size=deer?1.2:rabbit?.6:1;
      body.scale.setScalar(size);
      ell(0,.85,0,.42,.44,.72,color);
      ell(0,1.15,.65,.29,.33,.32,color);
      ell(0,1.04,.9,.19,.15,.28,fox?'#efe1c4':color);
      ell(0,1.09,1.12,.07,.06,.05,'#524b40');
      for(const side of [-1,1]){
        eye(side*.23,1.23,.88);
        const ear=ell(side*.2,1.5,.6,rabbit?.09:.12,rabbit?.45:.22,.1,color);ear.rotation.z=side*.2;
        ell(side*.2,1.52,.69,.055,rabbit?.3:.13,.03,'#c6a697');
        if(deer){
          beam([side*.13,1.46,.5],[side*.28,2.2,.35],.035,'#8d7b5b',body);
          beam([side*.23,1.9,.4],[side*.52,2.06,.4],.025,'#8d7b5b',body);
          beam([side*.27,2.04,.38],[side*.12,2.22,.35],.025,'#8d7b5b',body);
        }
        for(const front of [-1,1]){
          const leg=group(side*.27,.65,front*.44,body);
          cylinder(.055,.08,.6,color,0,-.25,0,leg,6);box(.13,.12,.2,'#665f4e',0,-.57,.04,leg);limbs.push({leg,sign:side*front});
        }
      }
      if(fox){const tail=ell(0,.8,-1,.22,.22,.62,'#c48651');tail.rotation.x=-.25;ell(0,.95,-1.44,.17,.17,.24,'#f0e5cd');}
      else if(rabbit)ell(0,.65,-.7,.18,.18,.18,'#eee9d9');
      if(deer)for(let i=0;i<7;i++)ell((i%2?1:-1)*.32,1+(i%3)*.07,-.45+i*.13,.055,.03,.055,'#eadabd');
    }else if(type==='duck'){
      ell(0,.24,0,.3,.25,.5,'#e8ddba');ell(0,.56,.35,.2,.23,.2,'#718b6a');ell(0,.51,.62,.14,.055,.14,'#d7b86c');
      for(const side of [-1,1]){eye(side*.16,.62,.46);ell(side*.24,.3,-.06,.07,.15,.3,'#b7b293');}
    }else if(type==='fish'){
      ell(0,0,0,.16,.09,.46,index%2?'#e9c28f':'#d88f73');
      const tail=mesh(new THREE.ConeGeometry(.22,.32,3),'#b6745e',0,0,-.55,body);tail.rotation.x=Math.PI/2;tail.scale.z=.35;wings.push(tail);
      const fin=mesh(new THREE.ConeGeometry(.14,.25,3),'#e6cb9f',.17,.03,-.05,body);fin.rotation.z=-1;
      for(const side of [-1,1])eye(side*.13,.04,.25);
    }else if(type==='butterfly'){
      ell(0,0,0,.035,.045,.17,'#5c6652');
      for(const side of [-1,1]){
        const wing=group(0,0,0,body);
        ell(side*.21,0,.07,.22,.025,.27,index%2?'#d99591':'#edca7c',wing);
        ell(side*.15,0,-.2,.16,.025,.18,index%2?'#c0a0bd':'#d6a668',wing);wings.push(wing);
      }
    }else if(type==='bird'){
      ell(0,0,0,.12,.13,.27,'#7b8985');ell(0,.08,.23,.11,.12,.12,'#d9d4b7');ell(0,.04,.36,.04,.025,.08,'#c2a069');
      for(const side of [-1,1]){const wing=group(0,0,0,body);ell(side*.27,0,-.07,.35,.035,.15,'#83958b',wing);wings.push(wing);}
    }else if(type==='dragonfly'){
      ell(0,0,0,.035,.04,.26,'#6f9e9c');
      for(const side of [-1,1])for(const dz of [-.08,.08]){const wing=ell(side*.24,0,dz,.26,.014,.07,'#c4d8cc');wings.push(wing);}
    }else{
      ell(0,.08,0,.1,.09,.15,'#9d5549');
      for(const side of [-1,1])for(let i=0;i<3;i++)beam([side*.04,.08,-.1+i*.08],[side*.17,.01,-.1+i*.08],.012,'#555f49',body);
      ell(0,.1,.15,.065,.06,.06,'#525f4a');
    }
    residents.push({root,body,type,home:{x,z},phase:index*.83,limbs,wings});
  }
  const landHomes=[[-29,40],[-78,65],[-112,-40],[79,-52],[105,108],[-52,-117]];
  for(const [i,[x,z]] of landHomes.entries())for(let j=0;j<3;j++){
    const px=x+j*2,pz=z+j;if(!isBlocked(px,pz))creature(i%2?'deer':'fox',px,pz,i*3+j);
  }
  for(let i=0;i<18;i++){const x=i<6?8+i*2:(random()-.5)*230,z=i<6?18+i*.8:(random()-.5)*230;if(!isBlocked(x,z))creature(i%5?'rabbit':'boar',x,z,i);}
  for(let i=0;i<10;i++){const z=-15+i*6;creature('duck',riverX(z)+(i%2?1.7:-1.5),z,i);}
  for(let i=0;i<28;i++){
    const z=-50+i*4.5;creature('fish',riverX(z)+(i%3-1)*1.8,z,i);
  }
  for(const pond of PONDS)for(let i=0;i<6;i++)creature('fish',pond.x+Math.sin(i)*pond.rx*.4,pond.z+Math.cos(i)*pond.rz*.4,i);
  for(let i=0;i<35;i++)creature(i%4?'butterfly':'dragonfly',(random()-.5)*75,(random()-.5)*75,i);
  for(let i=0;i<10;i++)creature('bird',(random()-.5)*100,(random()-.5)*100,i);
  for(let i=0;i<16;i++){const x=(random()-.5)*70,z=(random()-.5)*70;if(!isBlocked(x,z))creature('beetle',x,z,i);}
  return {residents,update(dt,time,player){
    for(const animal of residents){
      const {root,body,type,home,phase,limbs,wings}=animal;
      const visibility=['butterfly','dragonfly','beetle'].includes(type)?32:type==='fish'?40:65;
      root.visible=Math.hypot(home.x-player.x,home.z-player.z)<visibility;if(!root.visible)continue;
      const t=time*(type==='fish'?.7:type==='butterfly'?1:type==='bird'?.45:.22)+phase;
      const radius=type==='bird'?8:type==='butterfly'?2.5:type==='fish'?1.2:1.8;
      let x=home.x+Math.sin(t)*radius,z=home.z+Math.sin(t*.7)*radius;
      const aquatic=type==='duck'||type==='fish',flying=['bird','butterfly','dragonfly'].includes(type);
      if((aquatic&&isWater(x,z))||flying||(!aquatic&&!isBlocked(x,z))){root.position.x=x;root.position.z=z;}
      root.rotation.y=Math.atan2(Math.cos(t),Math.cos(t*.7)*.7);
      const ground=terrainSurfaceHeight(root.position.x,root.position.z);
      root.position.y=type==='fish'?WATER_LEVEL-.08:type==='duck'?WATER_LEVEL+.06:ground+(type==='bird'?7+Math.sin(t)*1.5:type==='butterfly'?1.1+Math.sin(t*2)*.5:type==='dragonfly'?1.4+Math.sin(t)*.3:.04);
      if(type==='rabbit')body.position.y=Math.max(0,Math.sin(time*5+phase))*.15;
      for(const {leg,sign} of limbs)leg.rotation.x=Math.sin(time*4+phase)*.25*sign;
      wings.forEach((wing,i)=>{if(type==='fish')wing.rotation.y=Math.sin(time*7+phase)*.4;else wing.rotation.z=Math.sin(time*(type==='bird'?6:18)+phase)*(i%2?1:-1)*.65;});
    }
  }};
}

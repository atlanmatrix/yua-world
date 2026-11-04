import * as THREE from 'three';
import {terrainSurfaceHeight} from './elevation.js';

export function createNeighborhood(source,kit,{block,buildings,roofMaterial}){
  const {box,ball,cylinder,beam,group,mesh}=kit,homes=[],civic=[];
  function windowUnit(g,x,y,z,width=1.2,height=1.65){
    box(width+.18,height+.18,.14,'#f1ead7',x,y,z,g);box(width,height,.16,'#88aeb3',x,y,z+.05,g);
    box(.06,height,.18,'#ecdfc2',x,y,z+.1,g);box(width,.06,.18,'#ecdfc2',x,y,z+.11,g);
    box(width+.3,.12,.35,'#c3b69b',x,y-height/2-.1,z+.08,g);
  }
  function roof(g,w,d,y,color){const s=new THREE.Shape();s.moveTo(-w/2-.7,0);s.lineTo(0,2.6);s.lineTo(w/2+.7,0);s.closePath();mesh(new THREE.ExtrudeGeometry(s,{depth:d+1.4,bevelEnabled:false}),roofMaterial(color),0,y,-d/2-.7,g);}
  function foundation(x,z,w,d,angle){
    const c=Math.cos(angle),s=Math.sin(angle),samples=[];
    for(const lx of [-w/2,0,w/2])for(const lz of [-d/2,0,d/2])samples.push(terrainSurfaceHeight(x+lx*c+lz*s,z-lx*s+lz*c));
    return {top:Math.max(...samples)+.08,bottom:Math.min(...samples)-.1};
  }
  function world(x,z,lx,lz,angle){return {x:x+lx*Math.cos(angle)+lz*Math.sin(angle),z:z-lx*Math.sin(angle)+lz*Math.cos(angle)};}
  function obstacleLocal(x,z,lx,lz,w,d,angle){const p=world(x,z,lx,lz,angle);block(p.x,p.z,w,d,angle);}
  function courtyard(x,z,angle,floors,color){
    const w=11,d=10,yardW=21,yardD=24,base=foundation(x,z,yardW,yardD,angle),g=group(x,base.top,z,source,angle);
    box(yardW,base.top-base.bottom,yardD,'#b8ad91',0,-(base.top-base.bottom)/2,0,g);
    box(yardW-.35,.07,yardD-.35,'#a6bc82',0,.03,0,g);
    const house=group(0,0,-3,g),floorHeight=3.8,h=floors*floorHeight;
    box(w,h,d,color,0,h/2+.12,0,house);box(w+.3,.3,d+.3,'#bcb5a1',0,.15,0,house);
    for(let f=0;f<floors;f++){
      const y=f*floorHeight+2.05;
      for(const side of [-1,1])windowUnit(house,side*3.2,y,d/2+.08,1.55,1.8);
      for(const side of [-1,1]){const wall=group(0,0,0,house,side*Math.PI/2);for(const z of [-2.6,1.7])windowUnit(wall,z,y,w/2+.08,1.35,1.7);}
      if(f>0){box(w+.22,.18,d+.22,'#d1c9b6',0,f*floorHeight,0,house);box(4,.18,1.7,'#d3c8ae',0,f*floorHeight+.05,d/2+.65,house);
        for(let j=-3;j<=3;j++)cylinder(.035,.035,1.05,'#6b8077',j*.55,f*floorHeight+.65,d/2+1.4,house,5);
        beam([-2,f*floorHeight+1.18,d/2+1.4],[2,f*floorHeight+1.18,d/2+1.4],.04,'#6b8077',house);
      }
    }
    box(1.6,2.8,.16,'#7a6955',0,1.5,d/2+.12,house);box(.15,2.7,.18,'#dfc795',.55,1.5,d/2+.24,house);
    roof(house,w,d,h+.2,floors===3?'#708c88':'#a27663');
    box(3.3,.15,7,'#ddd1b6',0,.13,6,g);
    for(const side of [-1,1]){
      for(let i=-11;i<=11;i+=1.5){box(.14,1.25,.14,'#e1d4b6',side*yardW/2,.7,i,g);}
      for(const height of [.48,1.05])beam([side*yardW/2,height,-12],[side*yardW/2,height,12],.055,'#e1d4b6',g);
      obstacleLocal(x,z,side*yardW/2,0,.25,yardD,angle);
      const segment=(yardW-3.8)/2;box(segment,1.05,.22,'#ddd0b3',side*(1.9+segment/2),.55,12,g);obstacleLocal(x,z,side*(1.9+segment/2),12,segment,.25,angle);
      for(let i=0;i<5;i++){
        const z=4+i*1.15,bush=ball(.7,'#81985f',side*6.8,.5,z,g);bush.scale.y=.65;
        cylinder(.03,.04,.5,'#78985f',side*6.6,.6,z,g,5);ball(.2,i%2?'#d99591':'#c0a0bd',side*6.6,.95,z,g);
      }
    }
    box(yardW,1.05,.22,'#ddd0b3',0,.55,-12,g);obstacleLocal(x,z,0,-12,yardW,.25,angle);
    for(const side of [-1,1]){box(.45,1.7,.45,'#c1b69d',side*2.1,.85,12,g);ball(.25,'#ede2c0',side*2.1,1.85,12,g);}
    const mailbox=group(3.1,0,11.5,g);cylinder(.06,.08,1,'#82775b',0,.5,0,mailbox);box(.65,.45,.45,'#859c8a',0,1.1,0,mailbox);
    obstacleLocal(x,z,0,-3,w+.4,d+.4,angle);
    const feature={type:'courtyard-house',x,z,floors,width:w,height:h+2.8,doorHeight:2.8,angle,yardWidth:yardW,yardDepth:yardD,base:base.top};buildings.push(feature);homes.push(feature);
  }
  courtyard(-31,53,.15,2,'#e1cbb4');courtyard(12,73,Math.PI/2,3,'#d4dfd5');courtyard(-111,84,-.25,3,'#e5d4b9');courtyard(111,-44,Math.PI,2,'#e0d7ca');

  function publicBuilding(type,x,z,w,d,floors,angle,color){
    const base=foundation(x,z,w+3,d+3,angle),g=group(x,base.top,z,source,angle),floorHeight=type==='supermarket'?5.2:3.9,h=floors*floorHeight;
    box(w+2,base.top-base.bottom+.3,d+2,'#bdb7a7',0,-(base.top-base.bottom)/2,0,g);
    box(w,h,d,color,0,h/2+.15,0,g);
    for(let f=0;f<floors;f++){
      box(w+.2,.18,d+.2,'#e9e3cf',0,f*floorHeight+.15,0,g);
      for(let i=0;i<Math.floor(w/3);i++){
        const lx=-w/2+2+i*3;if(f===0&&Math.abs(lx)<3)continue;
        windowUnit(g,lx,f*floorHeight+2.15,d/2+.08,type==='supermarket'?2.1:1.65,type==='supermarket'?2.5:1.8);
      }
      for(const side of [-1,1]){
        const wall=group(0,0,0,g,side*Math.PI/2);for(let i=0;i<3;i++)windowUnit(wall,-d/2+2+i*3,f*floorHeight+2.1,w/2+.08,1.5,1.8);
      }
    }
    box(3.8,3.1,.15,'#759fa9',0,1.7,d/2+.18,g);box(.12,3.2,.2,'#f1e6ce',0,1.7,d/2+.29,g);
    box(7,.22,3.4,type==='hospital'?'#829e92':'#c6b697',0,3.5,d/2+1.3,g);
    for(const side of [-1,1])cylinder(.14,.18,3.35,'#e0d8c2',side*3,1.7,d/2+2.7,g);
    if(type==='school'){
      roof(g,w,d,h+.2,'#9b705d');
      const entrance=group(0,0,d/2+.3,g);box(4.5,1.5,.15,'#d2be8d',0,5,0,entrance);
      // Open-book crest, flagpole, playground and a small sports court.
      const left=box(.85,.7,.08,'#f6eed4',-.44,5,.15,entrance);left.rotation.z=.12;
      const right=box(.85,.7,.08,'#f6eed4',.44,5,.15,entrance);right.rotation.z=-.12;
      cylinder(.065,.09,8,'#b2b4aa',-w/2-4,4,d/2+6,g);const flag=box(2,1.15,.04,'#91b5a3',-w/2-3.1,7.1,d/2+6,g);
      box(12,.07,8,'#a4b79a',w/2+10,.08,0,g);
      for(const side of [-1,1])beam([w/2+4,.13,side*3.7],[w/2+16,.13,side*3.7],.04,'#f0e8cf',g);
      for(const side of [-1,1]){cylinder(.06,.09,3,'#a6aba1',w/2+10+side*5,1.5,0,g);box(1.3,.8,.08,'#eee9d8',w/2+10+side*5,3.1,0,g);}
    }else if(type==='hospital'){
      box(w+1,.25,d+1,'#a3b4aa',0,h+.3,0,g);box(w,.6,.18,'#e2e9df',0,h+.6,d/2,g);
      const sign=group(0,0,d/2+.3,g);box(1.1,3.2,.2,'#bd756d',0,h-1.9,0,sign);box(3.2,1.1,.22,'#bd756d',0,h-1.9,.02,sign);
      // Compact ambulance bay and a recognizable white/green service vehicle.
      const van=group(w/2+5,0,1,g);box(2.5,2.1,4.5,'#e9ede1',0,1.45,0,van);box(2.2,.8,.12,'#83a9b0',0,1.9,2.3,van);box(2.55,.35,4.55,'#8fa99a',0,1.15,0,van);box(.55,.22,.5,'#b57f73',0,2.7,.5,van);
      for(const side of [-1,1])for(const dz of [-1.3,1.3]){const tire=cylinder(.42,.42,.25,'#646e64',side*1.2,.45,dz,van,12);tire.rotation.z=Math.PI/2;}
      obstacleLocal(x,z,w/2+5,1,2.7,4.7,angle);
    }else if(type==='supermarket'){
      box(w+1,.3,d+1,'#8da594',0,h+.3,0,g);
      for(let i=0;i<12;i++){const stripe=box(w/12,.16,2.6,i%2?'#d4b680':'#8fa795',-w/2+(i+.5)*w/12,3.8,d/2+1,g);stripe.rotation.x=-.12;}
      // Basket emblem, fruit display, shopping carts and curved parking approach.
      box(2.5,1,.1,'#d7c38e',0,4.6,d/2+.2,g);for(let i=0;i<4;i++)box(.08,1.05,.13,'#7e947c',-.9+i*.6,4.6,d/2+.27,g);
      for(const side of [-1,1]){const crate=group(side*6,0,d/2+1.6,g);box(2,.8,1.3,'#b29a6e',0,.45,0,crate);for(let i=0;i<8;i++)ball(.17,i%2?'#bd8d67':'#a5b171',(i%4)*.4-.6,.95,Math.floor(i/4)*.45-.2,crate);}
      for(let i=0;i<3;i++){
        const cart=group(w/2+3,0,-2+i*2,g);box(.8,.55,1.1,'#b4c2b8',0,.9,0,cart);beam([-.4,1,-.55],[.4,1,-.55],.045,'#82968e',cart);for(const side of [-1,1])for(const dz of [-.4,.4])ball(.12,'#6f7d70',side*.32,.25,dz,cart);
      }
    }else{
      roof(g,w,d,h+.2,'#718d83');
      const sign=group(0,h-1.7,d/2+.2,g);box(3,1.5,.12,'#e7dfbf',0,0,0,sign);
      beam([-1.4,.65,.12],[0,-.15,.12],.035,'#769787',sign);beam([0,-.15,.12],[1.4,.65,.12],.035,'#769787',sign);
      const postbox=group(w/2+2.5,0,d/2+1,g);cylinder(.45,.48,1.5,'#7d9d86',0,.85,0,postbox,12);box(.55,.12,.05,'#526b5c',0,1.25,.45,postbox);
    }
    block(x,z,w+1,d+1,angle);const info={type,x,z,floors,width:w,height:h+(type==='school'?2.8:1),doorHeight:3.1,angle};buildings.push(info);civic.push(info);
  }
  publicBuilding('school',-7,-43,26,15,3,0,'#dfd1af');
  publicBuilding('hospital',82,40,22,15,3,Math.PI,'#e1e8df');
  publicBuilding('supermarket',-66,2,24,15,1,Math.PI/2,'#e6dfcc');
  // A two-storey mixed-use block adds a different roofline beside the eastern lane.
  publicBuilding('post-office',118,37,15,12,2,-.3,'#e0c8b4');
  return {homes,civic};
}

import {BRIDGES,PONDS,riverX} from './layout.js';
import {HOME,mapPoint,headingAngle} from './home-layout.js';

export function createMinimap(town,{onOpen,onClose}){
  const button=document.querySelector('#minimap'),small=document.querySelector('#minimap-canvas'),full=document.querySelector('#full-map-canvas'),dialog=document.querySelector('#world-map');
  const close=document.querySelector('#map-close'),size=1440,base=document.createElement('canvas');base.width=base.height=size;
  const ctx=base.getContext('2d'),scale=size/360;
  ctx.fillStyle='#dce4c5';ctx.fillRect(0,0,size,size);
  function point(x,z){return mapPoint(x,z,size);}
  function path(points,width,color){ctx.beginPath();points.forEach((p,i)=>{const q=point(p.x,p.z);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.lineWidth=width*scale;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
  // Water, paths and footprints are drawn from the same world data as the scene.
  path(Array.from({length:181},(_,i)=>({x:riverX(i*2-180),z:i*2-180})),11,'#adbf9c');
  path(Array.from({length:181},(_,i)=>({x:riverX(i*2-180),z:i*2-180})),9,'#8fbfc1');
  for(const p of PONDS){const q=point(p.x,p.z);ctx.beginPath();ctx.ellipse(q.x,q.y,p.rx*scale,p.rz*scale,0,0,Math.PI*2);ctx.fillStyle='#8fbfc1';ctx.fill();}
  for(const road of town.paths)path(road.curve.getPoints(240),road.width+1,road.type==='stone'?'#f3e7c9':'#d0bb93');
  for(const z of BRIDGES)path([{x:riverX(z)-8,z},{x:riverX(z)+8,z}],4,'#b89f77');
  const yard=point(HOME.x,HOME.z);ctx.fillStyle='#c1d2a2';ctx.strokeStyle='#f5e8c5';ctx.lineWidth=1.5*scale;ctx.fillRect(yard.x-20*scale,yard.y-20*scale,40*scale,40*scale);ctx.strokeRect(yard.x-20*scale,yard.y-20*scale,40*scale,40*scale);
  const pool=point(HOME.x+HOME.pond.x,HOME.z+HOME.pond.z);ctx.beginPath();ctx.ellipse(pool.x,pool.y,HOME.pond.rx*scale,HOME.pond.rz*scale,0,0,Math.PI*2);ctx.fillStyle='#8fbfc1';ctx.fill();const pavilion=point(HOME.x+11.5,HOME.z+7.8);ctx.beginPath();ctx.arc(pavilion.x,pavilion.y,3.5*scale,0,Math.PI*2);ctx.fillStyle='#8d9e89';ctx.fill();
  for(const b of town.buildings){const p=point(b.x,b.z),w=b.width??(b.type==='clocktower'?5:6),d=b.depth??w*.75;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-(b.angle??0));ctx.fillStyle=b.type==='player-home'?'#b68f57':['school','hospital','supermarket'].includes(b.type)?'#a49e8a':'#b9ab8e';ctx.fillRect(-w*scale/2,-d*scale/2,w*scale,d*scale);ctx.strokeStyle='#f4ebd3';ctx.lineWidth=scale*.3;ctx.strokeRect(-w*scale/2,-d*scale/2,w*scale,d*scale);ctx.restore();
  }
  const landmarks=town.buildings.filter(b=>['school','hospital','supermarket','clocktower','player-home'].includes(b.type));
  const names={school:'学校',hospital:'医院',supermarket:'超市',clocktower:'钟楼','player-home':'我的家'};
  function homePin(context,x,y,large){const r=large?8:6;context.save();context.translate(x,y);context.fillStyle='#b88d4e';context.strokeStyle='#fff7e5';context.lineWidth=2;context.beginPath();context.arc(0,0,r+3,0,Math.PI*2);context.fill();context.stroke();context.strokeStyle='#fff9e7';context.lineWidth=1.5;context.beginPath();context.moveTo(-r*.6,0);context.lineTo(0,-r*.6);context.lineTo(r*.6,0);context.moveTo(-r*.4,-r*.1);context.lineTo(-r*.4,r*.5);context.lineTo(r*.4,r*.5);context.lineTo(r*.4,-r*.1);context.stroke();context.restore();}
  function playerPin(context,x,y,angle,large){context.save();context.translate(x,y);context.fillStyle='#496e64';context.strokeStyle='#fffdf0';context.lineWidth=2;context.beginPath();context.arc(0,0,large?7:5,0,Math.PI*2);context.fill();context.stroke();context.rotate(headingAngle(angle));context.beginPath();context.moveTo(0,large?-19:-14);context.lineTo(large?7:5,large?-7:-5);context.lineTo(large?-7:-5,large?-7:-5);context.closePath();context.fill();context.stroke();context.restore();}
  function prepare(canvas){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w,h};}
  let last={x:0,z:0,angle:0},timer=1;
  function draw(){
    const {c,w,h}=prepare(small),span=112,zoom=w/span,originX=last.x-span/2,originZ=last.z-span/2;
    c.fillStyle='#dce4c5';c.fillRect(0,0,w,h);c.drawImage(base,0,0,size,size,(-180-originX)*zoom,(-180-originZ)*zoom,360*zoom,360*zoom);
    const hx=(HOME.x-originX)*zoom,hz=(HOME.z-6-originZ)*zoom;if(hx>-10&&hx<w+10&&hz>-10&&hz<h+10)homePin(c,hx,hz,false);
    playerPin(c,w/2,h/2,last.angle,false);c.fillStyle='#53684e';c.font='bold 10px Arial';c.fillText('N',8,15);
    if(dialog.open){const {c:m,w:width,h:height}=prepare(full);m.clearRect(0,0,width,height);m.drawImage(base,0,0,width,height);
      for(const b of landmarks){const p=mapPoint(b.x,b.z,width);if(b.type==='player-home')homePin(m,p.x,p.y,true);else{m.fillStyle='#7e8f78';m.beginPath();m.arc(p.x,p.y,3,0,Math.PI*2);m.fill();}m.font='11px Arial';m.textAlign='center';m.fillStyle='#3d564d';m.strokeStyle='#f3f4e3';m.lineWidth=3;const labelY=p.y+(b.type==='player-home'?-18:22);m.strokeText(names[b.type],p.x,labelY);m.fillText(names[b.type],p.x,labelY);}
      const p=mapPoint(last.x,last.z,width);playerPin(m,p.x,p.y,last.angle,true);m.textAlign='left';m.font='bold 12px Arial';m.fillStyle='#53684e';m.fillText('N',12,20);
    }
  }
  button.addEventListener('click',()=>{onOpen();dialog.showModal();draw();});close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>onClose());addEventListener('resize',()=>{timer=1;});
  return {update(dt,position,angle){last={x:position.x,z:position.z,angle};timer+=dt;if(timer>.1){timer=0;draw();}},draw,get state(){return {...last,open:dialog.open};}};
}

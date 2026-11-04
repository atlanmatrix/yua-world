import * as THREE from 'three';
import {terrainHeight,walkingHeight} from './elevation.js';
import {isWater,BRIDGES,riverX} from './layout.js';

export function createTerrain(scene,kit){
  const meshes=[],step=1.5,size=30;
  const normal=(x,z)=>new THREE.Vector3(terrainHeight(x-.15,z)-terrainHeight(x+.15,z),.3,terrainHeight(x,z-.15)-terrainHeight(x,z+.15)).normalize();
  for(let cx=-180;cx<180;cx+=size)for(let cz=-180;cz<180;cz+=size){
    const buckets=new Map();
    for(let x=cx;x<cx+size;x+=step)for(let z=cz;z<cz+size;z+=step){
      const mid=terrainHeight(x+step/2,z+step/2),color=mid<.05?'#b1a887':mid<2?'#b9ab88':'#b4c58a';
      if(!buckets.has(color))buckets.set(color,{p:[],n:[]});const out=buckets.get(color);
      for(const [dx,dz] of [[0,0],[0,step],[step,0],[step,0],[0,step],[step,step]]){out.p.push(x+dx,terrainHeight(x+dx,z+dz),z+dz);out.n.push(...normal(x+dx,z+dz).toArray());}
    }
    for(const [color,data] of buckets){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(data.n,3));g.computeBoundingSphere();const m=kit.mesh(g,color,0,0,0,scene);meshes.push(m);}
  }
  // A deep substrate keeps the cut riverbanks visibly solid at the map edge.
  kit.box(360,1,360,'#9a9277',0,-1.4,0,scene);
  return meshes;
}

export function createRoads(scene,kit,paths){
  const cell=.5,tiles=new Map(),priority={dirt:0,stone:1,promenade:2};
  // Rasterize a single union of all lanes. Each surface cell has one owner,
  // so intersecting curves can never create coplanar road polygons.
  for(const path of paths){const length=path.curve.getLength(),count=Math.ceil(length/.35);
    for(let i=0;i<=count;i++){const p=path.curve.getPointAt(i/count),r=path.width/2;
      const minX=Math.floor((p.x-r)/cell),maxX=Math.ceil((p.x+r)/cell),minZ=Math.floor((p.z-r)/cell),maxZ=Math.ceil((p.z+r)/cell);
      for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){
        const x=(ix+.5)*cell,z=(iz+.5)*cell;if(Math.hypot(x-p.x,z-p.z)>r)continue;
        if(Math.abs(x)>179.5||Math.abs(z)>179.5||isWater(x,z)||BRIDGES.some(b=>Math.abs(z-b)<2.5&&Math.abs(x-riverX(b))<7.5))continue;
        const key=`${ix},${iz}`,current=tiles.get(key);
        if(!current||priority[path.type]>priority[current.type])tiles.set(key,{ix,iz,type:path.type});
      }
    }
  }
  const chunks=new Map();
  for(const tile of tiles.values()){
    const {ix,iz,type}=tile,x=ix*cell,z=iz*cell;
    // Stone pieces and seams are one mesh, with deterministic cell colors.
    const hash=Math.abs((ix*73856093)^(iz*19349663));
    const color=type==='dirt'?'#c5ac80':type==='promenade'?'#e4d7b7':hash%7===0?'#c1b49b':['#ded5bb','#d4c9af','#e5dbc1'][hash%3];
    const key=`${Math.floor(x/30)},${Math.floor(z/30)},${color}`;if(!chunks.has(key))chunks.set(key,{color,p:[]});
    const data=chunks.get(key),y=.045;
    for(const [dx,dz] of [[0,0],[0,cell],[cell,0],[cell,0],[0,cell],[cell,cell]])data.p.push(x+dx,walkingHeight(x+dx,z+dz)+y,z+dz);
  }
  const meshes=[];
  for(const {color,p} of chunks.values()){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();g.computeBoundingSphere();
    const material=kit.mat(color);material.polygonOffset=true;material.polygonOffsetFactor=-1;material.polygonOffsetUnits=-1;
    const m=kit.mesh(g,material,0,0,0,scene);m.castShadow=false;meshes.push(m);
  }
  return {meshes,tiles};
}

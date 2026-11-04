import * as THREE from 'three';

export function createKit(materials) {
  const geometries = new Map();
  function mat(color) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true }));
    return materials.get(color);
  }
  function geometry(key, build) {
    if (!geometries.has(key)) geometries.set(key, build());
    return geometries.get(key);
  }
  function mesh(shape, color, x=0, y=0, z=0, parent) {
    const object = new THREE.Mesh(shape, typeof color === 'string' ? mat(color) : color);
    object.position.set(x,y,z);object.castShadow=object.receiveShadow=true;parent.add(object);return object;
  }
  const box=(w,h,d,c,x,y,z,p)=>mesh(geometry(`b${w},${h},${d}`,()=>new THREE.BoxGeometry(w,h,d)),c,x,y,z,p);
  const ball=(r,c,x,y,z,p)=>mesh(geometry(`s${r}`,()=>new THREE.IcosahedronGeometry(r,1)),c,x,y,z,p);
  const cylinder=(a,b,h,c,x,y,z,p,n=10)=>mesh(geometry(`c${a},${b},${h},${n}`,()=>new THREE.CylinderGeometry(a,b,h,n)),c,x,y,z,p);
  function beam(a,b,r,color,parent) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const object=cylinder(r,r,delta.length(),color,...start.clone().add(end).multiplyScalar(.5).toArray(),parent,6);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;
  }
  function group(x,y,z,parent,angle=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);return g;}
  return {mat,mesh,box,ball,cylinder,beam,group};
}

// Merge by spatial cell and material, keeping buildings, plants and paths cheap
// to render while still allowing camera and shadow-frustum culling.
export function batchScenery(source, scene, cellSize=48) {
  source.updateMatrixWorld(true);
  const buckets=new Map();const center=new THREE.Vector3();
  source.traverse(object=>{
    if(!object.isMesh)return;
    object.getWorldPosition(center);
    const key=`${Math.floor(center.x/cellSize)},${Math.floor(center.z/cellSize)},${object.material.uuid}`;
    if(!buckets.has(key))buckets.set(key,{material:object.material,parts:[]});
    const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);buckets.get(key).parts.push(geometry);
  });
  const chunks=[];
  for(const {material,parts} of buckets.values()) {
    const count=parts.reduce((n,g)=>n+g.attributes.position.array.length,0);
    const positions=new Float32Array(count),normals=new Float32Array(count);let offset=0;
    for(const part of parts){positions.set(part.attributes.position.array,offset);normals.set(part.attributes.normal.array,offset);offset+=part.attributes.position.array.length;part.dispose();}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));geometry.computeBoundingSphere();
    const object=new THREE.Mesh(geometry,material);object.castShadow=object.receiveShadow=true;scene.add(object);chunks.push(object);
  }
  scene.remove(source);return chunks;
}

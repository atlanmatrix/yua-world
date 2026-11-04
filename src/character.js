import * as THREE from 'three';

export function createCharacter() {
  const root=new THREE.Group();root.name='lavender-traveler';
  const body=new THREE.Group();root.add(body);
  const colors={skin:'#f8dfcf',hair:'#aea0c6',light:'#c2b4d8',shade:'#9180aa',ink:'#302e42',blue:'#3f5578',gold:'#d9b76b',white:'#fff8dc'};
  const cache=new Map();
  function material(c){if(!cache.has(c))cache.set(c,new THREE.MeshToonMaterial({color:c}));return cache.get(c);}
  function mesh(g,c,p,x=0,y=0,z=0){const m=new THREE.Mesh(g,material(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
  const ell=(x,y,z,rx,ry,rz,c,p=body)=>{const m=mesh(new THREE.SphereGeometry(1,32,24),c,p,x,y,z);m.scale.set(rx,ry,rz);return m;};
  const cyl=(r1,r2,h,c,p,x,y,z,n=16)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
  function tube(points,r,c,p=body){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,8,false),c,p);}
  function lock(points,w,d,c,p=body){
    const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const vertices=[],indices=[],steps=28,sides=14;
    for(let i=0;i<=steps;i++){const t=i/steps,point=curve.getPoint(t),profile=(.5+Math.sin(Math.PI*t)*.5)*(1-t*.97);
      for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;vertices.push(point.x+Math.cos(a)*w*profile,point.y,point.z+Math.sin(a)*d*profile);}}
    for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,c,p);
  }
  // A lavender-haired chibi interpretation of the supplied portrait.
  ell(0,2.54,-.12,.73,.73,.61,colors.hair);
  ell(0,2.51,.2,.57,.59,.46,colors.skin);
  // Painted iris detail keeps the amber eyes legible in close-up.
  const irisCanvas=document.createElement('canvas');irisCanvas.width=irisCanvas.height=192;
  const paint=irisCanvas.getContext('2d');const gradient=paint.createRadialGradient(96,90,10,96,96,92);
  gradient.addColorStop(0,'#e8bd58');gradient.addColorStop(.55,'#d4a445');gradient.addColorStop(.85,'#9a783d');gradient.addColorStop(1,'#5d4d38');paint.fillStyle=gradient;paint.fillRect(0,0,192,192);
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2;paint.strokeStyle=i%3?'#f2d07d80':'#80653b80';paint.lineWidth=1.5;paint.beginPath();paint.moveTo(96+Math.cos(a)*40,96+Math.sin(a)*40);paint.lineTo(96+Math.cos(a)*87,96+Math.sin(a)*87);paint.stroke();}
  paint.fillStyle='#554431';paint.beginPath();paint.ellipse(96,85,22,47,0,0,Math.PI*2);paint.fill();
  paint.fillStyle='#fff9df';paint.beginPath();paint.ellipse(68,48,15,21,-.3,0,Math.PI*2);paint.fill();paint.beginPath();paint.ellipse(131,137,8,8,0,0,Math.PI*2);paint.fill();
  const irisTexture=new THREE.CanvasTexture(irisCanvas);irisTexture.colorSpace=THREE.SRGBColorSpace;
  const irisMaterial=new THREE.MeshBasicMaterial({map:irisTexture});
  const eyes=[];
  // Oversized amber eyes, lashes, cheeks and a tiny mouth, facing +Z.
  for(const side of [-1,1]){
    const x=side*.245,eye=new THREE.Group();eye.position.set(x,2.55,0);body.add(eye);eyes.push(eye);
    ell(0,0,.614,.185,.21,.036,'#fffdf6',eye);
    ell(0,-.02,.649,.122,.164,.022,'#d6ae48',eye);
    const iris=new THREE.Mesh(new THREE.CircleGeometry(.124,48),irisMaterial);iris.position.set(0,-.02,.675);iris.scale.y=1.29;eye.add(iris);
    tube([[-.18,.13,.64],[0,.2,.65],[.17,.14,.64]],.023,colors.ink,eye);
    for(let i=0;i<3;i++)tube([[side*(.12+i*.02),.15-i*.015,.642],[side*(.2+i*.025),.22-i*.02,.64]],.012,colors.ink,eye);
    tube([[-.14,-.15,.637],[0,-.205,.64],[.13,-.14,.637]],.009,'#b28d7d',eye);
    tube([[-.16,.28,.51],[0,.31,.54],[.14,.27,.53]],.012,colors.shade,eye);
    ell(side*.39,2.29,.50,.105,.038,.012,'#efb9b5');
  }
  tube([[-.04,2.16,.585],[0,2.15,.589],[.045,2.17,.583]],.012,'#a16f73');
  ell(0,2.29,.659,.034,.026,.024,colors.skin);
  // Layered fringe sweeps over one eye, with long side locks and an ahoge.
  lock([[-.52,3.03,.22],[-.55,2.73,.56],[-.53,2.3,.52],[-.43,2.04,.34]],.23,.12,colors.light);
  lock([[-.34,3.13,.28],[-.28,2.91,.59],[-.2,2.72,.68],[-.13,2.57,.67]],.23,.105,colors.hair);
  lock([[-.06,3.17,.22],[.22,2.93,.64],[.32,2.64,.76],[.2,2.34,.67]],.36,.13,colors.light);
  lock([[.25,3.14,.11],[.55,2.91,.45],[.59,2.49,.53],[.42,2.15,.43]],.28,.14,colors.hair);
  lock([[.59,2.92,.1],[.7,2.5,.23],[.66,2.08,.27],[.45,1.94,.18]],.23,.17,colors.shade);
  tube([[-.12,3.18,-.05],[-.27,3.51,.02],[-.52,3.51,.05],[-.55,3.34,.09]],.038,colors.light);
  for(let i=0;i<11;i++){
    const angle=(i/10-.5)*Math.PI*1.1,x=Math.sin(angle)*.62,z=-.12-Math.cos(angle)*.48;
    lock([[x*.8,3.08,z*.65],[x,2.7,z],[x*1.07,2.27,z*.97],[x*.94,2.06,z*.85]],.13,.055,i%3?colors.hair:colors.light);
  }
  for(const side of [-1,1]){
    ell(side*.55,2.4,.12,.11,.15,.07,colors.skin);
    const earring=mesh(new THREE.TorusGeometry(.07,.014,6,18),colors.gold,body,side*.57,2.23,.14);
    ell(side*.57,2.09,.15,.045,.075,.03,'#d1bd88');
  }
  const tails=[];
  for(const side of [-1,1]){
    const tail=new THREE.Group();tail.position.set(side*.62,2.35,-.22);body.add(tail);tails.push({tail,side});
    ell(0,0,0,.21,.17,.2,colors.ink,tail);
    const tie=mesh(new THREE.TorusGeometry(.18,.025,6,20),colors.gold,tail);tie.rotation.x=.7;
    for(let i=0;i<7;i++)lock([[0,-.04,0],[side*(.2+i*.04),-.25,-.04],[side*(.2+i*.09),-.55-i*.035,.04],[side*(.34+i*.08),-.7-i*.06,.09]],.2,.17,i%2?colors.shade:colors.hair,tail);
    // Dark diamond pins and gold-trimmed tassels.
    const pin=mesh(new THREE.OctahedronGeometry(.18),colors.ink,body,side*.54,3.01,.43);pin.scale.set(.75,1.5,.45);pin.rotation.z=side*.25;
    tube([[side*.55,2.9,.47],[side*.58,2.68,.5],[side*.62,2.55,.48]],.023,colors.gold);
    const tassel=cyl(.035,.075,.28,colors.ink,body,side*.62,2.55,.48,5);tassel.rotation.z=side*.08;
    cyl(.077,.077,.027,colors.gold,body,side*.63,2.4,.48,8);
  }
  for(const [x,y] of [[-.22,3.07],[.05,3.14],[.27,3.06]])for(let i=0;i<4;i++)ell(x+Math.cos(i*Math.PI/2)*.044,y+Math.sin(i*Math.PI/2)*.044,.51,.04,.04,.016,colors.white);
  // High collar, sleeveless navy tunic, gold diagonal sash and pleated skirt.
  cyl(.23,.24,.24,colors.ink,body,0,1.95,0);
  cyl(.28,.34,.62,colors.ink,body,0,1.59,0);
  const chest=ell(0,1.62,.17,.26,.31,.12,colors.blue);
  const sash=mesh(new THREE.BoxGeometry(.12,.65,.05),colors.gold,body,.02,1.57,.302);sash.rotation.z=-.55;
  const skirt=mesh(new THREE.CylinderGeometry(.28,.52,.53,12),colors.blue,body,0,1.02,0);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    tube([[Math.sin(a)*.28,1.28,Math.cos(a)*.28],[Math.sin(a)*.49,.78,Math.cos(a)*.49]],.012,i%3===0?colors.gold:colors.ink);
  }
  for(const side of [-1,1]){
    lock([[side*.22,1.55,-.2],[side*.38,1.12,-.28],[side*.5,.69,-.31]],.2,.05,colors.ink);
    tube([[side*.24,1.49,-.26],[side*.38,1.06,-.33],[side*.49,.72,-.34]],.018,colors.gold);
  }
  cyl(.35,.35,.065,colors.gold,body,0,1.28,0);
  ell(.02,1.69,.33,.06,.09,.025,colors.gold);
  ell(.02,1.7,.357,.029,.045,.012,'#c4b0ce');
  for(let i=0;i<4;i++)ell(-.10,1.66-i*.105,.306,.022,.025,.013,colors.gold);
  for(const side of [-1,1]){
    tube([[side*.25,1.81,.17],[side*.31,1.58,.19],[side*.28,1.32,.23]],.009,colors.gold);
    for(let i=0;i<3;i++){
      const a=side*(.09+i*.07);tube([[a,1.18,.34],[a+side*.045,1.04,.4],[a,.88,.46]],.006,'#8196b0');
    }
  }
  const limbs=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.18,.89,0);body.add(leg);
    cyl(.10,.09,.5,colors.ink,leg,0,-.24,0);
    ell(0,-.67,.075,.13,.22,.2,colors.ink,leg);
    cyl(.125,.125,.05,colors.gold,leg,0,-.49,0);
    tube([[-.06,-.58,.22],[.06,-.62,.23],[-.06,-.66,.24],[.055,-.70,.24]],.007,colors.gold,leg);
    ell(0,-.81,.065,.135,.025,.205,'#252b39',leg);
    const arm=new THREE.Group();arm.position.set(side*.35,1.82,0);arm.rotation.z=side*.12;body.add(arm);
    cyl(.1,.085,.32,colors.skin,arm,0,-.17,0);
    cyl(.115,.115,.065,colors.ink,arm,0,-.18,0);
    tube([[-.085,-.2,.04],[.085,-.39,.04]],.012,colors.ink,arm);
    tube([[.085,-.2,.04],[-.085,-.39,.04]],.012,colors.ink,arm);
    cyl(.105,.08,.35,colors.blue,arm,0,-.47,0);
    cyl(.12,.12,.07,colors.ink,arm,0,-.37,0);
    ell(0,-.66,.015,.08,.1,.065,colors.blue,arm);
    for(let finger=0;finger<4;finger++){
      const fx=(finger-1.5)*.033;const length=.07+(finger===1||finger===2?.025:0);
      ell(fx,-.75-length/3,.042,.017,length,.025,colors.blue,arm);
      tube([[fx,-.70,.073],[fx,-.75,.074]],.004,'#8393aa',arm);
    }
    ell(side*.075,-.69,.075,.026,.065,.03,colors.blue,arm);
    for(let i=0;i<3;i++)ell(side*.03,-.41-i*.075,.103,.012,.014,.008,colors.gold,arm);
    ell(side*.08,-.39,.07,.038,.04,.018,colors.gold,arm);
    limbs.push({leg,arm,side});
  }
  // Preserve articulated groups, but combine their rigid details by material.
  // The refined model stays inexpensive to draw on mobile devices.
  function batchPart(part){
    for(const child of [...part.children])if(child.isGroup)batchPart(child);
    const buckets=new Map();
    for(const object of part.children){if(!object.isMesh||object===skirt||object===chest||object.material.map)continue;if(!buckets.has(object.material))buckets.set(object.material,[]);buckets.get(object.material).push(object);}
    for(const [mat,objects] of buckets){if(objects.length<2)continue;const parts=[];let count=0;
      for(const object of objects){object.updateMatrix();const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geometry.applyMatrix4(object.matrix);parts.push(geometry);count+=geometry.attributes.position.array.length;}
      const positions=new Float32Array(count),normals=new Float32Array(count);let offset=0;
      for(const geometry of parts){positions.set(geometry.attributes.position.array,offset);normals.set(geometry.attributes.normal.array,offset);offset+=geometry.attributes.position.array.length;geometry.dispose();}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));geometry.computeBoundingSphere();
      const batch=new THREE.Mesh(geometry,mat);batch.castShadow=batch.receiveShadow=true;for(const object of objects){part.remove(object);object.geometry.dispose();}part.add(batch);
    }
  }
  batchPart(root);
  root.userData.detailFeatures=['painted-iris','blinking-eyes','individual-fingers','layered-hair','gold-stitching'];
  root.userData.referenceFeatures=['lavender-twin-tails','amber-eyes','black-gold-hairpins','navy-gold-outfit'];
  return {root,update(elapsed,walking,sprint){
    const phase=elapsed*(sprint?15:10);
    const blink=elapsed%5.6;const openness=blink<.16?Math.max(.06,Math.abs(blink-.08)/.08):1;
    for(const eye of eyes)eye.scale.y=openness;
    for(const {leg,arm,side} of limbs){leg.rotation.x=walking?Math.sin(phase)*.5*side:0;arm.rotation.x=walking?-Math.sin(phase)*.38*side:Math.sin(elapsed*1.5)*.025;}
    for(const {tail,side} of tails){tail.rotation.z=Math.sin(elapsed*3+side)*.045+(walking?Math.sin(phase)*.07:0);tail.rotation.x=walking?Math.sin(phase)*.06:0;}
    body.position.y=walking?Math.abs(Math.sin(phase))*.045:Math.sin(elapsed*2)*.012;
    skirt.rotation.z=walking?Math.sin(phase)*.025:0;chest.rotation.z=body.rotation.z;
  }};
}

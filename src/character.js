import * as THREE from 'three';

export function createCharacter() {
  const root=new THREE.Group();root.name='lavender-traveler';
  const body=new THREE.Group();root.add(body);
  const colors={skin:'#f8dfcf',hair:'#aea0c6',light:'#c2b4d8',shade:'#9180aa',ink:'#302e42',blue:'#3f5578',gold:'#d9b76b',white:'#fff8dc'};
  const cache=new Map();
  function material(c){if(!cache.has(c))cache.set(c,new THREE.MeshToonMaterial({color:c}));return cache.get(c);}
  function mesh(g,c,p,x=0,y=0,z=0){const m=new THREE.Mesh(g,material(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
  const ell=(x,y,z,rx,ry,rz,c,p=body)=>{const m=mesh(new THREE.SphereGeometry(1,20,14),c,p,x,y,z);m.scale.set(rx,ry,rz);return m;};
  const cyl=(r1,r2,h,c,p,x,y,z,n=16)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
  function tube(points,r,c,p=body){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),16,r,6,false),c,p);}
  function lock(points,w,d,c,p=body){
    const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const vertices=[],indices=[],steps=16,sides=10;
    for(let i=0;i<=steps;i++){const t=i/steps,point=curve.getPoint(t),profile=(.5+Math.sin(Math.PI*t)*.5)*(1-t*.97);
      for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;vertices.push(point.x+Math.cos(a)*w*profile,point.y,point.z+Math.sin(a)*d*profile);}}
    for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,c,p);
  }
  // A lavender-haired chibi interpretation of the supplied portrait.
  ell(0,2.54,-.12,.73,.73,.61,colors.hair);
  ell(0,2.51,.2,.57,.59,.46,colors.skin);
  // Oversized amber eyes, lashes, cheeks and a tiny mouth, facing +Z.
  for(const side of [-1,1]){
    const x=side*.245;
    ell(x,2.55,.614,.185,.21,.036,'#fffdf6');
    ell(x,2.53,.649,.122,.164,.022,'#d6ae48');
    ell(x,2.57,.666,.065,.105,.012,'#987340');
    ell(x-.035,2.63,.68,.042,.052,.012,'#fffbea');
    ell(x+.04,2.46,.677,.028,.025,.012,'#f7e6a0');
    tube([[x-.18,2.68,.64],[x,2.75,.65],[x+.17,2.69,.64]],.027,colors.ink);
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
  const tails=[];
  for(const side of [-1,1]){
    const tail=new THREE.Group();tail.position.set(side*.62,2.35,-.22);body.add(tail);tails.push({tail,side});
    ell(0,0,0,.21,.17,.2,colors.ink,tail);
    const tie=mesh(new THREE.TorusGeometry(.18,.025,6,20),colors.gold,tail);tie.rotation.x=.7;
    for(let i=0;i<5;i++)lock([[0,-.04,0],[side*(.2+i*.04),-.25,-.04],[side*(.2+i*.09),-.55-i*.035,.04],[side*(.34+i*.08),-.7-i*.06,.09]],.2,.17,i%2?colors.shade:colors.hair,tail);
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
  const limbs=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.18,.89,0);body.add(leg);
    cyl(.10,.09,.5,colors.ink,leg,0,-.24,0);
    ell(0,-.67,.075,.13,.22,.2,colors.ink,leg);
    cyl(.125,.125,.05,colors.gold,leg,0,-.49,0);
    const arm=new THREE.Group();arm.position.set(side*.35,1.82,0);arm.rotation.z=side*.12;body.add(arm);
    cyl(.1,.085,.32,colors.skin,arm,0,-.17,0);
    cyl(.115,.115,.065,colors.ink,arm,0,-.18,0);
    tube([[-.085,-.2,.04],[.085,-.39,.04]],.012,colors.ink,arm);
    tube([[.085,-.2,.04],[-.085,-.39,.04]],.012,colors.ink,arm);
    cyl(.105,.08,.35,colors.blue,arm,0,-.47,0);
    cyl(.12,.12,.07,colors.ink,arm,0,-.37,0);
    ell(0,-.69,.015,.085,.12,.075,colors.blue,arm);
    ell(side*.08,-.39,.07,.038,.04,.018,colors.gold,arm);
    limbs.push({leg,arm,side});
  }
  root.userData.referenceFeatures=['lavender-twin-tails','amber-eyes','black-gold-hairpins','navy-gold-outfit'];
  return {root,update(elapsed,walking,sprint){
    const phase=elapsed*(sprint?15:10);
    for(const {leg,arm,side} of limbs){leg.rotation.x=walking?Math.sin(phase)*.5*side:0;arm.rotation.x=walking?-Math.sin(phase)*.38*side:Math.sin(elapsed*1.5)*.025;}
    for(const {tail,side} of tails){tail.rotation.z=Math.sin(elapsed*3+side)*.045+(walking?Math.sin(phase)*.07:0);tail.rotation.x=walking?Math.sin(phase)*.06:0;}
    body.position.y=walking?Math.abs(Math.sin(phase))*.045:Math.sin(elapsed*2)*.012;
    skirt.rotation.z=walking?Math.sin(phase)*.025:0;chest.rotation.z=body.rotation.z;
  }};
}

export const HOME={x:-63,z:105,halfWidth:20,halfDepth:20,houseMinX:-8,houseMaxX:8,houseMinZ:-13,houseMaxZ:1,floorRise:3.9,stairMinX:4.5,stairMaxX:7.45,stairFrontZ:-.7,stairBackZ:-11.2,pond:{x:-11.5,z:9,rx:4,rz:3}};
export function homeLocal(x,z){return {x:x-HOME.x,z:z-HOME.z};}
export function onHomeSite(x,z,margin=0){const p=homeLocal(x,z);return Math.abs(p.x)<=HOME.halfWidth+margin&&Math.abs(p.z)<=HOME.halfDepth+margin;}
export function inHouse(x,z){const p=homeLocal(x,z);return p.x>HOME.houseMinX&&p.x<HOME.houseMaxX&&p.z>HOME.houseMinZ&&p.z<HOME.houseMaxZ;}
export function stairHeight(x,z,base){const p=homeLocal(x,z);if(p.x<HOME.stairMinX||p.x>HOME.stairMaxX||p.z<HOME.stairBackZ||p.z>HOME.stairFrontZ)return null;return base+.2+(HOME.stairFrontZ-p.z)/(HOME.stairFrontZ-HOME.stairBackZ)*HOME.floorRise;}
export function homeHeight(x,z,previousY,base){
  if(!onHomeSite(x,z))return null;
  const p=homeLocal(x,z),stair=stairHeight(x,z,base);
  if(stair!==null){const step=Math.min(24,Math.max(0,Math.ceil((stair-base-.2)/HOME.floorRise*24-1e-8)));return base+.235+step*HOME.floorRise/24;}
  const upper=previousY>=base+HOME.floorRise-.2;
  if((inHouse(x,z)||(Math.abs(p.x)<8&&p.z>=1&&p.z<3.5))&&upper)return base+HOME.floorRise+.235;
  if(inHouse(x,z))return base+.235;
  if(Math.hypot(p.x-11.5,p.z-7.8)<3.5)return base+.355;
  return base+.12;
}
export function mapPoint(x,z,size,worldSize=360){return {x:(x/worldSize+.5)*size,y:(z/worldSize+.5)*size};}
export function headingAngle(rotationY){return Math.atan2(Math.sin(rotationY),-Math.cos(rotationY));}

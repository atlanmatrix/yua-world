import {BRIDGES,PONDS,riverX} from './layout.js';
export const LAND_LEVEL=3;
export const WATER_LEVEL=0;
export const CHARACTER_SCALE=.62;
const smooth=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
export function uplandHeight(x,z){
  return LAND_LEVEL+4.2*Math.exp(-((x+96)**2+(z+105)**2)/1800)+2.7*Math.exp(-((x-122)**2+(z-112)**2)/1400);
}
export function terrainHeight(x,z){
  const high=uplandHeight(x,z),riverDistance=Math.abs(x-riverX(z));
  let h=riverDistance<4.5?-.85+.8*smooth((riverDistance-3.2)/1.3):.04+(high-.04)*smooth((riverDistance-4.5)/6.5);
  for(const p of PONDS){const d=(Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz)-1)*Math.min(p.rx,p.rz);
    const pond=d<0?-.85+.8*smooth((d+1.3)/1.3):.04+(high-.04)*smooth(d/5);
    h=Math.min(h,pond);
  }
  // Solid earth beneath the bridge approach, with tapered embankment sides.
  for(const b of BRIDGES){const dx=Math.abs(x-riverX(b)),dz=Math.abs(z-b);
    if(dx>=7.25&&dx<13&&dz<3.8){
      const edge=1-smooth((dz-2.4)/1.4),end=1-smooth((dx-11.5)/1.5);
      h=Math.max(h,h+(high+.18-h)*edge*end);
    }
  }
  return h;
}
export function terrainSurfaceHeight(x,z){
  const step=1.5,x0=Math.floor(x/step)*step,z0=Math.floor(z/step)*step,fx=(x-x0)/step,fz=(z-z0)/step;
  const a=terrainHeight(x0,z0),b=terrainHeight(x0+step,z0),c=terrainHeight(x0,z0+step),d=terrainHeight(x0+step,z0+step);
  return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);
}
export function bridgeHeight(x,z){
  for(const b of BRIDGES){const dx=Math.abs(x-riverX(b));if(Math.abs(z-b)<2.5&&dx<12){
    const high=uplandHeight(riverX(b),b),deck=high+.18+.35*(1-Math.min(dx/7.5,1)**2);
    if(dx<=7.5)return deck;
    return deck+(terrainSurfaceHeight(x,z)-deck)*smooth((dx-7.5)/4.5);
  }}
  return null;
}
export function walkingHeight(x,z){return (bridgeHeight(x,z)??terrainSurfaceHeight(x,z))+.035;}

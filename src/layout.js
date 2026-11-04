export const SPAWN = { x: -63, z: 120 };
export const BRIDGES = [8, -83, 103];
export const PONDS = [{x:-68,z:-34,rx:13,rz:10},{x:104,z:70,rx:10,rz:15}];
export const riverX = z => 42 + Math.sin(z*.023)*15 + Math.sin(z*.051)*5;
export function isWater(x,z) {
  if(PONDS.some(p=>((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2<1))return true;
  return Math.abs(x-riverX(z))<4.5;
}
export function isWaterBlocked(x,z) {
  if(BRIDGES.some(b=>Math.abs(z-b)<2.1&&Math.abs(x-riverX(b))<8))return false;
  return isWater(x,z);
}
export const ROAD_ROUTES = [
  {type:'stone',width:3.5,points:[[-54,147],[-58,139],[-64,135],[-63,129],[-63,125]]},
  {type:'stone',width:3.6,points:[[0,0],[10,-12],[3,-25],[-7,-31],[-7,-34]]},
  {type:'stone',width:4.2,points:[[64,11],[76,14],[87,21],[82,25],[82,31]]},
  {type:'stone',width:3.8,points:[[-49,30],[-40,23],[-43,10],[-48,2],[-53,1]]},
  {type:'stone',width:5,points:[[-165,80],[-130,57],[-105,60],[-76,38],[-49,30],[-27,13],[0,0],[20,3],[42,8],[64,11],[91,3],[120,24],[161,15]]},
  {type:'stone',width:4.4,points:[[-99,-161],[-83,-124],[-94,-91],[-64,-63],[-43,-35],[-22,-18],[0,0],[8,30],[-6,58],[9,86],[0,118],[21,160]]},
  {type:'dirt',width:3.2,points:[[-162,-70],[-129,-62],[-111,-32],[-92,-13],[-96,14],[-76,38],[-68,68],[-87,102],[-121,128]]},
  {type:'stone',width:3.8,points:[[-94,-91],[-59,-101],[-33,-88],[riverX(-83),-83],[65,-80],[94,-107],[130,-94],[161,-123]]},
  {type:'dirt',width:3.5,points:[[8,30],[29,52],[24,79],[riverX(103),103],[70,110],[99,99],[125,119],[157,143]]},
  {type:'dirt',width:2.8,points:[[-68,68],[-38,88],[-23,119],[-54,147],[-91,153]]},
  {type:'stone',width:3.3,points:[[64,11],[77,-20],[68,-47],[73,-63],[65,-80]]},
  {type:'dirt',width:3,points:[[91,3],[121,-17],[143,5],[155,41],[132,66],[113,45],[91,3]]},
  {type:'dirt',width:3,points:[[-43,-35],[-25,-58],[2,-51],[20,-66],[riverX(-83),-83]]},
];

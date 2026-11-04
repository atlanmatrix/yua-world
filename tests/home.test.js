import test from 'node:test';
import assert from 'node:assert/strict';
import {HOME,homeHeight,homeLocal,inHouse,onHomeSite,stairHeight,mapPoint,headingAngle} from '../src/home-layout.js';
const base=3.08;
test('home has an accessible garden, two distinct floors and a real stair run',()=>{
 assert.equal(onHomeSite(HOME.x,HOME.z+15),true);assert.equal(inHouse(HOME.x,HOME.z+15),false);
 assert.equal(homeHeight(HOME.x,HOME.z-5,base+.2,base),base+.235);
 assert.equal(homeHeight(HOME.x,HOME.z-5,base+HOME.floorRise,base),base+HOME.floorRise+.235);
 let previous=base+.235;
 for(let i=0;i<=120;i++){const z=HOME.z+HOME.stairFrontZ-i/120*(HOME.stairFrontZ-HOME.stairBackZ);const h=homeHeight(HOME.x+5.95,z,previous,base);assert.ok(h>=previous-1e-8);assert.ok(h-previous<.164);previous=h;}
 assert.ok(Math.abs(previous-(base+HOME.floorRise+.235))<1e-8);
});
test('leaving the home plot delegates elevation to the town',()=>{
 assert.equal(homeHeight(HOME.x+30,HOME.z,base,base),null);assert.equal(stairHeight(HOME.x,HOME.z,base),null);
 assert.deepEqual(homeLocal(HOME.x+4,HOME.z-7),{x:4,z:-7});
});
test('the north-up map maps world edges and rotation to the right locations',()=>{
 assert.deepEqual(mapPoint(-180,-180,600),{x:0,y:0});assert.deepEqual(mapPoint(180,180,600),{x:600,y:600});assert.deepEqual(mapPoint(0,0,600),{x:300,y:300});
 assert.ok(Math.abs(headingAngle(Math.PI))<1e-8);assert.ok(Math.abs(headingAngle(Math.PI/2)-Math.PI/2)<1e-8);
});

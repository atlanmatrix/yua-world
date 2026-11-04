import test from 'node:test';
import assert from 'node:assert/strict';
import {BRIDGES,PONDS,riverX,isWaterBlocked,ROAD_ROUTES,SPAWN} from '../src/layout.js';
import {walkingHeight as groundHeight} from '../src/elevation.js';
import {movePlayer} from '../src/movement.js';
test('all three bridges allow a complete river crossing',()=>{
  for(const z of BRIDGES){const x=riverX(z);const result=movePlayer({x:x-9,z},{x:1,z:0},18,[],.45,isWaterBlocked);assert.ok(Math.abs(result.x-(x+9))<1e-8);assert.ok(groundHeight(x,z)>.4);}
});
test('river and ponds stop walking while the spawn stays on dry ground',()=>{
  const z=35,x=riverX(z);const result=movePlayer({x:x-10,z},{x:1,z:0},20,[],.45,isWaterBlocked);assert.ok(result.x<x-4.4);
  for(const pond of PONDS)assert.equal(isWaterBlocked(pond.x,pond.z),true);
  assert.equal(isWaterBlocked(SPAWN.x,SPAWN.z),false);
});
test('every walking route has multiple bends and all routes remain within the town',()=>{
  for(const {points} of ROAD_ROUTES){assert.ok(points.length>=5);assert.ok(points.every(([x,z])=>Math.abs(x)<180&&Math.abs(z)<180));
    assert.ok(points.slice(1).some(([x,z],i)=>x!==points[i][0]&&z!==points[i][1]));}
});

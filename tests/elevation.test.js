import test from 'node:test';
import assert from 'node:assert/strict';
import {riverX,BRIDGES} from '../src/layout.js';
import {terrainHeight,terrainSurfaceHeight,uplandHeight,walkingHeight,bridgeHeight,LAND_LEVEL,WATER_LEVEL,CHARACTER_SCALE} from '../src/elevation.js';
test('the actual riverbed is carved below the water and the banks rise to land',()=>{
  for(const z of [-130,-35,55,140]){const x=riverX(z);assert.ok(terrainHeight(x,z)<WATER_LEVEL-.5);assert.ok(terrainHeight(x+12,z)>WATER_LEVEL+2.8);assert.ok(terrainHeight(x+7,z)>terrainHeight(x+5,z));}
});
test('bridge height and its two approaches are continuous, with water below',()=>{
  for(const z of BRIDGES){const x=riverX(z);assert.ok(bridgeHeight(x,z)>WATER_LEVEL+3);let previous=walkingHeight(x-13,z);
    for(let step=1;step<=260;step++){const h=walkingHeight(x-13+step*.1,z);assert.ok(Math.abs(h-previous)<.11);previous=h;}
    assert.ok(Math.abs(walkingHeight(x+12.01,z)-terrainSurfaceHeight(x+12.01,z))<.04);
  }
});
test('height sampling agrees exactly with vertices of the rendered terrain',()=>{
  for(let x=-165;x<165;x+=1.5)assert.ok(Math.abs(terrainHeight(x,30)-terrainSurfaceHeight(x,30))<1e-9);
});
test('hills provide genuine elevation and the traveler fits normal-sized doorways',()=>{
  assert.ok(uplandHeight(-96,-105)>LAND_LEVEL+4);
  assert.ok(3.55*CHARACTER_SCALE<2.4);
  assert.ok(2.1*1.32>3.55*CHARACTER_SCALE);
});
test('bridge approaches have solid terrain support rather than floating road sheets',()=>{
  for(const z of BRIDGES){const center=riverX(z);for(const sign of [-1,1]){const x=center+sign*9;
    assert.ok(Math.abs(walkingHeight(x,z)-terrainSurfaceHeight(x,z))<.12);
  }}
});

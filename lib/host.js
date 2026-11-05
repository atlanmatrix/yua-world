import {readFile} from 'node:fs/promises';
export const name='yua-world';
export const inject=['connection'];
export function apply(ctx){
  const document=readFile(new URL('./world.html',import.meta.url),'utf8');
  ctx.effect(()=>ctx.connection.rpc.handle('/yua-world',async(endpoint,payload,signal,peer)=>{
    if(peer.principal.kind!=='owner')return {ok:false,error:{code:'forbidden',message:'Owner access required',details:{}}};
    if(endpoint!=='document')return {ok:false,error:{code:'not-found',message:'Unknown endpoint',details:{}}};
    return {ok:true,value:await document};
  }),'yua-world: authenticated document channel');
}

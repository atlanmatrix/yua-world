import {readFile} from 'node:fs/promises';
export const name='yua-world';
export const inject=['connection'];
export function apply(ctx){
  const document=readFile(new URL('./world.html',import.meta.url),'utf8');
  ctx.effect(()=>ctx.connection.fetch.register({
    path:'/api/yua-world/document',methods:['POST'],requestBody:'buffered',
    async fetch(request){
      const body=await request.json();
      if(body.type!=='client-request'||typeof body.rpcId!=='string'||body.method!=='yua-world/document')return new Response('Invalid request',{status:400});
      return Response.json({type:'server-response',rpcId:body.rpcId,result:{ok:true,value:await document}},{headers:{'cache-control':'no-store'}});
    },
  }),'yua-world: owner-only Connection Fetch route');
}

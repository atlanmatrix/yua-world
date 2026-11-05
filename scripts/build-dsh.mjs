import {build} from 'esbuild';
import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const output=process.env.DSH_OUTPUT||'dist-dsh';
await rm(output,{recursive:true,force:true});await mkdir(`${output}/lib`,{recursive:true});
const app=await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',minify:true,target:'es2022',legalComments:'inline'});
let html=await readFile('index.html','utf8');const css=await readFile('src/style.css','utf8');
html=html.replace(/<link rel="stylesheet"[^>]+>/,()=>`<style>${css}</style>`).replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('<script type="module" src="./src/main.js"></script>',()=>`<script>${app.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
html=html.replace('加载较慢，请检查网络后刷新','加载较慢，请检查 WebGL 支持后刷新');
await writeFile(`${output}/lib/world.html`,html);
await cp('dsh/src/host.js',`${output}/lib/host.js`);
const client=await build({entryPoints:['dsh/src/client.js'],bundle:true,write:false,format:'cjs',external:['react'],target:'es2022'});
await writeFile(`${output}/lib/client.js`,`window.__ModuleLoader__.load({id:"dsh-yua-world",factory(require){const module={exports:{}};const exports=module.exports;\n${client.outputFiles[0].text}\nreturn module.exports;}});\n`);
for(const file of ['package.json','cordis.patch.yml','README.md'])await cp(`dsh/${file}`,`${output}/${file}`);
const digest=createHash('sha256');for(const file of ['package.json','cordis.patch.yml','README.md','lib/host.js','lib/client.js','lib/world.html']){digest.update(file);digest.update(await readFile(`${output}/${file}`));}
await writeFile(`${output}/release.json`,JSON.stringify({artifactSha256:digest.digest('hex'),format:1,package:'dsh-yua-world',source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dsh:'0.2.2-rc.1'},null,2)+'\n');
console.log(`Built self-contained plugin: ${output}`);

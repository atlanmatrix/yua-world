import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const output=resolve(process.env.DSH_OUTPUT||'dist-dsh');
const git=(args,options={})=>execFileSync('git',args,{encoding:'utf8',...options}).trim();
const remote=process.env.DSH_REMOTE||git(['remote','get-url','origin']);
if(process.env.DSH_GITHUB_TOKEN&&remote.startsWith('https://github.com/')){
  const n=Number(process.env.GIT_CONFIG_COUNT||0);process.env[`GIT_CONFIG_KEY_${n}`]='http.https://github.com/.extraheader';process.env[`GIT_CONFIG_VALUE_${n}`]='';process.env[`GIT_CONFIG_KEY_${n+1}`]='http.https://github.com/.extraheader';process.env[`GIT_CONFIG_VALUE_${n+1}`]='AUTHORIZATION: basic '+Buffer.from('x-access-token:'+process.env.DSH_GITHUB_TOKEN).toString('base64');process.env.GIT_CONFIG_COUNT=String(n+2);
}
const temp=await mkdtemp(join(tmpdir(),'yua-publish-'));
try{
 git(['init','--bare',temp]);git(['--git-dir',temp,'config','user.name','Yua release bot']);git(['--git-dir',temp,'config','user.email','release@users.noreply.github.com']);
 const run=args=>git(['--git-dir',temp,...args]);
 const branch=git(['ls-remote','--heads',remote,'refs/heads/dsh']);let parent,previous;
 const release=JSON.parse(await readFile(join(output,'release.json'),'utf8'));
 if(branch){run(['fetch',remote,'refs/heads/dsh']);parent=run(['rev-parse','FETCH_HEAD']);
   try{previous=JSON.parse(run(['show',`${parent}:release.json`]));}catch{throw Error('Refusing unrelated dsh branch: missing release identity');}
   if(previous.package!=='dsh-yua-world'||previous.format!==1)throw Error('Refusing unrelated dsh branch');
 }
 // The index belongs only to the disposable bare repository, never the checkout.
 run(['--work-tree',output,'add','--all']);const tree=run(['write-tree']);
 if(parent&&(previous.artifactSha256===release.artifactSha256||tree===run(['rev-parse',`${parent}^{tree}`]))){console.log('Already published; no commit');process.exitCode=0;}else{
   const commit=run(['commit-tree',tree,...(parent?['-p',parent]:[]),'-m',`Build dsh from main ${release.source}`]);
   run(['push',remote,`${commit}:refs/heads/dsh`]);console.log(`Published ${commit} from ${release.source}`);
 }
}finally{await rm(temp,{recursive:true,force:true});}

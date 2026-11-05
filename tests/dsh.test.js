import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const run=(file,args,options={})=>execFileSync(file,args,{encoding:'utf8',...options}).trim();
test('plugin contract and lifecycle scripts use one consistent identity',async()=>{
 const p=JSON.parse(await readFile('dsh/package.json','utf8'));assert.equal(p.name,'dsh-yua-world');assert.equal(p.dsh.bundle.patch,'./cordis.patch.yml');assert.ok(!p.scripts);assert.ok((await readFile('dsh/cordis.patch.yml','utf8')).includes(`name: ${p.name}`));
});
test('release is fast-forward, idempotent, rejects unrelated branches, and preserves checkout/index',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'yua-release-test-'));const before=run('git',['status','--porcelain=v1']),index=run('git',['diff','--cached','--binary']);
 try{
  const remote=join(temp,'remote.git'),output=join(temp,'package');run('git',['init','--bare',remote]);await mkdir(output);await writeFile(join(output,'package.json'),'{}');await writeFile(join(output,'release.json'),JSON.stringify({format:1,package:'dsh-yua-world',source:'fixture',artifactSha256:'first'}));
  const publish=()=>run(process.execPath,['scripts/publish-dsh.mjs'],{env:{...process.env,DSH_OUTPUT:output,DSH_REMOTE:remote}});
  publish();const first=run('git',['--git-dir',remote,'rev-parse','dsh']);publish();assert.equal(run('git',['--git-dir',remote,'rev-parse','dsh']),first);
  await writeFile(join(output,'release.json'),JSON.stringify({format:1,package:'dsh-yua-world',source:'fixture2',artifactSha256:'second'}));publish();assert.equal(run('git',['--git-dir',remote,'rev-parse','dsh^']),first);
  const alien=join(temp,'alien.git');run('git',['init','--bare',alien]);run('git',['--git-dir',alien,'fetch',remote,'dsh:dsh']);
  // An unowned tree is refused, never replaced.
  const empty=run('git',['--git-dir',alien,'mktree'],{input:''});const commit=run('git',['--git-dir',alien,'-c','user.name=test','-c','user.email=test@example.com','commit-tree',empty,'-m','unrelated']);run('git',['--git-dir',alien,'update-ref','refs/heads/dsh',commit]);
  assert.throws(()=>run(process.execPath,['scripts/publish-dsh.mjs'],{env:{...process.env,DSH_OUTPUT:output,DSH_REMOTE:alien},stdio:'pipe'}));
  assert.equal(run('git',['--git-dir',alien,'rev-parse','dsh']),commit);
  assert.equal(run('git',['status','--porcelain=v1']),before);assert.equal(run('git',['diff','--cached','--binary']),index);
 }finally{await rm(temp,{recursive:true,force:true});}
});

import React from 'react';
export const name='yua-world';
export const inject=['slots','connection'];
export function apply(ctx){
  function World(){
    const [html,setHtml]=React.useState(''),[error,setError]=React.useState('');
    const frame=React.useRef(null),input=React.useRef(null);
    React.useEffect(()=>{
      const controller=new AbortController();
      ctx.connection.rpc.call('/yua-world','document',{},controller.signal).then(result=>{
        if(!controller.signal.aborted){if(result.ok)setHtml(result.value);else setError(result.error.message);}
      }).catch(e=>{if(!controller.signal.aborted)setError(String(e));});
      return ()=>{controller.abort();if(frame.current)frame.current.srcdoc='';};
    },[]);
    function backup(){const blob=new Blob([JSON.stringify({version:1,climate:JSON.parse(localStorage.getItem('yua-climate')||'null')})],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='yua-world-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    async function restore(e){try{const file=e.target.files[0];if(!file)return;const data=JSON.parse(await file.text()),value=data.climate??data;
      if(!['spring','summer','autumn','winter'].includes(value.season)||!['clear','rain','snow'].includes(value.weather))throw Error('无效存档');
      localStorage.setItem('yua-climate',JSON.stringify(value));setHtml(current=>{if(frame.current)frame.current.srcdoc=current;return current;});setError('');
    }catch(e){setError(String(e));}finally{e.target.value='';}}
    return React.createElement('section',{style:{height:'100%',minHeight:0,display:'flex',flexDirection:'column',position:'relative'}},
      React.createElement('div',{style:{display:'flex',gap:8,padding:6,flexShrink:0}},React.createElement('button',{onClick:backup},'导出存档'),React.createElement('button',{onClick:()=>input.current.click()},'导入存档'),React.createElement('input',{ref:input,type:'file',accept:'.json',onChange:restore,style:{display:'none'}}),error&&React.createElement('span',{role:'alert'},error)),
      html?React.createElement('iframe',{ref:frame,title:'风栖小镇',srcDoc:html,sandbox:'allow-scripts allow-same-origin',allow:'fullscreen',style:{border:0,width:'100%',flex:1,minHeight:0}}):React.createElement('p',null,error||'正在加载小镇…'));
  }
  ctx.effect(function*(){
    yield ctx.slots.inject('main',()=>ctx.slots.register({name:'main',key:'yua-world'},World));
    yield ctx.slots.inject('sidebar.panellist',()=>ctx.slots.register({name:'sidebar.panellist',id:'yua-world',order:20,label:()=> '风栖小镇'},({size})=>React.createElement('span',{style:{fontSize:size},'aria-hidden':true},'⌂')));
  });
}

'use strict';
const endpoints=[];
for(const kind of ['dv','ov','ev'])for(const generation of ['g3b','g3c'])for(const cross of [false,true]){
 const host=`${kind}-${generation}${cross?'-aaa':''}-emudhra.we-have-a-problem.com`;
 endpoints.push({name:`EM ${kind.toUpperCase()} TLS CA - ${generation.toUpperCase()}`,path:cross?'AAA 交叉签名':'emSign 签名链',url:`https://${host}/`});
}
const tbody=document.querySelector('#results'),button=document.querySelector('#start');
const cells=endpoints.map(e=>{const tr=document.createElement('tr');const name=document.createElement('td');name.textContent=e.name;const path=document.createElement('td');const a=document.createElement('a');a.href=e.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=e.path;path.append(a);const result=document.createElement('td');result.textContent='未检测';tr.append(name,path,result);tbody.append(tr);return result;});
async function probe(e){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);try{const response=await fetch(e.url+`?check=${Date.now()}`,{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});return {state:'connected',status:response.status};}catch(error){return {state:error.name==='AbortError'?'timeout':'failed'};}finally{clearTimeout(timer);}}
button.addEventListener('click',async()=>{button.disabled=true;let done=0,connected=0;document.querySelector('#summary').textContent='正在检测…';cells.forEach(c=>{c.textContent='等待中';c.className='';});
let next=0;async function worker(){while(next<endpoints.length){const i=next++;cells[i].textContent='连接中…';const result=await probe(endpoints[i]);done++;if(result.state==='connected'){connected++;cells[i].textContent=`连接成功 · HTTP ${result.status} · 需排查`;cells[i].className='risk';}else{cells[i].textContent=result.state==='timeout'?'连接超时 · 原因待确认':'未建立连接 · 原因待确认';cells[i].className='unknown';}document.querySelector('#summary').textContent=`已完成 ${done} / 12 条`;}}
await Promise.all([worker(),worker(),worker()]);document.querySelector('#summary').textContent=connected?`发现 ${connected} 条可连接路径，请排查`:'12 条路径均未建立连接；不能据此确认已吊销';document.querySelector('#context').textContent=`完成时间：${new Date().toLocaleString()}。结果仅适用于本次浏览器与网络环境。`;button.disabled=false;button.textContent='重新检测';});

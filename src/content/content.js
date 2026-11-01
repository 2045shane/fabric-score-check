(function(){
'use strict';
const F=globalThis.FabricScore;
let panel,output,button,busy=false;
function mount(){
 if(panel)return;
 panel=document.createElement('div');panel.id='fabric-score-check';
 const shadow=panel.attachShadow({mode:'closed'});
 const style=document.createElement('style');style.textContent=`:host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647;font:14px/1.65 "PingFang SC","Microsoft YaHei",sans-serif;color:#241c16}*{box-sizing:border-box}.card{width:320px;max-width:calc(100vw - 40px);padding:20px;background:#fbf6ee;border:1px solid #e4d5c2;border-radius:14px;box-shadow:0 10px 28px #301c1626}h2{font-family:serif;font-size:20px;margin:0 0 10px}button{font:inherit;cursor:pointer;border:0;border-radius:10px;padding:9px 16px;background:#9e2f2a;color:#fff}button:disabled{opacity:.6}button:focus-visible{outline:2px solid #241c16;outline-offset:3px}.close{float:right;background:transparent;color:#6a5e52;padding:0 5px}p{margin:9px 0;overflow-wrap:anywhere}.result{max-height:45vh;overflow:auto}.muted{font-size:12px;color:#6a5e52}`;
 const card=document.createElement('section');card.className='card';card.setAttribute('aria-label','面料成分检查');
 const close=document.createElement('button');close.className='close';close.textContent='收起';close.addEventListener('click',()=>{panel.hidden=true});
 const title=document.createElement('h2');title.textContent='面料成分检查';
 output=document.createElement('div');output.className='result';output.setAttribute('aria-live','polite');output.textContent='点击检查，读取当前商品的面料成分。每日免费 3 次。';
 button=document.createElement('button');button.textContent='检查';button.addEventListener('click',check);
 const note=document.createElement('p');note.className='muted';note.textContent='启发式提示 · 非检测报告';
 card.append(close,title,output,button,note);shadow.append(style,card);document.documentElement.append(panel);
}
function line(text){const p=document.createElement('p');p.textContent=text;output.append(p);}
async function check(){
 mount();panel.hidden=false;if(busy)return {ok:false,error:'正在检查，请稍候。'};
 const site=F.getSite(location.href);if(!site){output.textContent='请打开支持站点的商品详情页。';return {ok:false,error:output.textContent};}
 busy=true;button.disabled=true;
 try{
  const response=await chrome.runtime.sendMessage({type:'FSC_CONSUME'});
  output.replaceChildren();if(!response?.ok){line(response?.error||'检查失败，请重试。');return response;}
  const found=F.extractComposition(document,site);
  if(!found){line('未找到面料成分。请展开材质/成分详情，再次点击检查。');line('本次主动检查已计入次数。');}
  else{
   const result=F.analyzeComposition(found.text);
   line('成分原文：'+found.text);
   if(result.fibers.length)line('已识别：'+result.fibers.map(f=>f.name+(f.percent===null?'（比例未知）':` ${f.percent}%`)).join('、'));
   line('合成占比：'+(result.syntheticPercent===null?'无法确定':`${result.syntheticPercent}%`));
   line('评分：'+(result.score===null?'暂不评分':`${result.score} / 100`)+' · '+result.grade);
   for(const tip of result.tips)line(tip);
   line('来源：'+found.source);
  }
  line(response.quota.unlocked?'已离线解锁':`今日剩余 ${response.quota.remaining} 次免费检查`);
  return {ok:true};
 }catch{output.textContent='检查失败，请刷新页面后重试。';return {ok:false,error:output.textContent};}
 finally{busy=false;button.disabled=false;}
}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{if(m?.type!=='FSC_CHECK')return;check().then(reply);return true;});
if(F.getSite(location.href))mount();
// SPA 跳转只同步面板，不执行检查、不计次。
let previous=location.href;setInterval(()=>{if(previous===location.href)return;previous=location.href;if(F.getSite(location.href)){mount();panel.hidden=false;output.textContent='商品已变化，请点击检查。';}else if(panel)panel.hidden=true;},1000);
})();

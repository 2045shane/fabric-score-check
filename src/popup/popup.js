'use strict';
const status=document.getElementById('status'),button=document.getElementById('check');
async function refresh(){try{const r=await chrome.runtime.sendMessage({type:'FSC_STATUS'});if(!r?.ok)throw new Error();document.getElementById('quota').textContent=r.quota.unlocked?'已离线解锁 · 不限次数':`今日免费剩余 ${r.quota.remaining} / 3 次`;}catch{status.textContent='读取次数失败，请重试。';}}
document.getElementById('options').addEventListener('click',()=>chrome.runtime.openOptionsPage());
button.addEventListener('click',async()=>{button.disabled=true;status.textContent='正在检查…';try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const r=await chrome.tabs.sendMessage(tab.id,{type:'FSC_CHECK'});status.textContent=r?.ok?'检查完成，请查看页面右下角。':r?.error||'检查失败。';}catch{status.textContent='请打开支持的商品页；安装或更新插件后请先刷新页面。';}finally{button.disabled=false;await refresh();}});
refresh();

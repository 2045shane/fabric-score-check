'use strict';
const input=document.getElementById('license'),status=document.getElementById('status');
async function save(value){try{const r=await chrome.runtime.sendMessage({type:'FSC_SAVE_LICENSE',license:value});status.textContent=r?.ok?(value?'许可有效，已解锁。':'许可已清除，已恢复免费模式。'):r?.error||'保存失败。';if(r?.ok&&!value)input.value='';}catch{status.textContent='保存失败，请重试。';}}
document.getElementById('form').addEventListener('submit',e=>{e.preventDefault();if(!input.value.trim()){status.textContent='请输入许可。';return;}save(input.value);});
document.getElementById('clear').addEventListener('click',()=>save(''));
chrome.storage.local.get('fscLicense').then(data=>{input.value=data.fscLicense||'';status.textContent=input.value?'已保存许可，可重新验证。':'当前使用每日免费模式。';}).catch(()=>{status.textContent='读取许可失败。';});

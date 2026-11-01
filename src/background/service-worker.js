'use strict';
importScripts('../lib/license.js','../lib/quota.js','../content/selectors.js');
const store=FabricScore.createQuotaStore(chrome.storage.local);
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(!['FSC_STATUS','FSC_CONSUME','FSC_SAVE_LICENSE'].includes(message?.type))return;
 (async()=>{
  if(message.type==='FSC_STATUS')return {ok:true,quota:await store.status()};
  if(message.type==='FSC_SAVE_LICENSE'){
   if(sender.tab || !sender.url?.startsWith(chrome.runtime.getURL('src/options/options.html')))return {ok:false,error:'请在设置页保存许可。'};
   const token=typeof message.license==='string'?message.license.trim():'';
   if(token && !await FabricScore.verifyLicense(token))return {ok:false,error:'许可无效，请检查 FSC1. 前缀与完整内容。'};
   await chrome.storage.local.set({[FabricScore.STORAGE_KEYS.license]:token});return {ok:true,quota:await store.status()};
  }
  if(!sender.tab || !FabricScore.getSite(sender.url||sender.tab.url))return {ok:false,error:'请在支持的商品页检查。'};
  const quota=await store.consume();return {ok:quota.recorded,quota,error:quota.recorded?null:FabricScore.CTA};
 })().then(reply).catch(()=>reply({ok:false,error:'本地存储操作失败，请重试。'}));return true;
});

// DOM 易变、未在真站验收
(function(root){
'use strict';
const SELECTORS={
 amazon:{candidates:['#productFactsDesktopExpander .a-fixed-left-grid','#productFactsDesktopExpander .a-fixed-left-grid-col','#productDetails_techSpec_section_1 tr','#productDetails_detailBullets_sections1 tr','#detailBullets_feature_div li','#fabricType','#feature-bullets li'],fallback:['#productFactsDesktopExpander','#productOverview_feature_div','#detailBullets_feature_div','#productDescription']},
 // TODO: 用真实商品页核验以下占位选择器，包括区域、语言与动态折叠详情。
 shein:{candidates:['.product-intro__description-table-item','[data-testid="product-composition"]','.product-intro__description'],fallback:[]},
 // TODO: 用真实商品页核验以下占位选择器及 SPA 路由变化。
 zara:{candidates:['.product-detail-composition .structured-component-text-block-paragraph','[data-qa="composition"]','.product-detail-extra-detail'],fallback:[]}
};
function getSite(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;const h=u.hostname;if(/^www\.amazon\.(com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|in|com\.br|com\.mx)$/.test(h)&&/\/(?:dp|gp\/product)\/[a-z0-9]{10}(?:\/|$)/i.test(u.pathname))return 'amazon';if(/(^|\.)shein\.com$/.test(h)&&/-p-\d+\.html$/i.test(u.pathname))return 'shein';if(h==='www.zara.com'&&/-p\d+\.html$/i.test(u.pathname))return 'zara';return null;}catch{return null;}}
const label=/fabric\s*type|materials?|composition|成分|材质|面料|composición|zusammensetzung|composizione|素材/i;
function extractComposition(doc,site){
 const spec=SELECTORS[site];if(!spec)return null;
 for(const selector of spec.candidates){for(const node of doc.querySelectorAll(selector)){
  const text=(node.innerText||node.textContent||'').trim().slice(0,2000);
  if(!text)continue;
  if(root.FabricScore.parseComposition(text).fibers.length)return {text,source:selector};
 }}
 // Amazon 文本兜底仅扫描商品详情容器和其相邻行，避免扫描评论、推荐商品。
 for(const selector of spec.fallback){for(const node of doc.querySelectorAll(selector)){
  const lines=(node.innerText||node.textContent||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){if(label.test(lines[i]))return {text:lines.slice(i,i+3).join(' ').slice(0,2000),source:selector+'（文本兜底）'};}
 }}return null;
}
const api={SELECTORS,getSite,extractComposition};Object.assign(root.FabricScore ||= {},api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

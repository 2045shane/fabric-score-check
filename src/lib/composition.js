(function(root) {
'use strict';
const definitions = [
 ['polyester','聚酯纤维','synthetic',['recycled polyester','polyester','聚酯纤维','聚酯','涤纶','涤綸']],
 ['nylon','锦纶','synthetic',['polyamide','nylon','锦纶','錦綸','尼龙','尼龍']],
 ['acrylic','腈纶','synthetic',['acrylic','腈纶','腈綸']],
 ['elastane','氨纶','synthetic',['elastane','spandex','lycra','氨纶','氨綸','莱卡','萊卡']],
 ['polypropylene','丙纶','synthetic',['polypropylene','丙纶','丙綸']],
 ['polyethylene','聚乙烯','synthetic',['polyethylene','聚乙烯']],
 ['polyurethane','聚氨酯','synthetic',['polyurethane','聚氨酯']],
 ['cotton','棉','natural',['organic cotton','cotton','有机棉','纯棉','棉']],
 ['linen','亚麻','natural',['linen','flax','亚麻','亞麻']],
 ['hemp','大麻','natural',['hemp','大麻']],
 ['wool','羊毛','natural',['merino wool','wool','羊毛']],
 ['silk','蚕丝','natural',['silk','桑蚕丝','蚕丝','真丝']],
 ['cashmere','羊绒','natural',['cashmere','羊绒','羊絨']],
 ['viscose','粘胶','regenerated',['viscose','rayon','粘胶纤维','黏胶纤维','粘胶','黏胶','人造丝']],
 ['modal','莫代尔','regenerated',['modal','莫代尔','莫代爾']],
 ['lyocell','莱赛尔','regenerated',['lyocell','tencel','莱赛尔','萊賽爾','天丝']]
];
const aliases = definitions.flatMap(d=>d[3].map(alias=>({alias,d}))).sort((a,b)=>b.alias.length-a.alias.length);
const escape = s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const names = aliases.map(x=>escape(x.alias)).join('|');
const namePattern = '(?:'+names+')(?![a-z])';
const numberPattern = '(\\d+(?:[.,]\\d+)?)\\s*%';
function normalize(value){return String(value || '').normalize('NFKC').toLowerCase();}
function parseComposition(value) {
 const text=normalize(value), fibers=[], spans=[];
 // Match both orders in one left-to-right pass: a trailing percentage belongs
 // to its preceding fiber before it can be mistaken for the next fiber's share.
 const pairs=new RegExp(numberPattern+'\\s*('+namePattern+')|('+namePattern+')\\s*[:：]?\\s*'+numberPattern,'g');
 for(const m of text.matchAll(pairs)){
  const start=m.index,end=start+m[0].length;
  const alias=m[2]||m[3];
  const d=aliases.find(x=>x.alias===alias).d;
  fibers.push({id:d[0],name:d[1],category:d[2],percent:Number((m[1]||m[4]).replace(',','.'))});spans.push([start,end]);
 }
 // Retain named fibers without a percentage rather than inventing their share.
 const re=new RegExp(namePattern,'g');
 for(const m of text.matchAll(re)){
  if(spans.some(s=>m.index<s[1]&&m.index+m[0].length>s[0]))continue;
  const d=aliases.find(x=>x.alias===m[0]).d;
  fibers.push({id:d[0],name:d[1],category:d[2],percent:null});
 }
 const total=fibers.reduce((n,f)=>n+(f.percent||0),0);
 const allPercent=[...text.matchAll(/\d+(?:[.,]\d+)?\s*%/g)].length;
 const warnings=[];
 if(/[-−]\s*\d+(?:[.,]\d+)?\s*%/.test(text))warnings.push('存在负百分比，无法可靠评分。');
 if(!fibers.length)warnings.push('未识别到面料成分，请展开商品材质详情后重试。');
 if(fibers.some(f=>f.percent===null)||!allPercent)warnings.push('缺少百分比，无法确定合成占比。');
 if(allPercent>spans.length)warnings.push('存在未知纤维或无法匹配的百分比。');
 if(Math.abs(total-100)>0.5)warnings.push('已识别百分比合计为 '+total+'%，不等于 100%；不做归一化推断。');
 if(fibers.some(f=>f.percent>100))warnings.push('单项百分比超出范围。');
 return {text:String(value||''),fibers,total,warnings};
}
// Amazon 常把多颜色成分写在一行（如 "Solids: 100% Cotton; Sport Grey: 90% Cotton, 10% Polyester"），
// 整行合计会超过 100%。此时按分号/换行拆段，取第一个能完整解析为 100% 的款式，并提示用户核对颜色。
function pickVariant(value){
 const whole=parseComposition(value);if(whole.total<=100.5||!whole.warnings.length)return {r:whole,variant:null};
 const segments=String(value||'').split(/[;；\n]+/).map(x=>x.trim()).filter(Boolean);if(segments.length<2)return {r:whole,variant:null};
 for(const seg of segments){const r=parseComposition(seg);if(r.fibers.length&&!r.warnings.length){const label=(seg.match(/^([^:：%\d]{1,40})[:：]/)||[])[1]||seg.slice(0,20);return {r:{...r,text:String(value)},variant:label.replace(/^fabric\s*type\s*/i,'').trim()||label};}}
 return {r:whole,variant:null};
}
function analyzeComposition(value){
 const picked=pickVariant(value);const r=picked.r;const complete=!r.warnings.length;
 const syntheticPercent=complete?Math.min(100,r.fibers.filter(f=>f.category==='synthetic').reduce((n,f)=>n+f.percent,0)):null;
 const score=complete?Math.max(0,Math.min(100,Math.round(100-syntheticPercent))):null;
 const grade=score===null?'信息不足':syntheticPercent<=20?'合成占比较低':syntheticPercent<=50?'合成占比中等':'合成占比较高';
 const tips=[...r.warnings];
 if(picked.variant)tips.unshift('不同颜色/款式成分不同，以下按「'+picked.variant+'」计算，请核对你选的颜色。');
 if(complete)tips.push(syntheticPercent>0?'含合成纤维，洗涤时可能释放微塑料纤维；可减少不必要洗涤并使用集纤措施。':'已识别成分未见合成纤维；不代表没有环境影响。');
 if(r.fibers.some(f=>f.category==='regenerated'))tips.push('再生纤维素为单独类别；生产过程也有环境影响。');
 tips.push('评分仅按合成纤维占比启发式计算，非检测报告，不评价安全性或面料品质。');
 return {...r,variant:picked.variant,syntheticPercent,score,grade,tips};
}
const api={parseComposition,analyzeComposition};Object.assign(root.FabricScore ||= {},api);
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

const {test}=require('node:test');
const a=require('node:assert/strict');
const {parseComposition,analyzeComposition}=require('../src/lib/composition');
test('英文前置百分比及大小写',()=>{const r=analyzeComposition('60% COTTON, 40% Polyester');a.equal(r.syntheticPercent,40);a.equal(r.score,60);a.equal(r.total,100)});
test('后置百分比、中文、全角、分隔符',()=>{for(const text of ['棉６０％，聚酯纤维４０％','Cotton 60% / Polyester 40%','60 % cotton; 40 % polyester'])a.equal(analyzeComposition(text).syntheticPercent,40)});
test('同义词及分类',()=>{for(const name of ['nylon','polyamide','acrylic','elastane','spandex','lycra','polypropylene','涤纶','锦纶','腈纶','氨纶','丙纶'])a.equal(analyzeComposition('100% '+name).syntheticPercent,100);for(const name of ['viscose','rayon','modal','lyocell','粘胶','莫代尔','莱赛尔'])a.equal(parseComposition('100% '+name).fibers[0].category,'regenerated')});
test('天然面料评分及等级',()=>{const r=analyzeComposition('100% linen');a.equal(r.score,100);a.equal(r.grade,'合成占比较低');a.equal(analyzeComposition('100% nylon').score,0)});
test('没有百分比不给分',()=>{const r=analyzeComposition('Cotton and Polyester');a.equal(r.score,null);a.equal(r.syntheticPercent,null);a.ok(r.fibers.length===2)});
test('总和异常、未知纤维、局部缺百分比不给确定分',()=>{for(const t of ['60% cotton, 20% polyester','110% cotton','80% cotton, 20% mystery','60% cotton, polyester']){const r=analyzeComposition(t);a.equal(r.score,null);a.ok(r.warnings.length)}});
test('小数与空输入',()=>{a.equal(analyzeComposition('97.5% Cotton, 2.5% Lycra').score,98);a.equal(analyzeComposition('').score,null)});
test('后置比例无需逗号，支持换行 DOM 文本',()=>{for(const text of ['Cotton 60% Polyester 40%','Cotton 60%\nPolyester 40%']){const r=analyzeComposition(text);a.equal(r.syntheticPercent,40);a.equal(r.score,60)}});
test('负百分比不应被静默改成正数',()=>{a.equal(analyzeComposition('-50% cotton, 50% polyester').score,null)});

test('Amazon 多颜色成分取第一个完整款式并提示（真站 B077ZKF9ZN 回归）',()=>{

 const r=analyzeComposition('Fabric type \n  Solids: 100% Cotton; Sport Grey: 90% Cotton, 10% Polyester');
 a.equal(r.score,100);a.equal(r.syntheticPercent,0);a.equal(r.variant,"Solids");a.match(r.tips[0],/Solids/);
});

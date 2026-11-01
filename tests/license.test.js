const {test}=require('node:test');const a=require('node:assert/strict');const {createHash}=require('node:crypto');const l=require('../src/lib/license');
test('正确许可、空白、SHA-256 种子',async()=>{const token='FSC1.'+createHash('sha256').update('fabric-score-check:unlock:v1').digest('hex');a.equal(await l.issueLicense(),token);a.equal(await l.verifyLicense(' '+token+' '),true)});
test('拒绝错误内容及前缀',async()=>{for(const x of ['',null,'FSC1.'+'0'.repeat(64),'GJD1.'+'a'.repeat(64),'FSC1.short'])a.equal(await l.verifyLicense(x),false)});

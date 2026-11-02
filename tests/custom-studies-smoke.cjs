const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),ts=require('typescript');
const p=path.join(__dirname,'../lib/indicators.ts');
const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=new Module(p);mod.filename=p;mod.paths=Module._nodeModulePaths(__dirname);mod._compile(js,p);
const {computeIndicator,validIndicator}=mod.exports;
const c=Array.from({length:300},(_,i)=>{const x=130+.21*i+4*Math.sin(i*.19);return {open:x-1,high:x+2,low:x-2,close:x,volume:100000+i*500,timestamp:Date.UTC(2026,0,1)+i*86400000}});
for(const code of ['MACD_8_21_5','MACD_12_26_9','EMA200','RSI34']){if(!validIndicator(code))throw Error('Rejected '+code);const r=computeIndicator(code,c);const a=[...(r.pane||[]),...(r.main||[])];if(!a.length||a.some(v=>v.length!==c.length)||a.flat().some(v=>v!==null&&!Number.isFinite(v)))throw Error('Broken '+code);}
if(validIndicator('MACD_21_8_5')||validIndicator('MACD_501_502_6'))throw Error('Invalid MACD accepted');
const regular=computeIndicator('MACD',c).pane,custom=computeIndicator('MACD_12_26_9',c).pane;
for(let j=0;j<3;j++)for(let i=0;i<c.length;i++){if(regular[j][i]!==custom[j][i])throw Error('Default MACD mismatch');}
console.log('PASS named MACD parameters, EMA/RSI custom periods, validation');

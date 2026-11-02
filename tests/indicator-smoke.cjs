// Run after npm install: npm run test:indicators
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),ts=require('typescript');
const file=path.join(__dirname,'../lib/indicators.ts');
const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=new Module(file);mod.filename=file;mod.paths=Module._nodeModulePaths(__dirname);mod._compile(js,file);
const {INDICATORS,computeIndicator,ema,sma,rsi}=mod.exports;
const candles=Array.from({length:300},(_,i)=>{const p=100+i*.4+Math.sin(i*.3)*3;return {open:p,high:p+2,low:p-2,close:p+Math.cos(i*.25),volume:1e6+i*10000,timestamp:i*86400000,time:String(i)}});
for(const indicator of INDICATORS){const out=computeIndicator(indicator.code,candles);const series=[...(out.main||[]),...(out.pane||[])];if(!series.length||series.some(a=>a.length!==candles.length)||series.flat().some(v=>v!==null&&!Number.isFinite(v)))throw Error(`Indicator ${indicator.code} failed`)}
const prices=candles.map(c=>c.close);
for(const [name,result] of [['EMA200',ema(prices,200)],['SMA200',sma(prices,200)],['RSI14',rsi(prices,14)]]){if(result.some(x=>x!==null&&!Number.isFinite(x)))throw Error(name+' invalid')} 
console.log(`PASS ${INDICATORS.length} indicators, 300 OHLCV candles, moving averages, RSI`);

const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module'),ts=require('typescript');
function load(name){const file=path.join(__dirname,'../lib',name);const source=fs.readFileSync(file,'utf8');const compiled=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod=new Module(file);mod.filename=file;mod.paths=Module._nodeModulePaths(__dirname);mod._compile(compiled,file);return mod.exports;}
const {visiblePeriod,summarizePeriod}=load('market-stats.ts');const {placeTradeMarkers}=load('trade-placement.ts');
const day=86400000,start=Date.parse('2026-01-01T00:00:00Z');const data=Array.from({length:260},(_,i)=>({timestamp:start+i*day,time:new Date(start+i*day).toISOString(),open:100+i,high:101+i,low:99+i,close:100.5+i,volume:10+i}));
const m=visiblePeriod(data,'1M');assert(m.length>=28&&m.length<=32,'1M should not include 260 warmup candles');
const summary=summarizePeriod(data,'1M');assert.equal(summary.price,359.5);assert(summary.changePercent>0);assert.equal(summary.high,360);assert(summary.volume>0);
const mid=new Date(data[230].timestamp).toISOString();const earlier=new Date(start-20*day).toISOString();const later=new Date(start+400*day).toISOString();
const markers=placeTradeMarkers([{id:'valid',executed_at:mid,price:'330'},{id:'old',executed_at:earlier,price:'190'},{id:'future',executed_at:later,price:'420'}],data,0,data.length);
assert.deepEqual(markers.map(m=>m.id),['valid'],'Historical out-of-window trades must not attach to first or last candle');
assert(markers[0].i===230);console.log('PASS market window, period scoped stats, trade placement');

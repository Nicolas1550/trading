// Offline tests of the public data adapters. Run: npm run test:feeds
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require('typescript');
// Compile TypeScript module dependencies in memory; no external HTTP request is made here.
const Module=require('node:module');
const original=require.extensions['.ts'];
require.extensions['.ts']=(mod,filename)=>{const source=fs.readFileSync(filename,'utf8');const code=ts.transpileModule(source,{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;mod._compile(code,filename)};
const m={exports:require('../lib/market-feed.ts')};
if(original)require.extensions['.ts']=original;else delete require.extensions['.ts'];
const {getQuote,coinbaseCandles,isCryptoPair,safeSymbol}=m.exports;
process.env.TWELVE_DATA_API_KEY='TEST_VALUE_NOT_A_SECRET';
const realFetch=global.fetch;
global.fetch=async u=>{
 const url=String(u);
 if(url.includes('/market/products/BTC-USD/candles'))return {ok:true,json:async()=>({candles:[{start:'1790000000',open:'100',high:'115',low:'95',close:'112',volume:'10'},{start:'1790086400',open:'112',high:'120',low:'108',close:'118',volume:'12'}]})};
 if(url.includes('/market/products/BTC-USD'))return {ok:true,json:async()=>({price:'77777.25',price_percentage_change_24h:'1.23%',volume_24h:'102.5'})};
 if(url.includes('twelvedata.com/quote'))return {ok:true,status:200,json:async()=>({symbol:'AAPL',close:'344.63',percent_change:'-1.23',volume:'1000000',datetime:'2026-10-30'})};
 throw Error('Unexpected URL '+url);
};
(async()=>{try{
 assert.equal(isCryptoPair('BTC/USD'),true);assert.equal(safeSymbol('AAPL'),true);assert.equal(safeSymbol('../../abc'),false);
 const btc=await getQuote('BTC/USD');assert.equal(btc.price,77777.25);assert.equal(btc.changePercent,1.23);assert.equal(btc.source,'coinbase');
 const apple=await getQuote('AAPL');assert.equal(apple.price,344.63);assert.equal(apple.source,'twelvedata');
 const candles=await coinbaseCandles('BTC/USD','1M');assert.equal(candles.candles.length,2);assert.equal(candles.price,118);assert.equal(candles.source,'coinbase');
 console.log('PASS public feeds: Coinbase spot, Coinbase OHLCV, Twelve Data quote, symbol validation');
 }finally{global.fetch=realFetch}})().catch(e=>{console.error(e);process.exitCode=1});

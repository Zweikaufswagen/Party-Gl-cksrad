"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {webcrypto} = require("node:crypto");
const C = require("../core.js");
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../config.js"),"utf8"),sandbox);
const sample = () => JSON.parse(JSON.stringify(sandbox.window.PARTY_CONFIG));
const config = () => C.validateConfig(sample());
class Storage {
  constructor() { this.data = new Map(); this.writes = 0; }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key,value) { this.writes++; this.data.set(key,String(value)); }
  removeItem(key) { this.data.delete(key); }
}

test("default config: 12 tasks, normalized config",()=>{
  const cfg=config(); assert.equal(cfg.tasks.length,12);assert.equal(cfg.partyId,"after-hours-2026-01");
});
test("configuration rejects missing/oversized task arrays",()=>{
  for(const count of [0,1,25]) {const cfg=sample();cfg.tasks=Array.from({length:count},(_,i)=>({...cfg.tasks[0],id:`t-${i}`}));assert.throws(()=>C.validateConfig(cfg),{code:"CONFIG"});}
});
test("duplicate IDs are rejected",()=>{const cfg=sample();cfg.tasks[1].id=cfg.tasks[0].id;assert.throws(()=>C.validateConfig(cfg),{code:"CONFIG"});});
test("dangerous/invalid CSS colors are rejected",()=>{const cfg=sample();cfg.tasks[0].color="url(javascript:1)";assert.throws(()=>C.validateConfig(cfg),{code:"CONFIG"});});
test("invalid settings are rejected",()=>{
  for(const patch of [{partyId:"party?reset"},{spinDurationMs:0},{spinDurationMs:12345},{confetti:"true"},{accentColor:"red"},{name:""}])assert.throws(()=>C.validateConfig({...sample(),...patch}),{code:"CONFIG"});
});
test("one draw is persisted before returning",()=>{
  const storage=new Storage(),cfg=config(),draw=C.claimDraw(storage,cfg,webcrypto);
  assert.equal(draw.created,true);assert.equal(storage.writes,1);assert.deepEqual(C.readRecord(storage,cfg.partyId),draw.record);
});
test("repeat draw / reload returns same result and does not write",()=>{
  const storage=new Storage(),cfg=config(),first=C.claimDraw(storage,cfg,webcrypto);
  for(let i=0;i<30;i++) {const next=C.claimDraw(storage,cfg,webcrypto);assert.equal(next.created,false);assert.deepEqual(next.record,first.record);}
  assert.equal(storage.writes,1);
});
test("draw snapshot survives edited/deleted/reordered task definitions",()=>{
  const storage=new Storage(),cfg=config(),first=C.claimDraw(storage,cfg,webcrypto);
  const changed=config();changed.tasks=changed.tasks.filter(t=>t.id!==first.record.task.id).reverse();
  const next=C.claimDraw(storage,changed,webcrypto);assert.deepEqual(next.record,first.record);
});
test("completion survives a new read",()=>{
  const storage=new Storage(),cfg=config(),draw=C.claimDraw(storage,cfg,webcrypto).record;
  const done={...draw,completedAt:new Date().toISOString()};C.writeRecord(storage,done);
  assert.equal(C.readRecord(storage,cfg.partyId).completedAt,done.completedAt);
});
test("new party ID starts a separate draw without erasing old party",()=>{
  const storage=new Storage(),cfg=config(),first=C.claimDraw(storage,cfg,webcrypto).record;
  const second=C.claimDraw(storage,{...cfg,partyId:"new-party"},webcrypto).record;
  assert.notEqual(second.drawId,first.drawId);assert.deepEqual(C.readRecord(storage,cfg.partyId),first);
});
test("malformed saved data fail closed without replacement",()=>{
  for(const raw of ["broken","", "null", "{}", "[]", '{"version":2}']) {
    const storage=new Storage(),cfg=config();storage.setItem(C.storageKey(cfg.partyId),raw);
    assert.throws(()=>C.claimDraw(storage,cfg,webcrypto),{code:"CORRUPT"});assert.equal(storage.writes,1);
  }
});
test("invalid snapshot metadata and layout fail closed",()=>{
  const cfg=config(),saved=C.createRecord(cfg,webcrypto);
  for(const patch of [{partyId:"wrong"},{drawId:"x"},{drawnAt:"x"},{completedAt:12},{rotation:NaN},{wheel:[]},{task:{}}]) assert.throws(()=>C.validateRecord({...saved,...patch},cfg.partyId),{code:"CORRUPT"});
});
test("blocked storage reads report controlled error",()=>{assert.throws(()=>C.readRecord({getItem(){throw new Error("denied");}},config().partyId),{code:"STORAGE"});});
test("blocked or full storage writes do not return a result",()=>{
  const storage=new Storage();storage.setItem=()=>{throw new Error("QuotaExceededError");};assert.throws(()=>C.claimDraw(storage,config(),webcrypto),{code:"STORAGE"});
});
test("silent write failures are detected by read-back",()=>{
  const storage=new Storage();storage.setItem=()=>{};assert.throws(()=>C.claimDraw(storage,config(),webcrypto),{code:"STORAGE"});
});
test("storage probe removes its own key and preserves other data",()=>{const storage=new Storage();storage.setItem("other","yes");C.probeStorage(storage);assert.deepEqual([...storage.data.entries()],[["other","yes"]]);});
test("random sampler rejects upper incomplete bucket",()=>{
  const samples=[0xffffffff,7];const crypto={getRandomValues(array){array[0]=samples.shift();return array;}};
  assert.equal(C.randomInt(10,crypto),7);assert.equal(samples.length,0);
});
test("random sampler rejects unsupported sources and invalid ranges",()=>{
  assert.throws(()=>C.randomInt(10,null),{code:"RANDOM"});assert.throws(()=>C.randomInt(0,webcrypto),RangeError);
});
test("pointer lands on the selected segment for all supported wheel sizes",()=>{
  for(let count=2;count<=24;count++) {
    const cfg=config();cfg.tasks=Array.from({length:count},(_,i)=>({...cfg.tasks[i%12],id:`task-${i}`}));
    for(let repeat=0;repeat<100;repeat++) {
      const record=C.createRecord(cfg,webcrypto),step=360/count;
      const pointerIndex=Math.floor((((360-record.rotation%360)%360)+step/2)/step)%count;
      assert.equal(record.task.id,record.wheel[pointerIndex].id);
    }
  }
});
test("exported config is executable and equivalent",()=>{
  const cfg=config();cfg.tasks[0].description='Anführungszeichen " und Zeilen\numbruch, äöü und </script> bleiben Text.';
  const target={window:{}};vm.runInNewContext(C.exportConfig(cfg),target);
  assert.deepEqual(JSON.parse(JSON.stringify(target.window.PARTY_CONFIG)),cfg);
});
test("contrast selection uses readable light/dark foreground",()=>{assert.equal(C.contrastingInk("#ffffff"),"#14151a");assert.equal(C.contrastingInk("#000000"),"#ffffff");});
test("concurrent callers through serialized lock get only one record",async()=>{
  const storage=new Storage(),cfg=config();let chain=Promise.resolve();
  const lock=callback=>{const result=chain.then(callback);chain=result.catch(()=>{});return result;};
  const results=await Promise.all(Array.from({length:30},()=>lock(()=>C.claimDraw(storage,cfg,webcrypto))));
  assert.equal(results.filter(r=>r.created).length,1);assert.equal(new Set(results.map(r=>r.record.drawId)).size,1);
});

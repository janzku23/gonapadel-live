// Run with: node --test LiveWeb/tests/courts.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file), 'utf8');
function setup(language) {
  const elements = new Map();
  const element = id => { if(!elements.has(id)) elements.set(id,{innerHTML:'',textContent:'',className:''}); return elements.get(id); };
  const context = vm.createContext({navigator:{language},URLSearchParams,location:{search:'?id=fixture'},
    console,document:{documentElement:{},readyState:'complete',querySelectorAll:()=>[],querySelector:()=>null,getElementById:element}});
  vm.runInContext(read('live-i18n.js'),context);
  vm.runInContext(read('live-presentation.js'),context);
  context.LivePresentation.update = () => {}; // Renderers are real; presentation is separately tested below.
  return {context,element};
}
function renderer(mode,language) {
  const {context,element} = setup(language);
  const html = read(mode+'.html');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function render('));
  if(mode === 'americano') {
    const declarations = script.slice(script.indexOf('  const getVal ='),script.indexOf('  async function loadOnce'));
    const functions = script.slice(script.indexOf('  function render(d)'));
    vm.runInContext(`const t=LiveI18n.t; ${['title','meta','state','rows','updated','err','courts'].map(id=>`const $${id === 'updated' ? 'upd' : id}=document.getElementById('${id}');`).join('')}\n${declarations}\n${functions}`,context);
    return data => { context.fixture=data; vm.runInContext('render(fixture)',context);return element('courts').innerHTML; };
  }
  const functions = script.slice(script.indexOf('    function render(root, t)'),script.indexOf('    (async function main()'));
  vm.runInContext('const text=LiveI18n.t;\n'+functions,context);
  return data => { context.fixture=data; vm.runInContext("render(document.getElementById('root'),fixture)",context);return element('root').innerHTML; };
}
const match = (court,name,scoreA=16,scoreB=14) => ({round:1,court,courtName:name,teamA:['A & B'],teamB:['C <D>'],scoreA,scoreB});
function data(matches,lower=true) { return {name:'QA <script>never()</script>',[lower?'pointsperround':'pointsPerRound']:10,
  [lower?'currentround':'currentRound']:1,[lower?'totalrounds':'totalRounds']:7,[lower?'isfinished':'isFinished']:false,
  players:[{name:'<img src=x onerror=alert(1)>',totalPoints:2,pm50:'+2'}],matches}; }
for(const mode of ['americano','mexicano']) for(const language of ['fi-FI','en-GB','sv-SE']) {
  test(`${mode} ${language}: custom, numeric, old and unsafe court names render safely`,()=>{
    const render=renderer(mode,language);
    for(const lower of [true,false]) {
      const output=render(data([match(1,'Central'),match(2,'Joma & Sevas'),match(3,''),match(4,undefined),match(5,'<img onerror=alert(1)>')],lower));
      assert.match(output,/Central/);assert.match(output,/Joma &amp; Sevas/);
      assert.ok(output.includes((language.startsWith('fi')?'Kenttä':'Court')+' 3'));
      assert.ok(output.includes((language.startsWith('fi')?'Kenttä':'Court')+' 4'));
      assert.match(output,/&lt;img onerror=alert\(1\)&gt;/);
      assert.ok(!output.includes('<img onerror='));assert.ok(!output.includes('<script>never'));
      assert.match(output,mode==='americano'?/16–14/:/16 – 14/);
      assert.ok(!output.includes('16 – -6'));
    }
    const updated=render(data([match(1,'Keskusta',10,4)]));
    assert.match(updated,/Keskusta/);assert.ok(!updated.includes('Central'));
  });
}
test('legacy scoreB fallback remains compatible in Mexicano',()=>{
  const render=renderer('mexicano','fi');
  const legacy = match(1,undefined,6); delete legacy.scoreB;
  assert.match(render(data([legacy])),/6 – 4/);
});
test('shared helper preserves custom numbering and handles zero-based legacy courtIndex',()=>{
  const {context}=setup('fi');const p=context.LivePresentation;
  assert.equal(p.courtLabel({court:1,courtName:'  1  '}),'1');
  assert.equal(p.courtLabel({court:4,courtName:' \n '}),'Kenttä 4');
  assert.equal(p.courtLabel({courtIndex:0}),'Kenttä 1');
  assert.equal(p.courtLabel({court:2,courtName:7}),'Kenttä 2');
});
test('final standings retain signed ranking points, raw scores, and escaped names',()=>{
  const {context}=setup('fi');const p=context.LivePresentation;
  const summary=p.summarize({...data([match(1,'Central')]),isfinished:true},'mexicano');
  assert.equal(summary.points,30);assert.equal(summary.games,1);assert.equal(summary.rounds,1);
  assert.equal(summary.ranked[0].points,2);
  const html=p.finalMarkup(summary);assert.ok(!html.includes('<img src=x onerror='));assert.match(html,/&lt;img/);
});

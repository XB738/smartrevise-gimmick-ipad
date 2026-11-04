(() => {
  const ID='sr-gimmick-panel';
  if(window.__srGimmickActive){document.getElementById(ID)?.remove();window.__srGimmickActive=false;return;}
  window.__srGimmickActive=true;
  const KEY='sr-gimmick-answer-bank-v1';
  const state={on:true,unknown:true,next:false,busy:false,current:'',lastQ:'',lastA:'',
    bank:(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}})()};
  const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase().replace(/[’‘]/g,"'");
  const text=e=>(e?.innerText||e?.textContent||'').replace(/\s+/g,' ').trim();
  const visible=e=>{if(!e||!e.isConnected)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>20&&r.height>15&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0;};
  const css=document.createElement('style');
  css.textContent=`#${ID}{position:fixed;z-index:2147483647;top:10px;right:8px;width:245px;max-width:calc(100vw - 16px);background:#17152c;color:white;border:1px solid #55517b;border-radius:14px;box-shadow:0 8px 28px #0006;font:14px -apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden}#${ID} *{box-sizing:border-box}#${ID} .head{padding:10px 12px;background:#29264b;display:flex;justify-content:space-between;align-items:center;font-weight:700}#${ID} button{border:0;border-radius:8px;padding:9px;background:#45416c;color:white;font:inherit}#${ID} .body{padding:12px;display:grid;gap:10px}#${ID} label{display:flex;justify-content:space-between;align-items:center;gap:8px}#${ID} input{width:20px;height:20px;accent-color:#7182ff}#${ID} .status{background:#302d50;padding:9px;border-radius:8px;font-size:12px;color:#d8dcff}#${ID} .question{font-size:12px;color:#ddd;max-height:55px;overflow:auto}#${ID} .primary{background:#6578ff;font-weight:700}#${ID} .foot{font-size:10px;color:#aaa;text-align:center}#${ID}.min{width:190px}#${ID}.min .body{display:none}`;
  document.documentElement.appendChild(css);
  const panel=document.createElement('section');panel.id=ID;
  panel.innerHTML=`<div class="head"><span>⚡ Smart Revise Bot</span><button id="sr-min">−</button></div><div class="body"><label><b>Auto answer</b><input id="sr-on" type="checkbox" checked></label><label>Try unknown questions<input id="sr-unknown" type="checkbox" checked></label><label>Auto next question<input id="sr-next" type="checkbox"></label><div class="status" id="sr-status">Scanning page…</div><div class="question" id="sr-question">No question detected yet.</div><button class="primary" id="sr-save">Mark last answer correct</button><button id="sr-clear">Clear answer bank (<span id="sr-count">0</span>)</button><div class="foot">Answers stay in this Safari browser.</div></div>`;
  document.documentElement.appendChild(panel);
  const $=id=>panel.querySelector('#'+id),status=s=>$('sr-status').textContent=s;
  const persist=()=>{localStorage.setItem(KEY,JSON.stringify(state.bank));$('sr-count').textContent=Object.keys(state.bank).length;};persist();
  $('sr-on').onchange=e=>{state.on=e.target.checked;status(state.on?'Bot enabled.':'Bot paused.');if(state.on)scan();};
  $('sr-unknown').onchange=e=>state.unknown=e.target.checked;
  $('sr-next').onchange=e=>state.next=e.target.checked;
  $('sr-min').onclick=()=>{panel.classList.toggle('min');$('sr-min').textContent=panel.classList.contains('min')?'+':'−';};
  $('sr-clear').onclick=()=>{if(confirm('Clear all learned answers?')){state.bank={};persist();status('Answer bank cleared.');}};
  $('sr-save').onclick=()=>{if(!state.lastQ||!state.lastA){status('No recent answer to save.');return;}state.bank[state.lastQ]=state.lastA;persist();status('Saved for next time.');};
  function getQuestion(){const a=[...document.querySelectorAll('p,h1,h2,h3,label,div')].filter(e=>visible(e)&&!panel.contains(e)).map(el=>({el,t:text(el)})).filter(x=>x.t.length>35&&x.t.length<500&&x.t.includes('?'));a.sort((x,y)=>x.t.length-y.t.length);return a[0]||null;}
  function getOptions(el){const r=el.getBoundingClientRect();return [...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"]')].filter(visible).filter(b=>!panel.contains(b)).map(el=>({el,t:text(el)||el.value||'',r:el.getBoundingClientRect()})).filter(x=>x.t.length>1&&x.t.length<220&&x.r.top>=r.bottom-4&&x.r.top<r.bottom+850&&x.r.left<r.right+100&&x.r.right>r.left-100&&!/next question|previous|submit|check answer|i don't know|hint|back|home/i.test(x.t));}
  function getNext(){return [...document.querySelectorAll('button,[role="button"],a')].filter(visible).find(e=>/next question/i.test(text(e)));}
  function scan(){
    if(!state.on||state.busy||!document.getElementById(ID))return;
    const q=getQuestion();if(!q){status('Could not identify question text.');return;}
    const question=q.t.replace(/\s+/g,' ').trim(),key=norm(question),opts=getOptions(q.el);
    if(opts.length<2){status('Question found, but answer choices were not recognised.');return;}
    $('sr-question').textContent=question;if(key===state.current)return;state.current=key;
    let choice=null;
    if(state.bank[key]){choice=opts.find(o=>norm(o.t)===norm(state.bank[key]));if(!choice){status('Saved answer is not among these choices; stopped safely.');return;}status('Known answer found; selecting…');}
    else if(state.unknown){choice=opts[Math.floor(Math.random()*opts.length)];status('Trying an unknown question. Confirm before saving.');}
    else{status('No saved answer. Unknown-question mode is off.');return;}
    state.lastQ=key;state.lastA=choice.t;state.busy=true;choice.el.click();
    setTimeout(()=>{state.busy=false;if(state.next){const n=getNext();if(n&&!n.disabled){n.click();status('Selected answer; moving to next question.');}else status('Selected answer. Next button unavailable.');}else status('Answer selected. If confirmed correct, tap Mark last answer correct.');},850);
  }
  let timer;const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scan,400);});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});setTimeout(scan,600);
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
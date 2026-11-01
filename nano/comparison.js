(function () {
  'use strict';
  const data = window.VERL_COMPARISON;
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n || 0).toLocaleString('en-US');
  const statusNames = {retained:'保留',partial:'部分保留',deleted:'删除'};
  const statusNotes = {retained:'主要职责继续提供',partial:'留下主线，收窄范围',deleted:'nano 已不再提供'};
  const domainNames = {RL:'RL · 奖励训练',RLVR:'RLVR · 规则判题',SFT:'SFT · 示例微调',RLHF:'RLHF · 偏好奖励',shared:'共享基础'};
  const state = {domain:'',status:'',search:'',sort:'baseline'};
  let displayed = [];
  function el(tag, attrs = {}, text) {
    const node = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) k === 'class' ? node.className = v : node.setAttribute(k,v);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function updateHash() {
    const params = new URLSearchParams();
    for (const [key,value] of Object.entries(state)) if (value && !(key === 'sort' && value === 'baseline')) params.set(key,value);
    history.replaceState(null,'',location.pathname + location.search + (params.size ? '#' + params : ''));
  }
  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    state.domain = params.get('domain') || '';
    state.status = Object.hasOwn(statusNames,params.get('status')) ? params.get('status') : '';
    state.search = params.get('search') || '';
    state.sort = ['baseline','saved','name'].includes(params.get('sort')) ? params.get('sort') : 'baseline';
    if (state.domain && !Object.hasOwn(domainNames,state.domain)) state.domain = '';
  }
  function textEvidence(item) {
    if (typeof item === 'string') return item;
    if (!item) return '';
    return [item.commit ? '版本 ' + item.commit.slice(0,8) : '',item.path ? item.path + (item.line ? ':' + item.line : '') : '',item.text || item.note || item.reason || ''].filter(Boolean).join(' — ') || JSON.stringify(item);
  }
  function evidence(card, mod) {
    const detail = el('details',{class:'module-evidence'});
    detail.append(el('summary',{},'查看实际文件与核对依据'));
    detail.append(el('p',{},`非测试源码文件：${fmt(mod.beforeFiles)} → ${fmt(mod.afterFiles)}。每个文件只归属于一个模块，模块行数可相加。`));
    if (mod.planDifference) detail.append(el('h4',{},'与原计划的差别'),el('p',{},textEvidence(mod.planDifference)));
    for (const [key,label] of [['paths','当前源码文件'],['removedPaths','已删除的原源码文件'],['addedPaths','新增文件'],['changedPaths','保留但已修改的文件']]) {
      const items = mod[key] || [];
      if (!items.length) continue;
      const group = el('details');group.append(el('summary',{},`${label} · ${items.length}`));
      const list = el('ul');for (const item of items) list.append(el('li',{},typeof item === 'string' ? item : item.path || textEvidence(item)));
      group.append(list);detail.append(group);
    }
    if (mod.evidence?.length) {
      detail.append(el('h4',{},'源码核对依据'));
      for (const item of mod.evidence) detail.append(el('p',{},textEvidence(item)));
    }
    card.append(detail);
  }
  function moduleCard(mod) {
    const card = el('article',{class:'module-card ' + mod.status,'data-module-id':mod.id,'data-status':mod.status});
    const head = el('div',{class:'module-heading'}),title = el('div');
    title.append(el('h3',{},mod.name),el('div',{class:'module-id'},mod.id));
    head.append(title,el('span',{class:'module-badge ' + mod.status},statusNames[mod.status]));card.append(head);
    card.append(el('p',{class:'module-description'},mod.description));
    const numbers = el('div',{class:'module-lines'}), delta = mod.beforeLines - mod.afterLines;
    numbers.append(el('span',{class:'before'},fmt(mod.beforeLines)),el('span',{'aria-hidden':'true'},'→'),el('strong',{},fmt(mod.afterLines)),el('small',{},'行'),el('span',{class:'line-delta'},delta >= 0 ? '减少 ' + fmt(delta) : '增加 ' + fmt(-delta)));
    card.append(numbers);
    const bar = el('div',{class:'module-bar',role:'img','aria-label':`源码从 ${fmt(mod.beforeLines)} 行到 ${fmt(mod.afterLines)} 行`});
    const progress = el('span');progress.style.width = Math.min(100,mod.beforeLines ? mod.afterLines / mod.beforeLines * 100 : 100) + '%';bar.append(progress);card.append(bar);
    const reason = el('div',{class:'module-reason'});reason.append(el('strong',{},'为什么'),document.createTextNode(mod.reason));card.append(reason);
    const footer = el('div',{class:'module-footer'}), tags = el('div',{class:'module-tags'});
    for (const domain of mod.domains || []) tags.append(el('span',{class:'module-tag',title:domainNames[domain] || domain},domain === 'shared' ? '共享' : domain));
    footer.append(tags);
    if (mod.afterLines > 0) footer.append(el('a',{class:'comparison-link',href:'code.html#' + new URLSearchParams({capability:mod.id,focus:'',selected:'module:' + mod.id,view:'graph'})},'查看保留代码 ↗'));
    else footer.append(el('span',{class:'removed-label'},'nano 中已移除'));
    card.append(footer);evidence(card,mod);
    return card;
  }
  function render() {
    const terms = state.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    displayed = data.modules.filter(mod => {
      const haystack = [mod.id,mod.name,mod.description,mod.reason,...(mod.paths || []),...(mod.removedPaths || [])].join(' ').toLowerCase();
      return (!state.domain || mod.domains.includes(state.domain)) && (!state.status || mod.status === state.status) && terms.every(word => haystack.includes(word));
    });
    if (state.sort === 'saved') displayed.sort((a,b) => (b.beforeLines-b.afterLines)-(a.beforeLines-a.afterLines) || a.id.localeCompare(b.id));
    if (state.sort === 'name') displayed.sort((a,b) => a.name.localeCompare(b.name,'zh-CN'));
    $('module-list').replaceChildren(...displayed.map(moduleCard));
    $('compare-empty').hidden = displayed.length > 0;
    $('filter-summary').textContent = `${displayed.length} / ${data.modules.length} 个模块` + (state.domain ? ' · ' + domainNames[state.domain] : ' · 全部能力') + (state.status ? ' · ' + statusNames[state.status] : '');
    const before = displayed.reduce((sum,m) => sum+m.beforeLines,0),after = displayed.reduce((sum,m) => sum+m.afterLines,0);
    $('filter-totals').textContent = `当前筛选 ${fmt(before)} → ${fmt(after)} 行`;
    $('domain-explanation').textContent = state.domain === 'RLHF' ? '内置奖励模型管线已删除。PPO 的价值估计器（critic）仍服务于奖励训练；保留它不代表保留完整 RLHF。' : '一个模块可以服务多种训练方式；筛选结果之间有重叠，不能跨分类相加。';
    $('compare-search').value = state.search;$('compare-status').value = state.status;$('compare-sort').value = state.sort;
    document.querySelectorAll('[data-domain]').forEach(b => {const active=b.dataset.domain===state.domain;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    updateHash();
  }
  function totals() {
    const s=data.summary, before=s.beforeLines, after=s.afterLines;
    $('compare-commit').textContent=s.sourceCommit.slice(0,8);$('total-commit').textContent=s.sourceCommit.slice(0,8);
    $('total-before').textContent=fmt(before);$('total-after').textContent=fmt(after);
    $('total-retained-percent').textContent=(after/before*100).toFixed(1)+'%';
    $('total-saved').textContent=fmt(before-after);$('total-removed-percent').textContent=((before-after)/before*100).toFixed(1)+'%';
    $('retained-bar').style.width=(after/before*100)+'%';
    $('total-bar').setAttribute('aria-label',`保留 ${(after/before*100).toFixed(1)}%，减少 ${((before-after)/before*100).toFixed(1)}%`);
    $('total-files').textContent=`${fmt(s.beforeFiles)} → ${fmt(s.afterFiles)} 个非测试源码文件 · 原始 43 模块逐项复核`;
    for (const status of ['retained','partial','deleted']) {
      const count=data.modules.filter(mod=>mod.status===status).length;
      const button=el('button',{class:'status-summary '+status,'data-summary-status':status,'aria-label':`筛选${statusNames[status]}：${count} 个模块`});
      const text=el('span');text.append(el('span',{class:'status-title'},statusNames[status]),el('p',{},statusNotes[status]));
      button.append(el('span',{class:'status-number'},fmt(count)),text,el('span',{class:'summary-arrow','aria-hidden':'true'},'↗'));
      button.addEventListener('click',()=>{state.status=status;render();document.querySelector('.comparison-workspace').scrollIntoView({block:'start',behavior:'smooth'});});
      $('status-overview').append(button);
    }
  }
  function reset() {Object.assign(state,{domain:'',status:'',search:'',sort:'baseline'});render();}
  document.querySelectorAll('[data-domain]').forEach(b=>b.addEventListener('click',()=>{state.domain=b.dataset.domain;render();}));
  $('compare-search').addEventListener('input',()=>{state.search=$('compare-search').value;render();});
  $('compare-status').addEventListener('change',()=>{state.status=$('compare-status').value;render();});
  $('compare-sort').addEventListener('change',()=>{state.sort=$('compare-sort').value;render();});
  $('compare-reset').addEventListener('click',reset);$('compare-empty-reset').addEventListener('click',reset);
  $('compare-export').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({summary:data.summary,filters:{...state},modules:displayed,meaning:'Filtered subset; summary retains whole-repository totals. Module ownership is exclusive; domain categories overlap.'},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=el('a',{href:url,download:'verl-nano-comparison.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  window.addEventListener('hashchange',()=>{readHash();render();});
  readHash();totals();render();
  window.VERL_COMPARE_READY=true;
  window.VERL_COMPARE_INSPECT=()=>({state:{...state},displayedModuleIds:displayed.map(m=>m.id),totals:{beforeLines:displayed.reduce((s,m)=>s+m.beforeLines,0),afterLines:displayed.reduce((s,m)=>s+m.afterLines,0)},summary:data.summary});
})();

(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const M = AtlasModel.createModel(window.VERL_ATLAS);
  const symbols = {module:'◫',file:'py',class:'C',function:'ƒ',config:'⚙',document:'≡',resource:'·'};
  const typeNames = {module:'能力模块',file:'源文件',class:'类',function:'函数 / 方法',config:'配置',document:'文档',resource:'资源'};
  const decisionNames = {keep:'保留',remove:'删除候选',review:'待议',unknown:'未判定'};
  const statusNames = {current:'当前',legacy:'遗留',mixed:'新旧混合',unknown:'未判定'};
  const edgeNames = {contains:'包含',imports:'导入',calls:'调用',inherits:'继承',uses:'使用',depends_on:'依赖'};
  const groupNames = {rl:'RL 训练闭环',sft:'监督微调',reward:'奖励与验证',legacy:'历史兼容',engine:'训练引擎',rollout:'采样与推理',data:'共享数据',infra:'基础设施',models:'模型适配',other:'其它能力'};
  const defaultFocus = 'file:verl/trainer/ppo/v1/trainer_sync.py';
  const defaultSelection = 'function:verl/trainer/ppo/v1/trainer_sync.py:PPOTrainerSync.on_sample_end';
  const initial = {capability:'rl-entry',focus:defaultFocus,selected:defaultSelection,view:'graph',category:'',decision:'',status:'',kind:'',page:0,zoom:1,relations:['contains','imports','calls','inherits','uses','depends_on']};
  let state = {...initial,relations:[...initial.relations]}, visible = null, graphLayout = null;
  let searchTimer;
  const fmt = value => Number(value || 0).toLocaleString('en-US');
  const trim = (text,n) => String(text || '').length > n ? String(text).slice(0,n-1) + '…' : String(text || '');
  function el(tag,attrs={},text) {
    const node = document.createElement(tag);
    for (const [key,value] of Object.entries(attrs)) {
      if (key === 'class') node.className = value;
      else node.setAttribute(key,value);
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svg(tag,attrs={},text) {
    const node = document.createElementNS(NS,tag);
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(text,fn,cls='text-button') {const b=el('button',{class:cls},text);b.addEventListener('click',fn);return b;}
  function badge(text,kind='') {return el('span',{class:'badge '+kind},text);}
  function saveHash() {
    const p = new URLSearchParams();
    for (const key of ['capability','focus','selected','view','category','decision','status','kind']) p.set(key,state[key]);
    history.replaceState(null,'','#'+p.toString());
  }
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    for (const key of ['capability','focus','selected','view','category','decision','status','kind']) if (p.has(key)) state[key]=p.get(key);
    if (!M.byId.has(state.focus)) state.focus='';
    if (!M.byId.has(state.selected)) state.selected=state.focus || (state.capability?'module:'+state.capability:'');
    if(state.focus)state.capability=M.byId.get(state.focus).capabilityId || '';
    if (!['graph','tree'].includes(state.view)) state.view='graph';
    const selectedIndex=M.scope(state).base.findIndex(n=>n.id===state.selected);
    if(selectedIndex>=0)state.page=Math.floor(selectedIndex/AtlasModel.PAGE_SIZE);
  }
  function chooseCapability(id) {
    state.capability=id;state.focus='';state.selected=id?'module:'+id:'';state.page=0;
    render();$('graph-wrap').scrollTo(0,0);
  }
  function focusNode(id) {
    const n=M.byId.get(id);if(!n)return;
    state.capability=n.capabilityId || '';state.focus=n.type==='module'?'':id;
    state.selected=id;state.page=0;state.kind='';render();$('graph-wrap').scrollTo(0,0);
  }
  function selectNode(id,navigate=false) {
    const n=M.byId.get(id);if(!n)return;
    state.selected=id;
    if(navigate){
      state.capability=n.capabilityId || '';
      if(n.type==='module')state.focus='';
      else if(['function','class'].includes(n.type))state.focus='file:'+n.filePath;
      else state.focus=id;
      state.kind='';state.page=0;
      const idx=M.scope(state).base.findIndex(item=>item.id===id);
      if(idx>=0)state.page=Math.floor(idx/AtlasModel.PAGE_SIZE);
    }
    if(navigate)render();
    else{
      details();saveHash();
      document.querySelectorAll('.graph-node').forEach(g=>{g.classList.toggle('selected',g.dataset.nodeId===id);g.setAttribute('aria-pressed',String(g.dataset.nodeId===id));});
      document.querySelectorAll('.edge-path').forEach(p=>p.classList.toggle('selected',p.dataset.source===id||p.dataset.target===id));
    }
  }
  function stats() {
    $('stats').replaceChildren();
    for(const [value,label] of [[M.counts.module,'能力模块'],[M.nodes.filter(n=>!['module','function','class'].includes(n.type)).length,'Git 文件条目'],[(M.counts.function||0)+(M.counts.class||0),'函数与类'],[M.edges.length,'静态关系']]){
      const box=el('div',{class:'stat'});box.append(el('strong',{},fmt(value)),el('span',{},label));$('stats').append(box);
    }
    $('capability-count').textContent=M.modules.length;
  }
  function capabilityList() {
    const list=$('capability-list');list.replaceChildren();
    const all=button('所有能力模块',()=>chooseCapability(''),'cap-button'+(!state.capability?' active':''));
    all.append(el('div',{class:'cap-meta'},`${M.modules.length} MODULES · ${fmt(M.nodes.length)} NODES`));list.append(all);
    let previous='';
    for(const module of M.modules){
      if(!M.matches(module,{...state,kind:''}))continue;
      const cap=M.capById.get(module.capabilityId)||{};
      const group=cap.group||'other';
      if(group!==previous){list.append(el('div',{class:'cap-group'},groupNames[group]||group));previous=group;}
      const b=button('',()=>chooseCapability(module.capabilityId),'cap-button'+(state.capability===module.capabilityId?' active':''));
      b.setAttribute('data-capability',module.capabilityId);b.setAttribute('title',module.name+'\n'+module.status+'\n'+module.decision);
      const label=el('span',{class:'cap-label'});label.append(el('i',{class:'legend-dot '+module.decisionClass}),document.createTextNode(module.name));
      const files=(M.children.get(module.id)||[]).length;
      b.append(label,el('div',{class:'cap-meta'},`${files} FILES · ${fmt(module.loc)} LOC`));list.append(b);
    }
    document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('active',b.dataset.category===state.category));
    $('decision').value=state.decision;$('status').value=state.status;$('kind').value=state.kind;
  }
  function crumbs() {
    const target=state.focus|| (state.capability?'module:'+state.capability:'');
    $('breadcrumbs').replaceChildren(button('verl',()=>chooseCapability('')));
    for(const n of M.breadcrumbs(target)){
      $('breadcrumbs').append(el('span',{},'/'),button(n.type==='module'?n.name:n.name,()=>focusNode(n.id)));
    }
    $('scope-title').textContent=M.byId.get(target)?.name||'全部能力模块';
    $('back').disabled=!target;
    $('graph-tab').classList.toggle('active',state.view==='graph');$('tree-tab').classList.toggle('active',state.view==='tree');
    $('graph-tab').setAttribute('aria-selected',String(state.view==='graph'));$('tree-tab').setAttribute('aria-selected',String(state.view==='tree'));
    $('graph-wrap').hidden=state.view!=='graph';$('tree-wrap').hidden=state.view!=='tree';
    document.querySelector('.zoom-controls').hidden=state.view!=='graph';
    document.querySelector('.pagination').hidden=state.view!=='graph';
    document.querySelectorAll('.relation-toolbar input').forEach(input=>{input.disabled=state.view==='tree';input.checked=state.relations.includes(input.value);});
    $('export').title=state.view==='tree'?'导出完整匹配树及其祖先':'导出当前图页的节点和关系';
  }
  function graph() {
    visible=M.scope(state);state.page=visible.page;
    graphLayout=AtlasModel.layout(visible.nodes,visible.contextIds,$('graph-wrap').clientWidth||700);
    const scene=$('graph');scene.replaceChildren();
    scene.setAttribute('viewBox',`0 0 ${graphLayout.width} ${graphLayout.height}`);
    scene.setAttribute('width',graphLayout.width*state.zoom);scene.setAttribute('height',graphLayout.height*state.zoom);
    const defs=svg('defs');
    for(const [kind,color] of Object.entries({contains:'#a9b6a3',imports:'#9685bd',calls:'#66a3ad',inherits:'#ca8c75',uses:'#628957',depends_on:'#b89750'})){
      const mark=svg('marker',{id:'arrow-'+kind,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'});
      mark.append(svg('path',{d:'M 0 1 L 9 5 L 0 9 Z',fill:color}));defs.append(mark);
    }scene.append(defs);
    const edgeLayer=svg('g',{'aria-label':'关系'});
    for(const e of visible.edges){
      const a=graphLayout.positions.get(e.source),b=graphLayout.positions.get(e.target);if(!a||!b||e.source===e.target)continue;
      const sameRow=Math.abs(a.y-b.y)<10;
      let d;
      if(sameRow){const right=b.x>a.x;const ax=right?a.x+a.w:a.x,bx=right?b.x:b.x+b.w;const ay=a.y+a.h/2,by=b.y+b.h/2;d=`M${ax},${ay} C${ax+(right?24:-24)},${ay-24} ${bx+(right?-24:24)},${by-24} ${bx},${by}`;}
      else {const down=b.y>a.y;const ax=a.x+a.w/2,bx=b.x+b.w/2,ay=down?a.y+a.h:a.y,by=down?b.y:b.y+b.h;const mid=(ay+by)/2;d=`M${ax},${ay} C${ax},${mid} ${bx},${mid} ${bx},${by}`;}
      const p=svg('path',{class:'edge-path '+e.type+([e.source,e.target].includes(state.selected)?' selected':''),d,'marker-end':'url(#arrow-'+e.type+')','data-source':e.source,'data-target':e.target,'data-relation':e.type});
      p.append(svg('title',{},`${M.byId.get(e.source).name} → ${M.byId.get(e.target).name}\n${edgeNames[e.type]}${e.description?' · '+e.description:''}`));edgeLayer.append(p);
    }scene.append(edgeLayer);
    scene.append(svg('text',{x:28,y:21,class:'graph-label'},state.focus?'DEFINITIONS / 当前文件与声明':'STRUCTURE / 模块与文件'));
    if(graphLayout.contextY!==null)scene.append(svg('text',{x:28,y:graphLayout.contextY,class:'graph-label'},'OUTGOING CONTEXT / 外部关联节点 · 最多 12 个'));
    for(const n of visible.nodes){
      const p=graphLayout.positions.get(n.id),selected=n.id===state.selected;
      const g=svg('g',{class:'graph-node'+(selected?' selected':''),transform:`translate(${p.x},${p.y})`,tabindex:'0',role:'button','aria-label':`${n.name}，${typeNames[n.type]||n.type}，${n.locApplicable===false?'不适用':n.loc??'未知'} 行，${statusNames[n.statusClass]}，${decisionNames[n.decisionClass]}`,'data-node-id':n.id,'aria-pressed':String(selected)});
      g.append(svg('title',{},`${n.name}\n${n.filePath||n.summary}\n${n.loc??'未知'} LOC · ${n.status}\n${n.decision}`));
      g.append(svg('rect',{class:'node-card',width:p.w,height:p.h,rx:7}));
      const colors={keep:'#529077',remove:'#bf7367',review:'#c3a05b',unknown:'#a4b09a'};
      g.append(svg('rect',{x:0,y:12,width:3,height:p.h-24,rx:1.5,fill:colors[n.decisionClass]}));
      g.append(svg('text',{x:13,y:23,class:'node-symbol'},symbols[n.type]||'·'));
      g.append(svg('text',{x:36,y:22,class:'node-type'},(n.symbolKind||n.type).toUpperCase()+(p.context?' · 关联':'')));
      g.append(svg('text',{x:14,y:43,class:'node-name'},trim(n.name.split('.').slice(-1)[0]||n.name,28)));
      // Filenames retain their extension; qualified declarations show their last segment.
      g.querySelector('.node-name').textContent=trim(['class','function'].includes(n.type)?n.name.split('.').slice(-1)[0]:n.name,28);
      g.append(svg('text',{x:14,y:67,class:'node-meta'},n.locApplicable===false?'N/A · binary / Git link':`${n.loc===null||n.loc===undefined?'?':fmt(n.loc)} LOC${n.lineRange?'  L'+n.lineRange[0]+'–'+n.lineRange[1]:''}`));
      g.append(svg('text',{x:p.w-12,y:67,'text-anchor':'end',class:'node-badge'},statusNames[n.statusClass]));
      if((M.children.get(n.id)||[]).length)g.append(svg('text',{x:p.w-15,y:23,'text-anchor':'end',class:'node-action'},'↗'));
      g.addEventListener('click',()=>selectNode(n.id));g.addEventListener('dblclick',()=>focusNode(n.id));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();selectNode(n.id);}if(e.key===' '){e.preventDefault();focusNode(n.id);}});
      scene.append(g);
    }
    $('empty').hidden=visible.nodes.length>0;
    $('visible-count').textContent=`${visible.nodes.length-visible.contextIds.size}/${fmt(visible.total)} 节点${visible.contextIds.size?' + '+visible.contextIds.size+' 关联':''} · ${visible.edges.length} 边`;
    $('page-label').textContent=`${visible.page+1} / ${visible.pages}`;$('page-prev').disabled=visible.page===0;$('page-next').disabled=visible.page>=visible.pages-1;
    $('zoom-reset').textContent=Math.round(state.zoom*100)+'%';
    $('view-hint').textContent=state.view==='graph'?'单击详情 · 双击深入 · 空格展开 · 拖动画布平移':'展开目录与类 · 点击节点查看行数、状态和关系';
  }
  function tree() {
    const wrap=$('tree-wrap');
    if(state.view!=='tree'){wrap.replaceChildren();return;}
    const keepOpen=new Set([...wrap.querySelectorAll('details[open]')].map(x=>x.dataset.nodeId));
    wrap.replaceChildren();
    let roots;
    if(state.focus)roots=[M.byId.get(state.focus)];
    else if(state.capability)roots=[M.byId.get('module:'+state.capability)];
    else roots=M.modules;
    const allowed=n=>M.matches(n,state)||M.descendants(n.id).some(c=>M.matches(c,state));
    function add(n,parent,depth){
      if(!n||!allowed(n))return;
      const kids=(M.children.get(n.id)||[]).map(id=>M.byId.get(id)).filter(allowed);
      const box=el('details',{class:'tree-node'+(!kids.length?' leaf':'')+(depth===0?' tree-root':'')+(state.selected===n.id?' selected':''),'data-node-id':n.id});
      const row=el('summary',{'data-select-id':n.id});
      row.append(el('span',{class:'tree-icon'},symbols[n.type]||'·'),el('span',{class:'tree-name'},n.name),el('span',{class:'tree-loc'},n.locApplicable===false?'N/A':(n.loc===undefined||n.loc===null?'?':fmt(n.loc))+' L'),badge(statusNames[n.statusClass]),badge(decisionNames[n.decisionClass],n.decisionClass));
      box.append(row);let loaded=false;
      function load(){if(loaded)return;loaded=true;for(const child of kids)add(child,box,depth+1);}
      row.addEventListener('click',()=>{state.selected=n.id;details();saveHash();wrap.querySelectorAll('.tree-node.selected').forEach(x=>x.classList.remove('selected'));box.classList.add('selected');if(!box.open)load();});
      box.addEventListener('toggle',()=>{if(box.open)load();});
      parent.append(box);
      if((depth===0&&roots.length===1)||keepOpen.has(n.id)||M.breadcrumbs(state.selected).some(x=>x.id===n.id)){load();box.open=!!kids.length;}
    }
    for(const n of roots)add(n,wrap,0);
    if(!wrap.children.length)wrap.append(el('p',{class:'empty'},'没有匹配节点。清除筛选后重试。'));
    $('visible-count').textContent='完整包含层级 · 按需展开';
  }
  function details() {
    const pane=$('details');pane.replaceChildren();
    const n=M.byId.get(state.selected)||M.byId.get(state.focus)||M.byId.get('module:'+state.capability);
    if(!n){const head=el('div',{class:'detail-header'});head.append(el('div',{class:'detail-eyebrow'},'NODE INSPECTOR'),el('h2',{class:'detail-title'},'选择一个节点'),el('p',{class:'detail-path'},'点击图中的节点，查看函数、行数、新旧依据和调用关系。'));pane.append(head);return;}
    const head=el('div',{class:'detail-header'});
    head.append(el('div',{class:'detail-eyebrow'},`${symbols[n.type]||'·'} ${typeNames[n.type]||n.type} / ${n.symbolKind||n.type}`),el('h2',{class:'detail-title'},n.name),el('div',{class:'detail-path'},(n.filePath||M.capById.get(n.capabilityId)?.label||'语义能力分组')+(n.lineRange?' : '+n.lineRange.join('–'):'')));
    const tags=el('div',{class:'badges'});tags.append(badge(decisionNames[n.decisionClass],n.decisionClass),badge(statusNames[n.statusClass]));for(const tag of (M.capById.get(n.capabilityId)?.tags||n.tags||[]).slice(0,4))tags.append(badge(tag));head.append(tags);pane.append(head);
    function section(title){const s=el('section',{class:'detail-section'});s.append(el('h3',{},title));pane.append(s);return s;}
    const sizing=section('代码规模');const metrics=el('div',{class:'metric-row'});
    const rel=(M.outgoing.get(n.id)||[]).filter(e=>e.type!=='contains');
    for(const [v,l] of [[n.locApplicable===false?'N/A':n.loc===undefined||n.loc===null?'?':fmt(n.loc),n.type==='module'?'所属文件物理行':'物理行 / LOC'],[(M.children.get(n.id)||[]).length,'直接子节点'],[rel.length,'出向关系']]){const box=el('div',{class:'metric'});box.append(el('strong',{},v),el('small',{},l));metrics.append(box);}sizing.append(metrics);
    if(n.locApplicable===false)sizing.append(el('p',{class:'subtle'},'二进制资源 / Git 链接：源代码行数不适用。'));
    if(n.type==='function'||n.type==='class')sizing.append(el('p',{class:'subtle'},'按 AST 声明区间计行；与所在类、文件区间重叠，不相加。'));
    if((M.children.get(n.id)||[]).length)sizing.append(button('进入此节点的代码结构 ↗',()=>focusNode(n.id),'detail-action'));
    else if(n.filePath)sizing.append(button('查看所在文件与关联节点 ↗',()=>focusNode('file:'+n.filePath),'detail-action'));
    const meaning=section('职责与语义');meaning.append(el('p',{},n.summary||'未补充语义说明。'));
    if(n.signature){const details=el('details');details.append(el('summary',{},'声明签名'),el('p',{},n.signature));meaning.append(details);}
    const choice=section('新旧与 nano 取舍');choice.append(el('p',{},n.status||'未判定'),el('p',{},n.decision||'待审查'));
    choice.append(el('p',{class:'subtle'},'审阅来源：'+(n.analysis||'能力层标注；非逐符号人工审查')));
    if(['function','class'].includes(n.type)){
      const sourceNames={'host symbol review':'该符号的 host 源码审阅','symbol declaration':'该符号的源码声明 / 弃用注解','capability inheritance':'继承所属能力（非该符号的单独判断）'};
      choice.append(el('p',{class:'subtle'},'状态来源：'+(sourceNames[n.statusSource]||n.statusSource||sourceNames['capability inheritance'])));
      choice.append(el('p',{class:'subtle'},'取舍来源：'+(sourceNames[n.decisionSource]||n.decisionSource||sourceNames['capability inheritance'])));
    }else if(n.analysis!=='host semantic review')choice.append(el('p',{class:'subtle'},'能力判断不等于逐函数判定；混合文件中的当前函数与旧 API 需要分别审查。'));
    const evidenceItems=n.evidence||M.capById.get(n.capabilityId)?.evidence||[];
    if(evidenceItems.length){const evidence=el('details');evidence.append(el('summary',{},`查看 ${evidenceItems.length} 条源码依据`));for(const ev of evidenceItems){const p=el('p',{class:'evidence-item'});if(typeof ev==='string')p.textContent=ev;else{p.append(el('code',{},`${ev.path||''}${ev.line?':'+ev.line:''}`),el('br'),document.createTextNode(ev.text||ev.note||''));}evidence.append(p);}choice.append(evidence);}
    const snippets=window.VERL_ATLAS.snippets||{};
    if(snippets[n.id]){const code=section('源码摘录 · 固定提交');const pre=el('pre',{class:'source-snippet'});pre.textContent=snippets[n.id];code.append(pre);}
    const kids=(M.children.get(n.id)||[]).map(id=>M.byId.get(id));
    if(kids.length){const children=section(`包含 ${kids.length} 个直接节点`),list=el('ul',{class:'relation-list'});for(const child of kids.slice(0,60)){const item=el('li');const b=button(child.name,()=>selectNode(child.id,true),'');b.append(el('small',{},`${child.type} · ${fmt(child.loc)} LOC · ${statusNames[child.statusClass]}`));item.append(b);list.append(item);}children.append(list);if(kids.length>60)children.append(el('p',{class:'subtle'},'这里只显示前 60 项；完整子节点可在 Tree 展开。'));}
    for(const [dir,title,edges] of [['out','出向关系',M.outgoing.get(n.id)||[]],['in','入向关系',M.incoming.get(n.id)||[]]]){
      const relevant=edges.filter(e=>e.type!=='contains');if(!relevant.length)continue;
      const s=section(`${title} · ${relevant.length}`),list=el('ul',{class:'relation-list'});
      for(const e of relevant.slice(0,35)){const other=M.byId.get(dir==='out'?e.target:e.source);const li=el('li');const b=button('',()=>selectNode(other.id,true),'');b.append(el('span',{class:'edge-kind'},edgeNames[e.type]||e.type),document.createTextNode(other.name),el('small',{},trim(other.filePath||other.name,70)));li.append(b);list.append(li);}s.append(list);if(relevant.length>35)s.append(el('p',{class:'subtle'},'显示前 35 条；完整关系在下载的知识图谱中。'));
    }
    const source=section('证据定位');source.append(el('p',{class:'subtle'},'提交 '+M.data.graph.project.gitCommitHash));
    if(n.filePath){const sourceUrl='https://github.com/verl-project/verl/blob/'+M.data.graph.project.gitCommitHash+'/'+n.filePath+(n.lineRange?'#L'+n.lineRange[0]:'');source.append(el('a',{href:sourceUrl,target:'_blank',rel:'noopener noreferrer',class:'detail-secondary'},'打开固定提交源码（需网络） ↗'));}
  }
  function search() {
    const q=$('search').value,box=$('search-results');box.replaceChildren();
    if(!q.trim()){box.hidden=true;return;}
    box.hidden=false;const results=M.search(q,state);
    box.append(el('p',{},`${fmt(results.length)} 个匹配${results.length>50?' · 展示前 50 个':''}`));
    for(const n of results.slice(0,50)){const b=button('',()=>{selectNode(n.id,true);box.hidden=true;},'');b.append(el('strong',{},n.name),el('small',{},`${n.type} · ${n.loc??'?'} LOC · ${statusNames[n.statusClass]}`),el('small',{},n.filePath||n.summary));box.append(b);}
  }
  function render() {capabilityList();crumbs();graph();tree();details();saveHash();}
  function reset(){state={...initial,relations:[...initial.relations]};$('search').value='';$('search-results').hidden=true;render();}
  function changeFilter(key,value){state[key]=value;state.page=0;if(key==='category'){state.focus='';state.capability='';}render();if($('search').value)search();}
  readHash();
  const typeLabel=el('label',{'for':'kind'},'节点类型'),typeSelect=el('select',{id:'kind'});
  for(const [value,label] of [['','全部类型'],['file','源文件'],['symbol','函数与类'],['function','函数 / 方法'],['class','类'],['module','能力模块'],['config','配置'],['document','文档']])typeSelect.append(el('option',{value},label));
  const typeRow=el('div',{class:'filter-row'});typeRow.append(typeLabel,typeSelect);$('capability-list').before(typeRow);
  const nativeLink=el('a',{href:'tree.html'},'LMA 原生 Tree ↗');document.querySelector('.masthead nav').prepend(nativeLink);
  const flowLink=el('a',{href:'domain.html'},'业务流程');document.querySelector('.masthead nav').prepend(flowLink);
  for(const [value,label] of [['uses','使用'],['depends_on','依赖']]){
    const box=el('label'),check=el('input',{type:'checkbox',value});check.checked=true;
    box.append(check,el('i',{class:'relation-dot '+value}),document.createTextNode(label));$('visible-count').before(box);
  }
  $('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,100);});
  $('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',()=>{state.decision='';state.status='';state.category='';state.kind='';render();});
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>changeFilter('category',b.dataset.category)));
  for(const key of ['decision','status','kind'])$(key).addEventListener('change',e=>changeFilter(key,e.target.value));
  $('graph-tab').addEventListener('click',()=>{state.view='graph';render();});$('tree-tab').addEventListener('click',()=>{state.view='tree';render();});
  $('back').addEventListener('click',()=>{if(state.focus){const parent=M.parents.get(state.focus);if(parent)focusNode(parent);else chooseCapability(state.capability);}else chooseCapability('');});
  document.querySelectorAll('.relation-toolbar input').forEach(input=>input.addEventListener('change',()=>{state.relations=[...document.querySelectorAll('.relation-toolbar input:checked')].map(x=>x.value);graph();}));
  for(const [id,delta] of [['page-prev',-1],['page-next',1]])$(id).addEventListener('click',()=>{state.page+=delta;graph();$('graph-wrap').scrollTo(0,0);});
  function zoom(value){state.zoom=Math.min(1.8,Math.max(.4,value));graph();}
  $('zoom-in').addEventListener('click',()=>zoom(state.zoom+.15));$('zoom-out').addEventListener('click',()=>zoom(state.zoom-.15));$('zoom-reset').addEventListener('click',()=>zoom(1));
  let drag=null;const wrap=$('graph-wrap');
  wrap.addEventListener('pointerdown',e=>{if(e.target.closest('.graph-node')||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:wrap.scrollLeft,top:wrap.scrollTop};wrap.classList.add('dragging');wrap.setPointerCapture(e.pointerId);});
  wrap.addEventListener('pointermove',e=>{if(!drag)return;wrap.scrollLeft=drag.left-(e.clientX-drag.x);wrap.scrollTop=drag.top-(e.clientY-drag.y);});
  const endDrag=()=>{drag=null;wrap.classList.remove('dragging');};wrap.addEventListener('pointerup',endDrag);wrap.addEventListener('pointercancel',endDrag);
  $('export').addEventListener('click',()=>{
    let nodes=visible.nodes,edges=visible.edges,total=visible.total,meaning='Current graph page with outgoing context; no code changes or behavior validation';
    if(state.view==='tree'){
      const rootIds=state.focus?[state.focus]:state.capability?['module:'+state.capability]:M.modules.map(n=>n.id);
      const candidates=rootIds.flatMap(id=>[M.byId.get(id),...M.descendants(id)]),allowedIds=new Set(candidates.map(n=>n.id));
      const ids=new Set();
      for(const n of candidates)if(M.matches(n,state))for(const ancestor of M.breadcrumbs(n.id))if(allowedIds.has(ancestor.id))ids.add(ancestor.id);
      nodes=candidates.filter(n=>ids.has(n.id));edges=M.edges.filter(e=>e.type==='contains'&&ids.has(e.source)&&ids.has(e.target));total=nodes.length;
      meaning='Full filtered containment scope including ancestors, not graph pagination; no code changes or behavior validation';
    }
    const blob=new Blob([JSON.stringify({project:M.data.graph.project,scope:{...state},nodes,edges,totalMatchingNodes:total,meaning},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=el('a',{href:url,download:'verl-code-scope.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();$('search').focus();}if(e.key==='Escape'){$('search-results').hidden=true;$('search').blur();}});
  window.addEventListener('hashchange',()=>{readHash();render();});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>graph(),100);});
  stats();render();
  window.VERL_ATLAS_READY=true;
  window.VERL_ATLAS_INSPECT=()=>({state:{...state},visible:{nodes:visible.nodes.map(n=>n.id),edges:visible.edges,total:visible.total},counts:M.counts,layout:[...graphLayout.positions].map(([id,p])=>({id,...p}))});
})();

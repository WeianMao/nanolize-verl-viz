(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PAGE_SIZE = 48;
  function decisionClass(text) {
    if (/^删除/.test(text || '')) return 'remove';
    if (/^保留/.test(text || '')) return 'keep';
    if (/待议|候选|二选一/.test(text || '')) return 'review';
    return 'unknown';
  }
  function statusClass(text) {
    text = text || '';
    if (/^mixed|混合|新旧|局部|含.*旧|旧.*共存|主体当前/.test(text)) return 'mixed';
    if (/未证实\s*deprecated|未找到.*退役|不确定/.test(text)) return 'unknown';
    if (/明确\s+(?:deprecated|legacy)|^遗留|^已弃用|^deprecated|^legacy|明确旧/.test(text)) return 'legacy';
    if (/当前|现行|现代|默认|未见.*弃用/.test(text)) return 'current';
    return 'unknown';
  }
  function createModel(data) {
    const meta = data.metadata || {};
    const nodes = data.graph.nodes.map(n => ({...n, ...(meta[n.id] || {}),
      decisionClass: decisionClass(meta[n.id]?.decision), statusClass: statusClass(meta[n.id]?.status)}));
    const byId = new Map(nodes.map(n => [n.id, n]));
    const edges = data.graph.edges.filter(e => byId.has(e.source) && byId.has(e.target));
    const outgoing = new Map(), incoming = new Map(), children = new Map(), parents = new Map();
    for (const e of edges) {
      if (!outgoing.has(e.source)) outgoing.set(e.source, []);
      if (!incoming.has(e.target)) incoming.set(e.target, []);
      outgoing.get(e.source).push(e); incoming.get(e.target).push(e);
      if (e.type === 'contains') {
        if (!children.has(e.source)) children.set(e.source, []);
        children.get(e.source).push(e.target);
        if (!parents.has(e.target)) parents.set(e.target, e.source);
      }
    }
    const caps = data.capabilities.capabilities;
    const capById = new Map(caps.map(c => [c.id, c]));
    for (const n of nodes) if (n.evidence === undefined) n.evidence = capById.get(n.capabilityId)?.evidence || [];
    const modules = nodes.filter(n => n.type === 'module');
    const counts = Object.create(null);
    for (const n of nodes) counts[n.type] = (counts[n.type] || 0) + 1;
    function descendants(id) {
      const out = [], visited = new Set(), stack = [...(children.get(id) || [])].reverse();
      while (stack.length) {
        const next = stack.pop(); if (visited.has(next)) continue;
        visited.add(next); out.push(byId.get(next));
        stack.push(...[...(children.get(next) || [])].reverse());
      }
      return out;
    }
    function matches(n, state) {
      return (!state.category || n.tags?.includes(state.category) || capById.get(n.capabilityId)?.tags?.includes(state.category)) &&
        (!state.decision || n.decisionClass === state.decision) &&
        (!state.status || n.statusClass === state.status) &&
        (!state.kind || (state.kind === 'symbol' ? ['function', 'class'].includes(n.type) : n.type === state.kind));
    }
    function search(q, state) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/);
      return nodes.filter(n => matches(n, state) && words.every(w => (n.name + ' ' + (n.filePath || '') + ' ' + (n.qualname || '')).toLowerCase().includes(w)))
        .sort((a,b) => (a.name.toLowerCase() === q ? -1 : b.name.toLowerCase() === q ? 1 : a.name.length - b.name.length) || a.id.localeCompare(b.id));
    }
    function scope(state) {
      let base;
      if (state.focus && byId.has(state.focus)) {
        base = [byId.get(state.focus), ...descendants(state.focus)];
      } else if (state.capability && byId.has('module:' + state.capability)) {
        const moduleId = 'module:' + state.capability;
        base = state.kind ? descendants(moduleId) : [byId.get(moduleId), ...(children.get(moduleId) || []).map(id => byId.get(id))];
      } else {
        base = state.kind ? nodes : modules;
      }
      base = base.filter(n => matches(n, state));
      const total = base.length, pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.max(0, Math.min(state.page || 0, pages - 1));
      const shown = base.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      const shownIds = new Set(shown.map(n => n.id)), contextIds = new Set();
      if (state.focus) {
        const candidates = new Map();
        for (const n of shown) for (const e of outgoing.get(n.id) || []) {
          if (!state.relations.includes(e.type) || e.type === 'contains' || shownIds.has(e.target)) continue;
          const related = byId.get(e.target);
          if (matches(related, {...state,kind:''})) candidates.set(e.target, (candidates.get(e.target) || 0) + (e.type === 'inherits' ? 4 : 1));
        }
        const context = [...candidates.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
        for (const [id] of context) { shown.push(byId.get(id)); shownIds.add(id); contextIds.add(id); }
      }
      const shownEdges = edges.filter(e => shownIds.has(e.source) && shownIds.has(e.target) && state.relations.includes(e.type));
      return {nodes:shown, edges:shownEdges, total, pages, page, contextIds, base};
    }
    function breadcrumbs(id) {
      const path = [], seen = new Set();
      while (id && byId.has(id) && !seen.has(id)) { seen.add(id); path.unshift(byId.get(id)); id = parents.get(id); }
      return path;
    }
    return {data,nodes,edges,byId,outgoing,incoming,children,parents,caps,capById,modules,counts,descendants,matches,search,scope,breadcrumbs};
  }
  function layout(nodes, contextIds, width) {
    const cardWidth = 234, cardHeight = 86, gapX = 45, gapY = 55, padX = 28, padY = 40;
    const columns = Math.max(2, Math.min(4, Math.floor((width - padX * 2 + gapX) / (cardWidth + gapX))));
    const own = nodes.filter(n => !contextIds.has(n.id)), context = nodes.filter(n => contextIds.has(n.id));
    const positions = new Map();
    own.forEach((n,i) => positions.set(n.id,{x:padX + (i % columns) * (cardWidth + gapX),y:padY + Math.floor(i / columns) * (cardHeight + gapY),w:cardWidth,h:cardHeight,context:false}));
    const contextY = Math.max(1,Math.ceil(own.length / columns)) * (cardHeight + gapY) + padY + 28;
    context.forEach((n,i) => positions.set(n.id,{x:padX + (i % columns) * (cardWidth + gapX),y:contextY + Math.floor(i / columns) * (cardHeight + gapY),w:cardWidth,h:cardHeight,context:true}));
    const last = [...positions.values()];
    return {positions,width:columns * (cardWidth + gapX) - gapX + padX * 2,height:Math.max(340,...last.map(p=>p.y + p.h + 50)),contextY:context.length ? contextY - 17 : null};
  }
  return {createModel,decisionClass,statusClass,layout,PAGE_SIZE};
});

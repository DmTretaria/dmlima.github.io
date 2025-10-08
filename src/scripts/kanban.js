// Kanban.js - simples Trello-like com localStorage e timer por cartão
document.addEventListener('DOMContentLoaded', () => {
  const listsContainer = document.getElementById('lists');
  const addListBtn = document.getElementById('addListBtn');
  const backBtn = document.getElementById('backBtn');

  // Modal
  const cardModal = document.getElementById('cardModal');
  const modalTitle = document.getElementById('modalTitle');
  const cardTitleInput = document.getElementById('cardTitle');
  const cardDescInput = document.getElementById('cardDesc');
  const cardFileInput = document.getElementById('cardFileInput');
  const attachmentsPreview = document.getElementById('attachmentsPreview');
  const saveCardBtn = document.getElementById('saveCardBtn');
  const cancelCardBtn = document.getElementById('cancelCardBtn');

  let state = loadState();
  let currentListId = null;
  let editCardId = null;
  let pendingAttachments = [];

  function saveState(){ localStorage.setItem('kanbanState', JSON.stringify(state)); }
  function loadState(){
    const raw = localStorage.getItem('kanbanState');
    if(!raw) return [{id: genId(), title:'A Fazer', cards:[]},{id: genId(), title:'Em Progresso', cards:[]},{id: genId(), title:'Concluído', cards:[]}];
    try{
      const parsed = JSON.parse(raw);
      // parsed should be an array of lists; if it's an object with .lists, support that too
      if(Array.isArray(parsed)) return parsed;
      if(parsed && Array.isArray(parsed.lists)) return parsed.lists;
    }catch(e){/* ignore parse errors */}
    return [{id: genId(), title:'A Fazer', cards:[]},{id: genId(), title:'Em Progresso', cards:[]},{id: genId(), title:'Concluído', cards:[]}];
  }
  function genId(){ return 'id_'+Math.random().toString(36).slice(2,9); }

  function render(){
    listsContainer.innerHTML = '';
    state.forEach(list => {
      const el = document.createElement('section');
      el.className = 'list';
      el.dataset.listId = list.id;
      el.innerHTML = `
        <div class="list-header">
          <div class="list-title">${escapeHtml(list.title)}</div>
          <div class="list-actions">
            <button class="small add-card">+ Cartão</button>
            <button class="small rename-list">✎</button>
            <button class="small del-list">🗑</button>
          </div>
        </div>
        <div class="cards" data-list-id="${list.id}"></div>
      `;

      listsContainer.appendChild(el);

      const cardsEl = el.querySelector('.cards');
      list.cards.forEach(card => {
        const c = document.createElement('div');
        c.className = 'card';
        c.draggable = true;
        c.dataset.cardId = card.id;
        c.innerHTML = `<div class="card-title">${escapeHtml(card.title)}</div>
                       <div class="card-meta">
                         <span>${card.timer ? formatSeconds(card.timer) : '00:00:00'}</span>
                         <span>
                            <button class="small start-timer">▶</button>
                            <button class="small stop-timer">■</button>
                            <button class="small edit-card">✎</button>
                         </span>
                       </div>`;
        // attachments thumbnails
        if(card.attachments && card.attachments.length){
          const wrap = document.createElement('div'); wrap.className = 'attachments-preview';
          card.attachments.slice(0,4).forEach(att=>{
            const d = document.createElement('div'); d.className='attachment';
            if(att.type && att.type.startsWith('image/')){ const img = document.createElement('img'); img.src = att.data; d.appendChild(img); }
            else { d.textContent = '📎'; }
            wrap.appendChild(d);
          });
          c.appendChild(wrap);
        }
        cardsEl.appendChild(c);
      });

      // attach list listeners
      el.querySelector('.add-card').addEventListener('click', ()=> openCardModal(list.id));
      el.querySelector('.del-list').addEventListener('click', ()=> { if(confirm('Excluir lista?')){ state = state.filter(l=>l.id!==list.id); saveState(); render(); }});
      el.querySelector('.rename-list').addEventListener('click', ()=>{
        const name = prompt('Novo nome da lista', list.title);
        if(name!=null){ list.title = name; saveState(); render(); }
      });

      // Drag and drop on cards container
      cardsEl.addEventListener('dragstart', (e)=>{
        const card = e.target.closest('.card');
        if(!card) return;
        e.dataTransfer.setData('text/plain', JSON.stringify({cardId: card.dataset.cardId, fromList: list.id}));
        card.classList.add('dragging');
      });
      cardsEl.addEventListener('dragend', (e)=>{
        const card = e.target.closest('.card'); if(card) card.classList.remove('dragging');
      });
      cardsEl.addEventListener('dragover', (e)=>{ e.preventDefault(); });
      cardsEl.addEventListener('drop', (e)=>{
        e.preventDefault();
        try{
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          const card = moveCard(data.cardId, data.fromList, list.id);
          if(card){ saveState(); render(); }
        }catch(err){/*ignore*/}
      });

    });

    // attach card-level listeners (delegate)
    document.querySelectorAll('.card').forEach(cardEl=>{
      cardEl.querySelector('.edit-card')?.addEventListener('click', (ev)=>{
        const cardId = cardEl.dataset.cardId;
        const {list, card} = findCard(cardId);
        if(card){ editCardId = cardId; currentListId = list.id; cardTitleInput.value = card.title || ''; cardDescInput.value = card.desc||''; modalTitle.textContent = 'Editar Cartão'; cardModal.classList.remove('hidden'); }
      });
      cardEl.querySelector('.start-timer')?.addEventListener('click', ()=> startTimer(cardEl.dataset.cardId));
      cardEl.querySelector('.stop-timer')?.addEventListener('click', ()=> stopTimer(cardEl.dataset.cardId));
    });
  }

  function openCardModal(listId){ currentListId = listId; editCardId = null; cardTitleInput.value=''; cardDescInput.value=''; modalTitle.textContent='Novo Cartão'; cardModal.classList.remove('hidden'); }
  cancelCardBtn.addEventListener('click', ()=>{ cardModal.classList.add('hidden'); if(attachmentsPreview) attachmentsPreview.innerHTML=''; if(cardFileInput) cardFileInput.value=''; pendingAttachments = []; });
  // Handle file input and previews
  if(cardFileInput){
    cardFileInput.addEventListener('change', async (e)=>{
      const files = Array.from(e.target.files || []);
      for(const f of files){
        if(f.size > 2_500_000){ alert('Arquivo muito grande: ' + f.name); continue; }
        try{
          const data = await fileToDataURL(f);
          pendingAttachments.push({name: f.name, type: f.type, data});
        }catch(err){ console.error('Erro lendo arquivo', err); }
      }
      renderPendingAttachments();
    });
  }

  function fileToDataURL(file){ return new Promise((res, rej)=>{ const reader = new FileReader(); reader.onload = ()=>res(reader.result); reader.onerror = rej; reader.readAsDataURL(file); }); }
  function renderPendingAttachments(){ if(!attachmentsPreview) return; attachmentsPreview.innerHTML=''; pendingAttachments.forEach((a)=>{ const d = document.createElement('div'); d.className='attachment'; if(a.type && a.type.startsWith('image/')){ const img = document.createElement('img'); img.src = a.data; d.appendChild(img); } else { d.textContent = '📎'; } attachmentsPreview.appendChild(d); }); }
  saveCardBtn.addEventListener('click', ()=>{
    const title = cardTitleInput.value.trim();
    const desc = cardDescInput.value.trim();
    if(!title) return alert('Título é obrigatório');
    if(editCardId){ const {list, card} = findCard(editCardId); card.title = title; card.desc = desc; if(pendingAttachments.length) card.attachments = (card.attachments||[]).concat(pendingAttachments); }
    else{ const list = state.find(l=>l.id===currentListId); list.cards.push({id:genId(), title, desc, timer:0, running:false, lastStart: null, attachments: pendingAttachments.slice()}); }
    // reset pending attachments
    pendingAttachments = [];
    if(attachmentsPreview) attachmentsPreview.innerHTML=''; if(cardFileInput) cardFileInput.value='';
    saveState(); cardModal.classList.add('hidden'); render();
  });

  function findCard(cardId){ for(const l of state){ const c = l.cards.find(ci=>ci.id===cardId); if(c) return {list:l, card:c}; } return {}; }
  function moveCard(cardId, fromId, toId){ if(!cardId) return null; const from = state.find(l=>l.id===fromId); const to = state.find(l=>l.id===toId); if(!from || !to) return null; const idx = from.cards.findIndex(c=>c.id===cardId); if(idx<0) return null; const [card] = from.cards.splice(idx,1); to.cards.push(card); return card; }

  // Timer helpers
  const timerIntervals = {};
  function startTimer(cardId){ const found = findCard(cardId); if(!found.card) return; const card = found.card; if(card.running) return; card.running = true; card.lastStart = Date.now(); saveState(); timerIntervals[cardId] = setInterval(()=>{
      card.timer = Math.floor((card.timer || 0) + (Date.now() - card.lastStart)/1000);
      card.lastStart = Date.now(); saveState(); render();
    }, 1000);
  }
  function stopTimer(cardId){ const found = findCard(cardId); if(!found.card) return; const card = found.card; if(!card.running) return; card.running = false; if(card.lastStart){ card.timer = Math.floor((card.timer||0) + (Date.now() - card.lastStart)/1000); card.lastStart = null; } clearInterval(timerIntervals[cardId]); delete timerIntervals[cardId]; saveState(); render(); }

  function formatSeconds(sec){ sec = Number(sec||0); const h = String(Math.floor(sec/3600)).padStart(2,'0'); const m = String(Math.floor((sec%3600)/60)).padStart(2,'0'); const s = String(sec%60).padStart(2,'0'); return `${h}:${m}:${s}`; }

  function escapeHtml(str){ return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  // Simple drag support for cards created dynamically: use event delegation on lists container
  listsContainer.addEventListener('dragstart', (e)=>{
    const card = e.target.closest('.card'); if(!card) return; e.dataTransfer.setData('text/plain', JSON.stringify({cardId: card.dataset.cardId, fromList: card.closest('.list').dataset.listId}));
  });

  // Back button
  backBtn.addEventListener('click', ()=> window.history.back());

  // Add list
  addListBtn.addEventListener('click', ()=>{
    const name = prompt('Nome da lista', 'Nova Lista'); if(!name) return; state.push({id:genId(), title:name, cards:[]}); saveState(); render();
  });

  // Init render
  render();

});

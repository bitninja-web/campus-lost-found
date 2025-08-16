// // Index page logic
// (function(){
//   const yearEl = document.getElementById('year');
//   if (yearEl) yearEl.textContent = new Date().getFullYear();

//   const qs = (s, r=document) => r.querySelector(s);
//   const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

//   const listingsEl = qs('#listings');
//   const emptyStateEl = qs('#emptyState');
//   const statsEl = qs('#stats');

//   const searchInput = qs('#searchInput');
//   const categorySelect = qs('#categorySelect');
//   const statusSelect = qs('#statusSelect');
//   const sortSelect = qs('#sortSelect');
//   const clearBtn = qs('#clearFilters');

//   const modal = qs('#itemModal');
//   const modalTitle = qs('#modalTitle');
//   const modalImage = qs('#modalImage');
//   const modalStatus = qs('#modalStatus');
//   const modalCategory = qs('#modalCategory');
//   const modalLocation = qs('#modalLocation');
//   const modalContact = qs('#modalContact');
//   const modalDate = qs('#modalDate');
//   const modalDescription = qs('#modalDescription');
//   const deleteBtn = qs('#deleteBtn');

//   let currentViewItems = [];
//   let selectedItemId = null;

//   // Populate category options
//   function populateCategories() {
//     const cats = StorageAPI.categories();
//     categorySelect.innerHTML = '<option value="">All</option>' + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
//   }

//   function getFilters() {
//     return {
//       q: (searchInput?.value || '').trim().toLowerCase(),
//       category: categorySelect?.value || '',
//       status: statusSelect?.value || '',
//       sort: sortSelect?.value || 'newest'
//     };
//   }

//   function applyFilters() {
//     const { q, category, status, sort } = getFilters();
//     let items = StorageAPI.getAll();

//     if (q) {
//       items = items.filter(i =>
//         [i.title, i.description, i.location].some(f => (f || '').toLowerCase().includes(q))
//       );
//     }
//     if (category) items = items.filter(i => i.category === category);
//     if (status) items = items.filter(i => i.status === status);

//     // sort
//     switch (sort) {
//       case 'newest': items.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)); break;
//       case 'oldest': items.sort((a,b)=> new Date(a.created_at)-new Date(b.created_at)); break;
//       case 'az': items.sort((a,b)=> a.title.localeCompare(b.title)); break;
//       case 'za': items.sort((a,b)=> b.title.localeCompare(a.title)); break;
//     }

//     currentViewItems = items;
//     renderStats(items);
//     renderList(items);
//   }

//   function renderStats(items){
//     if (!statsEl) return;
//     const total = items.length;
//     const lost = items.filter(i=>i.status==='lost').length;
//     const found = items.filter(i=>i.status==='found').length;
//     statsEl.innerHTML = `
//       <span class="chip">Total: ${total}</span>
//       <span class="chip">Lost: ${lost}</span>
//       <span class="chip">Found: ${found}</span>
//     `;
//   }

//   function renderList(items){
//     if (!listingsEl) return;
//     listingsEl.innerHTML = '';
//     if (!items.length) {
//       emptyStateEl?.removeAttribute('hidden');
//       return;
//     }
//     emptyStateEl?.setAttribute('hidden','');

//     for (const item of items) {
//       const card = document.createElement('article');
//       card.className = 'card item';

//       const img = document.createElement('img');
//       img.className = 'thumb';
//       img.alt = item.title || 'Item image';
//       img.src = item.image || 'assets/placeholder.png';

//       const content = document.createElement('div');
//       content.className = 'content';

//       const title = document.createElement('div');
//       title.className = 'title';
//       title.textContent = item.title;

//       const meta = document.createElement('div');
//       meta.className = 'meta';
//       meta.innerHTML = `
//         <span class="badge ${item.status === 'lost' ? 'status-lost' : 'status-found'}">${escapeHtml(item.status)}</span>
//         <span class="badge">${escapeHtml(item.category)}</span>
//         <span class="badge">📍 ${escapeHtml(item.location)}</span>
//       `;

//       const desc = document.createElement('p');
//       desc.className = 'desc';
//       desc.textContent = item.description;

//       const foot = document.createElement('div');
//       foot.className = 'footer';
//       const date = new Date(item.created_at);
//       foot.innerHTML = `
//         <span class="badge">${date.toLocaleString()}</span>
//         <a class="link" href="javascript:void(0)">Quick view</a>
//       `;

//       foot.querySelector('.link').addEventListener('click', ()=> openModal(item.id));

//       content.append(title, meta, desc, foot);
//       card.append(img, content);
//       listingsEl.append(card);
//     }
//   }

//   function openModal(id){
//     const item = StorageAPI.getById(id);
//     if (!item) return;
//     selectedItemId = id;

//     modalTitle.textContent = item.title;
//     modalImage.src = item.image || 'assets/placeholder.png';
//     modalStatus.textContent = item.status;
//     modalCategory.textContent = item.category;
//     modalLocation.textContent = item.location;
//     modalContact.textContent = item.contact;
//     modalDate.textContent = new Date(item.created_at).toLocaleString();
//     modalDescription.textContent = item.description;

//     deleteBtn.onclick = () => {
//       if (confirm('Delete this item?')) {
//         StorageAPI.removeById(item.id);
//         applyFilters();
//         modal.close();
//       }
//     };

//     modal.showModal();
//   }

//   function escapeHtml(str=''){
//     return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
//   }

//   function bindEvents(){
//     if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 200));
//     if (categorySelect) categorySelect.addEventListener('change', applyFilters);
//     if (statusSelect) statusSelect.addEventListener('change', applyFilters);
//     if (sortSelect) sortSelect.addEventListener('change', applyFilters);
//     if (clearBtn) clearBtn.addEventListener('click', () => {
//       searchInput.value = '';
//       categorySelect.value = '';
//       statusSelect.value = '';
//       sortSelect.value = 'newest';
//       applyFilters();
//     });
//   }

//   function debounce(fn, delay){
//     let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); };
//   }

//   // init only on index.html (elements exist)
//   if (listingsEl) {
//     populateCategories();
//     bindEvents();
//     applyFilters();
//   }
// })();

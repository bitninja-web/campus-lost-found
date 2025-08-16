// // Simple LocalStorage API + seed data
// const StorageAPI = (() => {
//   const KEY = 'clf_items';

//   function getAll() {
//     const raw = localStorage.getItem(KEY);
//     return raw ? JSON.parse(raw) : [];
//   }

//   function saveAll(items) {
//     localStorage.setItem(KEY, JSON.stringify(items));
//   }

//   function addItem(item) {
//     const items = getAll();
//     items.unshift(item); // newest first
//     saveAll(items);
//   }

//   function getById(id) {
//     return getAll().find(i => i.id === id);
//   }

//   function removeById(id) {
//     const items = getAll().filter(i => i.id !== id);
//     saveAll(items);
//   }

//   function categories() {
//     const set = new Set(getAll().map(i => i.category).filter(Boolean));
//     return Array.from(set).sort((a,b)=>a.localeCompare(b));
//   }

//   function seedIfEmpty() {
//     if (getAll().length) return;
//     const demo = [
//       {
//         id: (Date.now()-300000).toString(),
//         title: 'Scientific Calculator (Casio FX-991ES)',
//         description: 'Black calculator with a small scratch on the cover. Last seen after Math Lab.',
//         category: 'Electronics',
//         location: 'Physics Block - Room 203',
//         contact: 'adarsh@example.com',
//         status: 'lost',
//         image: '',
//         created_at: new Date(Date.now()-300000).toISOString()
//       },
//       {
//         id: (Date.now()-200000).toString(),
//         title: 'Blue Water Bottle',
//         description: '1L bottle, sticker of mountains. Found near the library steps.',
//         category: 'Accessories',
//         location: 'Central Library',
//         contact: '+91-90000-12345',
//         status: 'found',
//         image: '',
//         created_at: new Date(Date.now()-200000).toISOString()
//       },
//       {
//         id: (Date.now()-100000).toString(),
//         title: 'Discrete Mathematics Notes',
//         description: 'Bundle of A4 sheets clipped together, name “K. Gupta” on first page.',
//         category: 'Documents',
//         location: 'CSE Block, 2nd floor corridor',
//         contact: 'kgupta@example.com',
//         status: 'lost',
//         image: '',
//         created_at: new Date(Date.now()-100000).toISOString()
//       }
//     ];
//     saveAll(demo);
//   }

//   return { getAll, saveAll, addItem, getById, removeById, categories, seedIfEmpty };
// })();

// (() => {
//   // one-time seed for first load in this browser
//   StorageAPI.seedIfEmpty();
// })();

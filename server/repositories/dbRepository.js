import { useStorage } from 'nitro/storage';

const KEY = 'db';
const fresh = () => ({
  people: [1, 2, 3, 4, 5].map((id) => ({ id, name: '', photo: '' })),
  order: [1, 2, 3, 4, 5],
  swaps: [],
  reminders: {},
  auth: { residents: {} },
});
const store = () => useStorage('data');

async function read() {
  const v = await store().getItem(KEY);
  return { ...fresh(), ...(v || {}) };
}

let queue = Promise.resolve();
function update(mutator) {
  const run = queue.then(async () => {
    const db = await read();
    let dirty = false;
    try { return await mutator(db, () => { dirty = true; }); }
    finally { if (dirty) await store().setItem(KEY, db); }
  });
  queue = run.catch(() => {});
  return run;
}

export const dbRepository = { read, update };

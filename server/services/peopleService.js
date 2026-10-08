import { dbRepository as repo } from '../repositories/dbRepository.js';
import { AppError } from '../utils/errors.js';

export const updatePerson = (id, patch) =>
  repo.update((db, touch) => {
    const p = db.people.find((x) => x.id === id);
    if (!p) throw new AppError(404, 'Finnes ikke');
    if (typeof patch.name === 'string') p.name = patch.name.trim().slice(0, 40);
    if (typeof patch.photo === 'string' && patch.photo.length < 200000) p.photo = patch.photo;
    touch();
    return p;
  });

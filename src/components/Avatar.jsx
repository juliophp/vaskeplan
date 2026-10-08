import { avatarSrc } from '@shared/rota.js';
export default function Avatar({ person, size = 40 }) {
  return <img className="avatar" src={avatarSrc(person)} style={{ width: size, height: size }} alt="" />;
}

import { useRef, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import Avatar from '../components/Avatar.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { useStateMutations } from '../hooks/useStateMutations.js';
import { resizePhoto } from '../lib/photo.js';
import Varsler from '../components/Varsler.jsx';

function Resident({ p }) {
  const { updatePerson } = useStateMutations();
  const [name, setName] = useState(p.name);
  const file = useRef(null);
  const onFile = async (e) => { const f=e.target.files[0]; if(f) await updatePerson.mutateAsync({id:p.id,patch:{photo:await resizePhoto(f)}}); };
  return <div className="p"><a href="#" onClick={(e)=>{e.preventDefault();file.current.click();}}><Avatar person={p} size={64}/></a><input ref={file} type="file" accept="image/*" hidden onChange={onFile}/><span className="room">Rom {p.id}</span><input value={name} placeholder="Navn" onChange={(e)=>setName(e.target.value)} onBlur={()=>name!==p.name&&updatePerson.mutate({id:p.id,patch:{name}})}/></div>;
}

export default function Beboere() {
  const { data: state } = useSuspenseQuery(stateQueryOptions);
  return <><section className="card"><h1>Beboere</h1><p className="s">Navn og bilder deles med alle i leiligheten. Trykk på bildet for å bytte det.</p><div className="people">{state.people.map((p)=><Resident key={p.id+':'+p.name+':'+p.photo.length} p={p}/>)}</div></section><Varsler/></>;
}

import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClientOnly } from '@tanstack/react-router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import nb from '@fullcalendar/core/locales/nb';
import Avatar from '../components/Avatar.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { addDays, addWeeks, displayName, iso, thisSaturday, whoAt } from '@shared/rota.js';

export function CalendarCard({ state, className = 'card', title }) {
  const events = useMemo(() => { const start=new Date(2026,0,3), cur=thisSaturday().getTime(); return Array.from({length:200},(_,i)=>{const d=addWeeks(start,i); return {start:iso(d),end:iso(addDays(d,2)),allDay:true,extendedProps:{p:whoAt(state,d)},classNames:d.getTime()===cur?['now']:[]};}); }, [state]);
  return <section className={className}>{title && <h2>{title}</h2>}<ClientOnly fallback={<p className="s">Laster kalender …</p>}><FullCalendar plugins={[dayGridPlugin]} locale={nb} firstDay={1} height="auto" initialView="dayGridMonth" headerToolbar={{left:'prev,next today',center:'title',right:''}} events={events} eventContent={(arg)=>{const p=arg.event.extendedProps.p; return <div className="ev"><Avatar person={p} size={28}/><div><b>{displayName(p)}</b><span>Rom {p.id}</span></div></div>;}} /></ClientOnly></section>;
}

export default function Kalender() {
  const { data: state } = useSuspenseQuery(stateQueryOptions);
  return <CalendarCard state={state} />;
}

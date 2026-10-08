import { getConfig } from '../utils/config.js';

// Sender tekst til WhatsApp-gruppen (Groups API) og/eller en webhook (Make, Zapier, n8n).
export async function sendAll(text) {
  const cfg = getConfig(), sent = [], errors = [];
  if (cfg.waOn) {
    try {
      const r = await fetch(`https://graph.facebook.com/${cfg.wa.version}/${cfg.wa.phone}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.wa.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'group', to: cfg.wa.group, type: 'text', text: { body: text } }),
      });
      if (!r.ok) throw new Error(`WhatsApp ${r.status}: ${(await r.text()).slice(0, 200)}`);
      sent.push('whatsapp');
    } catch (e) { errors.push(e.message); }
  }
  if (cfg.hook) {
    try {
      const r = await fetch(cfg.hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!r.ok) throw new Error(`Webhook ${r.status}`);
      sent.push('webhook');
    } catch (e) { errors.push(e.message); }
  }
  return { sent, errors };
}

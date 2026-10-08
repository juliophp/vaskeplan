// Leses ved hvert kall (ikke ved bygging), slik at miljøvariabler i Azure gjelder.
export function getConfig() {
  const e = process.env;
  const wa = { token: e.WHATSAPP_TOKEN, phone: e.WHATSAPP_PHONE_NUMBER_ID, group: e.WHATSAPP_GROUP_ID, version: e.WHATSAPP_API_VERSION || 'v23.0' };
  return {
    days: (e.REMIND_DAYS || '2,1').split(',').map(Number).filter(Boolean), // dager før lørdag
    hour: +(e.REMIND_HOUR || 18), // klokkeslett i Oslo-tid
    appUrl: e.APP_URL || '',
    wa,
    waOn: !!(wa.token && wa.phone && wa.group),
    hook: e.NOTIFY_WEBHOOK_URL || '',
    dataDir: e.DATA_DIR || './.data',
  };
}

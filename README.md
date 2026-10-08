# Vaskeplan (TanStack Start + Nitro)

Krever Node 22.12+.

    npm install
    npm run dev      # vite dev (SSR + HMR)
    npm run build    # vite build -> .output/
    npm start        # node .output/server/index.mjs

Se README_TANSTACK_START.md for arkitekturen.

## Struktur

    shared/                 rene funksjoner (turnus, datoer) – klient og server
    src/
      routes/                 filbaserte ruter (__root = HTML-skall, _app = layout med meny, se = gjestevisning)
      functions/              createServerFn – grensen mot serveren
      queries/ hooks/         TanStack Query, mutasjoner, «me»
      views/ components/      UI
    server/                 Nitro
      services/               forretningslogikk (bytte, frist, restart, påminnelser)
      repositories/           datatilgang (Nitro storage)
      integrations/           WhatsApp / webhook
      plugins/                01.storage (monterer «data»), 02.scheduler (minuttjobb)
      utils/                  klokke (Oslo-tid), config, feil

Avhengighetsretning: routes -> functions -> services -> repositories / integrations.

## Viktig
- Ikke ha en `index.html` i rotmappen. Nitro v3 bruker den som renderer og serverer den for alle
  forespørsler som ikke matcher en rute – også `/_serverFn/*`. Start lager HTML-en selv fra `__root.tsx`.
- Gjestevisning: `/se`.

## Regler
- Bytte krever at mottakeren godtar. Frist for å be om bytte: fredag 23:55 (Oslo-tid).
  Fra da til og med søndag er bytte og «start på nytt» låst, og ventende forespørsler utløper.

## Miljøvariabler (alle valgfrie)

    DATA_DIR=/home/data     # hvor data lagres (Azure: vedvarende /home)
    APP_URL=https://...     # tas med i påminnelsene
    REMIND_DAYS=2,1         # dager før lørdag
    REMIND_HOUR=18          # klokkeslett (Oslo)
    WHATSAPP_TOKEN= WHATSAPP_PHONE_NUMBER_ID= WHATSAPP_GROUP_ID=   # Groups API
    NOTIFY_WEBHOOK_URL=     # mottar POST {"text": "..."}

## Azure App Service (Linux)
Node 22+, Always On, én instans. Startkommando: `node .output/server/index.mjs`.
Deploy mappen `.output/`. Sett `DATA_DIR=/home/data`.

## Autentisering

- `/se` er offentlig gjestevisning og er appens standardvisning.
- `/login` lar brukeren velge **Beboer** eller **Admin**.
- Beboere oppretter sitt eget passord første gang og logger deretter inn med rom + passord.
- Admin logger inn med `ADMIN_PASSWORD`. `APP_PASSWORD` støttes fortsatt som bakoverkompatibelt fallback-navn.
- Sessionen er en HTTP-only cookie. Resident-passord lagres som scrypt-hasher i den vedvarende appdatabasen og sendes aldri til klienten.
- «Start raden på nytt» vises bare for admin, og serverfunksjonen krever admin-rolle i tillegg til frontend-sjekken.

Sett disse miljøvariablene på serveren:

    ADMIN_PASSWORD=...
    SESSION_SECRET=...

`SESSION_SECRET` må være minst 32 tegn. I produksjon brukes Secure-cookie automatisk.

### Viktig om første gangs oppsett

Et rom kan opprette passord én gang. Hvis et rom allerede har passord, kan det ikke overskrives fra innloggingssiden. Et glemt passord må derfor håndteres av admin/ved å nullstille resident-credentials i dataene.

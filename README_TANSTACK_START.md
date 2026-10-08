# Vaskeplan – TanStack Start architecture

The application uses TanStack Start + Nitro SSR + TanStack Query.

## Data flow

React component -> TanStack Query -> `createServerFn()` -> service -> repository -> Nitro KV.

There is no separate API server and the application no longer uses the old `/api/*` routes for its UI data flow.

### Server functions

`src/functions/state.functions.js` is the server boundary. It exposes typed RPC-style functions such as `getStateFn`, `updatePersonFn`, `requestSwapFn`, and `testReminderFn`.

### TanStack Query

`src/queries/state.js` defines the query contracts. The application uses `useSuspenseQuery` so state can participate in TanStack Start SSR and hydration.

### Client state

The selected resident (`me`) is browser-only state stored in `localStorage` and exposed through `src/hooks/useMe.jsx`. It is intentionally not part of the server state cache.

### Server state

Business logic remains in `server/services` and persistence remains in `server/repositories`. These layers are not coupled to React components.

### Nitro

Nitro is the runtime/build layer used by TanStack Start. `serverDir` is configured explicitly and the persistent local filesystem KV mount is named `data`. `DATA_DIR` can point to a persistent location such as `/home/data` in Azure App Service.

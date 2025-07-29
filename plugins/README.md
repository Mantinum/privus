# Plugin architecture

Each plugin lives in its own folder under `plugins/` and follows this
convention:

- `plugin.json` defines metadata with at least the following fields:
  - `slug`: unique identifier
  - `name`: display name
  - `description`: short description
  - `permissions`: list of permissions such as `webRequest` or `db`
- `main.py` exposes a function `register(router)` which receives the NLP
  router. This function can register intents using
  `router.add_intent(pattern, callback)` and optionally add FastAPI routes.
- `ui/` (optional) contains React components/pages for Next.js (App Router).

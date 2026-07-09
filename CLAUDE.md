# Mentionate — Auditor GEO/AEO (Sarauter)

App de un solo archivo (`index.html`, vanilla HTML/CSS/JS, sin build) + funciones serverless de
Cloudflare Pages. Ver `ESTADO.md` para el progreso y los pendientes actuales.

## Reglas de trabajo

- **Nunca trabajes ni hagas commit directo en `main`.** Usa una rama (`feat/...`, `fix/...`).
- **Nunca hagas `git push` ni abras un PR sin que el usuario lo pida explícitamente.**
- **Nunca subas secretos al repo** (`RESEND_API_KEY`, `OPTIMIZER_PASSWORD`, etc.). Van como
  Cloudflare secrets en producción y en `.dev.vars` en local (ya está en `.gitignore`).
- **Antes de decir que algo "funciona", pruébalo de verdad** con `npm run dev`
  (`wrangler pages dev`) y confírmalo en el navegador — no basta con que el código "se vea bien".
  Las Pages Functions (`/api/audit`, `/api/lead`, `/api/unlock`) no funcionan abriendo
  `index.html` como archivo suelto.
- Antes de tocar el código, revisa **`ESTADO.md`** para saber qué está hecho y qué falta.

## Decisiones de producto ya tomadas (no reabrir sin que el usuario lo pida)

- Nombre de la herramienta: **Mentionate**.
- Dominio de ejemplo en la auditoría: **sarauter.com** (no kstudio.es).
- Acceso al optimizador: **login con contraseña verificada en servidor** (`/api/unlock`), no una
  URL secreta ni credenciales en el cliente.
- Público solo ve el **diagnóstico**; el constructor/optimizador queda cerrado tras el login.
- Los leads (formulario de contacto) se envían por email a **marketing@sarauter.com** vía Resend,
  con webhook y Workers KV como alternativas.
- No hay cookies de analítica/marketing → no hace falta banner de cookies mientras siga así.
- Los datos legales (titular, NIF, domicilio, email) viven **solo** en `legal-info.js`, no
  repetidos en cada página legal.

## Estilo y código

- Reutiliza los tokens CSS, componentes y utilidades ya existentes (`--purple`, `.btn`,
  `.card`, etc.) — no introduzcas un sistema de diseño paralelo.
- **Todo texto nuevo debe traducirse a ES y EN** (objeto `T` en `index.html`).
- No rompas: autoguardado (`localStorage`), exports (JSON/CSV/.md/FAQ schema), ni el flujo de
  construcción existente.
- Las páginas legales (`politica-de-privacidad.html`, `aviso-legal.html`,
  `politica-de-cookies.html`) son **borradores**, no asesoría legal — no lo olvides al editarlas.

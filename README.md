# Constructor + Auditor GEO/AEO

LEGACY #1

Herramienta bilingüe (ES/EN) para **auditar** y **construir** contenido optimizado para
**GEO** (Generative Engine Optimization) y **AEO** (Answer Engine Optimization) — es decir,
para que motores como ChatGPT, Perplexity y Google AI Overviews **citen tu sitio**.

- **Auditor:** pega una URL y obtén un diagnóstico automático (scores + carencias priorizadas).
- **Constructor:** flujo guiado paso a paso (Zona Cero, tripletas causales, tabla comparativa,
  E-E-A-T, FAQ schema, protocolo VARC y motor de prompts por persona).

Autoguardado en `localStorage`, i18n ES/EN, y exports (Copy Schema, `.md`, CSV, JSON).

## Arquitectura

| Pieza | Descripción |
|-------|-------------|
| `index.html` | App completa: HTML + CSS + JS vanilla, sin build. Todo el estado vive en `localStorage`. |
| `functions/api/audit.js` | **Cloudflare Pages Function** que audita una URL desde el servidor (evita el CORS del navegador). |

## Auditoría por URL — cómo funciona

El navegador **no puede** hacer `fetch` de webs externas (CORS), así que la auditoría corre en
una **Pages Function** de Cloudflare. La función:

1. Recibe `POST /api/audit` con `{ "url": "kstudio.es" }`.
2. Descarga (con `fetch` nativo del runtime, User-Agent identificable, timeout y límite de bytes):
   la home, `robots.txt`, `/llms.txt` y el `sitemap`.
3. Analiza: acceso de bots IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…), JSON-LD
   (`Organization`, `Article`, `FAQPage`), presencia de autor y fecha, estructura de respuesta
   directa (sujeto+verbo+predicado, ≤40 palabras), datos/métricas verificables y bloque FAQ.
4. Devuelve `{ scores: { content, distribution, geo }, findings: [...] }` — cada carencia
   (`finding`) trae `severity` y una `section` que enlaza con la sección del constructor que la
   resuelve (puente auditoría → constructor).

Errores contemplados: URL inválida, timeout, dominio inexistente, sitio que bloquea el bot,
ausencia de `robots.txt`/`llms.txt`. La UI nunca queda colgada; muestra mensajes claros.

## Acceso público: solo diagnóstico (el constructor está cerrado)

La herramienta es un **funnel público**: cualquiera puede **auditar** una URL y ver su
diagnóstico (score + carencias), pero el **constructor / módulo de optimización está cerrado**.

- Al pulsar cualquier acción de optimizar (la tarjeta "Optimizar con Sarauter", "Resolver" en una
  carencia, "Optimizar con Sarauter →" tras el diagnóstico) se abre un **formulario de contacto**
  (nombre, apellido, email — mínimos obligatorios) en lugar de entrar al constructor.
- En modo público se ocultan el conmutador de modos, la navegación lateral y el dashboard del
  constructor.

### Acceso del propietario (login de equipo)

El optimizador/constructor se abre con un **login** ("Acceso equipo", enlace discreto en el pie).
La contraseña se verifica **en el servidor** (`/api/unlock`) contra un secret de Cloudflare, así
que no está en el código ni en el repo:

```bash
wrangler pages secret put OPTIMIZER_PASSWORD   # te pide la contraseña
# (opcional) también un usuario:  añade OPTIMIZER_USER en wrangler.toml
```

Al entrar correctamente, la herramienta desbloquea el constructor en ese navegador; el botón
**"Salir"** (🔒) vuelve a bloquearlo.

> **Nota de seguridad honesta:** como toda la app vive en un único `index.html`, el login es una
> puerta de acceso (la contraseña se valida en servidor y no aparece en el código), pero el
> *código* del constructor sí es visible en el navegador. Para aislamiento real frente a terceros,
> la mejora recomendada es **Cloudflare Access** (Zero Trust): protege una ruta con login por
> email (OTP) sin escribir código, gratis hasta 50 usuarios. Se puede combinar con esta versión.

## Captación de leads (`/api/lead`) — email a marketing@sarauter.com

El formulario de contacto hace `POST /api/lead` (nombre, apellido, email, empresa y mensaje
opcionales) e incluye la URL auditada, el score y la intención. La entrega se configura con
variables/bindings **opcionales** (sin secrets en el repo); se intentan en orden y las que
funcionen marcan `delivered:true`:

1. **Email vía Resend** — define el secret `RESEND_API_KEY`. Envía a `LEAD_TO`
   (por defecto **`marketing@sarauter.com`**) desde `LEAD_FROM` (un remitente verificado en Resend).
   Configúralo con `wrangler pages secret put RESEND_API_KEY` o en el dashboard (Encrypt).
2. **Webhook** — `LEAD_WEBHOOK_URL` (Slack, Make, Zapier, n8n, Google Apps Script…).
3. **Workers KV** — binding `LEADS` para persistir cada lead.

Si no se configura nada, la función valida y acepta el lead (el usuario ve el agradecimiento) y
lo registra en logs con `delivered:false`. **Para recibir el email en marketing@sarauter.com,
configura `RESEND_API_KEY`** (3 min: crea cuenta en resend.com, verifica el dominio sarauter.com,
genera la API key).

## Cumplimiento legal (GDPR / LOPDGDD)

El formulario recoge datos personales (nombre, email), así que incluye:

- **Casilla de consentimiento obligatoria** (sin marcar por defecto) enlazada a la Política de
  Privacidad. Se valida en cliente y servidor (`/api/lead` rechaza sin consentimiento) y el
  consentimiento queda registrado en el lead.
- **Enlaces legales** en el pie: Aviso legal · Política de privacidad · Política de cookies.
  Ajusta las URLs a tus páginas reales con:

  ```html
  <script>
    window.PRIVACY_URL = "https://sarauter.com/politica-de-privacidad";
    window.LEGAL_URL   = "https://sarauter.com/aviso-legal";
    window.COOKIES_URL = "https://sarauter.com/politica-de-cookies";
  </script>
  ```

**Tú debes publicar** esas tres páginas (idealmente revisadas por un profesional legal). Datos a
declarar: responsable (Sarauter), finalidad (contacto comercial GEO/AEO), base jurídica
(consentimiento), encargados de tratamiento (**Cloudflare** hosting, **Resend** email), plazo de
conservación y derechos (acceso, rectificación, supresión, etc.).

**Cookies:** la herramienta **no** usa cookies de seguimiento ni analítica; solo `localStorage`
funcional (autoguardado, idioma). Ese uso está exento de consentimiento previo, así que **no
requiere banner de cookies** tal cual está. Si más adelante añades analítica o píxeles de
marketing, entonces sí necesitarás banner de consentimiento de cookies.

## Desarrollo local

Requiere Node 18+. La función serverless necesita el runtime de Cloudflare, así que **no**
sirvas `index.html` como archivo estático suelto (el `fetch` a `/api/audit` fallaría): usa
`wrangler pages dev`. La versión de wrangler está fijada en `package.json` y la configuración
de Pages (output dir + `compatibility_date`) en `wrangler.toml`.

```bash
npm install       # instala wrangler (fijado)
npm run dev       # wrangler pages dev -> http://localhost:8788
```

Prueba rápida de la API:

```bash
curl -X POST http://127.0.0.1:8788/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"kstudio.es"}'
```

## Despliega tu propia copia (auditoría en vivo, para cualquiera)

> ⚠️ La auditoría en vivo **no funciona** abriendo `index.html` como archivo suelto ni en un
> hosting estático normal: necesita las Pages Functions de Cloudflare. Despliega el repo en
> Cloudflare Pages (gratis) y tendrás una URL pública tipo `https://TU-PROYECTO.pages.dev`
> donde cualquiera puede auditar en tiempo real.

**Un clic** (crea una copia en tu cuenta de Cloudflare):

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Sarauter/constructor-auditor-GEO-AEO)

**Manual (3 pasos):** ver la sección siguiente.

## Despliegue en Cloudflare Pages

El repo es un sitio estático con una carpeta `functions/`, que es exactamente el formato que
**Cloudflare Pages** espera:

1. En Cloudflare → **Pages** → *Create project* → conecta este repositorio.
2. **Build command:** *(vacío)*. El `wrangler.toml` ya fija `pages_build_output_dir = "."` y el
   `compatibility_date`, así que no hay que configurar el output dir a mano.
3. Pages detecta `functions/api/audit.js` y publica automáticamente la ruta `/api/audit`.
   (También puedes desplegar por CLI con `npm run deploy`.)
4. La app llama a `/api/audit` en **relativo**, así que funciona sin configuración extra siempre
   que el sitio se sirva **como proyecto de Pages**.

### Si la herramienta vive en un subpath de otro hosting

Si `index.html` se embebe bajo `sarauter.com/constructor-auditor-GEO-AEO/` en un hosting que
**no** es Cloudflare Pages, la ruta `/api/audit` no existirá ahí. En ese caso, despliega la
función en un proyecto Pages aparte y, antes de cargar la app, define la base del API:

```html
<script>window.AUDIT_API_BASE = "https://tu-proyecto.pages.dev";</script>
```

La app usará `https://tu-proyecto.pages.dev/api/audit`.

### Variables de entorno (todas opcionales — no hay secrets)

Configúralas en *Pages → Settings → Environment variables* para ajustar los valores por defecto:

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `AUDIT_USER_AGENT` | `SarauterGEOAuditBot/1.0 (+…)` | User-Agent con el que la función se identifica al auditar. |
| `AUDIT_TIMEOUT_MS` | `8000` | Timeout por petición (ms). |
| `AUDIT_MAX_BYTES` | `1500000` | Máximo de bytes leídos por documento. |
| `RESEND_API_KEY` (secret) | — | API key de Resend para enviar el email del lead. |
| `LEAD_TO` | `marketing@sarauter.com` | Destinatario del email de lead. |
| `LEAD_FROM` | `GEO Auditor <onboarding@resend.dev>` | Remitente (usa uno verificado en tu dominio para producción). |
| `LEAD_WEBHOOK_URL` | — | Webhook al que se reenvía cada lead (Slack/Make/Zapier/n8n…). |
| KV binding `LEADS` | — | Namespace de Workers KV donde persistir los leads (opcional). |

`RESEND_API_KEY` es la única credencial, y **no vive en el repo**: se guarda como secret en
Cloudflare. El resto tiene valores por defecto seguros.

# Estado del proyecto — Mentionate (Auditor GEO/AEO)

Repo local: `constructor-auditor-GEO-AEO` · Rama: `feat/auditor-geo-aeo-ux` · Hosting: Cloudflare Pages

## Qué es
App de un solo archivo (`index.html`, vanilla HTML/CSS/JS) + funciones serverless de Cloudflare.
Público: solo diagnóstico gratuito de una URL. El optimizador/constructor está cerrado tras login.

## Archivos clave
- `index.html` — toda la app (UI, i18n ES/EN, autoguardado en localStorage).
- `functions/api/audit.js` — audita una URL (bots IA, schema, FAQ, autoría…) y devuelve scores + carencias.
- `functions/api/lead.js` — recibe el formulario de contacto y envía email a marketing@sarauter.com (vía Resend).
- `functions/api/unlock.js` — verifica la contraseña de equipo en servidor (secret `OPTIMIZER_PASSWORD`).
- `legal-info.js` — datos legales (titular, NIF, domicilio, email, fecha) que se inyectan en las 3 páginas legales.
- `politica-de-privacidad.html`, `aviso-legal.html`, `politica-de-cookies.html` — páginas legales (borrador).
- `wrangler.toml`, `package.json` — config de Cloudflare Pages y versión fijada de wrangler.

## Cómo probar en local
```bash
npm install
npm run dev   # abre http://localhost:8788
```
Necesita un archivo `.dev.vars` (NO se sube a git) con, por ejemplo:
```
OPTIMIZER_PASSWORD=tu-contraseña-de-prueba
```

## Pendientes
1. ~~**Rellenar `titular`** en `legal-info.js`~~ ✅ HECHO — datos legales completos (titular: Andrea Saravia, NIF, domicilio con CP, email). Falta solo la revisión legal (ver punto 5).
2. **Subir el repo a GitHub** (por la web, método "Add files"): sube TODO excepto `node_modules/`, `.wrangler/`, `.dev.vars`, `.claude/`, `.DS_Store` (ya están en `.gitignore`).
3. **Desplegar en Cloudflare Pages** conectando el repo (build command vacío; Cloudflare detecta `wrangler.toml`).
4. **Configurar secretos en Cloudflare** (Pages → Settings → Variables, o `wrangler pages secret put`):
   - `OPTIMIZER_USER` — usuario del login de equipo (en local es `asaravia`, en `.dev.vars`).
   - `OPTIMIZER_PASSWORD` — contraseña para el login de equipo.
   - `RESEND_API_KEY` — para que los leads lleguen por email a marketing@sarauter.com.
   - (opcional) `LEAD_TO`, `LEAD_FROM`, `LEAD_WEBHOOK_URL`.
   ⚠ Ahora que el login usa usuario, hay que configurar **tanto `OPTIMIZER_USER` como `OPTIMIZER_PASSWORD`** en Cloudflare, o el login fallará en producción.
5. Revisar las 3 páginas legales con un profesional y marcar `reviewed: true` en `legal-info.js`.

## Decisiones ya tomadas (no volver a preguntar)
- Nombre de la herramienta: **Mentionate**.
- Ejemplo de auditoría: **sarauter.com** (no kstudio.es).
- El acceso al optimizador es por **login con contraseña server-side**, no por URL secreta.
- No hay cookies de analítica/marketing → no hace falta banner de cookies (sí lo habrá si se añade Analytics/Pixel en el futuro).

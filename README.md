# CV web — Raúl Eduardo Hernández Mendoza

Sitio estático (HTML5 + CSS3 + JavaScript puro) listo para GitHub Pages. Incluye modo claro/oscuro, navegación con scroll suave, sección **Formación Adicional** dinámica (desde `datos.json`) y formulario de contacto sin servidor (Web3Forms).

## 1. Estructura

```
cv_raul_hernandez/
├── index.html        → Estructura y contenido del CV
├── css/style.css     → Estilos (colores en variables :root)
├── js/script.js      → Tema, navegación, formación dinámica y formulario
├── datos.json        → Formación adicional (lo único que editas para agregar cursos)
├── assets/           → favicon.svg (y tu foto, si la agregas)
├── screenshots/      → Capturas de referencia (puedes borrarlas)
└── README.md
```

## 2. Verlo en local

`fetch()` no funciona abriendo el archivo con doble clic (`file://`). Usa un servidor local:

```bash
cd cv_raul_hernandez
python3 -m http.server 8080
```
Abre `http://localhost:8080` en tu navegador. (En VS Code también sirve la extensión *Live Server*.)

## 3. Conectar tu correo con Web3Forms (recomendado)

1. Entra a <https://web3forms.com> y escribe tu correo (`contactactame@proton.me`) en **"Create your Access Key"**.
2. Revisa tu bandeja (y spam): te llega la **Access Key** (formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. Abre `js/script.js` y en la primera línea de configuración reemplaza:
   ```js
   const WEB3FORMS_ACCESS_KEY = "TU_ACCESS_KEY_AQUI";
   ```
   por tu clave real.
4. Guarda, recarga el sitio, llena el formulario y presiona **Enviar**. Debe aparecer "¡Gracias! Tu mensaje se envió correctamente" y el correo llegará a tu bandeja en segundos.

> Mientras la clave sea `TU_ACCESS_KEY_AQUI`, el formulario muestra un aviso y un botón **"Abrir mi correo"** (mailto) con el asunto y el mensaje ya rellenados. La access key de Web3Forms puede ser pública: solo permite enviar correos a tu dirección.

> **Importante — destinatario:** en Web3Forms el correo de destino es el que usaste para generar la access key (no se puede cambiar desde el código). Para que los mensajes te lleguen a `contactactame@proton.me`, genera la clave con ESE correo. Recomendado además: en el panel de Web3Forms, en la sección de tu access key, configura **Allowed domains** = `routeroots.github.io` para que solo tu sitio pueda enviar con esa clave.

Incluye: validación (campos obligatorios, formato de correo), honeypot antispam (`botcheck`), aviso de privacidad y estados de *Enviando…*, éxito y error.

### Alternativa A — Formspree
1. Crea un formulario en <https://formspree.io> y copia su ID (`https://formspree.io/f/ABCDwxyz`).
2. En `js/script.js`, sustituye el bloque `fetch(...)` de Web3Forms por:
```js
const resp = await fetch("https://formspree.io/f/TU_ID_FORMSPREE", {
  method: "POST", body: datos, headers: { Accept: "application/json" }
});
const res = await resp.json().catch(() => ({}));
if (resp.ok) { /* éxito */ } else { throw new Error((res.errors || []).map(e => e.message).join(", ") || "Error"); }
```
   y cambia el `if (resp.ok && res.success)` por `if (resp.ok)`. Cambia también la comprobación del placeholder para que use tu ID.

### Alternativa B — EmailJS
1. En <https://www.emailjs.com> crea un *Email Service* y un *Template* con las variables `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`. Copia **Public Key**, **Service ID** y **Template ID**.
2. En `index.html`, antes de `<script src="js/script.js">`, añade:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>emailjs.init({ publicKey: "TU_PUBLIC_KEY" });</script>
```
3. En `js/script.js` sustituye el bloque `fetch(...)` por:
```js
await emailjs.sendForm("TU_SERVICE_ID", "TU_TEMPLATE_ID", form);
// si no lanza error, el envío fue exitoso
```

## 4. Publicar en GitHub Pages

1. En GitHub: **New repository**. Para la URL `https://TU_USUARIO.github.io/` nómbralo exactamente `TU_USUARIO.github.io`; con cualquier otro nombre (p. ej. `cv`) la URL será `https://TU_USUARIO.github.io/cv/`. Márcalo como **Public**.
2. Sube los archivos (que `index.html` quede en la raíz):
   - Web: **Add file → Upload files**, arrastra todo el contenido de la carpeta y **Commit changes**.
   - O por terminal:
     ```bash
     cd cv_raul_hernandez
     git init && git add . && git commit -m "CV web"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
     git push -u origin main
     ```
3. **Settings → Pages** → *Source*: **Deploy from a branch** → Branch **main**, carpeta **/ (root)** → **Save**.
4. En 1–2 minutos aparecerá la URL publicada en esa misma página.

## 5. Agregar formación (solo `datos.json`)

Cada elemento es un objeto; solo `titulo` es obligatorio. Pégalo dentro del arreglo de su categoría (no olvides la coma entre objetos):

| Categoría en el sitio | Arreglo en `datos.json` |
|---|---|
| Certificados / Constancias | `certificados` |
| Webinars | `webinars` |
| Conferencias | `conferencias` |
| Certificaciones Oficiales | `certificaciones` |
| Diplomados | `diplomados` |

```json
{
  "formacionAdicional": {
    "certificados": [
      { "titulo": "Curso nuevo", "institucion": "Plataforma", "fecha": "2026", "descripcion": "", "enlace": "" }
    ],
    "webinars": [
      { "titulo": "Webinar de Threat Hunting", "institucion": "Organizador", "fecha": "Oct 2026", "descripcion": "", "enlace": "" }
    ],
    "conferencias": [
      { "titulo": "Conferencia de Ciberseguridad", "institucion": "Evento", "fecha": "2026", "descripcion": "", "enlace": "" }
    ],
    "certificaciones": [
      { "titulo": "CompTIA Security+", "institucion": "CompTIA", "fecha": "2026", "descripcion": "", "enlace": "https://url-de-verificacion" }
    ]
  }
}
```
Los contadores, pestañas y tarjetas se actualizan solos; no toques HTML ni CSS. Si `enlace` empieza por `https://`, la tarjeta muestra "Ver ↗". Valida el archivo en <https://jsonlint.com> si algo deja de cargar (el sitio mostrará un aviso en vez de romperse). Las claves que empiezan con `_` (`_instrucciones`, `_ejemplo`) son solo documentación.

## 6. Personalización

- **Colores:** variables `--acento`, `--fondo`, `--texto`… en `:root` (claro) y `[data-tema="oscuro"]` de `css/style.css`.
- **Tipografía:** variable `--fuente`. Para Google Fonts, agrega su `<link>` en `<head>` y pon el nombre al inicio de `--fuente`.
- **Foto de perfil:** guarda `assets/foto.jpg` y en `index.html` reemplaza `<div class="avatar">RH</div>` por `<img src="assets/foto.jpg" alt="Foto de Raúl Eduardo Hernández Mendoza">` (y quita `aria-hidden="true"` del contenedor).
- **Textos del CV:** se editan directamente en `index.html`.

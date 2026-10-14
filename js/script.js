/* ==========================================================
   CONFIGURACIÓN DEL FORMULARIO DE CONTACTO (Web3Forms)
   1) Obtén tu access key gratis en https://web3forms.com con tu correo.
   2) Pégala aquí reemplazando "TU_ACCESS_KEY_AQUI".
   ========================================================== */
const WEB3FORMS_ACCESS_KEY = "TU_ACCESS_KEY_AQUI";
const EMAIL_CONTACTO = "contactactame@proton.me"; // usado en el plan B (mailto)
const RUTA_DATOS = "datos.json";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("anio").textContent = new Date().getFullYear();
  iniciarTema();
  iniciarMenu();
  iniciarScrollActivo();
  iniciarRevelar();
  cargarFormacion();
  iniciarFormulario();
});

/* ---------------- Tema claro / oscuro ---------------- */
function iniciarTema() {
  const btn = document.getElementById("temaBtn");
  const raiz = document.documentElement;
  const actualizarEtiqueta = () => {
    const oscuro = raiz.getAttribute("data-tema") === "oscuro";
    btn.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    btn.setAttribute("aria-pressed", String(oscuro));
  };
  actualizarEtiqueta();
  btn.addEventListener("click", () => {
    const nuevo = raiz.getAttribute("data-tema") === "oscuro" ? "claro" : "oscuro";
    raiz.setAttribute("data-tema", nuevo);
    try { localStorage.setItem("tema", nuevo); } catch (e) { /* sin almacenamiento */ }
    actualizarEtiqueta();
  });
  // Si el usuario nunca eligió, seguir los cambios del sistema
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
    let guardado = null;
    try { guardado = localStorage.getItem("tema"); } catch (err) {}
    if (!guardado) { raiz.setAttribute("data-tema", e.matches ? "oscuro" : "claro"); actualizarEtiqueta(); }
  });
}

/* ---------------- Menú móvil ---------------- */
function iniciarMenu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const cerrar = () => { menu.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Abrir menú"); };
  btn.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", String(abierto));
    btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrar));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
}

/* ---------------- Sección activa en la navegación ---------------- */
function iniciarScrollActivo() {
  const barra = document.getElementById("barra");
  const enlaces = [...document.querySelectorAll(".menu a")];
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const alHacerScroll = () => {
    barra.classList.toggle("con-sombra", window.scrollY > 10);
    const pos = window.scrollY + window.innerHeight * 0.35;
    let actual = null;
    secciones.forEach((s) => { if (s.offsetTop <= pos) actual = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) actual = secciones.at(-1)?.id;
    enlaces.forEach((a) => {
      const activo = a.getAttribute("href") === "#" + actual;
      a.classList.toggle("activo", activo);
      activo ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();
}

/* ---------------- Animaciones de aparición ---------------- */
let observador = null;
function iniciarRevelar() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".revelar").forEach((el) => el.classList.add("visible"));
    return;
  }
  observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observador.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".revelar").forEach((el) => observador.observe(el));
}

/* ==========================================================
   FORMACIÓN ADICIONAL (dinámica desde datos.json)
   Para agregar elementos edita SOLO datos.json.
   ========================================================== */
const CATEGORIAS = {
  certificados: "Certificados / Constancias",
  webinars: "Webinars",
  conferencias: "Conferencias",
  certificaciones: "Certificaciones Oficiales",
  diplomados: "Diplomados",
};
let datosFormacion = null;

async function cargarFormacion() {
  const cont = document.getElementById("formacionContenido");
  try {
    const resp = await fetch(RUTA_DATOS, { cache: "no-cache" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const json = await resp.json();
    const fa = json.formacionAdicional || {};
    datosFormacion = {};
    Object.keys(CATEGORIAS).forEach((cat) => {
      // Solo elementos válidos (objetos con "titulo"); se ignoran claves que empiezan con "_"
      datosFormacion[cat] = (Array.isArray(fa[cat]) ? fa[cat] : [])
        .filter((it) => it && typeof it === "object" && typeof it.titulo === "string" && it.titulo.trim());
    });
    actualizarContadores();
    iniciarFiltros();
    renderFormacion("todas");
  } catch (err) {
    console.warn("No se pudo cargar datos.json:", err);
    cont.innerHTML = `<div class="error-carga" role="alert">
      <strong>No se pudo cargar la formación adicional.</strong><br>
      Verifica que el archivo <code>datos.json</code> exista y tenga un formato JSON válido.
      Si abriste el sitio con doble clic (file://), sírvelo con un servidor local (ver README).</div>`;
  }
}

function actualizarContadores() {
  let total = 0;
  Object.keys(CATEGORIAS).forEach((cat) => {
    const n = datosFormacion[cat].length;
    total += n;
    document.querySelector(`[data-contador="${cat}"]`).textContent = n;
  });
  document.querySelector('[data-contador="todas"]').textContent = total;
}

function iniciarFiltros() {
  const botones = [...document.querySelectorAll("#filtros .filtro")];
  botones.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      botones.forEach((b) => { b.classList.toggle("activo", b === btn); b.setAttribute("aria-selected", String(b === btn)); b.tabIndex = b === btn ? 0 : -1; });
      renderFormacion(btn.dataset.cat);
    });
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const sig = botones[(i + (e.key === "ArrowRight" ? 1 : -1) + botones.length) % botones.length];
      sig.focus(); sig.click();
    });
  });
}

function escapar(txt) {
  return String(txt ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function tarjetaHTML(item, cat, i) {
  const enlace = /^https?:\/\//i.test(item.enlace || "")
    ? `<a href="${escapar(item.enlace)}" target="_blank" rel="noopener" aria-label="Ver credencial de ${escapar(item.titulo)} (nueva pestaña)">Ver ↗</a>` : "";
  return `<article class="tarjeta card-form" style="animation-delay:${Math.min(i, 12) * 30}ms">
      <span class="tipo">${CATEGORIAS[cat]}</span>
      <h4>${escapar(item.titulo)}</h4>
      ${item.institucion ? `<p class="inst">${escapar(item.institucion)}</p>` : ""}
      ${item.descripcion ? `<p class="desc">${escapar(item.descripcion)}</p>` : ""}
      <div class="pie-card"><span>${escapar(item.fecha || "")}</span>${enlace}</div>
    </article>`;
}

function grupoHTML(cat) {
  const items = datosFormacion[cat];
  const cuerpo = items.length
    ? `<div class="cards-formacion">${items.map((it, i) => tarjetaHTML(it, cat, i)).join("")}</div>`
    : `<p class="vacio">Aún no hay elementos en esta categoría.</p>`;
  return `<div class="grupo-cat"><h3>${CATEGORIAS[cat]} <span class="contador">${items.length}</span></h3>${cuerpo}</div>`;
}

function renderFormacion(filtro) {
  const cont = document.getElementById("formacionContenido");
  // En "Todas" se muestran primero las certificaciones oficiales
  const orden = filtro === "todas" ? ["certificaciones", "diplomados", "certificados", "webinars", "conferencias"] : [filtro];
  cont.innerHTML = orden.map(grupoHTML).join("");
}

/* ==========================================================
   FORMULARIO DE CONTACTO
   ========================================================== */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function iniciarFormulario() {
  const form = document.getElementById("formContacto");
  const btn = document.getElementById("btnEnviar");
  const estado = document.getElementById("estadoForm");
  const reglas = {
    nombreC: (v) => (v.trim().length >= 2 ? "" : "Escribe tu nombre (mínimo 2 caracteres)."),
    correoC: (v) => (!v.trim() ? "El correo es obligatorio." : REGEX_EMAIL.test(v.trim()) ? "" : "Escribe un correo válido, p. ej. nombre@dominio.com."),
    asuntoC: (v) => (v.trim().length >= 3 ? "" : "Escribe un asunto (mínimo 3 caracteres)."),
    mensajeC: (v) => (v.trim().length >= 10 ? "" : "El mensaje debe tener al menos 10 caracteres."),
    consentC: (_, el) => (el.checked ? "" : "Debes aceptar el aviso de privacidad."),
  };

  const validarCampo = (id) => {
    const el = document.getElementById(id);
    const msg = reglas[id](el.value, el);
    const campo = el.closest(".campo");
    campo.classList.toggle("invalido", !!msg);
    campo.classList.toggle("valido", !msg && el.type !== "checkbox");
    el.setAttribute("aria-invalid", String(!!msg));
    document.getElementById("err-" + id).textContent = msg;
    return !msg;
  };

  Object.keys(reglas).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("blur", () => validarCampo(id));
    el.addEventListener(el.type === "checkbox" ? "change" : "input", () => {
      if (el.closest(".campo").classList.contains("invalido")) validarCampo(id);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    estado.className = "estado"; estado.innerHTML = "";
    const ok = Object.keys(reglas).map(validarCampo).every(Boolean);
    if (!ok) {
      form.querySelector(".invalido input, .invalido textarea")?.focus();
      return;
    }
    if (form.botcheck.checked) return; // honeypot: probablemente un bot

    const asunto = form.subject.value.trim();
    const cuerpo = `Nombre: ${form.name.value.trim()}\nCorreo: ${form.email.value.trim()}\n\n${form.message.value.trim()}`;

    // Plan B: la access key aún no se configuró
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "TU_ACCESS_KEY_AQUI") {
      const mailto = `mailto:${EMAIL_CONTACTO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      estado.className = "estado aviso";
      estado.innerHTML = `<strong>El formulario aún no está configurado.</strong><br>
        Mientras tanto, puedes enviar tu mensaje directamente desde tu aplicación de correo; ya está todo rellenado.<br>
        <a class="btn btn-primario" id="enlaceMailto" href="${mailto}">Abrir mi correo</a>`;
      return;
    }

    const datos = new FormData(form);
    datos.append("access_key", WEB3FORMS_ACCESS_KEY);
    datos.append("from_name", "CV Raúl Hernández");
    btn.disabled = true; btn.classList.add("enviando");
    btn.querySelector(".btn-texto").textContent = "Enviando...";
    try {
      const resp = await fetch("https://api.web3forms.com/submit", { method: "POST", body: datos, headers: { Accept: "application/json" } });
      const res = await resp.json().catch(() => ({}));
      if (resp.ok && res.success) {
        estado.className = "estado ok";
        estado.textContent = "¡Gracias! Tu mensaje se envió correctamente. Te responderé pronto.";
        form.reset();
        form.querySelectorAll(".campo").forEach((c) => c.classList.remove("valido", "invalido"));
      } else {
        throw new Error(res.message || "Respuesta no válida del servidor");
      }
    } catch (err) {
      console.warn("Error al enviar el formulario:", err);
      estado.className = "estado mal";
      estado.innerHTML = `No se pudo enviar el mensaje (${escapar(err.message)}). Intenta de nuevo o escríbeme a
        <a href="mailto:${EMAIL_CONTACTO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}">${EMAIL_CONTACTO}</a>.`;
    } finally {
      btn.disabled = false; btn.classList.remove("enviando");
      btn.querySelector(".btn-texto").textContent = "Enviar mensaje";
    }
  });
}

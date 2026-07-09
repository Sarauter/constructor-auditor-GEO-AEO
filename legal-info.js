/* ============================================================
   DATOS LEGALES — rellena esto UNA sola vez.
   Se inyectan automáticamente en las tres páginas legales
   (privacidad, aviso legal y cookies). No hace falta tocar el HTML.

   Cómo editar: cambia el texto entre comillas de cada línea.
   Deja las comillas. Ejemplo:
       titular: "Andrea Saravia Sauter",
   ============================================================ */
window.LEGAL_INFO = {
  titular:   "Andrea Saravia",   // tu nombre y apellidos o razón social legal
  nif:       "Y6964064T",   // NIF / DNI / NIE / CIF
  domicilio: "Calle General Pardiñas 44, 28001, Madrid",   // Dirección postal completa
  email:     "marketing@sarauter.com",   // Email de contacto legal
  fecha:     "8 de julio de 2026",   // Fecha de última actualización

  // Pon esto en true SOLO cuando un profesional legal haya revisado los textos.
  // Al ponerlo en true, desaparece el aviso naranja de "borrador".
  reviewed:  false
};

/* --- No hace falta tocar nada debajo de esta línea --- */
(function () {
  function apply() {
    var info = window.LEGAL_INFO || {};
    document.querySelectorAll('[data-legal]').forEach(function (el) {
      var k = el.getAttribute('data-legal');
      if (info[k] && String(info[k]).trim()) {
        el.textContent = info[k];
        el.classList.remove('ph'); // quita el resaltado amarillo
      }
    });
    var fields = ['titular', 'nif', 'domicilio', 'email', 'fecha'];
    var allFilled = fields.every(function (k) { return info[k] && String(info[k]).trim(); });
    if (allFilled) {
      document.querySelectorAll('.fill-note').forEach(function (n) { n.style.display = 'none'; });
    }
    if (info.reviewed === true) {
      document.querySelectorAll('.draft').forEach(function (b) { b.style.display = 'none'; });
    }
  }
  if (document.readyState !== 'loading') apply();
  else document.addEventListener('DOMContentLoaded', apply);
})();

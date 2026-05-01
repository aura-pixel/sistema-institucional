// js/bienvenida.js

const bienvenidaForm = document.getElementById("bienvenidaForm");
const confirmacion = document.getElementById("confirmacion");
const errorBienvenida = document.getElementById("errorMessage");

bienvenidaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!confirmacion.checked) {
    errorBienvenida.textContent =
      "Debes confirmar que tienes tu archivo PDF listo.";
    return;
  }

  errorBienvenida.textContent = "";

  // Siguiente pantalla
  window.location.href = "registro.html";
});
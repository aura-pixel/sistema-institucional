const documentosForm = document.getElementById("documentosForm");
const pdfFileInput = document.getElementById("pdfFile");
const fileName = document.getElementById("fileName");
const errorDocs = document.getElementById("errorMessage");
const confirmacionDocs = document.getElementById("confirmacionDocs");
const subirBtn = document.getElementById("subirBtn");

const numeroCuenta = localStorage.getItem("numeroCuenta");

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

if (!numeroCuenta) {
  window.location.href = "index.html";
}

/* =========================
   VALIDAR BOTÓN
========================= */
function validarFormularioDocumentos() {
  const file = pdfFileInput.files[0];

  const archivoValido =
    file &&
    file.type === "application/pdf" &&
    file.size <= MAX_FILE_SIZE;

  const confirmado =
    confirmacionDocs &&
    confirmacionDocs.checked;

  subirBtn.disabled = !(archivoValido && confirmado);
}

/* =========================
   CAMBIO DE ARCHIVO
========================= */
pdfFileInput.addEventListener("change", () => {
  errorDocs.textContent = "";

  const file = pdfFileInput.files[0];

  if (!file) {
    fileName.textContent = "Ningún archivo seleccionado";
    validarFormularioDocumentos();
    return;
  }

  // Validar formato
  if (file.type !== "application/pdf") {
    errorDocs.textContent =
      "Solo se permiten archivos en formato PDF.";

    pdfFileInput.value = "";
    fileName.textContent = "Ningún archivo seleccionado";

    validarFormularioDocumentos();
    return;
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    errorDocs.textContent =
      "El archivo supera el límite de 15MB.";

    pdfFileInput.value = "";
    fileName.textContent = "Ningún archivo seleccionado";

    validarFormularioDocumentos();
    return;
  }

  // Mostrar info
  fileName.innerHTML = `
    <strong>Archivo seleccionado:</strong> ${file.name}<br>
    <strong>Tamaño:</strong> ${(file.size / (1024 * 1024)).toFixed(2)} MB / 15 MB máximo
  `;

  validarFormularioDocumentos();
});

/* =========================
   CHECKBOX
========================= */
if (confirmacionDocs) {
  confirmacionDocs.addEventListener(
    "change",
    validarFormularioDocumentos
  );
}

/* =========================
   SUBMIT
========================= */
documentosForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = pdfFileInput.files[0];

  // Validación archivo
  if (!file) {
    errorDocs.textContent =
      "Debes seleccionar tu archivo PDF completo.";
    return;
  }

  // Validación checkbox
  if (confirmacionDocs && !confirmacionDocs.checked) {
    errorDocs.textContent =
      "Debes confirmar que tu archivo está completo.";
    return;
  }

  // Validación PDF
  if (file.type !== "application/pdf") {
    errorDocs.textContent =
      "Solo se permiten archivos en formato PDF.";
    return;
  }

  // Validación tamaño
  if (file.size > MAX_FILE_SIZE) {
    errorDocs.textContent =
      "El archivo supera el límite de 15MB.";
    return;
  }

  errorDocs.textContent = "Subiendo archivo...";
  subirBtn.disabled = true;

  const filePath = `${numeroCuenta}/${Date.now()}_${file.name}`;

  try {
    // Subir archivo
    const { error: uploadError } = await supabaseClient.storage
      .from("documentos-alumnos")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);

      errorDocs.textContent =
        "No se pudo subir el archivo.";

      validarFormularioDocumentos();
      return;
    }

    // URL firmada
    const { data: signedData, error: signedError } =
      await supabaseClient.storage
        .from("documentos-alumnos")
        .createSignedUrl(
          filePath,
          60 * 60 * 24 * 30
        );

    if (signedError || !signedData) {
      console.error(signedError);

      errorDocs.textContent =
        "No se pudo generar acceso al archivo.";

      validarFormularioDocumentos();
      return;
    }

    // Actualizar alumno
    const { error: updateError } =
      await supabaseClient
        .from("alumnos")
        .update({
          estado_registro: "completo",
          documento_url: signedData.signedUrl,
        })
        .eq("numero_cuenta", numeroCuenta);

    if (updateError) {
      console.error(updateError);

      errorDocs.textContent =
        "Archivo subido, pero no se pudo actualizar el expediente.";

      validarFormularioDocumentos();
      return;
    }

    // Guardar local
    localStorage.setItem(
      "nombreDocumento",
      file.name
    );

    // Redirigir
    window.location.href =
      "resumen.html";

  } catch (err) {
    console.error(err);

    errorDocs.textContent =
      "Ocurrió un error inesperado.";

    validarFormularioDocumentos();
  }
});

/* =========================
   ESTADO INICIAL
========================= */
subirBtn.disabled = true;
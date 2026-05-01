// js/resumen.js
// Mejora:
// ✔ Muestra materias
// ✔ Muestra documento
// ✔ Vista más profesional

const resumenContainer = document.getElementById("resumenContainer");

const numeroCuenta = localStorage.getItem("numeroCuenta");

if (!numeroCuenta) {
  window.location.href = "index.html";
}

// js/resumen.js

async function cargarResumen() {
  const { data, error } = await supabaseClient
    .from("alumnos")
    .select("*")
    .eq("numero_cuenta", numeroCuenta)
    .maybeSingle();

  if (error || !data) {
    resumenContainer.innerHTML =
      "<p>No se pudo cargar tu información.</p>";
    return;
  }

  // Consultar materias reales
  const { data: materiasDB, error: materiasError } =
    await supabaseClient
      .from("materias_alumno")
      .select("*")
      .eq("numero_cuenta", numeroCuenta);

  if (materiasError) {
    console.error(materiasError);
  }

  let materiasHTML = "";

  let totalCreditos = 0;

  (materiasDB || []).forEach((materia) => {
    totalCreditos += materia.creditos;

    materiasHTML += `
      <li>
        ${materia.clave} - ${materia.nombre}
        | Grupo: ${materia.grupo}
        | Subgrupo: ${materia.subgrupo}
        | Recursa: ${materia.recursa}
      </li>
    `;
  });

  // js/resumen.js
// MEJORA VISUAL DEL RENDER
// Dentro de resumenContainer.innerHTML = `...`
// REEMPLAZA por este formato:

resumenContainer.innerHTML = `
  <div class="resumen-block">
    <h3>Datos del Alumno</h3>

    <p><strong>Número de cuenta:</strong> ${data.numero_cuenta}</p>
    <p><strong>Nombre:</strong> ${data.nombre}</p>
    <p><strong>Semestre:</strong> ${data.semestre}</p>
    <p><strong>Periodo:</strong> ${data.periodo}</p>
    <p><strong>Estado:</strong> ${data.estado_registro}</p>
  </div>

  <div class="resumen-block">
    <h3>Créditos Totales</h3>

    <p><strong>Total:</strong> ${totalCreditos}</p>
  </div>

  <div class="resumen-block">
    <h3>Materias Seleccionadas</h3>

    <ul>
      ${materiasHTML || "<li>No hay materias registradas.</li>"}
    </ul>
  </div>

  <div class="resumen-block">
    <h3>Documento</h3>

    <p>
      ${
        localStorage.getItem("nombreDocumento") ||
        "Documento cargado correctamente"
      }
    </p>
  </div>
`;
}

cargarResumen();


const finalizarBtn = document.getElementById("finalizarBtn");

if (finalizarBtn) {
  finalizarBtn.addEventListener("click", () => {
    // Limpiar sesión temporal
    localStorage.removeItem("numeroCuenta");
    localStorage.removeItem("materiasSeleccionadas");
    localStorage.removeItem("creditosTotales");
    localStorage.removeItem("nombreDocumento");

    // Regresar al inicio
    window.location.href = "index.html";
  });
}

// js/resumen.js
// DESCARGA SIMPLE TXT
// AGREGA:

const descargarResumenBtn =
  document.getElementById("descargarResumenBtn");

if (descargarResumenBtn) {
  descargarResumenBtn.addEventListener(
    "click",
    () => {
      const contenido =
        resumenContainer.innerText;

      const blob = new Blob(
        [contenido],
        { type: "text/plain" }
      );

      const link =
        document.createElement("a");

      link.href =
        URL.createObjectURL(blob);

      link.download =
        "resumen_inscripcion.txt";

      link.click();
    }
  );
}
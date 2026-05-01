// js/dashboard-generaciones.js
// =========================
// FUNCIONES DE GENERACIONES
// Exportar por generación + Archivar
// =========================

const exportarGeneracionBtn = document.getElementById(
  "exportarGeneracionBtn"
);

const archivarGeneracionBtn = document.getElementById(
  "archivarGeneracionBtn"
);

/* =========================
   EXPORTAR GENERACIÓN
========================= */

const modalGeneraciones =
  document.getElementById("modalGeneraciones");

const listaGeneraciones =
  document.getElementById("listaGeneraciones");

const cancelarModalBtn =
  document.getElementById("cancelarModalBtn");

const confirmarExportacionBtn =
  document.getElementById("confirmarExportacionBtn");

let generacionesDisponibles = [];

if (
  typeof exportarGeneracionBtn !==
    "undefined" &&
  exportarGeneracionBtn
) {
  exportarGeneracionBtn.addEventListener(
    "click",
    async () => {
      try {
        const { data, error } =
          await supabaseClient
            .from("alumnos")
            .select("*")
            .eq(
              "estado_generacion",
              "activa"
            );

        if (
          error ||
          !data ||
          data.length === 0
        ) {
          mostrarModalMensaje(
  "No hay generaciones activas."
);
          return;
        }

        generacionesDisponibles = [
          ...new Set(
            data
              .map(
                (a) => a.generacion
              )
              .filter(Boolean)
          ),
        ];

        listaGeneraciones.innerHTML =
          "";

        generacionesDisponibles.forEach(
          (gen) => {
            listaGeneraciones.innerHTML += `
              <label class="generacion-option">
                <input
                  type="checkbox"
                  value="${gen}"
                />
                <span>${gen}</span>
              </label>
            `;
          }
        );

        modalGeneraciones.classList.remove(
          "hidden"
        );

      } catch (err) {
        console.error(err);
        mostrarModalMensaje(
  "Ocurrió un error al cargar generación."
);
      }
    }
  );
}

/* =========================
   CANCELAR MODAL
========================= */
if (cancelarModalBtn) {
  cancelarModalBtn.addEventListener(
    "click",
    () => {
      modalGeneraciones.classList.add(
        "hidden"
      );
    }
  );
}

/* =========================
   CONFIRMAR EXPORTACIÓN
========================= */
if (confirmarExportacionBtn) {
  confirmarExportacionBtn.addEventListener(
    "click",
    async () => {
      const seleccionadas = [
        ...document.querySelectorAll(
          "#listaGeneraciones input:checked"
        ),
      ].map((input) => input.value);

      if (seleccionadas.length === 0) {
        mostrarModalMensaje(
  "Selecciona al menos una generación."
);
        return;
      }

      try {
        const { data, error } =
          await supabaseClient
            .from("alumnos")
            .select("*")
            .in(
              "generacion",
              seleccionadas
            );

        if (error || !data) {
          mostrarModalMensaje(
  "No se pudo exportar."
);
          return;
        }

        // UNA SOLA GENERACIÓN = CSV NORMAL
        if (seleccionadas.length === 1) {
          const generacion =
            seleccionadas[0];

          const alumnosGeneracion =
            data.filter(
              (a) =>
                a.generacion ===
                generacion
            );

          descargarCSVGeneracion(
            alumnosGeneracion,
            generacion
          );
        }

        // VARIAS = ZIP
        else {
          const zip =
            new JSZip();

          seleccionadas.forEach(
            (generacion) => {
              const alumnosGeneracion =
                data.filter(
                  (a) =>
                    a.generacion ===
                    generacion
                );

              let csv =
                "NumeroCuenta,Nombre,Generacion,Semestre,Periodo,Creditos,EstadoAcademico,DocumentoURL\n";

              alumnosGeneracion.forEach(
                (alumno) => {
                  csv += `"${alumno.numero_cuenta || ""}","${alumno.nombre || ""}","${alumno.generacion || ""}","${alumno.semestre || ""}","${alumno.periodo || ""}","${alumno.creditos_acumulados || 0}","${alumno.estado_academico || ""}","${alumno.documento_url || ""}"\n`;
                }
              );

              zip.file(
                `generacion_${generacion}.csv`,
                csv
              );
            }
          );

          const contenido =
            await zip.generateAsync({
              type: "blob",
            });

          const link =
            document.createElement(
              "a"
            );

          link.href =
            URL.createObjectURL(
              contenido
            );

          link.download =
            "generaciones_exportadas.zip";

          document.body.appendChild(
            link
          );

          link.click();

          document.body.removeChild(
            link
          );
        }

        modalGeneraciones.classList.add(
          "hidden"
        );

      } catch (err) {
        console.error(err);
        mostrarModalMensaje(
  "Ocuriió un error."
);
      }
    }
  );
}

/* =========================
   DESCARGAR CSV GENERACIÓN
========================= */
function descargarCSVGeneracion(
  alumnos,
  generacion
) {
  let csv =
    "NumeroCuenta,Nombre,Generacion,Semestre,Periodo,Creditos,EstadoAcademico,DocumentoURL\n";

  alumnos.forEach((alumno) => {
    csv += `"${alumno.numero_cuenta || ""}","${alumno.nombre || ""}","${alumno.generacion || ""}","${alumno.semestre || ""}","${alumno.periodo || ""}","${alumno.creditos_acumulados || 0}","${alumno.estado_academico || ""}","${alumno.documento_url || ""}"\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    `generacion_${generacion}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================
   ARCHIVAR / DESARCHIVAR GENERACIÓN
========================= */

const modalArchivar =
  document.getElementById(
    "modalArchivar"
  );

const listaArchivar =
  document.getElementById(
    "listaArchivar"
  );

const listaDesarchivar =
  document.getElementById(
    "listaDesarchivar"
  );

const confirmarArchivarBtn =
  document.getElementById(
    "confirmarArchivarBtn"
  );

const cancelarArchivarBtn =
  document.getElementById(
    "cancelarArchivarBtn"
  );

if (archivarGeneracionBtn) {
  archivarGeneracionBtn.addEventListener(
    "click",
    async () => {
      try {
        const { data, error } =
          await supabaseClient
            .from("alumnos")
            .select(
              "generacion, estado_generacion"
            );

        if (
          error ||
          !data ||
          data.length === 0
        ) {
          mostrarModalMensaje(
            "No hay generaciones disponibles."
          );
          return;
        }

        const activas = [
          ...new Set(
            data
              .filter(
                (a) =>
                  a.generacion &&
                  a.estado_generacion !==
                    "archivada"
              )
              .map(
                (a) =>
                  a.generacion
              )
          ),
        ].sort();

        const archivadas = [
          ...new Set(
            data
              .filter(
                (a) =>
                  a.generacion &&
                  a.estado_generacion ===
                    "archivada"
              )
              .map(
                (a) =>
                  a.generacion
              )
          ),
        ].sort();

        listaArchivar.innerHTML =
          "";

        listaDesarchivar.innerHTML =
          "";

        activas.forEach(
          (gen) => {
            listaArchivar.innerHTML += `
              <label class="generacion-option">
                <input type="checkbox" value="${gen}">
                <span>${gen}</span>
              </label>
            `;
          }
        );

        archivadas.forEach(
          (gen) => {
            listaDesarchivar.innerHTML += `
              <label class="generacion-option">
                <input type="checkbox" value="${gen}">
                <span>${gen}</span>
              </label>
            `;
          }
        );

        modalArchivar.classList.remove(
          "hidden"
        );

      } catch (err) {
        console.error(err);
        mostrarModalMensaje(
          "Ocurrió un error al cargar generaciones."
        );
      }
    }
  );
}

if (cancelarArchivarBtn) {
  cancelarArchivarBtn.addEventListener(
    "click",
    () => {
      modalArchivar.classList.add(
        "hidden"
      );
    }
  );
}

if (confirmarArchivarBtn) {
  confirmarArchivarBtn.addEventListener(
    "click",
    async () => {
      const activar = [
        ...document.querySelectorAll(
          "#listaDesarchivar input:checked"
        ),
      ].map((i) => i.value);

      const archivar = [
        ...document.querySelectorAll(
          "#listaArchivar input:checked"
        ),
      ].map((i) => i.value);

      if (
        !activar.length &&
        !archivar.length
      ) {
        mostrarModalMensaje(
          "Selecciona al menos una generación."
        );
        return;
      }

      try {
        if (archivar.length) {
          await supabaseClient
            .from("alumnos")
            .update({
              estado_generacion:
                "archivada",
            })
            .in(
              "generacion",
              archivar
            );
        }

        if (activar.length) {
          await supabaseClient
            .from("alumnos")
            .update({
              estado_generacion:
                "activa",
            })
            .in(
              "generacion",
              activar
            );
        }

        modalArchivar.classList.add(
          "hidden"
        );

        mostrarModalMensaje(
          "Generaciones actualizadas correctamente."
        );

        cargarAlumnos();

      } catch (err) {
        console.error(err);

        mostrarModalMensaje(
          "No se pudieron guardar los cambios."
        );
      }
    }
  );
}

// ===============================
// MODAL ARCHIVAR / DESARCHIVAR
// ===============================

archivarGeneracionBtn.addEventListener(
  "click",
  async () => {
    try {
      // Buscar todas las generaciones únicas
      const { data, error } =
        await supabaseClient
          .from("alumnos")
          .select(
            "generacion, estado_generacion"
          );

      if (error) {
        console.error(error);
        return;
      }

      // Separar activas y archivadas
      const activas = [
        ...new Set(
          data
            .filter(
              (a) =>
                a.generacion &&
                a.estado_generacion !==
                  "archivada"
            )
            .map((a) => a.generacion)
        ),
      ].sort();

      const archivadas = [
        ...new Set(
          data
            .filter(
              (a) =>
                a.generacion &&
                a.estado_generacion ===
                  "archivada"
            )
            .map((a) => a.generacion)
        ),
      ].sort();

      // Mostrar listas
      generacionesDisponibles.innerHTML = `
        <strong>Generaciones activas:</strong><br>
        ${
          activas.length
            ? activas.join("<br>")
            : "Ninguna"
        }

        <br><br>

        <strong>Generaciones archivadas:</strong><br>
        ${
          archivadas.length
            ? archivadas.join("<br>")
            : "Ninguna"
        }
      `;

    } catch (err) {
      console.error(err);
    }
  }
);

// ===============================
// MODAL DE MENSAJES PERSONALIZADO
// ===============================

// Crear referencias
const modalMensaje =
  document.getElementById(
    "modalMensaje"
  );

const modalMensajeTexto =
  document.getElementById(
    "modalMensajeTexto"
  );

// Función global
function mostrarModalMensaje(
  mensaje
) {
  modalMensajeTexto.textContent =
    mensaje;

  modalMensaje.classList.remove(
    "hidden"
  );

  setTimeout(() => {
    modalMensaje.classList.add(
      "hidden"
    );
  }, 2000);
}

// Cerrar clic fuera
modalMensaje.addEventListener(
  "click",
  (e) => {
    if (
      e.target === modalMensaje
    ) {
      modalMensaje.classList.add(
        "hidden"
      );
    }
  }
);
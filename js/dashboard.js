const loginBtn = document.getElementById("loginBtn");
const coordUser = document.getElementById("coordUser");
const coordPass = document.getElementById("coordPass");
const loginError = document.getElementById("loginError");

const coordinadorLogin =
  document.getElementById(
    "coordinadorLogin"
  );

const dashboardPanel =
  document.getElementById(
    "dashboardPanel"
  );

const tablaAlumnos =
  document.getElementById(
    "tablaAlumnos"
  );

const cerrarSesionBtn =
  document.getElementById(
    "cerrarSesionBtn"
  );

const exportarCSVBtn =
  document.getElementById(
    "exportarCSVBtn"
  );

const depurarGeneracionBtn =
  document.getElementById(
    "depurarGeneracionBtn"
  );

const filtroGeneracion =
  document.getElementById(
    "filtroGeneracion"
  );

const filtroEstado =
  document.getElementById(
    "filtroEstado"
  );

const coordinadorBienvenida =
  document.getElementById(
    "coordinadorBienvenida"
  );

const busquedaAlumno =
  document.getElementById(
    "busquedaAlumno"
  );

// =========================
// CONFIGURACIÓN
// =========================
const MINIMO_COHORTE = 30;

// MVP temporal
const USER = "coordinador";
const PASS = "admin123";

// =========================
// ESTADO GLOBAL
// =========================
let alumnos = [];
let alumnosFiltrados = [];
let generacionesVencidas = [];

// =========================
// LOGIN
// =========================
if (loginBtn) {
  loginBtn.addEventListener(
    "click",
    async () => {
      const usuario =
        coordUser.value.trim();

      const password =
        coordPass.value.trim();

      if (!usuario || !password) {
        loginError.textContent =
          "Completa usuario y contraseña.";
        return;
      }

      if (coordinadorBienvenida) {
        coordinadorBienvenida.textContent =
          `Bienvenido, ${usuario}`;
      }

      const { data, error } =
        await supabaseClient
          .from("coordinadores")
          .select("*")
          .eq("usuario", usuario)
          .eq("password", password)
          .maybeSingle();

      if (error) {
        console.error(error);

        loginError.textContent =
          "Error de conexión.";
        return;
      }

      if (!data) {
        loginError.textContent =
          "Usuario o contraseña incorrectos.";
        return;
      }

      localStorage.setItem(
        "coordinadorActivo",
        "true"
      );

      localStorage.setItem(
        "coordinadorUsuario",
        usuario
      );

      coordinadorLogin.style.display =
        "none";

      dashboardPanel.style.display =
        "block";

      cargarAlumnos();
    }
  );
}

// =========================
// SESIÓN
// =========================
async function verificarSesionCoordinador() {
  const coordinadorActivo =
    localStorage.getItem(
      "coordinadorActivo"
    );

  if (
    coordinadorActivo !==
    "true"
  )
    return;

  coordinadorLogin.style.display =
    "none";

  dashboardPanel.style.display =
    "block";

  await cargarAlumnos();
}

const usuarioGuardado =
  localStorage.getItem(
    "coordinadorUsuario"
  );

if (
  coordinadorBienvenida &&
  usuarioGuardado
) {
  coordinadorBienvenida.textContent =
    `Bienvenido, ${usuarioGuardado}`;
}

verificarSesionCoordinador();

// =========================
// MODAL MENSAJE
// =========================
function mostrarModalMensaje(
  mensaje
) {
  const modal =
    document.getElementById(
      "modalMensaje"
    );

  const texto =
    document.getElementById(
      "modalMensajeTexto"
    );

  if (!modal || !texto) {
    alert(mensaje);
    return;
  }

  texto.textContent = mensaje;

  modal.classList.remove(
    "hidden"
  );

  setTimeout(() => {
    modal.classList.add(
      "hidden"
    );
  }, 4000);
}

// =========================
// CARGAR ALUMNOS
// =========================
async function cargarAlumnos() {
  tablaAlumnos.innerHTML = `
    <tr>
      <td colspan="8">
        Cargando...
      </td>
    </tr>
  `;

  let query = supabaseClient
    .from("alumnos")
    .select("*");

  const estadoSeleccionado =
    filtroEstado.value;

  if (estadoSeleccionado) {
    const estadoMap = {
      Activo: "activa",
      Archivado:
        "archivada",
    };

    if (
      estadoMap[
        estadoSeleccionado
      ]
    ) {
      query = query.eq(
        "estado_generacion",
        estadoMap[
          estadoSeleccionado
        ]
      );
    }
  }

  const { data, error } =
    await query.order(
      "numero_cuenta",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(error);

    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="8">
          Error al cargar alumnos
        </td>
      </tr>
    `;
    return;
  }

  if (
    !data ||
    data.length === 0
  ) {
    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="8">
          No hay registros disponibles
        </td>
      </tr>
    `;
    return;
  }

  alumnos = data;
  alumnosFiltrados = data;

  // =========================
  // GENERACIONES ÚNICAS
  // =========================
  const generacionesUnicas = [
    ...new Set(
      data
        .map(
          (a) =>
            a.generacion
        )
        .filter(Boolean)
    ),
  ].sort();

  filtroGeneracion.innerHTML = `
    <option value="">
      Todas las generaciones
    </option>
  `;

  generacionesUnicas.forEach(
    (gen) => {
      filtroGeneracion.innerHTML += `
        <option value="${gen}">
          ${gen}
        </option>
      `;
    }
  );

  // =========================
  // COHORTES
  // =========================
  const conteoGeneraciones =
    {};

  alumnos.forEach(
    (alumno) => {
      if (
        !alumno.generacion
      )
        return;

      conteoGeneraciones[
        alumno.generacion
      ] =
        (conteoGeneraciones[
          alumno.generacion
        ] || 0) + 1;
    }
  );

  const generacionesValidas =
    Object.entries(
      conteoGeneraciones
    ).filter(
      (
        [generacion, total]
      ) =>
        total >=
        MINIMO_COHORTE
    );
    
      const anioActual =
    new Date().getFullYear();

  generacionesVencidas =
    generacionesValidas.filter(
      ([generacion]) =>
        anioActual -
          parseInt(
            generacion
          ) >=
        4
    );

  // =========================
  // BOTÓN DEPURAR
  // =========================
  if (
    depurarGeneracionBtn
  ) {
    depurarGeneracionBtn.style.display =
      generacionesVencidas.length
        ? "inline-block"
        : "none";
  }

  // =========================
  // AVISO INSTITUCIONAL
  // =========================
  if (
    generacionesVencidas.length
  ) {
    generacionesVencidas.sort(
      (a, b) =>
        parseInt(a[0]) -
        parseInt(b[0])
    );

    const generacionBase =
      generacionesVencidas[0][0];

    const ultimaGeneracionAvisada =
      localStorage.getItem(
        "ultimaGeneracionAvisada"
      );

    if (
      ultimaGeneracionAvisada !==
      generacionBase
    ) {
      mostrarModalMensaje(
        `Aviso institucional: La generación ${generacionBase} ha cumplido su ciclo de 4 años. Se recomienda exportar, archivar y depurar su información.`
      );

      localStorage.setItem(
        "ultimaGeneracionAvisada",
        generacionBase
      );
    }
  }

  // =========================
  // RENDER FINAL
  // =========================
  renderTabla(
    alumnosFiltrados
  );
}

// =========================
// CERRAR SESIÓN
// =========================
if (cerrarSesionBtn) {
  cerrarSesionBtn.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        "coordinadorActivo"
      );

      localStorage.removeItem(
        "coordinadorUsuario"
      );

      window.location.reload();
    }
  );
}

// =========================
// EXPORTAR CSV GENERAL
// =========================
if (exportarCSVBtn) {
  exportarCSVBtn.addEventListener(
    "click",
    async () => {
      const {
        data,
        error,
      } =
        await supabaseClient
          .from("alumnos")
          .select("*");

      if (
        error ||
        !data
      ) {
        mostrarModalMensaje(
          "No se pudieron exportar los registros."
        );
        return;
      }

      let csv =
        "NumeroCuenta,Nombre,Generacion,Semestre,Periodo,Creditos,EstadoAcademico,DocumentoURL\n";

      data.forEach(
        (alumno) => {
          csv += `"${alumno.numero_cuenta || ""}","${alumno.nombre || ""}","${alumno.generacion || ""}","${alumno.semestre || ""}","${alumno.periodo || ""}","${alumno.creditos_acumulados || 0}","${alumno.estado_academico || ""}","${alumno.documento_url || ""}"\n`;
        }
      );

      const blob =
        new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });

      const link =
        document.createElement(
          "a"
        );

      const url =
        URL.createObjectURL(
          blob
        );

      link.setAttribute(
        "href",
        url
      );

      link.setAttribute(
        "download",
        "alumnos_registrados.csv"
      );

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );
    }
  );
}

// =========================
// TABLA
// =========================
function renderTabla(
  lista
) {
  if (
    !lista ||
    lista.length === 0
  ) {
    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="8">
          No se encontraron alumnos
        </td>
      </tr>
    `;
    return;
  }

  tablaAlumnos.innerHTML =
    lista
      .map(
        (alumno) => `
        <tr>
          <td>${alumno.numero_cuenta || ""}</td>
          <td>${alumno.nombre || ""}</td>
          <td>${alumno.generacion || "-"}</td>
          <td>${alumno.semestre || ""}</td>
          <td>${alumno.periodo || ""}</td>
          <td>${alumno.creditos_acumulados || 0}</td>
          <td>${alumno.estado_academico || "Activo"}</td>
          <td>
            ${
              alumno.documento_url
                ? `<a href="${alumno.documento_url}" target="_blank">Ver PDF</a>`
                : "Sin documento"
            }
          </td>
        </tr>
      `
      )
      .join("");
}

// =========================
// FILTROS
// =========================
function aplicarFiltros() {
  const texto =
    busquedaAlumno
      ? busquedaAlumno.value
          .trim()
          .toLowerCase()
      : "";

  const generacion =
    filtroGeneracion.value;

  const estado =
    filtroEstado.value;

  alumnosFiltrados =
    alumnos.filter(
      (alumno) => {
        const coincideTexto =
          alumno.numero_cuenta
            ?.toString()
            .includes(
              texto
            ) ||
          alumno.nombre
            ?.toLowerCase()
            .includes(
              texto
            );

        const coincideGeneracion =
          !generacion ||
          alumno.generacion ===
            generacion;

        const coincideEstado =
          !estado ||
          alumno.estado_academico ===
            estado;

        return (
          coincideTexto &&
          coincideGeneracion &&
          coincideEstado
        );
      }
    );

  renderTabla(
    alumnosFiltrados
  );
}

// =========================
// EVENTOS FILTROS
// =========================
if (busquedaAlumno) {
  busquedaAlumno.addEventListener(
    "input",
    aplicarFiltros
  );
}

if (filtroGeneracion) {
  filtroGeneracion.addEventListener(
    "change",
    aplicarFiltros
  );
}

if (filtroEstado) {
  filtroEstado.addEventListener(
    "change",
    async () => {
      await cargarAlumnos();
      aplicarFiltros();
    }
  );
}

// =========================
// DEPURAR GENERACIONES
// =========================
async function eliminarGeneracion(
  generacion
) {
  const {
    data,
    error,
  } =
    await supabaseClient
      .from("alumnos")
      .select(
        "numero_cuenta, documento_url"
      )
      .eq(
        "generacion",
        generacion
      );

  if (
    error ||
    !data
  ) {
    console.error(
      error
    );
    return false;
  }

  // Eliminar documentos
  for (const alumno of data) {
    if (
      alumno.documento_url
    ) {
      const path =
        alumno.documento_url.split(
          "/documentos-alumnos/"
        )[1];

      if (path) {
        await supabaseClient.storage
          .from(
            "documentos-alumnos"
          )
          .remove([path]);
      }
    }
  }

  // Eliminar alumnos
  const {
    error: deleteError,
  } =
    await supabaseClient
      .from("alumnos")
      .delete()
      .eq(
        "generacion",
        generacion
      );

  if (deleteError) {
    console.error(
      deleteError
    );
    return false;
  }

  return true;
}

// =========================
// MODAL DEPURAR
// =========================
if (
  depurarGeneracionBtn
) {
  depurarGeneracionBtn.addEventListener(
    "click",
    () => {
      const modal =
        document.getElementById(
          "modalDepurar"
        );

      const lista =
        document.getElementById(
          "listaDepurar"
        );

      if (
        !modal ||
        !lista
      )
        return;

      lista.innerHTML =
        "";

      if (
        !generacionesVencidas.length
      ) {
        lista.innerHTML = `
          <p>
            No hay generaciones disponibles para depuración.
          </p>
        `;
      } else {
        generacionesVencidas.forEach(
          ([gen]) => {
            lista.innerHTML += `
              <label style="display:block; margin-bottom:10px;">
                <input type="checkbox" value="${gen}" />
                Generación ${gen}
              </label>
            `;
          }
        );
      }

      modal.classList.remove(
        "hidden"
      );
    }
  );
}

// =========================
// CONFIRMAR DEPURACIÓN
// =========================
const confirmarDepurarBtn =
  document.getElementById(
    "confirmarDepurarBtn"
  );

if (
  confirmarDepurarBtn
) {
  confirmarDepurarBtn.addEventListener(
    "click",
    async () => {
      const seleccionadas =
        [
          ...document.querySelectorAll(
            "#listaDepurar input:checked"
          ),
        ].map(
          (el) =>
            el.value
        );

      if (
        !seleccionadas.length
      ) {
        mostrarModalMensaje(
          "Selecciona al menos una generación."
        );
        return;
      }

      const confirmar =
        confirm(
          `Se eliminarán ${seleccionadas.length} generaciones de forma permanente.\n\n¿Deseas continuar?`
        );

      if (
        !confirmar
      )
        return;

      let eliminadas = 0;

      for (const generacion of seleccionadas) {
        const exito =
          await eliminarGeneracion(
            generacion
          );

        if (exito)
          eliminadas++;
      }

      document
        .getElementById(
          "modalDepurar"
        )
        .classList.add(
          "hidden"
        );

      mostrarModalMensaje(
        `${eliminadas} generaciones depuradas correctamente.`
      );

      localStorage.removeItem(
        "ultimaGeneracionAvisada"
      );

      cargarAlumnos();
    }
  );
}

// =========================
// CANCELAR DEPURACIÓN
// =========================
const cancelarDepurarBtn =
  document.getElementById(
    "cancelarDepurarBtn"
  );

if (
  cancelarDepurarBtn
) {
  cancelarDepurarBtn.addEventListener(
    "click",
    () => {
      document
        .getElementById(
          "modalDepurar"
        )
        .classList.add(
          "hidden"
        );
    }
  );
}

// =========================
// VOLVER AL REGISTRO
// =========================
const volverRegistroBtn =
  document.getElementById(
    "volverRegistroBtn"
  );

if (
  volverRegistroBtn
) {
  volverRegistroBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "index.html";
    }
  );
}
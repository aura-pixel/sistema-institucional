
const loginBtn = document.getElementById("loginBtn");
const coordUser = document.getElementById("coordUser");
const coordPass = document.getElementById("coordPass");
const loginError = document.getElementById("loginError");

const coordinadorLogin = document.getElementById("coordinadorLogin");
const dashboardPanel = document.getElementById("dashboardPanel");

const tablaAlumnos = document.getElementById("tablaAlumnos");
const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

const exportarCSVBtn = document.getElementById("exportarCSVBtn");
//const eliminarRegistrosBtn = document.getElementById("eliminarRegistrosBtn");

const filtroGeneracion =
  document.getElementById("filtroGeneracion");

const filtroEstado =
  document.getElementById("filtroEstado");

const coordinadorBienvenida =
  document.getElementById("coordinadorBienvenida");

// MVP Credenciales temporales
const USER = "coordinador";
const PASS = "admin123";

let alumnos = [];
let alumnosFiltrados = [];

// Login
if (loginBtn) {
loginBtn.addEventListener("click", async () => {
  const usuario = coordUser.value.trim();
  const password = coordPass.value.trim();

  if (!usuario || !password) {
    loginError.textContent =
      "Completa usuario y contraseña.";
    return;
  }

if (coordinadorBienvenida) {
  coordinadorBienvenida.textContent =
    `Bienvenido, ${usuario}`;
}

  const { data, error } = await supabaseClient
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

  localStorage.setItem("coordinadorActivo", "true");
  localStorage.setItem(
  "coordinadorUsuario",
  usuario
);

  coordinadorLogin.style.display = "none";
  dashboardPanel.style.display = "block";

  cargarAlumnos();
})};

// Cargar sesión
async function verificarSesionCoordinador() {
  const coordinadorActivo =
    localStorage.getItem("coordinadorActivo");

  if (coordinadorActivo !== "true") return;

  coordinadorLogin.style.display = "none";
  dashboardPanel.style.display = "block";

  await cargarAlumnos();
}

const usuarioGuardado =
  localStorage.getItem("coordinadorUsuario");

if (coordinadorBienvenida && usuarioGuardado) {
  coordinadorBienvenida.textContent =
    `Bienvenido, ${usuarioGuardado}`;
}

verificarSesionCoordinador();

// Cargar alumnos
async function cargarAlumnos() {
  tablaAlumnos.innerHTML = `
    <tr>
      <td colspan="8">Cargando...</td>
    </tr>
  `;

  // Crear query base
  let query = supabaseClient
    .from("alumnos")
    .select("*");

  // Filtro por estado de generación
  const estadoSeleccionado = filtroEstado.value;

  if (estadoSeleccionado) {
    const estadoMap = {
      Activo: "activa",
      Archivado: "archivada",
    };

    if (estadoMap[estadoSeleccionado]) {
      query = query.eq(
        "estado_generacion",
        estadoMap[estadoSeleccionado]
      );
    }
  }

  // Ejecutar query ordenada
  const { data, error } = await query.order(
    "numero_cuenta",
    { ascending: true }
  );

  // Manejo de errores
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

  // Sin registros
  if (!data || data.length === 0) {
    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="8">
          No hay registros disponibles
        </td>
      </tr>
    `;
    return;
  }

  // Guardar datos globales
  alumnos = data;
  alumnosFiltrados = data;

  // Renderizar tabla
  renderTabla(alumnosFiltrados);

  // Generaciones únicas
  const generacionesUnicas = [
    ...new Set(
      data
        .map((a) => a.generacion)
        .filter(Boolean)
    ),
  ].sort();

  // Reiniciar filtro
  filtroGeneracion.innerHTML = `
    <option value="">
      Todas las generaciones
    </option>
  `;

  // Agregar generaciones dinámicas
  generacionesUnicas.forEach((gen) => {
    filtroGeneracion.innerHTML += `
      <option value="${gen}">
        ${gen}
      </option>
    `;
  });
}

// Buscador
const busquedaAlumno =
  document.getElementById("busquedaAlumno");

// Cerrar sesión
cerrarSesionBtn.addEventListener("click", () => {
  localStorage.removeItem("coordinadorActivo");
  localStorage.removeItem("coordinadorUsuario");

  window.location.reload();
});

exportarCSVBtn.addEventListener("click", async () => {
  const { data, error } = await supabaseClient
    .from("alumnos")
    .select("*");

  if (error || !data) {
    alert("No se pudieron exportar los registros.");
    return;
  }

  let csv =
"NumeroCuenta,Nombre,Generacion,Semestre,Periodo,Creditos,EstadoAcademico,DocumentoURL\n";

  data.forEach((alumno) => {
    csv += `"${alumno.numero_cuenta || ""}","${alumno.nombre || ""}","${alumno.periodo || ""}","${alumno.semestre || ""}","${alumno.generacion || ""}","${alumno.creditos_acumulados || 0}","${alumno.estado_academico || ""}","${alumno.documento_url || ""}"\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "alumnos_registrados.csv");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

/*eliminarRegistrosBtn.addEventListener("click", async () => {
  const confirmar = confirm(
    "¿Seguro que deseas eliminar TODOS los registros, materias y expedientes? Esta acción no se puede deshacer."
  );

  if (!confirmar) return;

  try {
    // 1. Eliminar materias
    const { error: materiasError } = await supabaseClient
      .from("materias_alumno")
      .delete()
      .neq("id", 0);

    if (materiasError) {
      console.error(materiasError);
      alert("No se pudieron eliminar las materias.");
      return;
    }

    // 2. Eliminar alumnos
    const { error: alumnosError } = await supabaseClient
      .from("alumnos")
      .delete()
      .neq("id", 0);

    if (alumnosError) {
      console.error(alumnosError);
      alert("No se pudieron eliminar los alumnos.");
      return;
    }

    // ⚠️ Nota:
    // Los PDFs en storage siguen existiendo.
    // Después podemos hacer limpieza automática de storage.

    alert("Todos los registros fueron eliminados correctamente.");

    tablaAlumnos.innerHTML = "";

  } catch (err) {
    console.error(err);
    alert("Ocurrió un error inesperado.");
  }
});*/

function renderTabla(lista) {
  if (!lista || lista.length === 0) {
    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="8">
          No se encontraron alumnos
        </td>
      </tr>
    `;
    return;
  }

  tablaAlumnos.innerHTML = lista
    .map((alumno) => {
      return `
        <tr>
          <td>${alumno.numero_cuenta || ""}</td>
          <td>${alumno.nombre || ""}</td>
          <td>${alumno.generacion || "-"}</td>
          <td>${alumno.semestre || ""}</td>
          <td>${alumno.generacion || ""}</td>
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
      `;
    })
    .join("");
}

function aplicarFiltros() {
  const texto = busquedaAlumno
  ? busquedaAlumno.value.trim().toLowerCase()
  : "";
  const generacion = filtroGeneracion.value;
  const estado = filtroEstado.value;

  alumnosFiltrados = alumnos.filter((alumno) => {
    const coincideTexto =
      alumno.numero_cuenta?.toString().includes(texto) ||
      alumno.nombre?.toLowerCase().includes(texto);

    const coincideGeneracion =
      !generacion || alumno.generacion === generacion;

    const coincideEstado =
      !estado || alumno.estado_academico === estado;

    return (
      coincideTexto &&
      coincideGeneracion &&
      coincideEstado
    );
  });

  renderTabla(alumnosFiltrados);
}

if (busquedaAlumno) {
  busquedaAlumno.addEventListener("input", aplicarFiltros);
}

if (filtroGeneracion) {
  filtroGeneracion.addEventListener("change", aplicarFiltros);
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", aplicarFiltros);
}

/* =========================
   VOLVER AL REGISTRO ALUMNO
========================= */
const volverRegistroBtn =
  document.getElementById(
    "volverRegistroBtn"
  );

if (volverRegistroBtn) {
  volverRegistroBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "index.html";
    }
  );
}
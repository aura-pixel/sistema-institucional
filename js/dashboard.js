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

const tablaHistorial =
  document.getElementById(
    "tablaHistorial"
  );

const historialTitulo =
  document.getElementById(
    "historialTitulo"
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
const MINIMO_COHORTE = 1;

// MVP temporal
const USER = "to";
const PASS = "to2026";

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

alumnosFiltrados =
  filtroEstado.value ===
  "Archivado"
    ? data.filter(
        (alumno) =>
          alumno.estado_generacion ===
          "archivada"
      )
    : data.filter(
        (alumno) =>
          alumno.estado_generacion !==
          "archivada"
      );

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
      const generacionesTexto =
  generacionesVencidas
    .map(([gen]) => gen)
    .join(", ");

mostrarModalDepuracionInicial(
  `Aviso institucional: Las generaciones ${generacionesTexto} han cumplido su ciclo de 4 años. Se recomienda exportar, archivar y depurar su información.`
);

      localStorage.setItem(
        "ultimaGeneracionAvisada",
        generacionBase
      );
    }
  }

  function mostrarModalDepuracionInicial(
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

  const boton =
    document.getElementById(
      "modalMensajeBtn"
    );

  texto.textContent =
    mensaje;

  boton.textContent =
    "Depurar ahora";

  boton.onclick = () => {
    modal.classList.add(
      "hidden"
    );

    if (
      depurarGeneracionBtn
    ) {
      depurarGeneracionBtn.click();
    }
  };

  modal.classList.remove(
    "hidden"
  );
}

  // =========================
  // RENDER FINAL
  // =========================
  renderTabla(
    alumnosFiltrados
  );
}

async function cargarHistorialAlumno(
  numeroCuenta,
  nombreAlumno = ""
) {
  if (!tablaHistorial) return;

  tablaHistorial.innerHTML = `
    <tr>
      <td colspan="4">
        Cargando historial...
      </td>
    </tr>
  `;

  if (historialTitulo) {
    historialTitulo.textContent =
      `Historial académico de ${nombreAlumno || numeroCuenta}`;
  }

  const { data, error } =
    await supabaseClient
      .from("historial_academico")
      .select("*")
      .eq(
        "numero_cuenta",
        numeroCuenta
      )
      .order(
        "fecha_registro",
        { ascending: false }
      );

  if (error) {
    console.error(error);

    tablaHistorial.innerHTML = `
      <tr>
        <td colspan="4">
          Error cargando historial
        </td>
      </tr>
    `;
    return;
  }

  const historialFiltrado =
  data.filter(
    (registro) =>
      registro.semestre &&
      registro.semestre !== "-"
  );

  if (
  !historialFiltrado ||
  !historialFiltrado.length
) {
    tablaHistorial.innerHTML = `
      <tr>
        <td colspan="4">
          Sin historial registrado
        </td>
      </tr>
    `;
    return;
  }

  tablaHistorial.innerHTML =
  historialFiltrado
    .map(
        (registro) => `
          <tr>
            <td>${registro.semestre || "-"}</td>
            <td>${registro.periodo || "-"}</td>
            <td>${registro.creditos_acumulados || 0}</td>
            <td>${new Date(
              registro.fecha_registro
            ).toLocaleDateString()}</td>
          </tr>
        `
      )
      .join("");
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
        "NumeroCuenta,Nombre,Generacion,Semestre,Periodo,CreditosTotales,SemestresCursados,MateriasRecursadas,EstatusFinal,DocumentoURL\n";

      for (const alumno of data) {

        const {
          data: historial,
        } =
          await supabaseClient
            .from(
              "historial_academico"
            )
            .select(
              "creditos_acumulados, semestre, materias_json"
            )
            .eq(
              "numero_cuenta",
              alumno.numero_cuenta
            );

        // Créditos totales
        const creditosTotales =
          historial?.reduce(
            (
              total,
              registro
            ) =>
              total +
              (registro.creditos_acumulados ||
                0),
            0
          ) || 0;

        // Semestres cursados únicos
        const semestresCursados =
          new Set(
            historial?.map(
              (registro) =>
                registro.semestre
            )
          ).size || 0;

        // Materias recursadas
        let materiasRecursadas = 0;

        historial?.forEach(
          (registro) => {
            if (
              registro.materias_json &&
              Array.isArray(
                registro.materias_json
              )
            ) {
              materiasRecursadas +=
                registro.materias_json.filter(
                  (materia) =>
                    materia.recursa ===
                    "Sí"
                ).length;
            }
          }
        );

        // Estatus final
        const estatusFinal =
          parseInt(
            alumno.semestre
          ) >= 8 &&
          creditosTotales >= 380
            ? "Egresado"
            : alumno.estado_academico ||
              "Activo";

        // Fila CSV
        csv += `"${alumno.numero_cuenta || ""}","${alumno.nombre || ""}","${alumno.generacion || ""}","${alumno.semestre || ""}","${alumno.periodo || ""}","${creditosTotales}","${semestresCursados}","${materiasRecursadas}","${estatusFinal}","${alumno.documento_url || ""}"\n`;
      }

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
        <tr
          style="cursor:pointer;"
          onclick="cargarHistorialAlumno(
            '${alumno.numero_cuenta}',
            '${(alumno.nombre || "").replace(/'/g, "\\'")}'
          )"
        >
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
          (
            estado ===
            "Archivado"
              ? alumno.estado_generacion ===
                "archivada"
              : estado ===
                "Activo"
              ? alumno.estado_generacion !==
                "archivada"
              : alumno.estado_academico ===
                estado
          );

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
  try {
    // Buscar alumnos
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
        "Error buscando alumnos:",
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
          const {
            error: storageError,
          } =
            await supabaseClient.storage
              .from(
                "documentos-alumnos"
              )
              .remove([path]);

          if (storageError) {
            console.error(
              "Error eliminando documento:",
              storageError
            );
          }
        }
      }
    }

    // Eliminar alumnos de base
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
        "Error eliminando generación:",
        deleteError
      );
      return false;
    }

    return true;

  } catch (err) {
    console.error(
      "Error general:",
      err
    );
    return false;
  }
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

      const lista =
        document.getElementById(
          "listaDepurar"
        );

      const modal =
        document.getElementById(
          "modalDepurar"
        );

      const seleccionadas =
        [
          ...document.querySelectorAll(
            "#listaDepurar input:checked"
          ),
        ].map(
          (el) =>
            el.value
        );

      // =========================
      // VALIDACIÓN
      // =========================
      if (
        !seleccionadas.length
      ) {
        mostrarModalMensaje(
          "Selecciona al menos una generación."
        );
        return;
      }

      lista.innerHTML = `
  <p style="
    text-align:center;
    font-weight:bold;
    padding:20px;
    font-size:1.1rem;
  ">
    Descargando últimos datos institucionales...
  </p>
`;

exportarGeneracionesAntesDeDepurar(
  seleccionadas
);

await new Promise(
  (resolve) =>
    setTimeout(
      resolve,
      1500
    )
);

      // =========================
      // ESTADO VISUAL:
      // DEPURANDO...
      // =========================
      lista.innerHTML = `
        <p style="
          text-align:center;
          font-weight:bold;
          padding:20px;
          font-size:1.1rem;
        ">
          Depurando ${seleccionadas.length} generación(es)...
        </p>
      `;

      let eliminadas = 0;

      // =========================
      // ELIMINACIÓN
      // =========================
      for (const generacion of seleccionadas) {

        const exito =
          await eliminarGeneracion(
            generacion
          );

        if (exito) {
          eliminadas++;
        }

      }

      // =========================
      // RESULTADO FINAL
      // =========================
      lista.innerHTML = `
        <p style="
          text-align:center;
          font-weight:bold;
          padding:20px;
          font-size:1.1rem;
        ">
          ${eliminadas} generaciones depuradas correctamente.
        </p>
      `;

      // =========================
      // RESET AVISO
      // =========================
      localStorage.removeItem(
        "ultimaGeneracionAvisada"
      );

      // =========================
      // CIERRE AUTOMÁTICO
      // =========================
      setTimeout(() => {

        modal.classList.add(
          "hidden"
        );

        cargarAlumnos();

      }, 2000);

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

function exportarGeneracionesAntesDeDepurar(
  generaciones
) {

  const alumnosExportar =
    alumnos.filter(
      (alumno) =>
        generaciones.includes(
          String(
            alumno.generacion
          )
        )
    );

  if (
    !alumnosExportar.length
  ) return;

  const encabezados = [
    "Numero de cuenta",
    "Nombre",
    "Generacion",
    "Semestre",
    "Periodo",
    "Creditos"
  ];

  const filas =
    alumnosExportar.map(
      (a) => [
        a.numero_cuenta || "",
        a.nombre || "",
        a.generacion || "",
        a.semestre || "",
        a.periodo || "",
        a.creditos || ""
      ]
    );

  let csv =
    encabezados.join(",") +
    "\n";

  filas.forEach(
    (fila) => {
      csv +=
        fila.join(",") +
        "\n";
    }
  );

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    URL.createObjectURL(
      blob
    );

  link.download =
    `respaldo_generaciones_${generaciones.join("_")}.csv`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );
}
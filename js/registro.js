// js/registro.js
// Básicamente conserva lo tuyo + agrega:
// ✔ referencias correctas
// ✔ autollenado
// ✔ validaciones mejoradas

const registroForm = document.getElementById("registroForm");
const errorRegistro = document.getElementById("errorMessage");

// Número de cuenta
const numeroCuenta = localStorage.getItem("numeroCuenta");

if (!numeroCuenta) {
  window.location.href = "index.html";
}

// Inputs
const numeroCuentaInput = document.getElementById("numeroCuenta");
const anioIngreso = document.getElementById("anioIngreso");
const periodo = document.getElementById("periodo");
const semestre = document.getElementById("semestre");
const nombre = document.getElementById("nombre");
const edad = document.getElementById("edad");
const sexo = document.getElementById("sexo");
const tipoSangre = document.getElementById("tipoSangre");
const nacionalidad = document.getElementById("nacionalidad");
const direccion = document.getElementById("direccion");
const localidad = document.getElementById("localidad");
const municipio = document.getElementById("municipio");
const estado = document.getElementById("estado");
const codigoPostal = document.getElementById("codigoPostal");
const telefono = document.getElementById("telefono");
const email = document.getElementById("email");
const tipoSeguro =
document.getElementById("tipoSeguro");
const nss = document.getElementById("nss");
const tutorNombre = document.getElementById("tutorNombre");
const tutorDireccion = document.getElementById("tutorDireccion");
const tutorTelefono = document.getElementById("tutorTelefono");
const paisOrigenContainer = document.getElementById("paisOrigenContainer");
const paisOrigen = document.getElementById("paisOrigen");

numeroCuentaInput.value = numeroCuenta;

// Validación básica
function camposVacios(campos) {
  return campos.some((campo) => !campo.value.trim());
}

// Validaciones extra
function emailValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function telefonoValido(numero) {
  return /^\d{10}$/.test(numero);
}

// AUTOCARGAR DATOS SI YA EXISTEN
async function cargarDatosAlumno() {
  const { data, error } = await supabaseClient
    .from("alumnos")
    .select("*")
    .eq("numero_cuenta", numeroCuenta)
    .maybeSingle();

  if (error) {
    console.error("Error cargando datos:", error);
    return;
  }

  if (!data) return;

  anioIngreso.value = data.anio_ingreso || "";
  periodo.value = data.periodo || "";
  semestre.value = data.semestre || "";
  nombre.value = data.nombre || "";
  edad.value = data.edad || "";
  sexo.value = data.sexo || "";
  tipoSangre.value = data.tipo_sangre || "";
  nacionalidad.value = data.nacionalidad || "";
  direccion.value = data.direccion || "";
  localidad.value = data.localidad || "";
  municipio.value = data.municipio || "";
  estado.value = data.estado || "";
  codigoPostal.value = data.codigo_postal || "";
  telefono.value = data.telefono || "";
  email.value = data.email || "";
  tipoSeguro.value = data.seguridad_social || "IMSS";
  nss.value = data.nss || "";
  tutorNombre.value = data.tutor_nombre || "";
  tutorDireccion.value = data.tutor_direccion || "";
  tutorTelefono.value = data.tutor_telefono || "";
}

// Guardar datos
registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const campos = [
    anioIngreso,
    periodo,
    semestre,
    nombre,
    edad,
    sexo,
    tipoSangre,
    nacionalidad,
    direccion,
    localidad,
    municipio,
    estado,
    codigoPostal,
    telefono,
    email,
    tipoSeguro,
    nss,
    tutorNombre,
    tutorDireccion,
    tutorTelefono,
  ];

  // Campos vacíos
  if (camposVacios(campos)) {
    errorRegistro.textContent =
      "Por favor completa todos los campos antes de continuar.";
    return;
  }

  // Email
  if (!emailValido(email.value)) {
    errorRegistro.textContent =
      "Ingresa un correo electrónico válido.";
    return;
  }

  // Teléfono
  if (!telefonoValido(telefono.value)) {
    errorRegistro.textContent =
      "El teléfono debe tener exactamente 10 dígitos.";
    return;
  }

  // Tutor teléfono
  if (!telefonoValido(tutorTelefono.value)) {
    errorRegistro.textContent =
      "El teléfono del tutor debe tener exactamente 10 dígitos.";
    return;
  }

  // js/registro.js
// VALIDACIÓN EXTRA DENTRO DEL SUBMIT
// AGREGA antes de guardar:

// Periodo escolar
if (!/^\d{4}-[AB]$/.test(periodo.value)) {
  errorRegistro.textContent =
    "El periodo debe tener formato YYYY-A o YYYY-B.";
  return;
}

// NSS
if (!/^\d{11}$/.test(nss.value)) {
  errorRegistro.textContent =
    "El NSS debe tener exactamente 11 dígitos.";
  return;
}

// Nacionalidad extranjera
if (
  nacionalidad.value === "Extranjera" &&
  !paisOrigen.value.trim()
) {
  errorRegistro.textContent =
    "Debes indicar tu país de origen.";
  return;
}

  errorRegistro.textContent = "Guardando información...";

  const { error } = await supabaseClient
    .from("alumnos")
    .update({
      anio_ingreso: anioIngreso.value,
      periodo: periodo.value,
      semestre: parseInt(semestre.value),
      nombre: nombre.value,
      edad: parseInt(edad.value),
      sexo: sexo.value,
      tipo_sangre: tipoSangre.value,
      nacionalidad: nacionalidad.value,
      direccion: direccion.value,
      localidad: localidad.value,
      municipio: municipio.value,
      estado: estado.value,
      codigo_postal: codigoPostal.value,
      telefono: telefono.value,
      email: email.value,
      seguridad_social: tipoSeguro.value,
      nss: nss.value,
      tutor_nombre: tutorNombre.value,
      tutor_direccion: tutorDireccion.value,
      tutor_telefono: tutorTelefono.value,
      pais_origen: nacionalidad.value === "Extranjera" ? paisOrigen.value: null,
      generacion: anioIngreso.value,
      estado_generacion: "activa",
    })
    .eq("numero_cuenta", numeroCuenta);

  if (error) {
    errorRegistro.textContent =
      "No se pudieron guardar los datos. Intenta nuevamente.";
    console.error(error);
    return;
  }

  // Continuar
  window.location.href = "materias.html";
});

generacion: `${anioIngreso.value}-${parseInt(anioIngreso.value) + 4}`,

// INICIAR AUTOCARGA
cargarDatosAlumno();

// js/registro.js
// FORMATO AUTOMÁTICO PERIODO ESCOLAR
// AGREGA:

periodo.addEventListener("input", () => {
  let valor = periodo.value.toUpperCase();

  // Solo números + A/B
  valor = valor.replace(/[^0-9AB]/g, "");

  // Si tiene 4 números, agregar guion
  if (valor.length > 4 && valor[4] !== "-") {
    valor = valor.slice(0, 4) + "-" + valor.slice(4);
  }

  // Limitar formato 2026-A
  if (valor.length > 6) {
    valor = valor.slice(0, 6);
  }

  // Solo permitir A o B al final
  if (valor.length === 6) {
    const ultimo = valor[5];

    if (ultimo !== "A" && ultimo !== "B") {
      valor = valor.slice(0, 5);
    }
  }

  periodo.value = valor;
});

// js/registro.js
// NSS solo números
// AGREGA:

nss.addEventListener("input", () => {
  nss.value = nss.value.replace(/\D/g, "");

  if (nss.value.length > 11) {
    nss.value = nss.value.slice(0, 11);
  }
});

// js/registro.js
// Nacionalidad dinámica
// AGREGA:

nacionalidad.addEventListener("change", () => {
  if (nacionalidad.value === "Extranjera") {
    paisOrigenContainer.style.display = "block";
  } else {
    paisOrigenContainer.style.display = "none";
    paisOrigen.value = "";
  }
});


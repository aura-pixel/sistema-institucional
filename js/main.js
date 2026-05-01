// js/main.js

const loginForm = document.getElementById("loginForm");
const numeroCuentaInput = document.getElementById("numeroCuenta");
const errorMessage = document.getElementById("errorMessage");

// Validar formato
function validarNumeroCuenta(numero) {
  return /^\d{7}$/.test(numero);
}

// Solo números
numeroCuentaInput.addEventListener("input", () => {
  numeroCuentaInput.value = numeroCuentaInput.value.replace(/\D/g, "");

  if (numeroCuentaInput.value.length > 7) {
    numeroCuentaInput.value = numeroCuentaInput.value.slice(0, 7);
  }

  errorMessage.textContent = "";
});

// Login / Registro
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numeroCuenta = numeroCuentaInput.value.trim();

  // Validación local
  if (!validarNumeroCuenta(numeroCuenta)) {
    errorMessage.textContent =
      "El número de cuenta debe tener exactamente 7 dígitos.";
    return;
  }

  errorMessage.textContent = "Validando...";

  try {
    // Buscar alumno
    const { data: alumnoExistente, error: searchError } =
      await supabaseClient
        .from("alumnos")
        .select("*")
        .eq("numero_cuenta", numeroCuenta)
        .maybeSingle();

    if (searchError) {
      console.error(searchError);
      errorMessage.textContent =
        "Error al conectar con la base de datos.";
      return;
    }

    // Si no existe → crear
    if (!alumnoExistente) {
      const { error: insertError } = await supabaseClient
        .from("alumnos")
        .insert([
          {
            numero_cuenta: numeroCuenta,
            estado_registro: "incompleto",
          },
        ]);

      if (insertError) {
        console.error(insertError);
        errorMessage.textContent =
          "No se pudo registrar el alumno.";
        return;
      }
    }

    // Guardar sesión
    localStorage.setItem("numeroCuenta", numeroCuenta);

    // Redirección
    window.location.href = "bienvenida.html";

  } catch (err) {
    console.error(err);
    errorMessage.textContent =
      "Ocurrió un error inesperado.";
  }
});

const coordinadorBtn =
  document.getElementById("coordinadorBtn");

if (coordinadorBtn) {
  coordinadorBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}
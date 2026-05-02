// js/materias.js

const materiasContainer = document.getElementById("materiasContainer");
const materiasExtrasContainer = document.getElementById("materiasExtrasContainer");
const totalCreditosSpan = document.getElementById("totalCreditos");
const guardarMateriasBtn = document.getElementById("guardarMateriasBtn");
const errorMaterias = document.getElementById("errorMessage");
const agregarMateriaBtn = document.getElementById("agregarMateriaBtn");

const numeroCuenta = localStorage.getItem("numeroCuenta");

if (!numeroCuenta) {
  window.location.href = "index.html";
}

let materiasActuales = [];

/* =========================
   CARGAR MATERIAS BASE
========================= */
async function cargarMaterias() {
  materiasContainer.innerHTML = "";
  materiasExtrasContainer.innerHTML = "";
  errorMaterias.textContent = "";

  const { data: alumno, error } = await supabaseClient
    .from("alumnos")
    .select("semestre")
    .eq("numero_cuenta", numeroCuenta)
    .maybeSingle();

  if (error || !alumno) {
    errorMaterias.textContent =
      "No se pudo obtener la información del alumno.";
    return;
  }

  const semestre = alumno.semestre;
  const materias = materiasPorSemestre[semestre];

  if (!materias || materias.length === 0) {
    errorMaterias.textContent =
      "No hay materias configuradas para este semestre.";
    return;
  }

  materiasActuales = [...materias];

  renderMateriasBase();
  recalcularCreditos();
}

/* =========================
   RENDER BASE
========================= */
function renderMateriasBase() {
  materiasContainer.innerHTML = "";

  materiasActuales.forEach((materia, index) => {
    const div = document.createElement("div");
    div.classList.add("materia-card");

    div.innerHTML = `
      <div class="materia-row">
        <div class="materia-nombre-base">
          <strong>${materia.clave} · ${materia.nombre}</strong>
<span>${materia.creditos} créditos</span>
        </div>

        <input
          type="text"
          placeholder="Grupo"
          id="grupo-${index}"
          maxlength="3"
          class="materia-col"
        />

        <input
          type="text"
          placeholder="Subgrupo"
          id="subgrupo-${index}"
          maxlength="3"
          class="materia-col"
        />

        <select
          id="recursa-${index}"
          class="materia-col"
        >
          <option value="No">Recursa: No</option>
          <option value="Sí">Recursa: Sí</option>
        </select>

        <button
          type="button"
          class="eliminar-base-btn materia-delete"
          data-index="${index}"
        >
          ✕
        </button>
      </div>
    `;

    materiasContainer.appendChild(div);
  });

  document.querySelectorAll(".eliminar-base-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      materiasActuales.splice(index, 1);
      renderMateriasBase();
      recalcularCreditos();
    });
  });

  document.querySelectorAll("#materiasContainer input, #materiasContainer select")
    .forEach((campo) => {
      campo.addEventListener("input", recalcularCreditos);
      campo.addEventListener("change", recalcularCreditos);
    });
}

/* =========================
   TODAS LAS MATERIAS
========================= */
function obtenerTodasLasMaterias() {
  let todas = [];

  Object.keys(materiasPorSemestre).forEach((sem) => {
    materiasPorSemestre[sem].forEach((materia) => {
      todas.push({
        ...materia,
        semestre: sem,
      });
    });
  });

  return todas;
}

/* =========================
   AGREGAR EXTRA
========================= */
function renderMateriaExtra() {
  const clavesActuales = obtenerMateriasSeleccionadas().map(
    (m) => m.clave
  );

  const disponibles = obtenerTodasLasMaterias().filter(
    (materia) => !clavesActuales.includes(materia.clave)
  );

  const div = document.createElement("div");
  div.classList.add("materia-card");

  div.innerHTML = `
    <div class="materia-row">
      <select class="materia-extra-select materia-col materia-nombre">
        <option value="">Selecciona una materia</option>
        ${disponibles
          .map(
            (m) => `
          <option value="${m.clave}">
            [${m.semestre}] ${m.nombre} (${m.creditos} créditos)
          </option>
        `
          )
          .join("")}
      </select>

      <input
        type="text"
        placeholder="Grupo"
        maxlength="3"
        class="grupo-extra materia-col"
      />

      <input
        type="text"
        placeholder="Subgrupo"
        maxlength="3"
        class="subgrupo-extra materia-col"
      />

      <select class="recursa-extra materia-col">
        <option value="No">Recursa: No</option>
        <option value="Sí">Recursa: Sí</option>
      </select>

      <button
        type="button"
        class="eliminar-materia-btn materia-delete"
      >
        ✕
      </button>
    </div>
  `;

  div.querySelector(".eliminar-materia-btn")
    .addEventListener("click", () => {
      div.remove();
      recalcularCreditos();
    });

  div.querySelectorAll("input, select")
    .forEach((campo) => {
      campo.addEventListener("input", recalcularCreditos);
      campo.addEventListener("change", recalcularCreditos);
    });

  materiasExtrasContainer.appendChild(div);
}

/* =========================
   OBTENER TODO
========================= */
function obtenerMateriasSeleccionadas() {
  const materiasFinales = materiasActuales.map(
    (materia, index) => ({
      ...materia,
      numero_cuenta: numeroCuenta,
      grupo:
        document.getElementById(`grupo-${index}`)?.value.trim() || "",
      subgrupo:
        document.getElementById(`subgrupo-${index}`)?.value.trim() || "",
      recursa:
        document.getElementById(`recursa-${index}`)?.value || "No",
    })
  );

  const todasLasMaterias = obtenerTodasLasMaterias();

  document.querySelectorAll(".materia-extra-select").forEach((select) => {
    if (!select.value) return;

    const card = select.closest(".materia-card");

    const materiaData = todasLasMaterias.find(
      (m) => m.clave === select.value
    );

    if (!materiaData) return;

    materiasFinales.push({
      ...materiaData,
      numero_cuenta: numeroCuenta,
      grupo:
        card.querySelector(".grupo-extra")?.value.trim() || "",
      subgrupo:
        card.querySelector(".subgrupo-extra")?.value.trim() || "",
      recursa:
        card.querySelector(".recursa-extra")?.value || "No",
    });
  });

  return materiasFinales;
}

/* =========================
   CRÉDITOS
========================= */
function recalcularCreditos() {
  const materias = obtenerMateriasSeleccionadas();

  const total = materias.reduce(
    (acc, materia) => acc + materia.creditos,
    0
  );

  totalCreditosSpan.textContent = total;

  if (total < 24 || total > 48) {
    errorMaterias.textContent =
      "Debes seleccionar entre 24 y 48 créditos.";
  } else {
    errorMaterias.textContent = "";
  }
}

/* =========================
   GUARDAR
========================= */
guardarMateriasBtn.addEventListener("click", async () => {
  const materiasSeleccionadas = obtenerMateriasSeleccionadas();

  const totalCreditos = parseInt(totalCreditosSpan.textContent);

  if (totalCreditos < 24 || totalCreditos > 48) {
    errorMaterias.textContent =
      "Debes cumplir con el rango de 24 a 48 créditos.";
    return;
  }

  for (const materia of materiasSeleccionadas) {
    if (!materia.grupo) {
      errorMaterias.textContent =
        "Todas las materias deben tener grupo.";
      return;
    }
  }

  errorMaterias.textContent = "Guardando materias...";

  try {
    await supabaseClient
      .from("materias_alumno")
      .delete()
      .eq("numero_cuenta", numeroCuenta);

      const { error } = await supabaseClient
  .from("materias_alumno")
  .insert(
    materiasSeleccionadas.map((m) => ({
      numero_cuenta: m.numero_cuenta,
      clave: m.clave,
      nombre: m.nombre,
      creditos: m.creditos,
      grupo: m.grupo,
      subgrupo: m.subgrupo || "",
      recursa: m.recursa,
      semestre: parseInt(m.semestre),
    }))
  );

if (error) {
  console.error("Error guardando materias:", error);
  errorMaterias.textContent =
    "No se pudieron guardar las materias.";
  return;
}

// SOLO SI materias se guardó bien:
const semestreActual =
  materiasSeleccionadas[0]?.semestre?.toString() || "";

const periodoActual =
  new Date().getFullYear() +
  "-" +
  (new Date().getMonth() < 6 ? "A" : "B");

await supabaseClient
  .from("historial_academico")
  .delete()
  .eq("numero_cuenta", numeroCuenta)
  .eq("semestre", semestreActual)
  .eq("periodo", periodoActual);

const { error: historialError } =
  await supabaseClient
    .from("historial_academico")
    .insert([
      {
        numero_cuenta: numeroCuenta,
        semestre: semestreActual,
        periodo: periodoActual,
        materias_json: JSON.parse(JSON.stringify(materiasSeleccionadas)),
        creditos_acumulados: totalCreditos,
        documento_url: null,
      },
    ]);

console.log("Historial payload limpio:", {
  numero_cuenta: numeroCuenta,
  semestre: semestreActual,
  periodo: periodoActual,
  materias_json: JSON.parse(
    JSON.stringify(materiasSeleccionadas)
  ),
  creditos_acumulados: totalCreditos
});

console.log("Historial error:", historialError);

if (historialError) {
  console.error(
    "Error guardando historial:",
    historialError
  );
}

    if (error) {
      errorMaterias.textContent =
        "No se pudieron guardar las materias.";
      return;
    }

    localStorage.setItem(
      "materiasSeleccionadas",
      JSON.stringify(materiasSeleccionadas)
    );

    localStorage.setItem(
      "creditosTotales",
      totalCreditos
    );

    window.location.href = "documentos.html";

  } catch (err) {
    console.error(err);
    errorMaterias.textContent =
      "Ocurrió un error inesperado.";
  }
});

/* =========================
   EVENTOS
========================= */
if (agregarMateriaBtn) {
  agregarMateriaBtn.addEventListener("click", () => {
    renderMateriaExtra();
  });
}

/* =========================
   INICIO
========================= */
cargarMaterias();
// PLAN DE ESTUDIOS COMPLETO
// Terapia Ocupacional FACMED

const materiasPorSemestre = {
  1: [
  {
    clave: "TO101",
    nombre: "Anatomía humana I",
    creditos: 18,
  },
  {
    clave: "TO102",
    nombre: "Histología",
    creditos: 7,
  },
  {
    clave: "TO103",
    nombre: "Embriología",
    creditos: 4,
  },
  {
    clave: "TO104",
    nombre: "Historia de la Terapia Ocupacional",
    creditos: 4,
  },
  {
    clave: "TO105",
    nombre: "Ocupación y promoción de la salud",
    creditos: 4,
  },
  {
    clave: "TO106",
    nombre: "Psicología",
    creditos: 4,
  },
  {
    clave: "TO107",
    nombre: "Ética profesional",
    creditos: 4,
  },
],

2: [
  {
    clave: "TO201",
    nombre: "Anatomía humana II",
    creditos: 10,
  },
  {
    clave: "TO202",
    nombre: "Bioquímica",
    creditos: 8,
  },
  {
    clave: "TO203",
    nombre: "Género, sexualidad y discapacidad",
    creditos: 4,
  },
  {
    clave: "TO204",
    nombre: "Ciencia ocupacional",
    creditos: 4,
  },
  {
    clave: "TO205",
    nombre: "Kinesiología y biomecánica",
    creditos: 8,
  },
  {
    clave: "TO206",
    nombre: "Antropología",
    creditos: 7,
  },
  {
    clave: "TO207",
    nombre: "Inglés 5",
    creditos: 6,
  },
],

3: [
  {
    clave: "TO301",
    nombre: "Fisiología humana I",
    creditos: 18,
  },
  {
    clave: "TO302",
    nombre: "Epidemiología",
    creditos: 7,
  },
  {
    clave: "TO303",
    nombre: "Neurodesarrollo infantil",
    creditos: 5,
  },
  {
    clave: "TO304",
    nombre: "Marcos de referencia de Terapia Ocupacional",
    creditos: 4,
  },
  {
    clave: "TO305",
    nombre: "Ortopedia y traumatología",
    creditos: 7,
  },
  {
    clave: "TO306",
    nombre: "Inglés 6",
    creditos: 6,
  },
],

4: [
  {
    clave: "TO401",
    nombre: "Fisiología humana II",
    creditos: 10,
  },
  {
    clave: "TO402",
    nombre: "Farmacología básica",
    creditos: 7,
  },
  {
    clave: "TO403",
    nombre: "Neurología clínica",
    creditos: 7,
  },
  {
    clave: "TO404",
    nombre: "Análisis del desempeño ocupacional y la actividad",
    creditos: 6,
  },
  {
    clave: "TO405",
    nombre: "Ergonomía y ocupación",
    creditos: 6,
  },
  {
    clave: "TO406",
    nombre: "Discapacidad, participación y entorno",
    creditos: 4,
  },
  {
    clave: "TO407",
    nombre: "Práctica clínica 1",
    creditos: 4,
  },
  {
    clave: "TO408",
    nombre: "Inglés 7",
    creditos: 6,
  },
],

5: [
  {
    clave: "TO501",
    nombre: "Fisiopatología",
    creditos: 7,
  },
  {
    clave: "TO502",
    nombre: "Análisis cuantitativo de la ocupación",
    creditos: 7,
  },
  {
    clave: "TO503",
    nombre: "Rehabilitación para la ocupación I",
    creditos: 5,
  },
  {
    clave: "TO504",
    nombre: "Evaluación e intervención en contextos educativos",
    creditos: 7,
  },
  {
    clave: "TO505",
    nombre: "Diseño de férulas y aditamentos",
    creditos: 5,
  },
  {
    clave: "TO506",
    nombre: "Asistencia tecnológica",
    creditos: 5,
  },
  {
    clave: "TO507",
    nombre: "Práctica clínica 2",
    creditos: 4,
  },
  {
    clave: "TO508",
    nombre: "Inglés 8",
    creditos: 6,
  },
],

6: [
  {
    clave: "TO601",
    nombre: "Evaluación e intervención en alteraciones de las funciones sistémicas",
    creditos: 7,
  },
  {
    clave: "TO602",
    nombre: "Análisis cualitativo de la ocupación",
    creditos: 6,
  },
  {
    clave: "TO603",
    nombre: "Rehabilitación para la ocupación II",
    creditos: 7,
  },
  {
    clave: "TO604",
    nombre: "Evaluación e intervención en contextos deportivos y culturales",
    creditos: 7,
  },
  {
    clave: "TO605",
    nombre: "Evaluación e intervención en deficiencias del sistema musculoesquelético",
    creditos: 7,
  },
  {
    clave: "TO606",
    nombre: "Tanatología",
    creditos: 5,
  },
  {
    clave: "TO607",
    nombre: "Práctica clínica 3",
    creditos: 4,
  },
  {
    clave: "TO608",
    nombre: "Optativa I",
    creditos: 5,
  },
],

7: [
  {
    clave: "TO701",
    nombre: "Evaluación e intervención del sistema cardiovascular",
    creditos: 5,
  },
  {
    clave: "TO702",
    nombre: "Integración sensorial",
    creditos: 5,
  },
  {
    clave: "TO703",
    nombre: "Evaluación e intervención en deficiencias neurológicas",
    creditos: 7,
  },
  {
    clave: "TO704",
    nombre: "Determinantes sociales",
    creditos: 7,
  },
  {
    clave: "TO705",
    nombre: "Rehabilitación de miembro superior",
    creditos: 5,
  },
  {
    clave: "TO706",
    nombre: "Evaluación e intervención en deficiencia de las funciones mentales",
    creditos: 7,
  },
  {
    clave: "TO707",
    nombre: "Práctica clínica 4",
    creditos: 4,
  },
  {
    clave: "TO708",
    nombre: "Optativa II",
    creditos: 5,
  },
],

8: [
  {
    clave: "TO801",
    nombre: "Evaluación e intervención en deficiencias del sistema respiratorio",
    creditos: 5,
  },
  {
    clave: "TO802",
    nombre: "Evaluación e intervención en pacientes con quemaduras",
    creditos: 7,
  },
  {
    clave: "TO803",
    nombre: "Evaluación e intervención en deficiencias de las funciones sensoriales",
    creditos: 7,
  },
  {
    clave: "TO804",
    nombre: "Evaluación e intervención en contextos comunitarios",
    creditos: 7,
  },
  {
    clave: "TO805",
    nombre: "Evaluación e intervención en contextos laborales",
    creditos: 7,
  },
  {
    clave: "TO806",
    nombre: "Gestión en servicios de Terapia Ocupacional",
    creditos: 6,
  },
  {
    clave: "TO807",
    nombre: "Práctica clínica 5",
    creditos: 4,
  },
  {
    clave: "TO808",
    nombre: "Optativa III",
    creditos: 5,
  },
],

optativas: [
  {
    clave: "OPT01",
    nombre: "Terapia de juego",
    creditos: 5,
  },
  {
    clave: "OPT02",
    nombre: "Estrategias Terapéuticas",
    creditos: 5,
  },
  {
    clave: "OPT03",
    nombre: "Lengua Mexicana de Señas",
    creditos: 5,
  },
  {
    clave: "OPT04",
    nombre: "Music therapy",
    creditos: 5,
  },
  {
    clave: "OPT05",
    nombre: "Investigación en Terapia Ocupacional",
    creditos: 5,
  },
  {
    clave: "OPT06",
    nombre: "Rehabilitación oncológica",
    creditos: 5,
  },
],

};

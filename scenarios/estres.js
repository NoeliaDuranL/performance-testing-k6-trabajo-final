// Prueba de estrés (stress test).
// Escalones de 50, 100, 150 y 200 VUs para identificar el punto de saturación.
// Carga máxima: 200 VUs sostenidos durante 2 minutos (min 5:00 a 7:00).
import { construirOpciones } from '../utils/config.js';
import { prepararUsuarios } from '../utils/preparacion.js';
import flujoUsuario from '../flujos/flujoUsuario.js';

export const options = construirOpciones('estres', [
  { duration: '30s', target: 50 },
  { duration: '1m', target: 50 },
  { duration: '30s', target: 100 },
  { duration: '1m', target: 100 },
  { duration: '30s', target: 150 },
  { duration: '1m', target: 150 },
  { duration: '30s', target: 200 },
  { duration: '2m', target: 200 }, // carga máxima
  { duration: '1m', target: 0 },
]);

export function setup() {
  prepararUsuarios();
}

export default function () {
  flujoUsuario();
}

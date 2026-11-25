// Prueba de carga sostenida (load test).
// Carga nominal: 50 VUs durante 4 minutos, con rampas de subida y bajada.
import { construirOpciones } from '../utils/config.js';
import { prepararUsuarios } from '../utils/preparacion.js';
import flujoUsuario from '../flujos/flujoUsuario.js';

export const options = construirOpciones('carga_sostenida', [
  { duration: '30s', target: 50 }, // rampa de subida
  { duration: '4m', target: 50 },  // carga nominal sostenida
  { duration: '30s', target: 0 },  // rampa de bajada
]);

export function setup() {
  prepararUsuarios();
}

export default function () {
  flujoUsuario();
}

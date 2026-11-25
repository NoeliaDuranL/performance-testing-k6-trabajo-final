// Prueba de humo (smoke test): 1 VU durante 30 s.
// Valida que scripts, datos, correlación y entorno funcionan antes de cargar.
import { construirOpciones } from '../utils/config.js';
import { prepararUsuarios } from '../utils/preparacion.js';
import flujoUsuario from '../flujos/flujoUsuario.js';

export const options = construirOpciones('humo', [
  { duration: '1s', target: 1 },
  { duration: '30s', target: 1 },
]);

export function setup() {
  prepararUsuarios();
}

export default function () {
  flujoUsuario();
}

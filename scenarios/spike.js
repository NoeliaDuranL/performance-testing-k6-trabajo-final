// Prueba de pico (spike test).
// Rampa hasta una línea base de 10 VUs, pico repentino a 100 VUs (x10) y fase de recuperación
// de 1m30s a 10 VUs para observar si el sistema vuelve a sus tiempos normales.
import { construirOpciones } from '../utils/config.js';
import { prepararUsuarios } from '../utils/preparacion.js';
import flujoUsuario from '../flujos/flujoUsuario.js';

export const options = construirOpciones('spike', [
  { duration: '30s', target: 10 },   // rampa hasta la línea base
  { duration: '10s', target: 100 },  // pico repentino
  { duration: '1m', target: 100 },   // mantenimiento del pico
  { duration: '10s', target: 10 },   // caída repentina
  { duration: '1m30s', target: 10 }, // recuperación
  { duration: '20s', target: 0 },
]);

export function setup() {
  prepararUsuarios();
}

export default function () {
  flujoUsuario();
}

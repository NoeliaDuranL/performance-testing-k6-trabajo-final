// Parametrización de datos con SharedArray.
// Los archivos JSON se leen UNA sola vez en el contexto init y se comparten
// en modo solo lectura entre todos los usuarios virtuales (VUs), en lugar de
// que cada VU mantenga su propia copia en memoria.
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

export const usuarios = new SharedArray('usuarios', function () {
  return JSON.parse(open('../data/usuarios.json'));
});

export const busquedas = new SharedArray('busquedas', function () {
  return JSON.parse(open('../data/busquedas.json'));
});

// Asigna a cada VU un usuario distinto de forma determinista (round-robin):
// VU 1 -> usuario 1, VU 2 -> usuario 2, ..., VU 51 -> usuario 1.
export function usuarioDelVU() {
  return usuarios[(exec.vu.idInTest - 1) % usuarios.length];
}

// Devuelve un término de búsqueda aleatorio en cada iteración.
export function terminoAleatorio() {
  return busquedas[Math.floor(Math.random() * busquedas.length)].termino;
}

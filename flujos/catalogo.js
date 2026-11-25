// Flujo crítico 1: búsqueda de productos en el catálogo (acceso público).
import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, THINK_TIME, TX } from '../utils/config.js';
import { terminoAleatorio } from '../utils/datos.js';
import { leerJson, validarFuncional, validarTiempo } from '../utils/validaciones.js';

export function buscarProductos() {
  const termino = terminoAleatorio();

  const respuesta = http.get(
    `${BASE_URL}/rest/products/search?q=${encodeURIComponent(termino)}`,
    { tags: { name: TX.BUSQUEDA } }
  );

  validarFuncional(respuesta, {
    'Busqueda: HTTP 200': (r) => r.status === 200,
    'Busqueda: respuesta con lista de productos': (r) => Array.isArray(leerJson(r, 'data')),
  });
  validarTiempo(respuesta, 'Busqueda');

  sleep(THINK_TIME);
}

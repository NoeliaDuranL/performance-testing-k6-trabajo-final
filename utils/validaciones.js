// Funciones de utilidad para validaciones (checks) y lectura segura de JSON.
// Los checks se etiquetan con "tipo" para poder definir thresholds separados:
//   - funcional:   estado HTTP, contenido de negocio y datos correlacionados.
//   - rendimiento: tiempo de respuesta frente al SLA.
// Así una degradación de latencia no se confunde con un fallo funcional.
import { check } from 'k6';
import { SLA_MS } from './config.js';

export function validarFuncional(objetivo, validaciones) {
  return check(objetivo, validaciones, { tipo: 'funcional' });
}

export function validarTiempo(respuesta, transaccion, limiteMs = SLA_MS.p95) {
  return check(
    respuesta,
    { [`${transaccion} < ${limiteMs} ms`]: (r) => r.timings.duration < limiteMs },
    { tipo: 'rendimiento' }
  );
}

// Extrae un valor del cuerpo JSON (selector estilo JSONPath de k6) sin lanzar
// excepción cuando la respuesta no es JSON válido.
export function leerJson(respuesta, selector) {
  try {
    return respuesta.json(selector);
  } catch (e) {
    return undefined;
  }
}

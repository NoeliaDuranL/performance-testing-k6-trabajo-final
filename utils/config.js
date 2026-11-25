// Configuración central del proyecto.
// Todos los valores pueden sobrescribirse con variables de entorno (-e VAR=valor o $env:VAR).

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Tiempo de pensamiento (think time) entre acciones del usuario, en segundos.
export const THINK_TIME = Number(__ENV.THINK_TIME || 1);

// Acuerdo de nivel de servicio (SLA) en milisegundos.
export const SLA_MS = {
  p95: 500,
  p99: 1000,
};

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Nombres de las transacciones. Se usan como tag "name" para agrupar las
// métricas por endpoint (evita una serie distinta por cada URL de búsqueda).
export const TX = {
  BUSQUEDA: 'BuscarProductos',
  LOGIN: 'Login',
  CARRITO: 'ConsultarCarrito',
};

// Criterios de aceptación (thresholds) comunes a todos los perfiles de carga.
// - Globales: P95 < 500 ms, P99 < 1000 ms y errores HTTP < 1 %.
// - Por transacción: cada endpoint crítico debe cumplir P95 < 500 ms.
// - Checks funcionales (estado HTTP, contenido, correlación) > 99 %.
// - Checks de rendimiento (respuesta < 500 ms) > 95 %, coherente con el P95.
export const THRESHOLDS = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: [`p(95)<${SLA_MS.p95}`, `p(99)<${SLA_MS.p99}`],
  [`http_req_duration{name:${TX.BUSQUEDA}}`]: [`p(95)<${SLA_MS.p95}`],
  [`http_req_duration{name:${TX.LOGIN}}`]: [`p(95)<${SLA_MS.p95}`],
  [`http_req_duration{name:${TX.CARRITO}}`]: [`p(95)<${SLA_MS.p95}`],
  'checks{tipo:funcional}': ['rate>0.99'],
  'checks{tipo:rendimiento}': ['rate>0.95'],
};

export const SUMMARY_TREND_STATS = ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'];

// Construye las opciones de k6 a partir de las etapas de un perfil de carga.
export function construirOpciones(nombreEscenario, stages) {
  return {
    scenarios: {
      [nombreEscenario]: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages,
        gracefulRampDown: '30s',
      },
    },
    setupTimeout: '2m',
    thresholds: THRESHOLDS,
    summaryTrendStats: SUMMARY_TREND_STATS,
  };
}

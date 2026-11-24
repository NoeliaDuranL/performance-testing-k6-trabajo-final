
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const busquedas = new SharedArray('datos_busqueda', function () {
  return JSON.parse(open('../data/busquedas.json'));
});

export const options = {
  vus: 2,
  duration: '20s',

  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const dato = busquedas[
    Math.floor(Math.random() * busquedas.length)
  ];

  const url =
    'http://localhost:3000/rest/products/search?q=' +
    encodeURIComponent(dato.termino);

  const respuesta = http.get(url);

  check(respuesta, {
    'Estado HTTP 200': (r) => r.status === 200,
    'Respuesta contiene lista de productos': (r) => {
      try {
        return Array.isArray(r.json('data'));
      } catch {
        return false;
      }
    },
    'Tiempo menor a 500ms': (r) =>
      r.timings.duration < 500,
  });

  sleep(1);
}

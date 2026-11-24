import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = 'http://localhost:3000';

const usuarios = new SharedArray('usuarios', function () {
  return JSON.parse(open('../data/usuarios.json'));
});

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const usuario = usuarios[0];

  // 1. Iniciar sesión
  const login = http.post(
    `${BASE_URL}/rest/user/login`,
    JSON.stringify({
      email: usuario.email,
      password: usuario.password,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { name: 'Login' },
    }
  );

  // Validación funcional
  const loginCorrecto = check(login, {
    'Login HTTP 200': (r) => r.status === 200,
  });

  // Validación de rendimiento independiente
  check(login, {
    'Login menor a 500ms': (r) =>
      r.timings.duration < 500,
  });

  // Interrumpir únicamente si falla el login
  if (!loginCorrecto) {
    return;
  }

  // 2. Extraer datos dinámicos
  let autenticacion;

  try {
    autenticacion = login.json('authentication');
  } catch {
    autenticacion = null;
  }

  const token = autenticacion?.token;
  const basketId = autenticacion?.bid;

  const datosCorrectos = check(autenticacion, {
    'Token JWT recibido': (a) =>
      typeof a?.token === 'string' &&
      a.token.length > 0,

    'ID de carrito recibido': (a) =>
      Number.isInteger(a?.bid) && a.bid > 0,
  });

  if (!datosCorrectos) {
    return;
  }

  // 3. Reutilizar los datos dinámicos
  const carrito = http.get(
    `${BASE_URL}/rest/basket/${basketId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      tags: { name: 'ConsultarCarrito' },
    }
  );

  // 4. Validar la respuesta del carrito
  check(carrito, {
    'Carrito HTTP 200': (r) => r.status === 200,

    'Carrito menor a 500ms': (r) =>
      r.timings.duration < 500,

    'Respuesta contiene productos del carrito': (r) => {
      try {
        return Array.isArray(r.json('data.Products'));
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
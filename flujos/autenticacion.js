// Flujos críticos 2 y 3: inicio de sesión y consulta del carrito.
// Implementa la CORRELACIÓN: el token JWT y el ID del carrito (bid) se extraen
// dinámicamente de la respuesta del login (selector JSONPath
// "authentication.token" / "authentication.bid") y se reutilizan en la
// petición siguiente.
import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, JSON_HEADERS, THINK_TIME, TX } from '../utils/config.js';
import { usuarioDelVU } from '../utils/datos.js';
import { leerJson, validarFuncional, validarTiempo } from '../utils/validaciones.js';

export function iniciarSesion() {
  const usuario = usuarioDelVU();

  const respuesta = http.post(
    `${BASE_URL}/rest/user/login`,
    JSON.stringify({ email: usuario.email, password: usuario.password }),
    { headers: JSON_HEADERS, tags: { name: TX.LOGIN } }
  );

  // Correlación: extracción de valores dinámicos devueltos por el servidor.
  const token = leerJson(respuesta, 'authentication.token');
  const basketId = leerJson(respuesta, 'authentication.bid');
  const emailRespuesta = leerJson(respuesta, 'authentication.umail');

  const correcto = validarFuncional(respuesta, {
    'Login: HTTP 200': (r) => r.status === 200,
    'Login: token JWT recibido': () => typeof token === 'string' && token.split('.').length === 3,
    'Login: ID de carrito recibido': () => Number.isInteger(basketId) && basketId > 0,
    'Login: sesion del usuario correcto': () => emailRespuesta === usuario.email,
  });
  validarTiempo(respuesta, 'Login');

  return correcto ? { token, basketId } : null;
}

export function consultarCarrito(sesion) {
  // Reutilización de los valores correlacionados (bid en la URL, JWT en la cabecera).
  const respuesta = http.get(`${BASE_URL}/rest/basket/${sesion.basketId}`, {
    headers: { Authorization: `Bearer ${sesion.token}` },
    tags: { name: TX.CARRITO },
  });

  validarFuncional(respuesta, {
    'Carrito: HTTP 200': (r) => r.status === 200,
    'Carrito: corresponde al ID correlacionado': (r) => leerJson(r, 'data.id') === sesion.basketId,
    'Carrito: contiene lista de productos': (r) => Array.isArray(leerJson(r, 'data.Products')),
  });
  validarTiempo(respuesta, 'Carrito');
}

export function autenticarYConsultarCarrito() {
  const sesion = iniciarSesion();

  // Sin sesión válida no se puede continuar con la petición dependiente.
  if (sesion) {
    consultarCarrito(sesion);
  }

  sleep(THINK_TIME);
}

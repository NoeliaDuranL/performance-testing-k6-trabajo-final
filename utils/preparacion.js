// Preparación de datos de prueba (se ejecuta una vez en setup()).
// OWASP Juice Shop reinicia su base de datos SQLite cada vez que se reinicia
// el contenedor, por lo que los usuarios de prueba se registran antes de
// cada ejecución. Si el usuario ya existe, la API responde 400 y se acepta.
import http from 'k6/http';
import { fail } from 'k6';
import { BASE_URL, JSON_HEADERS } from './config.js';
import { usuarios } from './datos.js';

const ESTADOS_REGISTRO = http.expectedStatuses(201, 400);

export function prepararUsuarios() {
  let creados = 0;

  for (const usuario of usuarios) {
    const res = http.post(
      `${BASE_URL}/api/Users`,
      JSON.stringify({
        email: usuario.email,
        password: usuario.password,
        passwordRepeat: usuario.password,
        securityQuestion: { id: 1 },
        securityAnswer: 'k6',
      }),
      {
        headers: JSON_HEADERS,
        responseCallback: ESTADOS_REGISTRO,
        tags: { name: 'Setup_RegistroUsuario' },
      }
    );

    if (res.status === 201) {
      creados++;
    } else if (res.status !== 400) {
      fail(`No se pudo registrar ${usuario.email}: HTTP ${res.status}`);
    }
  }

  // Verificación previa: el primer usuario debe poder autenticarse.
  const prueba = http.post(
    `${BASE_URL}/rest/user/login`,
    JSON.stringify({ email: usuarios[0].email, password: usuarios[0].password }),
    { headers: JSON_HEADERS, tags: { name: 'Setup_VerificarLogin' } }
  );
  if (prueba.status !== 200) {
    fail(`Los usuarios de prueba no pueden autenticarse (HTTP ${prueba.status})`);
  }

  console.log(`Preparación: ${creados} usuarios creados, ${usuarios.length - creados} ya existían.`);
}


import { group } from 'k6';
import catalogo from './catalogo.js';
import autenticacion from './autenticacion.js';

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '4m', target: 50 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    group('Busqueda de productos', function () {
        catalogo();
    });

    group('Autenticacion y consulta de carrito', function () {
        autenticacion();
    });
}

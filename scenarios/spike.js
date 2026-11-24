
import flujoCompleto from './carga.js';

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '40s', target: 10 },
        { duration: '5s', target: 100 },
        { duration: '40s', target: 100 },
        { duration: '5s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '20s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    flujoCompleto();
}

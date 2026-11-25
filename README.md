# Performance Testing – OWASP Juice Shop con k6, Prometheus y Grafana

- **Universidad:** Universidad Católica Boliviana
- **Programa:** Diplomado en Testing de Software V6 – Módulo Testing de Performance
- **Integrantes:** Noelia Paola Duran Llaveta · Juan Adolfo Mur Rodriguez
- **Documento técnico:** se entrega por separado (no forma parte del repositorio).

Evaluación del rendimiento, la estabilidad y el comportamiento bajo carga de OWASP Juice Shop mediante pruebas de **carga sostenida**, **pico (spike)** y **estrés**, con métricas en tiempo real en Grafana.

## 1. Arquitectura

```
                 HTTP/REST
  k6 (VUs) ───────────────────────▶ OWASP Juice Shop (Node.js + SQLite, 2 CPU / 2 GB)
     │
     │ Remote Write (2 s, histogramas nativos)
     ▼
  Prometheus ◀──── PromQL ──── Grafana (dashboard aprovisionado)
```

Todo corre en una misma red Docker (`docker-compose.yml`) con versiones fijas:
`juice-shop:v17.1.1`, `k6:0.54.0`, `prometheus:v2.55.1`, `grafana:11.3.0`.

## 2. Estructura del proyecto

```
data/                     Datos externos (parametrización)
  usuarios.json           50 cuentas de prueba
  busquedas.json          20 términos de búsqueda
utils/                    Funciones de utilidad
  config.js               BASE_URL, think time, SLA, thresholds y opciones comunes
  datos.js                SharedArray + selección de usuario por VU / término aleatorio
  validaciones.js         Checks funcionales y de rendimiento (tag "tipo"), lectura JSON segura
  preparacion.js          Registro de usuarios de prueba en setup()
flujos/                   Lógica de negocio (sin configuración de carga)
  catalogo.js             Búsqueda de productos
  autenticacion.js        Login + correlación (JWT y bid) + consulta de carrito
  flujoUsuario.js         Recorrido completo del usuario (groups)
scenarios/                Perfiles de carga (solo etapas)
  humo.js                 Smoke test: 1 VU, 30 s
  carga.js                Carga sostenida: 50 VUs, 4 min
  spike.js                Pico: 10 → 100 → 10 VUs con fase de recuperación
  estres.js               Estrés: 50 → 100 → 150 → 200 VUs
grafana/
  dashboards/dashboard-k6.json     Dashboard personalizado
  provisioning/                    Datasource y dashboard aprovisionados automáticamente
results/                  Resumen de k6 por prueba (.json exportado y .txt de la terminal)
evidencias/               Capturas de Grafana (en vivo y rango completo), resumen de terminal y docker stats
docker-compose.yml        Juice Shop + Prometheus + Grafana + k6
prometheus.yml            Configuración de Prometheus
```

## 3. Flujos críticos

| Transacción (tag `name`) | Método | Endpoint |
|---|---|---|
| BuscarProductos | GET | `/rest/products/search?q={término}` |
| Login | POST | `/rest/user/login` |
| ConsultarCarrito | GET | `/rest/basket/{bid}` |

Técnicas implementadas:

- **SharedArray:** usuarios y términos de búsqueda se cargan una sola vez y se comparten entre VUs; cada VU usa su propia cuenta (`exec.vu.idInTest`).
- **Correlación:** el token JWT y el ID de carrito (`authentication.token` / `authentication.bid`) se extraen del login y se reutilizan en la consulta del carrito.
- **Checks:** separados en `tipo:funcional` (estado HTTP, contenido, formato del JWT, carrito correcto) y `tipo:rendimiento` (respuesta < 500 ms).
- **Thresholds:** globales, por transacción y por tipo de check (ver abajo).

## 4. Criterios de aceptación (thresholds)

Carga nominal: **50 VUs**.

| Indicador | Threshold k6 | Criterio |
|---|---|---|
| Latencia P95 / P99 global | `http_req_duration` | < 500 ms / < 1000 ms |
| Latencia P95 por transacción | `http_req_duration{name:…}` | < 500 ms |
| Errores HTTP | `http_req_failed` | < 1 % |
| Checks funcionales | `checks{tipo:funcional}` | > 99 % |
| Respuestas dentro del SLA | `checks{tipo:rendimiento}` | > 95 % |

## 5. Ejecución

### Requisitos

- Docker Desktop (no hace falta instalar k6: se ejecuta en contenedor).

### 5.1 Levantar el entorno

```bash
docker compose up -d
```

| Servicio | URL |
|---|---|
| Juice Shop | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin; lectura anónima habilitada) |

El dashboard **k6 - OWASP Juice Shop (Performance)** queda disponible automáticamente en la carpeta *Performance*; no hay que importarlo.

> Juice Shop tarda unos segundos en iniciar. Espera a ver `Server listening on port 3000` en `docker logs juice-shop` (y unos 30 s más) antes de lanzar carga.

### 5.2 Ejecutar las pruebas

```bash
# Prueba de humo (validación)
docker compose run --rm k6 run --tag testid=humo scenarios/humo.js

# Carga sostenida
docker compose run --rm k6 run --tag testid=carga-sostenida --summary-export=results/carga-sostenida.json scenarios/carga.js

# Pico (spike)
docker compose run --rm k6 run --tag testid=spike --summary-export=results/spike.json scenarios/spike.js

# Estrés
docker compose run --rm k6 run --tag testid=estres --summary-export=results/estres.json scenarios/estres.js
```

Se recomienda reiniciar Juice Shop entre pruebas (`docker restart juice-shop`) para partir de una base de datos limpia; los usuarios de prueba se registran solos en `setup()`.

**Calentamiento:** después de cada reinicio, ejecuta la prueba de humo y espera a que la CPU de Juice Shop vuelva al reposo (`docker stats juice-shop` < 10 %) antes de lanzar la carga. Si la prueba arranca mientras la aplicación todavía se está inicializando, los primeros minutos muestran un rendimiento degradado que no es representativo (ver sección 7.1 del informe).

> En Git Bash (Windows) antepón `MSYS_NO_PATHCONV=1` a los comandos `docker compose run`.

### 5.3 Alternativa: k6 instalado localmente (PowerShell)

```powershell
$env:K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"
$env:K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM="true"
$env:K6_PROMETHEUS_RW_PUSH_INTERVAL="2s"
$env:K6_PROMETHEUS_RW_STALE_MARKERS="true"

k6 run -o experimental-prometheus-rw --tag testid=estres --summary-export=results/estres.json scenarios/estres.js
```

`BASE_URL` toma por defecto `http://localhost:3000` y puede cambiarse con `-e BASE_URL=...`.

### 5.4 Monitoreo de recursos del contenedor

```bash
docker stats juice-shop
```

## 6. Resultados (ejecución del 24/11/2026)

La carga sostenida se ejecutó con calentamiento previo (22:59 – 23:04); las pruebas de pico y estrés, por la mañana (08:33 – 08:46).

| Métrica | Carga sostenida | Pico (spike) | Estrés |
|---|---:|---:|---:|
| VUs máximos | 50 | 100 | 200 |
| Peticiones HTTP | 16.842 | 6.555 | 29.571 |
| Throughput en máxima carga | 61,4 req/s | 62,9 req/s | 61,9 req/s |
| Latencia promedio | 139,4 ms | 620,0 ms | 1.379,5 ms |
| P90 | 216,0 ms | 975,2 ms | 2.612,8 ms |
| P95 | **261,3 ms** | 1.018,8 ms | 2.725,3 ms |
| P99 | 433,3 ms | 1.710,6 ms | 2.993,5 ms |
| Errores HTTP | 0 % | 0 % | 0 % |
| Checks funcionales | 100 % | 100 % | 100 % |
| Checks de rendimiento (< 500 ms) | 99,32 % | 32,41 % | 24,36 % |
| Thresholds cumplidos | **7 / 7 ✅** | 2 / 7 ❌ | 2 / 7 ❌ |

### Estrés por escalón

| VUs | Throughput | P95 | CPU JavaScript (núcleos) |
|---:|---:|---:|---:|
| 50 | 66,6 req/s | 131 ms | 0,91 |
| 100 | 65,7 req/s | 983 ms | 0,93 |
| 150 | 63,6 req/s | 1.821 ms | 0,92 |
| 200 | 61,9 req/s | 2.967 ms | 0,94 |

### Conclusiones principales

- **SLA cumplido con la carga nominal (50 VUs)**, pero sin margen. El punto de saturación es **≈ 46 VUs / ~66 req/s** (Ley de Little).
- Por encima de ese punto el throughput se mantiene plano y la latencia crece de forma lineal (cola). No hay errores HTTP ni fallos funcionales, ni siquiera con 200 VUs.
- Tras el pico ×10, el P95 vuelve a ~35 ms en unos 20 s.
- **Cuello de botella:** el hilo único (event loop) de Node.js. La CPU de JavaScript queda fija en ~0,93 núcleos y el segundo núcleo asignado al contenedor no se usa. Memoria (máx. 399 MiB de 2 GiB), red y base de datos no son limitantes.
- **Recomendaciones:**
  - Escalado horizontal (cluster/PM2 o réplicas detrás de un balanceador) junto con la migración de SQLite a PostgreSQL.
  - Caché e índice de texto completo para la búsqueda.
  - Optimización de la consulta del carrito.
  - Control de admisión con alertas sobre P95 y lag del event loop.

El análisis completo está en el documento técnico, que se entrega por separado.

## 7. Evidencias

Ver [`evidencias/README.md`](evidencias/README.md). Cada prueba tiene capturas del dashboard del **rango completo** (y, en pico y estrés, también **en vivo durante la máxima carga**), el resumen de terminal de k6, el muestreo `docker stats` y su horario de ejecución. Los resúmenes exportados de k6 están en `results/`.


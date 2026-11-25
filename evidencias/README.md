# Evidencias de ejecución

Ejecución del 24/11/2026 en un entorno local con Docker (Juice Shop limitado a 2 CPU / 2 GB). El horario exacto de cada prueba está en `ejecucion.json`.

| Carpeta | Prueba | Capturas |
|---|---|---|
| `carga-sostenida/` | 50 VUs sostenidos (con calentamiento previo, 22:59 – 23:04) | Rango completo de la prueba |
| `spike/` | 10 → 100 → 10 VUs | En vivo durante el pico de 100 VUs y rango completo |
| `estres/` | 50 → 100 → 150 → 200 VUs | En vivo durante la meseta de **200 VUs (carga máxima)** y rango completo |

Archivos de cada carpeta:

| Archivo | Contenido |
|---|---|
| `grafana-completo.png` | Dashboard completo con el rango completo de la prueba (capturado al finalizar) |
| `grafana-1-resumen-carga.png` | Sección: resumen (VUs, peticiones, RPS pico, P95, errores, checks) + VUs/RPS |
| `grafana-2-latencia.png` | Sección: P90/P95/P99, P95 por transacción, VUs vs P95, duración de iteración |
| `grafana-3-errores-checks.png` | Sección: tasa de errores, checks por tipo, tráfico de red, tabla por transacción |
| `grafana-4-servidor.png` | Sección: CPU de Node.js, lag del event loop, memoria del proceso |
| `grafana-en-vivo-*.png` | Igual, capturado **durante** la ejecución (solo `spike/` y `estres/`) |
| `k6-resumen-terminal.png` | Resumen de k6 en la terminal (checks, thresholds y métricas) |
| `docker-stats.csv` | Muestreo de CPU, memoria y red del contenedor `juice-shop` cada ~2-4 s |
| `ejecucion.json` | Inicio y fin de la prueba |

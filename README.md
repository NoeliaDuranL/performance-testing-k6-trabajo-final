# Performance Testing – OWASP Juice Shop

## 1. Información del proyecto

- **Universidad:** Universidad Católica Boliviana
- **Programa:** Diplomado en Testing de Software V6
- **Módulo:** Testing de Performance
- **Proyecto:** Evaluación del rendimiento de una aplicación web mediante k6, Prometheus y Grafana.

## 2. Descripción

El proyecto tiene como objetivo evaluar el rendimiento, estabilidad y capacidad de respuesta de OWASP Juice Shop, una aplicación web de comercio electrónico de código abierto, desplegada en un entorno local mediante Docker.

Se realizaron pruebas de carga sostenida, picos de demanda (Spike Testing) y estrés (Stress Testing), utilizando diferentes niveles de concurrencia para identificar degradaciones del rendimiento y posibles cuellos de botella.

## 3. Herramientas utilizadas

- **OWASP Juice Shop:** aplicación web bajo prueba.
- **Grafana k6:** generación de carga y validación de respuestas.
- **Prometheus:** almacenamiento de métricas.
- **Grafana:** monitoreo y visualización de resultados en tiempo real.
- **Docker y Docker Compose:** despliegue del entorno local.
- **Visual Studio Code:** desarrollo de scripts.
- **Git y GitHub:** control de versiones.

## 4. Arquitectura

El entorno de pruebas está compuesto por una aplicación web ejecutada en Docker, scripts de k6 que generan peticiones HTTP y una infraestructura de monitoreo local mediante Prometheus y Grafana.

Flujo de ejecución:

**k6 → OWASP Juice Shop**

**k6 → Prometheus → Grafana**

## 5. Flujos críticos evaluados

| Flujo | Método | Endpoint |
|---|---|---|
| Búsqueda de productos | GET | /rest/products/search |
| Inicio de sesión | POST | /rest/user/login |
| Consulta del carrito | GET | /rest/basket/:id |

Los scripts implementan:

- Modularización de los flujos de prueba.
- Parametrización mediante archivos JSON externos.
- Uso de SharedArray para la gestión eficiente de datos.
- Correlación dinámica mediante tokens JWT e identificadores de carrito.
- Validación de códigos HTTP, contenido de negocio y tiempos de respuesta.
- Thresholds para determinar el cumplimiento de los objetivos de rendimiento.

## 6. Objetivos de rendimiento

| Indicador | Criterio de aceptación |
|---|---|
| Latencia P95 | Inferior a 500 ms |
| Tasa de errores HTTP | Inferior al 1 % |
| Checks exitosos | Superior al 99 % |

## 7. Perfiles de carga

### Carga sostenida

Evaluación del comportamiento de la aplicación bajo una carga estable de hasta 50 usuarios virtuales.

### Spike Testing

Evaluación de la capacidad de respuesta ante un incremento repentino de hasta 100 usuarios virtuales.

### Stress Testing

Incremento progresivo de la carga mediante niveles de 50, 100, 150 y 200 usuarios virtuales, con el propósito de identificar degradaciones del rendimiento.

## 8. Estructura del proyecto

- `data/`: datos externos utilizados en las pruebas.
- `scenarios/`: scripts de ejecución y flujos críticos.
- `evidencias/`: capturas de Grafana, resultados de terminal y consumo de recursos.
- `results/`: resultados exportados en formato JSON.
- `grafana/`: dashboard personalizado.
- `docker-compose.yml`: configuración de servicios.
- `prometheus.yml`: configuración de Prometheus.

## 9. Instalación y ejecución

### Requisitos

- Docker Desktop.
- Grafana k6.
- Git.

### Levantar la aplicación

```bash
docker run -d --name juice-shop -p 3000:3000 bkimminich/juice-shop
```

La aplicación estará disponible en http://localhost:3000.

Si el contenedor ya existe, utilizar:

```bash
docker start juice-shop
```

### Levantar los servicios de monitoreo

```bash
docker compose up -d
```

### Configurar los datos de prueba

Registrar un usuario de prueba en Juice Shop y configurar sus credenciales en `data/usuarios.json`.

### Configurar k6 para Prometheus

Ejecutar los siguientes comandos en PowerShell:

```powershell
$env:K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"
$env:K6_PROMETHEUS_RW_TREND_STATS="avg,min,max,p(90),p(95),p(99)"
$env:K6_PROMETHEUS_RW_PUSH_INTERVAL="2s"
$env:K6_PROMETHEUS_RW_STALE_MARKERS="true"
$env:K6_SUMMARY_TREND_STATS="avg,min,med,max,p(90),p(95),p(99)"
```

### Validación inicial

```bash
k6 run --vus 1 --duration 10s scenarios/carga.js
```

### Carga sostenida

```bash
k6 run -o experimental-prometheus-rw --tag testid=carga-sostenida --vus 50 --duration 5m --summary-export=results/carga-sostenida.json scenarios/carga.js
```

### Spike Testing

```bash
k6 run -o experimental-prometheus-rw --tag testid=spike --stage 30s:10 --stage 10s:100 --stage 30s:100 --stage 10s:10 --stage 1m:10 --stage 20s:0 --summary-export=results/spike.json scenarios/carga.js
```

### Stress Testing

```bash
k6 run -o experimental-prometheus-rw --tag testid=stress-01 --summary-export=results/stress-01.json --stage 30s:50 --stage 1m:50 --stage 30s:100 --stage 1m:100 --stage 30s:150 --stage 1m:150 --stage 30s:200 --stage 2m:200 --stage 1m:0 --stage 1m:0 scenarios/carga.js
```

### Visualización en Grafana

Importar el archivo `grafana/dashboard-k6.json` y seleccionar Prometheus como fuente de datos.

El dashboard permite visualizar:

- Usuarios virtuales activos.
- Peticiones por segundo (RPS).
- Percentiles P90, P95 y P99.
- Tasa de errores HTTP.
- Tiempos de respuesta.
- Resultados de checks.

## 10. Resultados obtenidos

| Métrica | Carga sostenida | Spike | Stress |
|---|---:|---:|---:|
| Usuarios virtuales máximos | 50 | 100 | 200 |
| Peticiones HTTP | 14.001 | 3.588 | 22.923 |
| Iteraciones | 4.667 | 1.196 | 7.641 |
| RPS promedio | 46,43 | 22,23 | 47,68 |
| Latencia promedio | 302,13 ms | 700,97 ms | 1.970 ms |
| P90 | 396,64 ms | 1.440 ms | 3.370 ms |
| P95 | 429 ms | 1.470 ms | 3.490 ms |
| P99 | 610,1 ms | 1.980 ms | 3.920 ms |
| Errores HTTP | 0 % | 0 % | 0 % |
| Checks exitosos | 99,29 % | 84,75 % | 76,32 % |

### Cumplimiento de thresholds

| Criterio | Carga sostenida | Spike | Stress |
|---|---|---|---|
| P95 inferior a 500 ms | Cumple | No cumple | No cumple |
| Errores HTTP inferiores al 1 % | Cumple | Cumple | Cumple |
| Checks superiores al 99 % | Cumple | No cumple | No cumple |

## 11. Diagnóstico de recursos

Se realizó una prueba complementaria con 200 usuarios virtuales durante un minuto, monitoreando el contenedor mediante Docker Stats.

| Recurso | Reposo | Carga máxima |
|---|---:|---:|
| CPU | 0,32 % | 121,57 % |
| Memoria utilizada | 244,9 MiB | 737 MiB |
| Porcentaje de memoria | 3,57 % | 10,74 % |

El incremento del consumo de CPU y de los tiempos de respuesta sugiere una posible limitación de procesamiento bajo alta concurrencia. No se observaron indicios de agotamiento de memoria en las capturas obtenidas.

Se requiere un análisis adicional para confirmar la causa exacta del cuello de botella.

## 12. Conclusiones

La aplicación cumplió los objetivos de rendimiento establecidos durante la prueba de carga sostenida con 50 usuarios virtuales.

Sin embargo, las pruebas Spike y Stress evidenciaron un incremento significativo de los tiempos de respuesta, superando el límite de latencia establecido.

A pesar de la degradación del rendimiento, la aplicación mantuvo su disponibilidad y no presentó errores HTTP durante las tres pruebas principales.

## 13. Recomendaciones

- Analizar y optimizar las operaciones de mayor latencia.
- Revisar las consultas a la base de datos.
- Evaluar mecanismos de almacenamiento en caché.
- Monitorear continuamente el consumo de CPU y memoria.
- Evaluar alternativas de escalabilidad.
- Ejecutar nuevas pruebas con niveles intermedios de concurrencia para determinar con mayor precisión el límite de rendimiento aceptable.

## 14. Evidencias

Las capturas de Grafana y los resultados de ejecución se encuentran disponibles en el directorio `evidencias/`. Los resultados exportados se encuentran en el directorio `results/`.

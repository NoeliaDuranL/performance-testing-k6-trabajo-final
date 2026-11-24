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

Si
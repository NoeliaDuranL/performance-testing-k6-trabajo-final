// Recorrido completo de un usuario: combina los flujos críticos.
// Cada perfil de carga (scenarios/) reutiliza este mismo recorrido.
import { group } from 'k6';
import { buscarProductos } from './catalogo.js';
import { autenticarYConsultarCarrito } from './autenticacion.js';

export default function flujoUsuario() {
  group('Busqueda de productos', function () {
    buscarProductos();
  });

  group('Autenticacion y consulta de carrito', function () {
    autenticarYConsultarCarrito();
  });
}

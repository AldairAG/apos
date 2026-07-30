import { COLORS, POSIcon } from '@/components/pos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { CrearOrdenDTO, DetalleOrdenDTO, ProductosBySucursalResponse, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type PasoCreacion = 'seleccion' | 'agregar-productos';

interface ItemCarrito {
  producto: ProductosBySucursalResponse;
  cantidad: number;
  observaciones?: string;
  extras: { id: number; nombre: string; precio: number; cantidad: number }[];
}

/**
 * ---------------------------------------------------------------------------
 * SISTEMA DE DISEÑO: Material Design 3 + Neo-Brutalismo Funcional
 * ---------------------------------------------------------------------------
 * - Bordes marcados (3px sólidos, negro puro) en vez de sombras difusas.
 * - Sombra "offset" dura (hard shadow) para dar sensación física de botón.
 * - Colores sólidos y saturados, sin gradientes ni transparencias sutiles.
 * - Alto contraste texto/fondo (mínimo AA/AAA) para uso en cocina/mostrador
 *   con luz variable y decisiones rápidas.
 * - Área táctil mínima de 56px (por encima del mínimo MD3 de 48px) porque
 *   se usa con dedos, prisa y a veces guantes.
 * - Psicología del color aplicada a propósito:
 *     Verde  -> dinero / confirmar / éxito (nunca para alertas)
 *     Rojo   -> SOLO eliminar o error real (evita fatiga de alerta)
 *     Azul   -> acciones neutras / navegación / confianza
 *     Ámbar  -> advertencia suave (obligatorio, requiere atención)
 *     Negro/blanco -> estructura, nunca decoración
 * - Feedback inmediato: todo elemento accionable cambia de estado visible
 *   al presionar (no se depende solo de opacidad).
 * ---------------------------------------------------------------------------
 */
const BRUTAL_BORDER = 3;
const BRUTAL_RADIUS = 14;
const INK = '#141414'; // negro "tinta", más suave que #000 puro para no fatigar

const hardShadow = (elevationLevel: number = 4) => ({
  shadowColor: INK,
  shadowOffset: { width: elevationLevel, height: elevationLevel },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: elevationLevel,
});

export default function CrearOrdenScreen() {
  const { ordenId, tipo, mesaId } = useLocalSearchParams<{ ordenId?: string; tipo?: string; mesaId?: string }>();
  const { productos, mesas, selectedMesa, cargarProductos, cargarMesas, cargarOrdenes, crearOrden, seleccionarMesa } = usePos();
  const { sucursalActual } = useSucursal();

  const [paso, setPaso] = useState<PasoCreacion>('seleccion');
  const [tipoOrden, setTipoOrden] = useState<TipoOrden | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<DetalleOrdenDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [modalProducto, setModalProducto] = useState<ProductosBySucursalResponse | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState(1);
  const [observacionesTemp, setObservacionesTemp] = useState('');
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Map<number, number>>(new Map());
  const [numeroPersonas, setNumeroPersonas] = useState(1);
  const [observacionesOrden, setObservacionesOrden] = useState('');

  // --- Feedback inmediato -----------------------------------------------
  // Id del producto que se acaba de agregar rápido, para pulso visual breve.
  const [productoRecienAgregado, setProductoRecienAgregado] = useState<number | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inicioDirectoAplicado = useRef(false);

  useEffect(() => {
    cargarProductos();
    cargarMesas();
  }, [cargarProductos, cargarMesas]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (inicioDirectoAplicado.current || mesas.length === 0) return;

    const tipoParam = tipo as TipoOrden | undefined;
    const mesaIdParam = mesaId ? Number(mesaId) : selectedMesa?.id;

    if (tipoParam === TipoOrden.PARA_LLEVAR || tipoParam === TipoOrden.RECOGER) {
      setTipoOrden(tipoParam);
      setMesaSeleccionada(null);
      setPaso('agregar-productos');
      inicioDirectoAplicado.current = true;
      return;
    }

    if ((tipoParam === TipoOrden.EN_MESA || mesaIdParam) && mesaIdParam) {
      const mesa = mesas.find((m: any) => m.id === mesaIdParam);
      if (mesa?.activa && mesa.estado !== EstadoMesa.OCUPADA && !mesa.ordenActualDTO) {
        seleccionarMesa(mesaIdParam);
        setMesaSeleccionada(mesaIdParam);
        setTipoOrden(TipoOrden.EN_MESA);
        setPaso('agregar-productos');
        inicioDirectoAplicado.current = true;
      }
    }
  }, [tipo, mesaId, mesas, selectedMesa, seleccionarMesa]);

  const flujoDirecto = Boolean(tipo) || Boolean(mesaId);

  const totales = useMemo(() => {
    let subtotal = 0;
    let cantidadTotal = 0;

    carrito.forEach(item => {
      subtotal += item.subtotal;
      cantidadTotal += item.cantidad;
    });

    const descuento = 0;
    const total = subtotal - descuento;

    return { subtotal, descuento, total, cantidadTotal };
  }, [carrito]);

  const mesasDisponibles = useMemo(() => {
    return mesas.filter((m: any) => m.activa && m.estado !== EstadoMesa.OCUPADA && !m.ordenActualDTO);
  }, [mesas]);

  const iniciarOrden = (tipo: TipoOrden) => {
    setTipoOrden(tipo);
    setMesaSeleccionada(null);
    setPaso('agregar-productos');
  };

  const seleccionarMesaYContinuar = (mesaId: number) => {
    const mesa = mesas.find((m: any) => m.id === mesaId);

    if (!mesa?.activa || mesa.estado === EstadoMesa.OCUPADA || Boolean(mesa.ordenActualDTO)) {
      Alert.alert('Mesa no disponible', 'La mesa seleccionada ya está ocupada o no está disponible.');
      return;
    }

    setMesaSeleccionada(mesaId);
    seleccionarMesa(mesaId);
    setTipoOrden(TipoOrden.EN_MESA);
    setPaso('agregar-productos');
  };

  const validarMesaAntesDeCrear = () => {
    if (tipoOrden !== TipoOrden.EN_MESA) {
      return true;
    }

    if (!mesaSeleccionada) {
      Alert.alert('Error', 'Selecciona una mesa para la orden.');
      return false;
    }

    const mesa = mesas.find((m: any) => m.id === mesaSeleccionada);

    if (!mesa?.activa || mesa.estado === EstadoMesa.OCUPADA || Boolean(mesa.ordenActualDTO)) {
      Alert.alert('Mesa ocupada', 'La mesa ya no está disponible para una nueva orden.');
      return false;
    }

    return true;
  };

  const abrirModalProducto = (producto: ProductosBySucursalResponse) => {
    setModalProducto(producto);
    setCantidadTemp(1);
    setObservacionesTemp('');
    setExtrasSeleccionados(new Map());
  };

  // Un producto se puede agregar en UN toque cuando no tiene ningún grupo
  // de extras obligatorio. Esto elimina el paso del modal para el caso
  // más común (bebidas, antojitos, productos simples) y reduce la
  // interacción de "2 toques + scroll" a "1 toque".
  const requiereModal = (producto: ProductosBySucursalResponse) => {
    return Boolean(producto.gruposExtra?.some(g => g.obligatorio));
  };

  const dispararFeedback = (productoId: number) => {
    setProductoRecienAgregado(productoId);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => setProductoRecienAgregado(null), 450);
  };

  const agregarRapidoAlCarrito = (producto: ProductosBySucursalResponse) => {
    const itemExistente = carrito.find(
      item => item.productoId === producto.id && item.extras.length === 0
    );

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item === itemExistente ? { ...item, cantidad: item.cantidad + 1, subtotal: item.subtotal + producto.precioVenta } : item
      ));
    } else {
      const nuevoItem: DetalleOrdenDTO = {
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta,
        extras: [],
        productoId: producto.id,
      };
      setCarrito(prev => [...prev, nuevoItem]);
    }

    dispararFeedback(producto.id);
  };

  const manejarToqueProducto = (producto: ProductosBySucursalResponse) => {
    if (requiereModal(producto)) {
      abrirModalProducto(producto);
    } else {
      agregarRapidoAlCarrito(producto);
    }
  };

  const actualizarCantidadExtra = (extraId: number, delta: number) => {
    setExtrasSeleccionados(prev => {
      const nuevo = new Map(prev);
      const cantidadActual = nuevo.get(extraId) || 0;
      const nuevaCantidad = Math.max(0, cantidadActual + delta);

      if (nuevaCantidad === 0) {
        nuevo.delete(extraId);
      } else {
        nuevo.set(extraId, nuevaCantidad);
      }

      return nuevo;
    });
  };

  const totalesModal = useMemo(() => {
    if (!modalProducto) return { precioBase: 0, totalExtras: 0, precioFinal: 0 };

    const precioBase = modalProducto.precioVenta;
    let totalExtras = 0;

    modalProducto.gruposExtra?.forEach(grupo => {
      grupo.grupoExtra.opciones.forEach(opcion => {
        const cantidad = extrasSeleccionados.get(opcion.id) || 0;
        totalExtras += opcion.precio * cantidad;
      });
    });

    const precioFinal = (precioBase + totalExtras) * cantidadTemp;

    return { precioBase, totalExtras, precioFinal };
  }, [modalProducto, extrasSeleccionados, cantidadTemp]);

  const agregarAlCarrito = () => {
    if (!modalProducto) return;

    const extrasArray: { id: number; nombre: string; precio: number; cantidad: number }[] = [];
    modalProducto.gruposExtra?.forEach(grupo => {
      grupo.grupoExtra.opciones.forEach(opcion => {
        const cantidad = extrasSeleccionados.get(opcion.id) || 0;
        if (cantidad > 0) {
          extrasArray.push({
            id: opcion.id,
            nombre: opcion.nombre,
            precio: opcion.precio,
            cantidad,
          });
        }
      });
    });

    const itemExistente = carrito.find(item =>
      item.productoId === modalProducto.id &&
      JSON.stringify(item.extras) === JSON.stringify(extrasArray)
    );

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item === itemExistente
          ? { ...item, cantidad: item.cantidad + cantidadTemp }
          : item
      ));
    } else {
      const nuevoCarritoItem: DetalleOrdenDTO = {
        cantidad: cantidadTemp,
        precioUnitario: modalProducto.precioVenta,
        subtotal: modalProducto.precioVenta * cantidadTemp + (extrasArray.reduce((sum, extra) => sum + (extra.precio * extra.cantidad), 0) * cantidadTemp),
        extras: extrasArray.map(extra => ({
          opcionExtraId: extra.id,
          cantidad: extra.cantidad,
          precioUnitario: extra.precio,
          subtotal: extra.precio * extra.cantidad,
        })),
        productoId: modalProducto.id,
      };

      setCarrito([...carrito, nuevoCarritoItem]);
    }

    dispararFeedback(modalProducto.id);
    setModalProducto(null);
  };

  const actualizarCantidadCarrito = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(index);
      return;
    }

    setCarrito(carrito.map((item, i) => i === index ? { ...item, cantidad: nuevaCantidad } : item));
  };

  const eliminarDelCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const finalizarOrden = async () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto antes de finalizar.');
      return;
    }

    if (!tipoOrden) {
      Alert.alert('Falta información', 'Selecciona el tipo de orden.');
      return;
    }

    if (!validarMesaAntesDeCrear()) {
      return;
    }

    try {
      const detalles: DetalleOrdenDTO[] = carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        extras: item.extras.map(extra => ({
          opcionExtraId: extra.opcionExtraId,
          cantidad: extra.cantidad,
          precioUnitario: extra.precioUnitario,
          subtotal: extra.subtotal,
        })),
      }));

      const ordenDTO: CrearOrdenDTO = {
        id: 0,
        tipo: tipoOrden,
        numeroPersonas,
        observaciones: observacionesOrden,
        nombreCliente: '',
        telefonoCliente: '',
        subtotal: totales.subtotal,
        descuento: totales.descuento,
        total: totales.total,
        sucursalId: sucursalActual?.id || 0,
        mesaId: mesaSeleccionada || 0,
        detallesDTO: detalles,
      };

      await crearOrden(ordenDTO);
      await cargarMesas();
      await cargarOrdenes();
      Alert.alert('Orden creada', 'La orden se registró correctamente.', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo crear la orden', 'Verifica tu conexión e intenta de nuevo.');
      console.error(error);
    }
  };

  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p: ProductosBySucursalResponse) => p.activo);

    if (busqueda.trim()) {
      resultado = resultado.filter((p: ProductosBySucursalResponse) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (categoriaFiltro) {
      resultado = resultado.filter((p: ProductosBySucursalResponse) => p.categoria.id === categoriaFiltro);
    }

    return resultado;
  }, [productos, busqueda, categoriaFiltro]);

  const categorias = useMemo(() => {
    const cats = productos.reduce((acc: any[], p: ProductosBySucursalResponse) => {
      if (!acc.find(c => c.id === p.categoria.id)) {
        acc.push(p.categoria);
      }
      return acc;
    }, []);
    return cats;
  }, [productos]);

  // ---------------------------------------------------------------------
  // PASO 1: Selección de mesa / tipo de orden
  // ---------------------------------------------------------------------
  if (paso === 'seleccion') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
            <View style={styles.backButtonInner}>
              <POSIcon name="arrow-back" size={24} color={INK} />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Orden</Text>
          <View style={{ width: 48 }} />
        </View>

        <FlatList
          data={mesasDisponibles}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.mesasGrid}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={(
            <View style={styles.seleccionTipoContainer}>
              <Text style={styles.seleccionTipoTitle}>¿Cómo empezamos?</Text>
              <Text style={styles.seleccionTipoSubtitle}>
                Elige una acción rápida o selecciona una mesa libre abajo. Las mesas ocupadas están bloqueadas.
              </Text>

              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.quickActionSecondary]}
                  onPress={() => iniciarOrden(TipoOrden.PARA_LLEVAR)}
                  activeOpacity={0.75}
                >
                  <POSIcon name="bag-handle" size={26} color={INK} />
                  <Text style={styles.quickActionText}>PARA LLEVAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.quickActionPrimary]}
                  onPress={() => iniciarOrden(TipoOrden.RECOGER)}
                  activeOpacity={0.75}
                >
                  <POSIcon name="flash" size={26} color={INK} />
                  <Text style={styles.quickActionText}>ORDEN RÁPIDA</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionDivider}>
                <Text style={styles.mesasTitle}>MESAS DISPONIBLES</Text>
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{mesasDisponibles.length}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconBox}>
                <POSIcon name="grid-outline" size={44} color={INK} />
              </View>
              <Text style={styles.emptyStateText}>No hay mesas libres ahora mismo</Text>
              <Text style={styles.emptyStateSubtext}>Usa "Para llevar" u "Orden rápida" mientras tanto</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mesaCard}
              onPress={() => seleccionarMesaYContinuar(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.mesaCardInner}>
                <POSIcon name="restaurant" size={36} color={INK} />
                <Text style={styles.mesaNombre}>{item.nombre}</Text>
                <View style={styles.libreBadge}>
                  <Text style={styles.libreBadgeText}>LIBRE</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ---------------------------------------------------------------------
  // PASO 2: Agregar productos
  // ---------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.6}
          onPress={() => {
            if (flujoDirecto) {
              router.back();
              return;
            }

            setPaso('seleccion');
            setTipoOrden(null);
            setMesaSeleccionada(null);
            setCarrito([]);
          }}
        >
          <View style={styles.backButtonInner}>
            <POSIcon name="arrow-back" size={24} color={INK} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>Agregar Productos</Text>
          <Text style={styles.subtitle}>
            {tipoOrden === TipoOrden.EN_MESA ? `Mesa ${mesaSeleccionada}` : tipoOrden === TipoOrden.PARA_LLEVAR ? 'Para llevar' : 'Orden rápida'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.carritoHeaderButton}
          onPress={() => setCarritoAbierto(true)}
          activeOpacity={0.7}
        >
          <POSIcon name="cart" size={24} color={INK} />
          {carrito.length > 0 && (
            <View style={styles.carritoBadge}>
              <Text style={styles.carritoBadgeText}>{totales.cantidadTotal}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <POSIcon name="search" size={20} color={INK} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor="#6B6B6B"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <POSIcon name="close-circle" size={20} color={INK} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
          <TouchableOpacity
            style={[styles.categoriaChip, !categoriaFiltro && styles.categoriaChipActivo]}
            onPress={() => setCategoriaFiltro(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoriaChipText, !categoriaFiltro && styles.categoriaChipTextoActivo]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categorias.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoriaChip, categoriaFiltro === cat.id && styles.categoriaChipActivo]}
              onPress={() => setCategoriaFiltro(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoriaChipText, categoriaFiltro === cat.id && styles.categoriaChipTextoActivo]}>
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        <View style={styles.productosGrid}>
          {productosFiltrados.map((producto: ProductosBySucursalResponse) => {
            const enFeedback = productoRecienAgregado === producto.id;
            const tieneModal = requiereModal(producto);

            return (
              <TouchableOpacity
                key={producto.id}
                style={styles.productoCard}
                onPress={() => manejarToqueProducto(producto)}
                activeOpacity={0.7}
              >
                <View style={[styles.productoCardInner, enFeedback && styles.productoCardFeedback]}>
                  {producto.destacado && (
                    <View style={styles.destacadoBadge}>
                      <POSIcon name="star" size={14} color={INK} />
                    </View>
                  )}
                  <POSIcon name="pizza-outline" size={40} color={INK} />
                  <Text style={styles.productoNombre} numberOfLines={2}>{producto.nombre}</Text>
                  <Text style={styles.productoPrecio}>${producto.precioVenta.toFixed(2)}</Text>

                  <View style={styles.productoAccion}>
                    {enFeedback ? (
                      <View style={styles.productoAccionAgregado}>
                        <POSIcon name="checkmark" size={16} color={COLORS.white} />
                        <Text style={styles.productoAccionAgregadoText}>AGREGADO</Text>
                      </View>
                    ) : (
                      <View style={styles.productoAccionDefault}>
                        <POSIcon name={tieneModal ? 'options' : 'add'} size={16} color={INK} />
                        <Text style={styles.productoAccionDefaultText}>
                          {tieneModal ? 'PERSONALIZAR' : 'AGREGAR'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {productosFiltrados.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No se encontraron productos</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra inferior fija: siempre visible mientras hay productos en el
          carrito, para no depender de hacer scroll hasta el final.
          Menos pasos + feedback inmediato del total en todo momento. */}
      {carrito.length > 0 && (
        <TouchableOpacity
          style={styles.barraCarritoFija}
          activeOpacity={0.85}
          onPress={() => setCarritoAbierto(true)}
        >
          <View style={styles.barraCarritoIzquierda}>
            <View style={styles.barraCarritoCantidad}>
              <Text style={styles.barraCarritoCantidadText}>{totales.cantidadTotal}</Text>
            </View>
            <Text style={styles.barraCarritoLabel}>Ver orden</Text>
          </View>
          <Text style={styles.barraCarritoTotal}>${totales.total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      {/* Modal: Carrito / Resumen de la orden */}
      <Modal
        visible={carritoAbierto}
        animationType="slide"
        transparent
        onRequestClose={() => setCarritoAbierto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBrutal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resumen de la Orden</Text>
              <TouchableOpacity onPress={() => setCarritoAbierto(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <POSIcon name="close" size={26} color={INK} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {carrito.length === 0 ? (
                <Text style={styles.emptyStateText}>Tu orden está vacía</Text>
              ) : (
                carrito.map((item, index) => (
                  <View key={`${item.productoId}-${index}`} style={styles.carritoItem}>
                    <View style={styles.carritoItemInfo}>
                      <Text style={styles.carritoItemNombre}>{productos.find(p => p.id === item.productoId)?.nombre}</Text>
                      {item.extras.length > 0 ? (
                        <Text style={styles.carritoItemExtras}>
                          {item.extras.map(e => `x${e.cantidad} extra`).join(', ')}
                        </Text>
                      ) : null}
                      <Text style={styles.carritoItemSubtotal}>${item.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.carritoItemControls}>
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => actualizarCantidadCarrito(index, item.cantidad - 1)}
                        activeOpacity={0.7}
                      >
                        <POSIcon name="remove" size={18} color={COLORS.white} />
                      </TouchableOpacity>
                      <Text style={styles.cantidadText}>{item.cantidad}</Text>
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => actualizarCantidadCarrito(index, item.cantidad + 1)}
                        activeOpacity={0.7}
                      >
                        <POSIcon name="add" size={18} color={COLORS.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.eliminarButton}
                        onPress={() => eliminarDelCarrito(index)}
                        activeOpacity={0.7}
                      >
                        <POSIcon name="trash-outline" size={18} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              {carrito.length > 0 && (
                <View style={styles.totalesContainer}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>${totales.subtotal.toFixed(2)}</Text>
                  </View>
                  {totales.descuento > 0 && (
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: COLORS.danger }]}>Descuento</Text>
                      <Text style={[styles.totalValue, { color: COLORS.danger }]}>
                        -${totales.descuento.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.totalDivider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalFinalLabel}>Total</Text>
                    <Text style={styles.totalFinalValue}>${totales.total.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.finalizarButton, carrito.length === 0 && styles.finalizarButtonDisabled]}
              onPress={finalizarOrden}
              disabled={carrito.length === 0}
              activeOpacity={0.8}
            >
              <POSIcon name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.finalizarButtonText}>FINALIZAR ORDEN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Personalizar producto (solo cuando tiene extras obligatorios) */}
      <Modal
        visible={modalProducto !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalProducto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBrutal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalProducto?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalProducto(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <POSIcon name="close" size={28} color={INK} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalPrecio}>${modalProducto?.precioVenta.toFixed(2)}</Text>

              {modalProducto?.descripcion && (
                <Text style={styles.modalDescripcion}>{modalProducto.descripcion}</Text>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>CANTIDAD</Text>
                <View style={styles.cantidadControls}>
                  <TouchableOpacity
                    style={styles.cantidadButtonLarge}
                    onPress={() => setCantidadTemp(Math.max(1, cantidadTemp - 1))}
                    activeOpacity={0.7}
                  >
                    <POSIcon name="remove" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.cantidadTextLarge}>{cantidadTemp}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButtonLarge}
                    onPress={() => setCantidadTemp(cantidadTemp + 1)}
                    activeOpacity={0.7}
                  >
                    <POSIcon name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {modalProducto?.gruposExtra && modalProducto.gruposExtra.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>EXTRAS</Text>

                  {modalProducto.gruposExtra.map((grupo, grupoIndex) => (
                    <View key={grupoIndex} style={styles.grupoExtraContainer}>
                      <View style={styles.grupoExtraHeader}>
                        <Text style={styles.grupoExtraNombre}>{grupo.grupoExtra.nombre}</Text>
                        {grupo.obligatorio && (
                          <View style={styles.obligatorioBadge}>
                            <Text style={styles.obligatorioBadgeText}>OBLIGATORIO</Text>
                          </View>
                        )}
                      </View>

                      {grupo.grupoExtra.descripcion && (
                        <Text style={styles.grupoExtraDescripcion}>{grupo.grupoExtra.descripcion}</Text>
                      )}

                      {grupo.minimo > 0 || grupo.maximo > 0 ? (
                        <Text style={styles.grupoExtraLimites}>
                          {grupo.minimo > 0 && grupo.maximo > 0
                            ? `Selecciona entre ${grupo.minimo} y ${grupo.maximo}`
                            : grupo.minimo > 0
                              ? `Mínimo ${grupo.minimo}`
                              : `Máximo ${grupo.maximo}`}
                        </Text>
                      ) : null}

                      <View style={styles.opcionesContainer}>
                        {grupo.grupoExtra.opciones
                          .filter(opcion => opcion.activo)
                          .map((opcion) => {
                            const cantidadSeleccionada = extrasSeleccionados.get(opcion.id) || 0;
                            const subtotalExtra = opcion.precio * cantidadSeleccionada;

                            return (
                              <View key={opcion.id} style={[styles.opcionExtraItem, cantidadSeleccionada > 0 && styles.opcionExtraItemActiva]}>
                                <View style={styles.opcionExtraInfo}>
                                  <Text style={styles.opcionExtraNombre}>{opcion.nombre}</Text>
                                  <Text style={styles.opcionExtraPrecio}>
                                    ${opcion.precio.toFixed(2)} c/u
                                  </Text>
                                  {cantidadSeleccionada > 0 && (
                                    <Text style={styles.opcionExtraSubtotal}>
                                      Subtotal: ${subtotalExtra.toFixed(2)}
                                    </Text>
                                  )}
                                </View>

                                <View style={styles.opcionExtraControles}>
                                  <TouchableOpacity
                                    style={styles.extraButton}
                                    onPress={() => actualizarCantidadExtra(opcion.id, -1)}
                                    activeOpacity={0.7}
                                  >
                                    <POSIcon name="remove" size={18} color={COLORS.white} />
                                  </TouchableOpacity>

                                  <Text style={styles.extraCantidad}>{cantidadSeleccionada}</Text>

                                  <TouchableOpacity
                                    style={styles.extraButton}
                                    onPress={() => actualizarCantidadExtra(opcion.id, 1)}
                                    activeOpacity={0.7}
                                  >
                                    <POSIcon name="add" size={18} color={COLORS.white} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {(totalesModal.totalExtras > 0 || cantidadTemp > 1) && (
                <View style={styles.resumenModalContainer}>
                  <Text style={styles.resumenModalTitle}>RESUMEN</Text>

                  <View style={styles.resumenModalRow}>
                    <Text style={styles.resumenModalLabel}>Producto Base</Text>
                    <Text style={styles.resumenModalValue}>
                      ${totalesModal.precioBase.toFixed(2)}
                    </Text>
                  </View>

                  {totalesModal.totalExtras > 0 && (
                    <>
                      <View style={styles.resumenModalRow}>
                        <Text style={styles.resumenModalLabel}>Total Extras</Text>
                        <Text style={[styles.resumenModalValue, { color: COLORS.info }]}>
                          +${totalesModal.totalExtras.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.resumenExtrasDetalle}>
                        {modalProducto?.gruposExtra?.map(grupo =>
                          grupo.grupoExtra.opciones
                            .filter(opcion => (extrasSeleccionados.get(opcion.id) || 0) > 0)
                            .map(opcion => {
                              const cantidad = extrasSeleccionados.get(opcion.id) || 0;
                              return (
                                <View key={opcion.id} style={styles.extraDetalleRow}>
                                  <POSIcon name="add-circle-outline" size={14} color={COLORS.info} />
                                  <Text style={styles.extraDetalleText}>
                                    {opcion.nombre} x{cantidad}
                                  </Text>
                                  <Text style={styles.extraDetalleValue}>
                                    ${(opcion.precio * cantidad).toFixed(2)}
                                  </Text>
                                </View>
                              );
                            })
                        )}
                      </View>
                    </>
                  )}

                  {cantidadTemp > 1 && (
                    <View style={styles.resumenModalRow}>
                      <Text style={styles.resumenModalLabel}>Cantidad</Text>
                      <Text style={styles.resumenModalValue}>x{cantidadTemp}</Text>
                    </View>
                  )}

                  <View style={styles.resumenModalDivider} />

                  <View style={styles.resumenModalRow}>
                    <Text style={styles.resumenModalTotalLabel}>Total Producto</Text>
                    <Text style={styles.resumenModalTotalValue}>
                      ${totalesModal.precioFinal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>OBSERVACIONES</Text>
                <TextInput
                  style={styles.observacionesInput}
                  placeholder="Ej: Sin cebolla, extra queso..."
                  value={observacionesTemp}
                  onChangeText={setObservacionesTemp}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#6B6B6B"
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.agregarButton} onPress={agregarAlCarrito} activeOpacity={0.8}>
              <POSIcon name="cart" size={24} color={COLORS.white} />
              <Text style={styles.agregarButtonText}>
                AGREGAR · ${totalesModal.precioFinal.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0EA', // hueso cálido: cómodo para la vista, no clínico
  },

  // ------------------------------------------------------------------- //
  // Header
  // ------------------------------------------------------------------- //
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: BRUTAL_BORDER,
    borderBottomColor: INK,
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...hardShadow(3),
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 2,
  },
  carritoHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...hardShadow(3),
  },
  carritoBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: INK,
  },
  carritoBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
  },

  // ------------------------------------------------------------------- //
  // Selección Tipo / Mesas
  // ------------------------------------------------------------------- //
  seleccionTipoContainer: {
    padding: 20,
    gap: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  seleccionTipoTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: INK,
  },
  seleccionTipoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 92,
    paddingVertical: 16,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...hardShadow(5),
  },
  quickActionPrimary: {
    backgroundColor: '#7FD1E0', // azul confianza, saturado y sólido
  },
  quickActionSecondary: {
    backgroundColor: '#B8E8A8', // verde suave, acción positiva
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mesasTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.4,
  },
  countPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.white,
  },

  mesasGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 14,
    marginBottom: 14,
  },
  mesaCard: {
    flex: 1,
    minHeight: 108,
  },
  mesaCardInner: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    ...hardShadow(4),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
    width: '100%',
  },
  emptyStateIconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...hardShadow(4),
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
    textAlign: 'center',
  },
  mesaNombre: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
  },
  libreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: INK,
  },
  libreBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.4,
  },

  // ------------------------------------------------------------------- //
  // Búsqueda / Categorías
  // ------------------------------------------------------------------- //
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: BRUTAL_BORDER,
    borderBottomColor: INK,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    padding: 0,
  },

  categorias: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoriaChip: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: INK,
  },
  categoriaChipActivo: {
    backgroundColor: INK,
  },
  categoriaChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  categoriaChipTextoActivo: {
    color: COLORS.white,
  },

  // ------------------------------------------------------------------- //
  // Contenido / Productos
  // ------------------------------------------------------------------- //
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 140,
    gap: 16,
  },
  productosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productoCard: {
    width: '48%',
    minHeight: 168,
  },
  productoCardInner: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    backgroundColor: COLORS.white,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    ...hardShadow(4),
  },
  productoCardFeedback: {
    backgroundColor: '#DFF4D8', // pulso verde: refuerzo positivo inmediato
    borderColor: COLORS.success,
  },
  destacadoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },
  productoPrecio: {
    fontSize: 17,
    fontWeight: '900',
    color: INK,
  },
  productoAccion: {
    marginTop: 4,
    width: '100%',
  },
  productoAccionDefault: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#FFE38A', // ámbar: llama la atención sin alarmar
  },
  productoAccionDefaultText: {
    fontSize: 11,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.3,
  },
  productoAccionAgregado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: COLORS.success,
  },
  productoAccionAgregadoText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ------------------------------------------------------------------- //
  // Barra de carrito fija (bottom bar)
  // ------------------------------------------------------------------- //
  barraCarritoFija: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    height: 64,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...hardShadow(5),
  },
  barraCarritoIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barraCarritoCantidad: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barraCarritoCantidadText: {
    fontSize: 14,
    fontWeight: '900',
    color: INK,
  },
  barraCarritoLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  barraCarritoTotal: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.white,
  },

  // ------------------------------------------------------------------- //
  // Carrito (dentro del modal de resumen)
  // ------------------------------------------------------------------- //
  carritoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E2D8',
  },
  carritoItemInfo: {
    flex: 1,
    gap: 4,
  },
  carritoItemNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  carritoItemExtras: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.info,
  },
  carritoItemSubtotal: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  carritoItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cantidadButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    minWidth: 26,
    textAlign: 'center',
  },
  eliminarButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ------------------------------------------------------------------- //
  // Totales
  // ------------------------------------------------------------------- //
  totalesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: BRUTAL_BORDER,
    borderTopColor: INK,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  totalDivider: {
    height: 2,
    backgroundColor: '#E5E2D8',
    marginVertical: 4,
  },
  totalFinalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: INK,
  },
  totalFinalValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.success,
  },

  // ------------------------------------------------------------------- //
  // Botones de acción principal
  // ------------------------------------------------------------------- //
  finalizarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.success,
    height: 60,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    marginTop: 16,
    ...hardShadow(5),
  },
  finalizarButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  finalizarButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.4,
  },

  // ------------------------------------------------------------------- //
  // Modales
  // ------------------------------------------------------------------- //
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContentBrutal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: BRUTAL_BORDER,
    borderLeftWidth: BRUTAL_BORDER,
    borderRightWidth: BRUTAL_BORDER,
    borderColor: INK,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: INK,
    flex: 1,
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalPrecio: {
    fontSize: 26,
    fontWeight: '900',
    color: INK,
    marginBottom: 12,
  },
  modalDescripcion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: INK,
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  cantidadButtonLarge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadTextLarge: {
    fontSize: 28,
    fontWeight: '900',
    color: INK,
    minWidth: 60,
    textAlign: 'center',
  },
  observacionesInput: {
    backgroundColor: '#F2F0EA',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    color: INK,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    textAlignVertical: 'top',
    minHeight: 56,
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#7FD1E0',
    height: 60,
    borderRadius: BRUTAL_RADIUS,
    borderWidth: BRUTAL_BORDER,
    borderColor: INK,
    marginTop: 20,
    ...hardShadow(5),
  },
  agregarButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.3,
  },

  // ------------------------------------------------------------------- //
  // Grupos de extras
  // ------------------------------------------------------------------- //
  grupoExtraContainer: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#F2F0EA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  grupoExtraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  grupoExtraNombre: {
    fontSize: 15,
    fontWeight: '900',
    color: INK,
    flex: 1,
  },
  obligatorioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FFE38A',
    borderWidth: 2,
    borderColor: INK,
  },
  obligatorioBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: INK,
    letterSpacing: 0.3,
  },
  grupoExtraDescripcion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 8,
    lineHeight: 18,
  },
  grupoExtraLimites: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.info,
    marginBottom: 12,
  },
  opcionesContainer: {
    gap: 10,
  },
  opcionExtraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
  },
  opcionExtraItemActiva: {
    backgroundColor: '#DFF4D8',
    borderColor: COLORS.success,
  },
  opcionExtraInfo: {
    flex: 1,
    gap: 3,
  },
  opcionExtraNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  opcionExtraPrecio: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  opcionExtraSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.info,
  },
  opcionExtraControles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  extraButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraCantidad: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
    minWidth: 22,
    textAlign: 'center',
  },

  // ------------------------------------------------------------------- //
  // Resumen dentro del modal de producto
  // ------------------------------------------------------------------- //
  resumenModalContainer: {
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#EAF7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  resumenModalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: INK,
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  resumenModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  resumenModalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  resumenExtrasDetalle: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    gap: 6,
  },
  extraDetalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  extraDetalleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  extraDetalleValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.info,
  },
  resumenModalDivider: {
    height: 2,
    backgroundColor: INK,
    marginVertical: 8,
  },
  resumenModalTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: INK,
  },
  resumenModalTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.success,
  },
});
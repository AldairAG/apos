import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { CrearOrdenDTO, DetalleOrdenDTO, OpcionExtraResponse, ProductosBySucursalResponse, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSucursal } from '@/features/sucursal/useSucursal';

type PasoCreacion = 'seleccion-tipo' | 'seleccion-mesa' | 'agregar-productos';

interface ItemCarrito {
  producto: ProductosBySucursalResponse;
  cantidad: number;
  observaciones?: string;
  extras: { id: number; nombre: string; precio: number; cantidad: number }[];
}

export default function CrearOrdenScreen() {
  const { ordenId } = useLocalSearchParams<{ ordenId?: string }>();
  const { productos, mesas, cargarProductos, cargarMesas, crearOrden, selectedMesa, seleccionarMesa } = usePos();
  const {sucursalActual}=useSucursal();
  
  const [paso, setPaso] = useState<PasoCreacion>('seleccion-tipo');
  const [tipoOrden, setTipoOrden] = useState<TipoOrden | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [modalProducto, setModalProducto] = useState<ProductosBySucursalResponse | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState(1);
  const [observacionesTemp, setObservacionesTemp] = useState('');
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Map<number, number>>(new Map());
  const [numeroPersonas, setNumeroPersonas] = useState(1);
  const [observacionesOrden, setObservacionesOrden] = useState('');

  useEffect(() => {
    cargarProductos();
    cargarMesas();
  }, []);

  // Calcular totales en tiempo real
  const totales = useMemo(() => {
    let subtotal = 0;
    let cantidadTotal = 0;

    carrito.forEach(item => {
      const precioProducto = item.producto.precioVenta * item.cantidad;
      const precioExtras = item.extras.reduce((sum, extra) => sum + (extra.precio * extra.cantidad), 0);
      subtotal += precioProducto + precioExtras;
      cantidadTotal += item.cantidad;
    });

    const descuento = 0; // Aquí se podría calcular descuentos
    const total = subtotal - descuento;

    return { subtotal, descuento, total, cantidadTotal };
  }, [carrito]);

  const seleccionarTipo = (tipo: TipoOrden) => {
    setTipoOrden(tipo);
    if (tipo === TipoOrden.EN_MESA) {
      setPaso('seleccion-mesa');
    } else {
      setPaso('agregar-productos');
    }
  };

  const seleccionarMesaYContinuar = (mesaId: number) => {
    setMesaSeleccionada(mesaId);
    seleccionarMesa(mesaId);
    setPaso('agregar-productos');
  };

  const abrirModalProducto = (producto: ProductosBySucursalResponse) => {
    setModalProducto(producto);
    setCantidadTemp(1);
    setObservacionesTemp('');
    setExtrasSeleccionados(new Map());
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

  // Calcular totales del modal en tiempo real
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

    // Convertir extras seleccionados a array con información completa
    const extrasArray: { id: number; nombre: string; precio: number; cantidad: number }[] = [];
    modalProducto.gruposExtra?.forEach(grupo => {
      grupo.grupoExtra.opciones.forEach(opcion => {
        const cantidad = extrasSeleccionados.get(opcion.id) || 0;
        if (cantidad > 0) {
          extrasArray.push({
            id: opcion.id,
            nombre: opcion.nombre,
            precio: opcion.precio,
            cantidad
          });
        }
      });
    });

    const itemExistente = carrito.find(item => 
      item.producto.id === modalProducto.id &&
      JSON.stringify(item.extras) === JSON.stringify(extrasArray) &&
      item.observaciones === observacionesTemp
    );

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item === itemExistente
          ? { ...item, cantidad: item.cantidad + cantidadTemp }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto: modalProducto,
        cantidad: cantidadTemp,
        observaciones: observacionesTemp,
        extras: extrasArray
      }]);
    }

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
      Alert.alert('Error', 'Agrega al menos un producto al carrito');
      return;
    }

    if (!tipoOrden) {
      Alert.alert('Error', 'Selecciona el tipo de orden');
      return;
    }

    try {
      const detalles: DetalleOrdenDTO[] = carrito.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioVenta,
        subtotal: item.producto.precioVenta * item.cantidad,
        extras: item.extras.map(extra => ({
          opcionExtraId: extra.id,
          cantidad: extra.cantidad,
          precioUnitario: extra.precio,
          subtotal: extra.precio * extra.cantidad
        }))
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
        sucursalId: sucursalActual?.id || 0, // Usar sucursal actual
        mesaId: mesaSeleccionada || 0,
        detallesDTO: detalles
      };

      await crearOrden(ordenDTO);
      Alert.alert('Éxito', 'Orden creada correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la orden');
      console.error(error);
    }
  };

  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p: ProductosBySucursalResponse) => p.disponible && p.activo);

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

  // PASO 1: Selección de Tipo
  if (paso === 'seleccion-tipo') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <POSIcon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Orden</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.seleccionTipoContainer}>
          <Text style={styles.seleccionTipoTitle}>¿Qué tipo de orden deseas crear?</Text>

          <TouchableOpacity
            style={styles.tipoCard}
            onPress={() => seleccionarTipo(TipoOrden.EN_MESA)}
            activeOpacity={0.8}
          >
            <POSCard variant="elevated" style={styles.tipoCardInner}>
              <POSIcon name="restaurant" size={64} color={COLORS.primary} />
              <Text style={styles.tipoCardTitle}>Orden en Mesa</Text>
              <Text style={styles.tipoCardSubtitle}>Servicio en restaurante</Text>
            </POSCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tipoCard}
            onPress={() => seleccionarTipo(TipoOrden.PARA_LLEVAR)}
            activeOpacity={0.8}
          >
            <POSCard variant="elevated" style={styles.tipoCardInner}>
              <POSIcon name="bag-handle" size={64} color={COLORS.success} />
              <Text style={styles.tipoCardTitle}>Orden Rápida</Text>
              <Text style={styles.tipoCardSubtitle}>Para llevar o recoger</Text>
            </POSCard>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // PASO 2: Selección de Mesa
  if (paso === 'seleccion-mesa') {
    const mesasDisponibles = mesas.filter((m: any) => m.activa);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setPaso('seleccion-tipo')}>
            <POSIcon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Mesa</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={mesasDisponibles}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.mesasGrid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mesaCard}
              onPress={() => seleccionarMesaYContinuar(item.id)}
              activeOpacity={0.8}
            >
              <POSCard variant="elevated" style={styles.mesaCardInner}>
                <POSIcon name="restaurant" size={40} color={COLORS.primary} />
                <Text style={styles.mesaNombre}>{item.nombre}</Text>
                <POSBadge
                  label={item.estado.toString()}
                  variant={item.estado === EstadoMesa.LIBRE ? 'success' : 'warning'}
                  size="small"
                />
              </POSCard>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // PASO 3: Agregar Productos
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => tipoOrden === TipoOrden.EN_MESA ? setPaso('seleccion-mesa') : setPaso('seleccion-tipo')}
        >
          <POSIcon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Agregar Productos</Text>
          <Text style={styles.subtitle}>
            {tipoOrden === TipoOrden.EN_MESA ? `Mesa ${mesaSeleccionada}` : 'Para Llevar'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.carritoButton}
          onPress={() => {/* scroll to carrito */}}
        >
          <POSIcon name="cart" size={24} color={COLORS.primary} />
          {carrito.length > 0 && (
            <View style={styles.carritoBadge}>
              <Text style={styles.carritoBadgeText}>{totales.cantidadTotal}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <POSIcon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor={COLORS.textSecondary}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <POSIcon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro de Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
          <TouchableOpacity
            style={[styles.categoriaChip, !categoriaFiltro && styles.categoriaChipActivo]}
            onPress={() => setCategoriaFiltro(null)}
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
            >
              <Text style={[styles.categoriaChipText, categoriaFiltro === cat.id && styles.categoriaChipTextoActivo]}>
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {/* Grid de Productos */}
        <View style={styles.productosGrid}>
          {productosFiltrados.map((producto: ProductosBySucursalResponse) => (
            <TouchableOpacity
              key={producto.id}
              style={styles.productoCard}
              onPress={() => abrirModalProducto(producto)}
              activeOpacity={0.8}
            >
              <POSCard variant="elevated" style={styles.productoCardInner}>
                {producto.destacado && (
                  <View style={styles.destacadoBadge}>
                    <POSIcon name="star" size={14} color={COLORS.warning} />
                  </View>
                )}
                <POSIcon name="pizza-outline" size={48} color={COLORS.primary} />
                <Text style={styles.productoNombre} numberOfLines={2}>{producto.nombre}</Text>
                <Text style={styles.productoPrecio}>${producto.precioVenta.toFixed(2)}</Text>
                {producto.tiempoPreparacion > 0 && (
                  <View style={styles.tiempoPrep}>
                    <POSIcon name="time-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.tiempoPrepText}>{producto.tiempoPreparacion} min</Text>
                  </View>
                )}
              </POSCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Carrito */}
        {carrito.length > 0 && (
          <POSCard variant="elevated" style={styles.carritoSection}>
            <View style={styles.carritoHeader}>
              <Text style={styles.carritoTitle}>Resumen de la Orden</Text>
              <POSBadge label={`${totales.cantidadTotal}`} variant="info" size="small" />
            </View>

            {carrito.map((item, index) => (
              <View key={index} style={styles.carritoItem}>
                <View style={styles.carritoItemInfo}>
                  <Text style={styles.carritoItemNombre}>{item.producto.nombre}</Text>
                  {item.extras.length > 0 && (
                    <Text style={styles.carritoItemExtras}>
                      {item.extras.map(e => `${e.nombre} x${e.cantidad}`).join(', ')}
                    </Text>
                  )}
                  {item.observaciones && (
                    <Text style={styles.carritoItemObs}>{item.observaciones}</Text>
                  )}
                </View>

                <View style={styles.carritoItemControls}>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => actualizarCantidadCarrito(index, item.cantidad - 1)}
                  >
                    <POSIcon name="remove" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.cantidadText}>{item.cantidad}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => actualizarCantidadCarrito(index, item.cantidad + 1)}
                  >
                    <POSIcon name="add" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.eliminarButton}
                    onPress={() => eliminarDelCarrito(index)}
                  >
                    <POSIcon name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Totales */}
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

            <TouchableOpacity style={styles.finalizarButton} onPress={finalizarOrden}>
              <POSIcon name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.finalizarButtonText}>Finalizar Orden</Text>
            </TouchableOpacity>
          </POSCard>
        )}
      </ScrollView>

      {/* Modal Agregar Producto */}
      <Modal
        visible={modalProducto !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalProducto(null)}
      >
        <View style={styles.modalOverlay}>
          <POSCard style={styles.modalContent} variant="elevated">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalProducto?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalProducto(null)}>
                <POSIcon name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalPrecio}>${modalProducto?.precioVenta.toFixed(2)}</Text>
              
              {modalProducto?.descripcion && (
                <Text style={styles.modalDescripcion}>{modalProducto.descripcion}</Text>
              )}

              {/* Cantidad */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Cantidad</Text>
                <View style={styles.cantidadControls}>
                  <TouchableOpacity
                    style={styles.cantidadButtonLarge}
                    onPress={() => setCantidadTemp(Math.max(1, cantidadTemp - 1))}
                  >
                    <POSIcon name="remove" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.cantidadTextLarge}>{cantidadTemp}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButtonLarge}
                    onPress={() => setCantidadTemp(cantidadTemp + 1)}
                  >
                    <POSIcon name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Grupos de Extras */}
              {modalProducto?.gruposExtra && modalProducto.gruposExtra.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Extras</Text>
                  
                  {modalProducto.gruposExtra.map((grupo, grupoIndex) => (
                    <View key={grupoIndex} style={styles.grupoExtraContainer}>
                      <View style={styles.grupoExtraHeader}>
                        <Text style={styles.grupoExtraNombre}>{grupo.grupoExtra.nombre}</Text>
                        {grupo.obligatorio && (
                          <POSBadge label="Obligatorio" variant="warning" size="small" />
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
                            ? `M\u00ednimo ${grupo.minimo}`
                            : `M\u00e1ximo ${grupo.maximo}`
                          }
                        </Text>
                      ) : null}

                      <View style={styles.opcionesContainer}>
                        {grupo.grupoExtra.opciones
                          .filter(opcion => opcion.activo)
                          .map((opcion) => {
                            const cantidadSeleccionada = extrasSeleccionados.get(opcion.id) || 0;
                            const subtotalExtra = opcion.precio * cantidadSeleccionada;

                            return (
                              <View key={opcion.id} style={styles.opcionExtraItem}>
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
                                  >
                                    <POSIcon name="remove" size={18} color={COLORS.white} />
                                  </TouchableOpacity>
                                  
                                  <Text style={styles.extraCantidad}>{cantidadSeleccionada}</Text>
                                  
                                  <TouchableOpacity
                                    style={styles.extraButton}
                                    onPress={() => actualizarCantidadExtra(opcion.id, 1)}
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

              {/* Resumen de Costos */}
              {(totalesModal.totalExtras > 0 || cantidadTemp > 1) && (
                <View style={styles.resumenModalContainer}>
                  <Text style={styles.resumenModalTitle}>Resumen de Costos</Text>
                  
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

                      {/* Detalle de extras */}
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

              {/* Observaciones */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Observaciones</Text>
                <TextInput
                  style={styles.observacionesInput}
                  placeholder="Ej: Sin cebolla, extra queso..."
                  value={observacionesTemp}
                  onChangeText={setObservacionesTemp}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.agregarButton} onPress={agregarAlCarrito}>
              <POSIcon name="cart" size={24} color={COLORS.white} />
              <Text style={styles.agregarButtonText}>
                Agregar ${totalesModal.precioFinal.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </POSCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  carritoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carritoBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  carritoBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Selección Tipo
  seleccionTipoContainer: {
    padding: 20,
    gap: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  seleccionTipoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  tipoCard: {
    width: '100%',
    maxWidth: 350,
  },
  tipoCardInner: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  tipoCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tipoCardSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // Selección Mesa
  mesasGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  mesaCard: {
    flex: 1,
  },
  mesaCardInner: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  mesaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Search
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
  },

  // Categorías
  categorias: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriaChipActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoriaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoriaChipTextoActivo: {
    color: COLORS.white,
  },

  // Content
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // Productos Grid
  productosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  productoCard: {
    width: '48%',
  },
  productoCardInner: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  destacadoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  tiempoPrep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tiempoPrepText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Carrito
  carritoSection: {
    padding: 16,
  },
  carritoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carritoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  carritoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  carritoItemInfo: {
    flex: 1,
    gap: 4,
  },
  carritoItemNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  carritoItemExtras: {
    fontSize: 12,
    color: COLORS.info,
  },
  carritoItemObs: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  carritoItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cantidadButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  eliminarButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Totales
  totalesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  totalFinalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalFinalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },

  // Buttons
  finalizarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  finalizarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalPrecio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 12,
  },
  modalDescripcion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  cantidadButtonLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadTextLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'center',
  },
  observacionesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  agregarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Grupos de Extras
  grupoExtraContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  grupoExtraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  grupoExtraNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  grupoExtraDescripcion: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  grupoExtraLimites: {
    fontSize: 12,
    color: COLORS.info,
    fontWeight: '600',
    marginBottom: 12,
  },
  opcionesContainer: {
    gap: 12,
  },
  opcionExtraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  opcionExtraInfo: {
    flex: 1,
    gap: 4,
  },
  opcionExtraNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  opcionExtraPrecio: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  opcionExtraSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.info,
  },
  opcionExtraControles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  extraButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'center',
  },

  // Resumen Modal
  resumenModalContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resumenModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  resumenModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenModalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resumenModalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  resumenExtrasDetalle: {
    marginLeft: 12,
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
    color: COLORS.textSecondary,
  },
  extraDetalleValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.info,
  },
  resumenModalDivider: {
    height: 1,
    backgroundColor: COLORS.primary,
    marginVertical: 8,
  },
  resumenModalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resumenModalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});

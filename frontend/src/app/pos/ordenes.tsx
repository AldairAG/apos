import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { EstadoOrden, OrdenResponseDTO, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FiltroTipo = 'todas' | 'mesas' | 'llevar' | 'entregadas';

export default function OrdenesScreen() {
  const { getOrdenesBySucursal, loading } = usePos();
  const [ordenes, setOrdenes] = useState<OrdenResponseDTO[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      const data = await getOrdenesBySucursal(1); // Usar sucursal actual
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

  const obtenerColorEstado = (estado: EstadoOrden) => {
    switch (estado) {
      case EstadoOrden.PENDIENTE:
        return COLORS.warning;
      case EstadoOrden.EN_PREPARACION:
        return COLORS.info;
      case EstadoOrden.LISTA:
        return COLORS.success;
      case EstadoOrden.ENTREGADA:
        return COLORS.textSecondary;
      case EstadoOrden.CANCELADA:
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  const filtrarOrdenes = () => {
    let ordenesFiltradas = ordenes;

    // Filtrar por tipo
    if (filtroActivo === 'mesas') {
      ordenesFiltradas = ordenesFiltradas.filter(o => o.tipo === TipoOrden.EN_MESA);
    } else if (filtroActivo === 'llevar') {
      ordenesFiltradas = ordenesFiltradas.filter(o => 
        o.tipo === TipoOrden.PARA_LLEVAR || o.tipo === TipoOrden.DELIVERY
      );
    } else if (filtroActivo === 'entregadas') {
      ordenesFiltradas = ordenesFiltradas.filter(o => o.estado === EstadoOrden.ENTREGADA);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      ordenesFiltradas = ordenesFiltradas.filter(o =>
        o.folio.toLowerCase().includes(searchLower) ||
        (o.mesa?.nombre || '').toLowerCase().includes(searchLower)
      );
    }

    return ordenesFiltradas;
  };

  const enviarACocina = (orden: OrdenResponseDTO) => {
    console.log('Enviar a cocina:', orden.folio);
    // Aquí iría la lógica
  };

  const cobrarOrden = (orden: OrdenResponseDTO) => {
    console.log('Cobrar orden:', orden.folio);
    // Aquí iría la lógica de cobro
  };

  const continuarOrden = (orden: OrdenResponseDTO) => {
    router.push(`/pos/detalle-orden?ordenId=${orden.id}`);
  };

  const cancelarOrden = (orden: OrdenResponseDTO) => {
    console.log('Cancelar orden:', orden.folio);
    // Aquí iría la lógica de cancelación
  };

  const formatearFecha = (fecha: Date) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calcularTiempoTranscurrido = (fechaCreacion: Date) => {
    const ahora = new Date();
    const inicio = new Date(fechaCreacion);
    const diffMs = ahora.getTime() - inicio.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const renderOrdenCard = ({ item: orden }: { item: OrdenResponseDTO }) => {
    const tiempoTranscurrido = calcularTiempoTranscurrido(orden.createdAt);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/pos/detalle-orden?ordenId=${orden.id}`)}
        activeOpacity={0.8}
      >
        <POSCard style={styles.ordenCard} variant="elevated">
          {/* Header */}
          <View style={styles.ordenHeader}>
            <View style={styles.ordenHeaderLeft}>
              <Text style={styles.ordenNumero}>Orden {orden.folio}</Text>
              
              {orden.tipo === TipoOrden.EN_MESA && orden.mesa ? (
                <View style={styles.mesaTag}>
                  <POSIcon name="restaurant" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.mesaTagText}>{orden.mesa.nombre}</Text>
                </View>
              ) : (
                <View style={styles.llevarTag}>
                  <POSIcon name="bag-handle" size={14} color={COLORS.primary} />
                  <Text style={styles.llevarTagText}>
                    {orden.tipo === TipoOrden.DELIVERY ? 'Delivery' : 'Llevar'}
                  </Text>
                </View>
              )}
            </View>

            <POSBadge
              label={orden.estado.replace('_', ' ')}
              variant={
                orden.estado === EstadoOrden.PENDIENTE ? 'warning' :
                orden.estado === EstadoOrden.EN_PREPARACION ? 'info' :
                orden.estado === EstadoOrden.LISTA ? 'success' :
                orden.estado === EstadoOrden.ENTREGADA ? 'default' :
                'danger'
              }
              size="small"
            />
          </View>

          {/* Items */}
          <View style={styles.ordenItems}>
            {orden.detalles?.slice(0, 3).map((detalle, index) => (
              <View key={index} style={styles.ordenItem}>
                <Text style={styles.ordenItemCantidad}>{detalle.cantidad}x</Text>
                <Text style={styles.ordenItemNombre} numberOfLines={1}>
                  Producto {detalle.productoId}
                </Text>
              </View>
            ))}
            {(orden.detalles?.length || 0) > 3 && (
              <Text style={styles.ordenItemsMas}>
                +{orden.detalles.length - 3} más...
              </Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.ordenFooter}>
            <View style={styles.ordenFooterLeft}>
              <View style={styles.tiempoContainer}>
                <POSIcon name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.tiempoText}>
                  {tiempoTranscurrido < 60 
                    ? `${tiempoTranscurrido} min` 
                    : `${Math.floor(tiempoTranscurrido / 60)}h ${tiempoTranscurrido % 60}m`
                  }
                </Text>
              </View>
              {orden.numeroPersonas > 0 && (
                <View style={styles.tiempoContainer}>
                  <POSIcon name="people-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.tiempoText}>{orden.numeroPersonas}</Text>
                </View>
              )}
            </View>

            <View style={styles.ordenFooterRight}>
              <Text style={styles.ordenTotal}>${orden.total.toFixed(2)}</Text>
              
              {/* Acciones */}
              <View style={styles.ordenAcciones}>
                {orden.estado === EstadoOrden.PENDIENTE && (
                  <TouchableOpacity
                    style={[styles.accionButton, { backgroundColor: COLORS.info }]}
                    onPress={() => enviarACocina(orden)}
                  >
                    <POSIcon name="send" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                )}

                {orden.estado === EstadoOrden.LISTA && (
                  <TouchableOpacity
                    style={[styles.accionButton, { backgroundColor: COLORS.success }]}
                    onPress={() => cobrarOrden(orden)}
                  >
                    <POSIcon name="cash" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                )}

                {(orden.estado === EstadoOrden.PENDIENTE || orden.estado === EstadoOrden.EN_PREPARACION) && (
                  <TouchableOpacity
                    style={[styles.accionButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => continuarOrden(orden)}
                  >
                    <POSIcon name="pencil" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                )}

                {orden.estado !== EstadoOrden.CANCELADA && orden.estado !== EstadoOrden.ENTREGADA && (
                  <TouchableOpacity
                    style={[styles.accionButton, { backgroundColor: COLORS.danger }]}
                    onPress={() => cancelarOrden(orden)}
                  >
                    <POSIcon name="close" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </POSCard>
      </TouchableOpacity>
    );
  };

  const ordenesFiltradas = filtrarOrdenes();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Órdenes</Text>
          <POSBadge 
            label={`${ordenesFiltradas.length}`} 
            variant="info" 
            size="medium"
          />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <POSIcon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por folio o mesa..."
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

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroActivo === 'todas' && styles.filtroChipActivo,
            ]}
            onPress={() => setFiltroActivo('todas')}
          >
            <POSIcon 
              name="apps" 
              size={16} 
              color={filtroActivo === 'todas' ? COLORS.white : COLORS.text}
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'todas' && styles.filtroChipTextoActivo,
            ]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroActivo === 'mesas' && styles.filtroChipActivo,
            ]}
            onPress={() => setFiltroActivo('mesas')}
          >
            <POSIcon 
              name="restaurant" 
              size={16} 
              color={filtroActivo === 'mesas' ? COLORS.white : COLORS.text}
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'mesas' && styles.filtroChipTextoActivo,
            ]}>
              Mesas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroActivo === 'llevar' && styles.filtroChipActivo,
            ]}
            onPress={() => setFiltroActivo('llevar')}
          >
            <POSIcon 
              name="bag-handle" 
              size={16} 
              color={filtroActivo === 'llevar' ? COLORS.white : COLORS.text}
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'llevar' && styles.filtroChipTextoActivo,
            ]}>
              Para Llevar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroActivo === 'entregadas' && styles.filtroChipActivo,
            ]}
            onPress={() => setFiltroActivo('entregadas')}
          >
            <POSIcon 
              name="checkmark-circle" 
              size={16} 
              color={filtroActivo === 'entregadas' ? COLORS.white : COLORS.text}
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'entregadas' && styles.filtroChipTextoActivo,
            ]}>
              Entregadas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Órdenes */}
      <FlatList
        data={ordenesFiltradas}
        renderItem={renderOrdenCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaOrdenes}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <POSIcon name="receipt-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyStateText}>No hay órdenes</Text>
            <Text style={styles.emptyStateSubtext}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea una nueva orden para comenzar'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/pos/crear-orden')}
      >
        <POSIcon name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
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
    backgroundColor: COLORS.white,
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Search
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

  // Filtros
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtroChipActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filtroChipTextoActivo: {
    color: COLORS.white,
  },

  // Lista
  listaOrdenes: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  ordenCard: {
    padding: 14,
  },

  // Orden Card
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ordenHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ordenNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mesaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mesaTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  llevarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  llevarTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Items
  ordenItems: {
    gap: 6,
    marginBottom: 12,
  },
  ordenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenItemCantidad: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 30,
  },
  ordenItemNombre: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  ordenItemsMas: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 38,
  },

  // Footer
  ordenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ordenFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ordenFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tiempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tiempoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ordenTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  ordenAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  accionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

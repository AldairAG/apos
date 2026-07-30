import { POSIcon } from '@/components/pos';
import { EstadoOrden, OrdenResponseDTO, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/* ============================================================
 * Mismo sistema visual que VistaMesasScreen — consistencia entre
 * pantallas = confianza (el usuario no tiene que "reaprender").
 * ============================================================ */
const INK = '#0A0A0A';
const PALETTE = {
  bg: '#F2F1EC',
  surface: '#FFFFFF',
  ink: INK,
  primary: '#1652F0',
  primaryDark: '#0F3BB8',
  success: '#1C8A4B',
  successDark: '#136436',
  warning: '#F2A900',
  warningDark: '#B87D00',
  danger: '#C4491D',      // terracota — cancelar / cancelada (evita alarmismo de rojo puro)
  dangerDark: '#8F350F',
  info: '#0E7C86',
  infoDark: '#0A5A61',
  neutral: '#6B6B63',
  border: INK,
};

const BORDER_W = 3;
const RADIUS = 14;

const hardShadow = (color: string = INK, size = 4) => ({
  shadowColor: color,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 2,
});

const tap = (style: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') => {
  try {
    if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (style === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (style === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics no disponible (web/simulador) — no bloquea el flujo.
  }
};

type FiltroTipo = 'todas' | 'mesas' | 'llevar' | 'entregadas';

const FILTROS: { key: FiltroTipo; label: string; icon: string }[] = [
  { key: 'todas', label: 'Todas', icon: 'apps' },
  { key: 'mesas', label: 'Mesas', icon: 'restaurant' },
  { key: 'llevar', label: 'Para llevar', icon: 'bag-handle' },
  { key: 'entregadas', label: 'Entregadas', icon: 'checkmark-circle' },
];

const estadoInfo = (estado: EstadoOrden) => {
  switch (estado) {
    case EstadoOrden.PENDIENTE:
      return { solid: PALETTE.warning, dark: PALETTE.warningDark, label: 'PENDIENTE' };
    case EstadoOrden.EN_PREPARACION:
      return { solid: PALETTE.info, dark: PALETTE.infoDark, label: 'EN PREPARACIÓN' };
    case EstadoOrden.LISTA:
      return { solid: PALETTE.success, dark: PALETTE.successDark, label: 'LISTA' };
    case EstadoOrden.ENTREGADA:
      return { solid: PALETTE.neutral, dark: '#4A4A44', label: 'ENTREGADA' };
    case EstadoOrden.COBRADA:
      return { solid: '#B8860B', dark: '#8B6914', label: 'COBRADA' };
    case EstadoOrden.CANCELADA:
      return { solid: PALETTE.danger, dark: PALETTE.dangerDark, label: 'CANCELADA' };
    default:
      return { solid: PALETTE.neutral, dark: '#4A4A44', label: String(estado).replace('_', ' ') };
  }
};

export default function OrdenesScreen() {
  const { getOrdenesBySucursal, actualizarEstadoOrden, cancelarOrden, loading,seleccionarOrden } = usePos();
  const { sucursalActual } = useSucursal();
  const [ordenes, setOrdenes] = useState<OrdenResponseDTO[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!sucursalActual?.id) {
      setOrdenes([]);
      return;
    }
    loadOrdenes();
  }, [sucursalActual?.id]);

  const loadOrdenes = async () => {
    if (!sucursalActual?.id) return;
    try {
      const data = await getOrdenesBySucursal(sucursalActual.id);
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

  const filtrarOrdenes = useMemo(() => {
    let ordenesFiltradas = ordenes;

    if (filtroActivo === 'mesas') {
      ordenesFiltradas = ordenesFiltradas.filter((o) => o.tipo === TipoOrden.EN_MESA);
    } else if (filtroActivo === 'llevar') {
      ordenesFiltradas = ordenesFiltradas.filter(
        (o) => o.tipo === TipoOrden.PARA_LLEVAR || o.tipo === TipoOrden.DELIVERY
      );
    } else if (filtroActivo === 'entregadas') {
      ordenesFiltradas = ordenesFiltradas.filter(
        (o) => o.estado === EstadoOrden.ENTREGADA || o.estado === EstadoOrden.COBRADA
      );
    }

    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      ordenesFiltradas = ordenesFiltradas.filter(
        (o) =>
          o.folio.toLowerCase().includes(searchLower) ||
          (o.mesa?.nombre || '').toLowerCase().includes(searchLower)
      );
    }

    return ordenesFiltradas;
  }, [ordenes, filtroActivo, busqueda]);

  const enviarACocina = async (orden: OrdenResponseDTO) => {
    tap('medium');
    try {
      await actualizarEstadoOrden(orden.id, EstadoOrden.EN_PREPARACION);
      await loadOrdenes();
      tap('success');
    } catch (error) {
      tap('error');
      Alert.alert('Error', 'No se pudo enviar la orden a cocina.');
    }
  };

  const cobrarOrden = (orden: OrdenResponseDTO) => {
    tap('medium');
    seleccionarOrden(orden.id);
    router.push('/pos/pagar-orden');
  };

  const continuarOrden = (orden: OrdenResponseDTO) => {
    tap('light');
    router.push(`/pos/detalle-orden?ordenId=${orden.id}`);
  };

  const cancelarOrdenActual = (orden: OrdenResponseDTO) => {
    tap('warning');
    Alert.alert('Cancelar orden', `¿Deseas cancelar la orden ${orden.folio}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarOrden(orden.id, 'Cancelada desde la vista de órdenes');
            await loadOrdenes();
            tap('success');
          } catch (error) {
            tap('error');
            Alert.alert('Error', 'No se pudo cancelar la orden.');
          }
        },
      },
    ]);
  };

  const calcularTiempoTranscurrido = (fechaCreacion: string): number => {
    const fecha = new Date(fechaCreacion);
    const diffMs = Date.now() - fecha.getTime();
    return Math.floor(diffMs / 60000);
  };

  const renderOrdenCard = ({ item: orden }: { item: OrdenResponseDTO }) => {
    const tiempoTranscurrido = calcularTiempoTranscurrido(orden.createdAt);
    const estado = estadoInfo(orden.estado);
    const esFinal = orden.estado === EstadoOrden.CANCELADA || orden.estado === EstadoOrden.ENTREGADA || orden.estado === EstadoOrden.COBRADA;

    return (
      <Pressable
        onPress={() => {
          tap('light');
          router.push(`/pos/detalle-orden?ordenId=${orden.id}`);
        }}
        style={({ pressed }) => [
          styles.ordenCard,
          { borderColor: estado.dark },
          hardShadow(estado.dark, pressed ? 1 : 4),
          pressed && { transform: [{ translateX: 3 }, { translateY: 3 }] },
        ]}
      >
        <View style={[styles.franjaEstado, { backgroundColor: estado.solid }]} />

        <View style={styles.ordenBody}>
          {/* Header */}
          <View style={styles.ordenHeader}>
            <View style={styles.ordenHeaderLeft}>
              <Text style={styles.ordenNumero}>#{orden.folio}</Text>
              {orden.tipo === TipoOrden.EN_MESA && orden.mesa ? (
                <View style={styles.mesaTag}>
                  <POSIcon name="restaurant" size={13} color={PALETTE.ink} />
                  <Text style={styles.mesaTagText}>{orden.mesa.nombre}</Text>
                </View>
              ) : (
                <View style={styles.llevarTag}>
                  <POSIcon name="bag-handle" size={13} color={PALETTE.primaryDark} />
                  <Text style={styles.llevarTagText}>
                    {orden.tipo === TipoOrden.DELIVERY ? 'Delivery' : 'Llevar'}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.estadoPill, { backgroundColor: estado.solid, borderColor: estado.dark }]}>
              <Text style={styles.estadoPillText}>{estado.label}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.ordenItems}>
            {orden.detalles?.slice(0, 3).map((detalle, index) => (
              <View key={index} style={styles.ordenItem}>
                <Text style={styles.ordenItemCantidad}>{detalle.cantidad}×</Text>
                <Text style={styles.ordenItemNombre} numberOfLines={1}>
                  {detalle.nombreProducto || `Producto ${detalle.id}`}
                </Text>
              </View>
            ))}
            {(orden.detalles?.length || 0) > 3 && (
              <Text style={styles.ordenItemsMas}>+{orden.detalles.length - 3} más</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.ordenFooter}>
            <View style={styles.ordenFooterLeft}>
              <View style={styles.tiempoContainer}>
                <POSIcon name="time" size={15} color={PALETTE.ink} />
                <Text style={styles.tiempoText}>
                  {tiempoTranscurrido < 60
                    ? `${tiempoTranscurrido} min`
                    : `${Math.floor(tiempoTranscurrido / 60)}h ${tiempoTranscurrido % 60}m`}
                </Text>
              </View>
              {orden.numeroPersonas > 0 && (
                <View style={styles.tiempoContainer}>
                  <POSIcon name="people" size={15} color={PALETTE.ink} />
                  <Text style={styles.tiempoText}>{orden.numeroPersonas}</Text>
                </View>
              )}
            </View>
            <Text style={styles.ordenTotal}>${orden.total.toFixed(2)}</Text>
          </View>

          {/* Acciones — un solo toque por acción, sin menús ocultos */}
          {!esFinal && (
            <View style={styles.ordenAcciones}>
              {orden.estado === EstadoOrden.PENDIENTE && (
                <Pressable
                  onPress={() => cobrarOrden(orden)}
                  style={({ pressed }) => [
                    styles.accionButtonFlex,
                    { backgroundColor: PALETTE.info, borderColor: PALETTE.infoDark },
                    hardShadow(PALETTE.infoDark, pressed ? 1 : 3),
                    pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                    styles.accionButtonFlex,
                  ]}
                >
                  <POSIcon name="send" size={17} color="#FFF" />
                  <Text style={styles.accionButtonText}>Cobrar</Text>
                </Pressable>
              )}

              {orden.estado === EstadoOrden.LISTA && (
                <Pressable
                  onPress={() => cobrarOrden(orden)}
                  style={({ pressed }) => [
                    styles.accionButtonFlex,
                    { backgroundColor: '#B8860B', borderColor: '#8B6914' },
                    hardShadow('#8B6914', pressed ? 1 : 3),
                    pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                    styles.accionButtonFlex,
                  ]}
                >
                  <POSIcon name="cash" size={17} color="#FFF" />
                  <Text style={styles.accionButtonText}>Cobrar</Text>
                </Pressable>
              )}

              {orden.estado === EstadoOrden.ENTREGADA && (
                <Pressable
                  onPress={() => cobrarOrden(orden)}
                  style={({ pressed }) => [
                    styles.accionButtonFlex,
                    { backgroundColor: '#B8860B', borderColor: '#8B6914' },
                    hardShadow('#8B6914', pressed ? 1 : 3),
                    pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                    styles.accionButtonFlex,
                  ]}
                >
                  <POSIcon name="cash" size={17} color="#FFF" />
                  <Text style={styles.accionButtonText}>Cobrar</Text>
                </Pressable>
              )}

              {(orden.estado === EstadoOrden.PENDIENTE || orden.estado === EstadoOrden.EN_PREPARACION) && (
                <Pressable
                  onPress={() => continuarOrden(orden)}
                  style={({ pressed }) => [
                    styles.accionButtonIcon,
                    { backgroundColor: PALETTE.primary, borderColor: PALETTE.primaryDark },
                    hardShadow(PALETTE.primaryDark, pressed ? 1 : 3),
                    pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                  ]}
                >
                  <POSIcon name="pencil" size={17} color="#FFF" />
                </Pressable>
              )}

              <Pressable
                onPress={() => cancelarOrdenActual(orden)}
                style={({ pressed }) => [
                  styles.accionButtonIcon,
                  { backgroundColor: PALETTE.surface, borderColor: PALETTE.danger },
                  hardShadow(PALETTE.dangerDark, pressed ? 1 : 3),
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
                ]}
              >
                <POSIcon name="close" size={17} color={PALETTE.danger} />
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const ordenesFiltradas = filtrarOrdenes;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Órdenes</Text>
            <Text style={styles.sucursalText}>{sucursalActual ? sucursalActual.nombre : 'Sin sucursal'}</Text>
          </View>
          <View style={styles.contadorTotal}>
            <Text style={styles.contadorTotalText}>{ordenesFiltradas.length}</Text>
          </View>
        </View>

        {/* Buscador — alto contraste, objetivo táctil grande */}
        <View style={styles.searchContainer}>
          <POSIcon name="search" size={20} color={PALETTE.ink} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por folio o mesa..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor={PALETTE.neutral}
          />
          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda('')} hitSlop={10}>
              <POSIcon name="close-circle" size={20} color={PALETTE.neutral} />
            </Pressable>
          )}
        </View>

        {/* Filtros — chips grandes, un toque cambia todo el listado */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {FILTROS.map((f) => {
            const activo = filtroActivo === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  tap('light');
                  setFiltroActivo(f.key);
                }}
                style={[
                  styles.filtroChip,
                  activo && { backgroundColor: PALETTE.primary, borderColor: PALETTE.primaryDark },
                ]}
              >
                <POSIcon name={f.icon as any} size={16} color={activo ? '#FFF' : PALETTE.ink} />
                <Text style={[styles.filtroChipText, activo && styles.filtroChipTextoActivo]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={ordenesFiltradas}
        renderItem={renderOrdenCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaOrdenes}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadOrdenes}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <POSIcon name="receipt" size={64} color={PALETTE.neutral} />
            <Text style={styles.emptyStateText}>No hay órdenes</Text>
            <Text style={styles.emptyStateSubtext}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea una nueva orden para comenzar'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => {
          tap('medium');
          router.push('/pos/crear-orden');
        }}
        style={({ pressed }) => [
          styles.fab,
          hardShadow(PALETTE.primaryDark, pressed ? 1 : 5),
          pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
        ]}
      >
        <POSIcon name="add" size={34} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },

  // Header
  header: {
    backgroundColor: PALETTE.surface,
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: BORDER_W,
    borderBottomColor: PALETTE.border,
    gap: 12,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flex: 1, gap: 2 },
  title: { fontSize: 28, fontWeight: '900', color: PALETTE.ink, letterSpacing: -0.5 },
  sucursalText: { fontSize: 12, color: PALETTE.neutral, fontWeight: '700' },
  contadorTotal: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: PALETTE.info,
    borderWidth: 2,
    borderColor: PALETTE.infoDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contadorTotalText: { fontSize: 15, fontWeight: '900', color: '#FFF' },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    minHeight: 50,
    gap: 10,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
  },
  searchInput: { flex: 1, fontSize: 16, color: PALETTE.ink, padding: 0, fontWeight: '600' },

  // Filtros
  filtros: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.surface,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: PALETTE.ink,
  },
  filtroChipText: { fontSize: 13, fontWeight: '800', color: PALETTE.ink },
  filtroChipTextoActivo: { color: '#FFF' },

  // Lista
  listaOrdenes: { padding: 16, paddingBottom: 110, gap: 14 },
  ordenCard: {
    borderWidth: BORDER_W,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: PALETTE.surface,
  },
  franjaEstado: { height: 8, width: '100%' },
  ordenBody: { padding: 14, gap: 10 },

  // Orden Card header
  ordenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  ordenHeaderLeft: { gap: 6, flex: 1 },
  ordenNumero: { fontSize: 17, fontWeight: '900', color: PALETTE.ink },
  mesaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#EDEBE3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mesaTagText: { fontSize: 12, fontWeight: '700', color: PALETTE.ink },
  llevarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E8EEFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  llevarTagText: { fontSize: 12, fontWeight: '700', color: PALETTE.primaryDark },

  estadoPill: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  estadoPillText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },

  // Items
  ordenItems: { gap: 5 },
  ordenItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ordenItemCantidad: { fontSize: 14, fontWeight: '800', color: PALETTE.neutral, width: 28 },
  ordenItemNombre: { fontSize: 14, color: PALETTE.ink, flex: 1, fontWeight: '600' },
  ordenItemsMas: { fontSize: 12, color: PALETTE.neutral, fontWeight: '700', marginLeft: 36 },

  divider: { height: 2, backgroundColor: '#EDEBE3' },

  // Footer
  ordenFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ordenFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tiempoContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tiempoText: { fontSize: 13, color: PALETTE.ink, fontWeight: '700' },
  ordenTotal: { fontSize: 19, fontWeight: '900', color: PALETTE.successDark },

  // Acciones
  ordenAcciones: { flexDirection: 'row', gap: 10, marginTop: 2 },
  accionButtonFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
  },
  accionButtonText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  accionButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyStateText: { fontSize: 17, fontWeight: '900', color: PALETTE.ink },
  emptyStateSubtext: { fontSize: 13, color: PALETTE.neutral, fontWeight: '600', textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: RADIUS + 4,
    backgroundColor: PALETTE.primary,
    borderWidth: BORDER_W,
    borderColor: PALETTE.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
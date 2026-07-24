import { POSIcon } from '@/components/pos';
import { EstadoOrden, OrdenResponseDTO, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/* ============================================================
 * Mismo sistema visual que el resto del POS — consistencia entre
 * pantallas = confianza (nada que reaprender).
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
  danger: '#C4491D',
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
    case EstadoOrden.CANCELADA:
      return { solid: PALETTE.danger, dark: PALETTE.dangerDark, label: 'CANCELADA' };
    default:
      return { solid: PALETTE.neutral, dark: '#4A4A44', label: String(estado).replace('_', ' ') };
  }
};

export default function DetalleOrdenScreen() {
  const { ordenId } = useLocalSearchParams<{ ordenId: string }>();
  const { ordenes, cancelOrden } = usePos();
  const [orden, setOrden] = useState<OrdenResponseDTO | null>(null);
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  useEffect(() => {
    loadOrden();
  }, [ordenId, ordenes]);

  const loadOrden = async () => {
    try {
      const ordenEncontrada = ordenes.find((o: OrdenResponseDTO) => o.id === Number(ordenId));
      setOrden(ordenEncontrada || null);
    } catch (error) {
      console.error('Error al cargar orden:', error);
    }
  };

  if (!orden) {
    return (
      <View style={styles.loadingContainer}>
        <POSIcon name="hourglass" size={52} color={PALETTE.neutral} />
        <Text style={styles.loadingText}>Cargando orden...</Text>
      </View>
    );
  }

  const formatearFecha = (fecha: Date) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularTiempoTranscurrido = () => {
    const diffMs = Date.now() - new Date(orden.createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const enviarACocina = () => {
    tap('medium');
    Alert.alert('Enviar a cocina', `¿Deseas enviar la orden ${orden.folio} a cocina?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Enviar', onPress: () => { tap('success'); console.log('Enviado'); } },
    ]);
  };

  const cobrarOrden = () => {
    tap('medium');
    router.push(`/pos/cobro?ordenId=${orden.id}` as any);
  };

  const cancelarOrden = () => {
    tap('warning');
    Alert.alert('Cancelar orden', `¿Estás seguro de cancelar la orden ${orden.folio}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrden(orden.id, 'Cancelada desde la app');
            setOrden({ ...orden, estado: EstadoOrden.CANCELADA });
            tap('success');
          } catch (error) {
            tap('error');
            Alert.alert('Error', 'No se pudo cancelar la orden. Intenta de nuevo más tarde.');
          }
        },
      },
    ]);
  };

  const continuarOrden = () => {
    tap('light');
    router.push(`/pos/crear-orden?ordenId=${orden.id}`);
  };

  const imprimirOrden = () => {
    tap('light');
    console.log('Imprimir orden:', orden.folio);
  };

  const tiempoTranscurrido = calcularTiempoTranscurrido();
  const puedeEditar = orden.estado === EstadoOrden.PENDIENTE || orden.estado === EstadoOrden.EN_PREPARACION;
  const puedeCobrar = orden.estado === EstadoOrden.LISTA;
  const puedeCancelar = orden.estado !== EstadoOrden.CANCELADA && orden.estado !== EstadoOrden.ENTREGADA;
  const estado = estadoInfo(orden.estado);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => {
            tap('light');
            router.back();
          }}
        >
          <POSIcon name="arrow-back" size={22} color={PALETTE.ink} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Orden #{orden.folio}</Text>
          <View style={[styles.estadoPill, { backgroundColor: estado.solid, borderColor: estado.dark }]}>
            <Text style={styles.estadoPillText}>{estado.label}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => {
            tap('light');
            setMostrarAcciones(true);
          }}
        >
          <POSIcon name="ellipsis-vertical" size={22} color={PALETTE.ink} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Información General */}
        <View style={[styles.section, hardShadow(INK, 4)]}>
          <Text style={styles.sectionTitle}>Información general</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="calendar" size={19} color={PALETTE.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de creación</Text>
                <Text style={styles.infoValue}>{formatearFecha(orden.createdAt)}</Text>
              </View>
            </View>

            {orden.tipo === TipoOrden.EN_MESA && orden.mesa && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="restaurant" size={19} color={PALETTE.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Mesa</Text>
                  <Text style={styles.infoValue}>{orden.mesa.nombre}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="bag-handle" size={19} color={PALETTE.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de orden</Text>
                <Text style={styles.infoValue}>
                  {orden.tipo === TipoOrden.EN_MESA
                    ? 'En mesa'
                    : orden.tipo === TipoOrden.PARA_LLEVAR
                      ? 'Para llevar'
                      : orden.tipo === TipoOrden.DELIVERY
                        ? 'Delivery'
                        : 'Recoger'}
                </Text>
              </View>
            </View>

            {orden.numeroPersonas > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="people" size={19} color={PALETTE.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Número de personas</Text>
                  <Text style={styles.infoValue}>{orden.numeroPersonas}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="time" size={19} color={PALETTE.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tiempo transcurrido</Text>
                <Text style={styles.infoValue}>
                  {tiempoTranscurrido < 60
                    ? `${tiempoTranscurrido} minutos`
                    : `${Math.floor(tiempoTranscurrido / 60)}h ${tiempoTranscurrido % 60}m`}
                </Text>
              </View>
            </View>

            {orden.tiempoPreparacion > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="flame" size={19} color={PALETTE.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tiempo de preparación</Text>
                  <Text style={styles.infoValue}>{orden.tiempoPreparacion} min</Text>
                </View>
              </View>
            )}
          </View>

          {orden.observaciones ? (
            <View style={styles.observacionesContainer}>
              <View style={styles.observacionesHeader}>
                <POSIcon name="chatbox" size={16} color={PALETTE.ink} />
                <Text style={styles.observacionesLabel}>Observaciones</Text>
              </View>
              <Text style={styles.observacionesText}>{orden.observaciones}</Text>
            </View>
          ) : null}
        </View>

        {/* Productos */}
        <View style={[styles.section, hardShadow(INK, 4)]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleNoMargin}>Productos</Text>
            <View style={styles.contadorChip}>
              <Text style={styles.contadorChipText}>{orden.detalles?.length || 0}</Text>
            </View>
          </View>

          <View style={styles.productosContainer}>
            {orden.detalles?.map((detalle, index) => (
              <View key={index} style={styles.productoItem}>
                <View style={styles.productoHeader}>
                  <View style={styles.productoInfo}>
                    <View style={styles.productoCantidad}>
                      <Text style={styles.productoCantidadText}>{detalle.cantidad}×</Text>
                    </View>
                    <View style={styles.productoTexto}>
                      <Text style={styles.productoNombre}>Producto {detalle.id}</Text>
                      <Text style={styles.productoPrecio}>${detalle.precioUnitario.toFixed(2)} c/u</Text>
                    </View>
                  </View>
                  <Text style={styles.productoTotal}>${detalle.total.toFixed(2)}</Text>
                </View>

                {detalle.extras && detalle.extras.length > 0 && (
                  <View style={styles.extrasContainer}>
                    {detalle.extras.map((extra, extraIndex) => (
                      <View key={extraIndex} style={styles.extraItem}>
                        <POSIcon name="add-circle" size={13} color={PALETTE.infoDark} />
                        <Text style={styles.extraNombre}>{extra.nombreExtra || `Extra ${extra.id}`}</Text>
                        <Text style={styles.extraCantidad}>×{extra.cantidad}</Text>
                        <Text style={styles.extraPrecio}>+${extra.total.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {index < (orden.detalles?.length || 0) - 1 && <View style={styles.productoDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Resumen de cobro */}
        <View style={[styles.section, { borderColor: PALETTE.successDark }, hardShadow(PALETTE.successDark, 4)]}>
          <Text style={styles.sectionTitle}>Resumen de cobro</Text>

          <View style={styles.resumenContainer}>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Subtotal</Text>
              <Text style={styles.resumenValue}>${orden.subtotal.toFixed(2)}</Text>
            </View>

            {orden.descuento > 0 && (
              <View style={styles.resumenRow}>
                <Text style={[styles.resumenLabel, { color: PALETTE.dangerDark, fontWeight: '800' }]}>Descuento</Text>
                <Text style={[styles.resumenValue, { color: PALETTE.dangerDark }]}>-${orden.descuento.toFixed(2)}</Text>
              </View>
            )}

            {orden.propina > 0 && (
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Propina</Text>
                <Text style={styles.resumenValue}>${orden.propina.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.resumenDivider} />

            <View style={styles.resumenRow}>
              <Text style={styles.resumenTotalLabel}>Total</Text>
              <Text style={styles.resumenTotalValue}>${orden.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Acciones fijas — grandes, directas, la decisión más probable siempre visible */}
      <View style={styles.bottomActions}>
        {puedeCancelar && (
          <Pressable
            onPress={cancelarOrden}
            style={({ pressed }) => [
              styles.actionButton,
              { flex: puedeEditar || puedeCobrar ? 1 : 2, backgroundColor: PALETTE.surface, borderColor: PALETTE.danger },
              hardShadow(PALETTE.dangerDark, pressed ? 1 : 3),
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
          >
            <POSIcon name="close-circle" size={20} color={PALETTE.danger} />
            <Text style={[styles.actionButtonText, { color: PALETTE.danger }]}>Cancelar</Text>
          </Pressable>
        )}

        {puedeEditar && (
          <Pressable
            onPress={continuarOrden}
            style={({ pressed }) => [
              styles.actionButton,
              { flex: 1, backgroundColor: PALETTE.primary, borderColor: PALETTE.primaryDark },
              hardShadow(PALETTE.primaryDark, pressed ? 1 : 3),
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
          >
            <POSIcon name="pencil" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </Pressable>
        )}

        {puedeCobrar && (
          <Pressable
            onPress={cobrarOrden}
            style={({ pressed }) => [
              styles.actionButton,
              { flex: 2, backgroundColor: PALETTE.success, borderColor: PALETTE.successDark },
              hardShadow(PALETTE.successDark, pressed ? 1 : 3),
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
          >
            <POSIcon name="cash" size={22} color="#FFF" />
            <Text style={styles.actionButtonText}>Cobrar</Text>
          </Pressable>
        )}
      </View>

      {/* Modal de acciones secundarias */}
      <Modal visible={mostrarAcciones} animationType="slide" transparent onRequestClose={() => setMostrarAcciones(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMostrarAcciones(false)}>
          <Pressable style={[styles.modalContent, hardShadow(INK, 5)]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Acciones</Text>

            <Pressable
              style={({ pressed }) => [styles.modalAction, pressed && { backgroundColor: '#F2F1EC' }]}
              onPress={() => {
                setMostrarAcciones(false);
                imprimirOrden();
              }}
            >
              <POSIcon name="print" size={22} color={PALETTE.ink} />
              <Text style={styles.modalActionText}>Imprimir orden</Text>
            </Pressable>

            {puedeCancelar && (
              <Pressable
                style={({ pressed }) => [styles.modalAction, pressed && { backgroundColor: '#F2F1EC' }]}
                onPress={() => {
                  setMostrarAcciones(false);
                  cancelarOrden();
                }}
              >
                <POSIcon name="close-circle" size={22} color={PALETTE.danger} />
                <Text style={[styles.modalActionText, { color: PALETTE.danger, fontWeight: '800' }]}>Cancelar orden</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.modalActionCancel,
                hardShadow(INK, pressed ? 1 : 3),
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
              onPress={() => setMostrarAcciones(false)}
            >
              <Text style={styles.modalActionCancelText}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: PALETTE.bg, gap: 12 },
  loadingText: { fontSize: 15, color: PALETTE.neutral, fontWeight: '700' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: BORDER_W,
    borderBottomColor: PALETTE.border,
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS - 4,
    borderWidth: 2,
    borderColor: PALETTE.ink,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
  },
  headerCenter: { flex: 1, gap: 6, alignItems: 'flex-start' },
  title: { fontSize: 19, fontWeight: '900', color: PALETTE.ink },
  estadoPill: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  estadoPillText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },

  // Content
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110, gap: 16 },

  // Section
  section: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    padding: 16,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: PALETTE.ink, marginBottom: 14 },
  sectionTitleNoMargin: { fontSize: 17, fontWeight: '900', color: PALETTE.ink },
  contadorChip: {
    backgroundColor: PALETTE.info,
    borderWidth: 2,
    borderColor: PALETTE.infoDark,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  contadorChipText: { fontSize: 12, fontWeight: '900', color: '#FFF' },

  // Info Grid
  infoGrid: { gap: 14 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PALETTE.primaryDark,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 12, color: PALETTE.neutral, fontWeight: '700' },
  infoValue: { fontSize: 15, color: PALETTE.ink, fontWeight: '800' },

  // Observaciones
  observacionesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FDF1D9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PALETTE.warningDark,
    gap: 6,
  },
  observacionesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  observacionesLabel: { fontSize: 12, color: PALETTE.ink, fontWeight: '800' },
  observacionesText: { fontSize: 14, color: PALETTE.ink, lineHeight: 20, fontWeight: '600' },

  // Productos
  productosContainer: { gap: 0 },
  productoItem: { paddingVertical: 12 },
  productoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productoInfo: { flex: 1, flexDirection: 'row', gap: 12 },
  productoCantidad: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PALETTE.primaryDark,
    backgroundColor: PALETTE.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoCantidadText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  productoTexto: { flex: 1, gap: 3 },
  productoNombre: { fontSize: 15, fontWeight: '800', color: PALETTE.ink },
  productoPrecio: { fontSize: 13, color: PALETTE.neutral, fontWeight: '600' },
  productoTotal: { fontSize: 16, fontWeight: '900', color: PALETTE.ink },
  productoDivider: { height: 2, backgroundColor: '#EDEBE3', marginTop: 12 },

  // Extras
  extrasContainer: { marginTop: 8, marginLeft: 52, gap: 6 },
  extraItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  extraNombre: { flex: 1, fontSize: 13, color: PALETTE.neutral, fontWeight: '600' },
  extraCantidad: { fontSize: 13, color: PALETTE.neutral, fontWeight: '700' },
  extraPrecio: { fontSize: 13, color: PALETTE.infoDark, fontWeight: '800' },

  // Resumen
  resumenContainer: { gap: 12 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumenLabel: { fontSize: 14, color: PALETTE.neutral, fontWeight: '700' },
  resumenValue: { fontSize: 15, fontWeight: '800', color: PALETTE.ink },
  resumenDivider: { height: 2, backgroundColor: '#EDEBE3', marginVertical: 4 },
  resumenTotalLabel: { fontSize: 18, fontWeight: '900', color: PALETTE.ink },
  resumenTotalValue: { fontSize: 26, fontWeight: '900', color: PALETTE.successDark },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: PALETTE.surface,
    borderTopWidth: BORDER_W,
    borderTopColor: PALETTE.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
  },
  actionButtonText: { fontSize: 15, fontWeight: '900', color: '#FFF' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: RADIUS + 6,
    borderTopRightRadius: RADIUS + 6,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: { width: 44, height: 5, backgroundColor: PALETTE.ink, borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: PALETTE.ink, marginBottom: 12 },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#EDEBE3',
  },
  modalActionText: { fontSize: 16, color: PALETTE.ink, fontWeight: '700' },
  modalActionCancel: {
    marginTop: 10,
    backgroundColor: PALETTE.ink,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionCancelText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
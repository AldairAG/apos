import { POSIcon } from '@/components/pos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { EstadoOrden, MesaPosResponseDTO } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

/* ============================================================
 * PALETA — Neo-Brutalismo Funcional + Material Design 3
 * ------------------------------------------------------------
 * Principios aplicados:
 * 1. Colores sólidos y planos, sin degradados: cada color tiene
 *    UN solo significado operativo (semántica consistente = confianza).
 * 2. Psicología del color:
 *    - Azul (PRIMARY): control, estabilidad, "aquí manda el sistema".
 *    - Verde (LIBRE): disponibilidad, luz verde, avanzar sin dudar.
 *    - Ámbar (RESERVADA): atención sin alarmar, "prepárate".
 *    - Terracota/rojo-ladrillo (OCUPADA) en vez de rojo puro:
 *      comunica "ocupado" sin activar estrés/urgencia de emergencia.
 *    - Teal (INFO/LIMPIEZA): neutral, refrescante, "en proceso".
 * 3. Bordes gruesos (3px) + sombra dura (offset, sin blur) dan
 *    lectura instantánea de qué es tocable (Neo-Brutalismo).
 * 4. Alto contraste: texto casi siempre #0A0A0A sobre color sólido
 *    o blanco, nunca grises medios que cuesten leer bajo luz de piso.
 * ============================================================ */
const INK = '#0A0A0A';
const PALETTE = {
  bg: '#F2F1EC',
  surface: '#FFFFFF',
  ink: INK,
  primary: '#1652F0',      // azul confianza — acciones principales
  primaryDark: '#0F3BB8',
  success: '#1C8A4B',      // verde — mesa libre
  successDark: '#136436',
  warning: '#F2A900',      // ámbar — reservada
  warningDark: '#B87D00',
  danger: '#C4491D',       // terracota — ocupada (sin alarmismo)
  dangerDark: '#8F350F',
  info: '#0E7C86',         // teal — limpieza / para llevar
  infoDark: '#0A5A61',
  neutral: '#6B6B63',
  border: INK,
};

const BORDER_W = 3;
const RADIUS = 14;

// Sombra "dura" característica del neo-brutalismo: sin blur, con offset.
const hardShadow = (color: string = INK, size = 4) => ({
  shadowColor: color,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 2,
});

const tap = (style: 'light' | 'medium' | 'success' | 'warning' = 'light') => {
  try {
    if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (style === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics no disponible (web/simulador) — no bloquea el flujo.
  }
};

const estadoOrdenInfo = (estado: EstadoOrden) => {
  switch (estado) {
    case EstadoOrden.PENDIENTE:
      return { color: PALETTE.warning, label: 'PENDIENTE' };
    case EstadoOrden.EN_PREPARACION:
      return { color: PALETTE.info, label: 'EN PREPARACIÓN' };
    case EstadoOrden.LISTA:
      return { color: PALETTE.success, label: 'LISTA' };
    case EstadoOrden.ENTREGADA:
      return { color: PALETTE.neutral, label: 'ENTREGADA' };
    case EstadoOrden.COBRADA:
      return { color: '#B8860B', label: 'COBRADA' };
    case EstadoOrden.CANCELADA:
      return { color: PALETTE.danger, label: 'CANCELADA' };
    default:
      return { color: PALETTE.neutral, label: String(estado).replace('_', ' ') };
  }
};

export default function VistaMesasScreen() {
  const { mesas, cargarMesas, seleccionarMesa, loading } = usePos();
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([]);
  const [mostrarModalUnir, setMostrarModalUnir] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);

  useEffect(() => {
    cargarMesas();
  }, []);

  const ordenesSinMesa = mesas.filter((m: MesaPosResponseDTO) => m.ordenActualDTO && !m.id).length;

  const toggleSeleccion = (mesaId: number) => {
    tap('light');
    setMesasSeleccionadas((prev) =>
      prev.includes(mesaId) ? prev.filter((id) => id !== mesaId) : [...prev, mesaId]
    );
  };

  const handleUnirMesas = () => {
    if (mesasSeleccionadas.length < 2) {
      tap('warning');
      Alert.alert('Selecciona 2 o más mesas', 'Necesitas al menos 2 mesas para unirlas.');
      return;
    }
    tap('medium');
    setMostrarModalUnir(true);
  };

  const confirmarUnion = () => {
    tap('success');
    console.log('Unir mesas:', mesasSeleccionadas);
    setMostrarModalUnir(false);
    setModoSeleccion(false);
    setMesasSeleccionadas([]);
    // Aquí iría la lógica de unión
  };

  const cancelarUnion = () => {
    tap('light');
    setModoSeleccion(false);
    setMesasSeleccionadas([]);
  };

  // Menos clics: un solo toque siempre lleva a la acción más probable.
  const handleMesaPress = (mesa: MesaPosResponseDTO) => {
    if (modoSeleccion) {
      toggleSeleccion(mesa.id);
      return;
    }
    tap('medium');
    if (mesa.ordenActualDTO) {
      router.push(`/pos/detalle-orden?ordenId=${mesa.ordenActualDTO.id}`);
    } else {
      seleccionarMesa(mesa.id);
      router.push('/pos/crear-orden');
    }
  };

  const getEstadoColores = (estado: EstadoMesa) => {
    switch (estado) {
      case EstadoMesa.LIBRE:
        return { solid: PALETTE.success, dark: PALETTE.successDark, label: 'LIBRE' };
      case EstadoMesa.OCUPADA:
        return { solid: PALETTE.danger, dark: PALETTE.dangerDark, label: 'OCUPADA' };
      case EstadoMesa.RESERVADA:
        return { solid: PALETTE.warning, dark: PALETTE.warningDark, label: 'RESERVADA' };
      default:
        return { solid: PALETTE.neutral, dark: PALETTE.neutral, label: 'DESCONOCIDO' };
    }
  };

  const calcularTiempoOcupada = (mesa: MesaPosResponseDTO) => {
    if (!mesa.ordenActualDTO) return null;
    const diffMs = Date.now() - new Date(mesa.ordenActualDTO.createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const renderMesaCard = ({ item }: { item: MesaPosResponseDTO }) => {
    const isSeleccionada = mesasSeleccionadas.includes(item.id);
    const tiempoOcupada = calcularTiempoOcupada(item);
    const estado = getEstadoColores(item.estado);

    return (
      <Pressable
        onPress={() => handleMesaPress(item)}
        style={({ pressed }) => [
          styles.mesaCard,
          { borderColor: estado.dark, backgroundColor: PALETTE.surface },
          hardShadow(estado.dark, pressed ? 1 : 4),
          // Feedback inmediato: la tarjeta "se hunde" al presionar.
          pressed && { transform: [{ translateX: 3 }, { translateY: 3 }] },
          isSeleccionada && { backgroundColor: '#E8EEFF', borderColor: PALETTE.primary },
        ]}
      >
        {/* Franja de estado — visible de un vistazo, sin leer texto */}
        <View style={[styles.franjaEstado, { backgroundColor: estado.solid }]} />

        <View style={styles.mesaBody}>
          <View style={styles.mesaHeaderRow}>
            <Text style={styles.mesaNombre} numberOfLines={1}>{item.nombre}</Text>
            {modoSeleccion && (
              <View
                style={[
                  styles.checkbox,
                  { borderColor: PALETTE.ink },
                  isSeleccionada && { backgroundColor: PALETTE.primary },
                ]}
              >
                {isSeleccionada && <POSIcon name="checkmark" size={16} color="#FFF" />}
              </View>
            )}
          </View>

          <View style={[styles.estadoPill, { backgroundColor: estado.solid, borderColor: estado.dark }]}>
            <Text style={styles.estadoPillText}>{estado.label}</Text>
          </View>

          {item.ordenActualDTO && (
            <View style={styles.mesaInfo}>
              <View style={styles.mesaInfoRow}>
                <POSIcon name="people" size={16} color={PALETTE.ink} />
                <Text style={styles.mesaInfoText}>{item.ordenActualDTO.numeroPersonas} personas</Text>
              </View>
              {tiempoOcupada !== null && (
                <View style={styles.mesaInfoRow}>
                  <POSIcon name="time" size={16} color={PALETTE.ink} />
                  <Text style={styles.mesaInfoText}>{tiempoOcupada} min</Text>
                </View>
              )}
              <Text style={styles.mesaTotalText}>${item.ordenActualDTO.total.toFixed(2)}</Text>
              <View style={styles.divider} />
              <View style={styles.ordenFooterRow}>
                <Text style={styles.ordenFolio} numberOfLines={1}>#{item.ordenActualDTO.folio}</Text>
                <View
                  style={[
                    styles.miniBadge,
                    {
                      backgroundColor: estadoOrdenInfo(item.ordenActualDTO.estado).color,
                    },
                  ]}
                >
                  <Text style={styles.miniBadgeText}>{estadoOrdenInfo(item.ordenActualDTO.estado).label}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header fijo — jerarquía clara, acciones grandes y directas */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mesas</Text>
          {ordenesSinMesa > 0 && (
            <Pressable
              onPress={() => {
                tap('light');
                router.push('/pos/ordenes?filtro=sin-mesa');
              }}
              style={({ pressed }) => [
                styles.paraLlevarBtn,
                hardShadow(PALETTE.infoDark, pressed ? 1 : 3),
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
            >
              <POSIcon name="bag-handle" size={20} color="#FFF" />
              <Text style={styles.paraLlevarText}>Para llevar</Text>
              <View style={styles.contador}>
                <Text style={styles.contadorText}>{ordenesSinMesa}</Text>
              </View>
            </Pressable>
          )}
        </View>

        {!modoSeleccion ? (
          <Pressable
            onPress={() => {
              tap('light');
              setModoSeleccion(true);
            }}
            style={({ pressed }) => [
              styles.unirButton,
              hardShadow(PALETTE.primaryDark, pressed ? 1 : 3),
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            ]}
          >
            <POSIcon name="git-merge" size={18} color={PALETTE.primary} />
            <Text style={styles.unirButtonText}>Unir mesas</Text>
          </Pressable>
        ) : (
          <View style={styles.unirActionsRow}>
            <Pressable onPress={cancelarUnion} style={styles.cancelarButton}>
              <Text style={styles.cancelarButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleUnirMesas}
              disabled={mesasSeleccionadas.length < 2}
              style={({ pressed }) => [
                styles.confirmarButton,
                mesasSeleccionadas.length < 2 && styles.buttonDisabled,
                hardShadow(PALETTE.primaryDark, pressed ? 1 : 3),
              ]}
            >
              <Text style={styles.confirmarButtonText}>
                Unir mesas ({mesasSeleccionadas.length})
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Leyenda — refuerza confianza: el color siempre significa lo mismo */}
      <View style={styles.leyenda}>
        {[
          { c: PALETTE.success, t: 'Libre' },
          { c: PALETTE.danger, t: 'Ocupada' },
          { c: PALETTE.warning, t: 'Reservada' },
          { c: PALETTE.info, t: 'Limpieza' },
        ].map((it) => (
          <View key={it.t} style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: it.c, borderColor: PALETTE.ink }]} />
            <Text style={styles.leyendaText}>{it.t}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={mesas}
        renderItem={renderMesaCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.mesasGrid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={cargarMesas}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <POSIcon name="grid" size={64} color={PALETTE.neutral} />
            <Text style={styles.emptyText}>No hay mesas disponibles</Text>
          </View>
        }
      />

      {/* Modal de confirmación — un paso menos: resumen + acción, nada más */}
      <Modal visible={mostrarModalUnir} animationType="fade" transparent onRequestClose={() => setMostrarModalUnir(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, hardShadow(INK, 6)]}>
            <Text style={styles.modalTitle}>Confirmar unión</Text>
            <Text style={styles.modalText}>Se unirán estas mesas en una sola orden:</Text>
            <View style={styles.modalMesas}>
              {mesasSeleccionadas.map((mesaId) => {
                const mesa = mesas.find((m: MesaPosResponseDTO) => m.id === mesaId);
                return mesa ? (
                  <View key={mesaId} style={styles.modalMesaItem}>
                    <Text style={styles.modalMesaText}>{mesa.nombre}</Text>
                  </View>
                ) : null;
              })}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButtonCancel} onPress={() => setMostrarModalUnir(false)}>
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButtonConfirm, hardShadow(PALETTE.successDark, 3)]}
                onPress={confirmarUnion}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Acciones flotantes — objetivos grandes (64/76dp), siempre al alcance del pulgar */}
      <View style={styles.floatingActions}>
        <Pressable
          onPress={() => {
            tap('light');
            router.push('/pos/ordenes');
          }}
          style={({ pressed }) => [
            styles.fabSecondary,
            hardShadow(PALETTE.infoDark, pressed ? 1 : 4),
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <POSIcon name="list" size={24} color="#FFF" />
        </Pressable>

        <Pressable
          onPress={() => {
            tap('medium');
            router.push('/pos/crear-orden');
          }}
          style={({ pressed }) => [
            styles.fabPrimary,
            hardShadow(PALETTE.primaryDark, pressed ? 1 : 5),
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <POSIcon name="add" size={34} color="#FFF" />
        </Pressable>
      </View>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 30, fontWeight: '900', color: PALETTE.ink, letterSpacing: -0.5 },

  paraLlevarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.info,
    borderWidth: BORDER_W,
    borderColor: PALETTE.infoDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS,
    gap: 8,
    minHeight: 48,
  },
  paraLlevarText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  contador: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: PALETTE.infoDark,
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  contadorText: { fontSize: 12, fontWeight: '900', color: PALETTE.infoDark },

  unirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: BORDER_W,
    borderColor: PALETTE.primaryDark,
    paddingVertical: 14,
    borderRadius: RADIUS,
    gap: 8,
    minHeight: 52,
  },
  unirButtonText: { fontSize: 15, fontWeight: '800', color: PALETTE.primary },

  unirActionsRow: { flexDirection: 'row', gap: 10 },
  cancelarButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    backgroundColor: '#FFF',
  },
  cancelarButtonText: { fontSize: 15, fontWeight: '800', color: PALETTE.ink },
  confirmarButton: {
    flex: 2,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.primaryDark,
    backgroundColor: PALETTE.primary,
  },
  confirmarButtonText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  buttonDisabled: { opacity: 0.4 },

  // Leyenda
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: PALETTE.surface,
    paddingVertical: 10,
    borderBottomWidth: BORDER_W,
    borderBottomColor: PALETTE.border,
  },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaColor: { width: 14, height: 14, borderRadius: 4, borderWidth: 2 },
  leyendaText: { fontSize: 12, color: PALETTE.ink, fontWeight: '700' },

  // Grid de mesas
  mesasGrid: { padding: 16, paddingBottom: 110 },
  columnWrapper: { gap: 14, marginBottom: 14 },
  mesaCard: {
    flex: 1,
    borderWidth: BORDER_W,
    borderRadius: RADIUS,
    overflow: 'hidden',
    minHeight: 168,
  },
  franjaEstado: { height: 8, width: '100%' },
  mesaBody: { padding: 12, gap: 8 },
  mesaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mesaNombre: { fontSize: 18, fontWeight: '900', color: PALETTE.ink, flexShrink: 1 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estadoPill: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  estadoPillText: { fontSize: 11, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  mesaInfo: { gap: 5, marginTop: 4 },
  mesaInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mesaInfoText: { fontSize: 13, color: PALETTE.ink, fontWeight: '600' },
  mesaTotalText: { fontSize: 18, fontWeight: '900', color: PALETTE.successDark },
  divider: { height: 2, backgroundColor: '#EDEBE3', marginVertical: 2 },
  ordenFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordenFolio: { fontSize: 12, fontWeight: '800', color: PALETTE.neutral, flexShrink: 1 },
  miniBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  miniBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', textTransform: 'uppercase' },

  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: PALETTE.neutral, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    padding: 22,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: { fontSize: 21, fontWeight: '900', color: PALETTE.ink, marginBottom: 8 },
  modalText: { fontSize: 14, color: PALETTE.neutral, fontWeight: '600', marginBottom: 14 },
  modalMesas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  modalMesaItem: {
    backgroundColor: '#E8EEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PALETTE.primary,
  },
  modalMesaText: { fontSize: 13, fontWeight: '800', color: PALETTE.primaryDark },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButtonCancel: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    backgroundColor: '#FFF',
  },
  modalButtonConfirm: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.successDark,
    backgroundColor: PALETTE.success,
  },
  modalButtonTextCancel: { fontSize: 15, fontWeight: '800', color: PALETTE.ink },
  modalButtonTextConfirm: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  // Floating actions — objetivos táctiles grandes, siempre visibles
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.infoDark,
    backgroundColor: PALETTE.info,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPrimary: {
    width: 72,
    height: 72,
    borderRadius: RADIUS + 4,
    borderWidth: BORDER_W,
    borderColor: PALETTE.primaryDark,
    backgroundColor: PALETTE.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
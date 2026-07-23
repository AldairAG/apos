import { COLORS, POSIcon } from '@/components/pos';
import { CrearMesaDTO, EstadoMesa, Mesa } from '@/features/mesas/mesas.types';
import { useMesa } from '@/features/mesas/useMesa';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ── Design tokens: MD3 + Neo-Brutalismo Funcional (mismos que el resto de la app) ──
const INK = '#0D0D0D';
const BORDER_W = 3;
const RADIUS = 16;
const RIPPLE = { color: 'rgba(0,0,0,0.18)', borderless: false };

const hardShadow = (pressed: boolean) => ({
  shadowColor: INK,
  shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: pressed ? 0 : 5,
  transform: [{ translateX: pressed ? 3 : 0 }, { translateY: pressed ? 3 : 0 }],
});

// ─── Estado config ─────────────────────────────────────────────────────────────
// Psicología del color: verde = disponible (afirmativo, invita a usar la mesa),
// ámbar = ocupada (atención, no alarma — es un estado normal del negocio),
// azul = reservada (informativo/planeado). Ningún estado usa rojo: el rojo
// queda reservado exclusivamente para acciones destructivas (eliminar).
const ESTADO_CONFIG: Record<EstadoMesa, { label: string; color: string }> = {
  [EstadoMesa.LIBRE]: { label: 'LIBRE', color: COLORS.success },
  [EstadoMesa.OCUPADA]: { label: 'OCUPADA', color: COLORS.warning },
  [EstadoMesa.RESERVADA]: { label: 'RESERVADA', color: COLORS.info },
};

// ─── MesaCard ──────────────────────────────────────────────────────────────────

interface MesaCardProps {
  mesa: Mesa;
  onEdit: (mesa: Mesa) => void;
  onDelete: (id: number, nombre: string) => void;
}

const MesaCard: React.FC<MesaCardProps> = ({ mesa, onEdit, onDelete }) => {
  const cfg = ESTADO_CONFIG[mesa.estado] ?? ESTADO_CONFIG[EstadoMesa.LIBRE];

  return (
    <View style={[styles.card, !mesa.activa && styles.cardInactive]}>
      <View style={[styles.cardStatusBar, { backgroundColor: cfg.color }]} />

      <View style={styles.cardBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>
          {mesa.nombre}
        </Text>
        <Text style={styles.cardCodigo}>{mesa.codigo}</Text>

        <View style={[styles.estadoBadge, { backgroundColor: cfg.color }]}>
          <Text style={styles.estadoText}>{cfg.label}</Text>
        </View>

        {mesa.estado === EstadoMesa.OCUPADA && mesa.ordenActual > 0 && (
          <Text style={styles.ordenText}>ORDEN #{mesa.ordenActual}</Text>
        )}

        {!mesa.activa && <Text style={styles.inactiveText}>INACTIVA</Text>}

        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnEditar, hardShadow(pressed)]}
            onPress={() => onEdit(mesa)}
            android_ripple={RIPPLE}
            accessibilityLabel={`Editar ${mesa.nombre}`}
          >
            <POSIcon name="create-outline" size={18} color={INK} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnDanger, hardShadow(pressed)]}
            onPress={() => onDelete(mesa.id, mesa.nombre)}
            android_ripple={RIPPLE}
            accessibilityLabel={`Eliminar ${mesa.nombre}`}
          >
            <POSIcon name="trash-outline" size={18} color={INK} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ─── FilterChip ────────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, count, active, onPress, color = COLORS.primary }) => (
  <Pressable
    style={({ pressed }) => [styles.chip, active && { backgroundColor: color }, hardShadow(pressed)]}
    onPress={onPress}
    android_ripple={RIPPLE}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={styles.chipLabel}>{label.toUpperCase()}</Text>
    <View style={styles.chipBadge}>
      <Text style={styles.chipBadgeText}>{count}</Text>
    </View>
  </Pressable>
);

// ─── MesaFormModal ─────────────────────────────────────────────────────────────

interface MesaFormModalProps {
  visible: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onSave: (data: CrearMesaDTO) => void;
  onDelete: (id: number) => void;
}

const MesaFormModal: React.FC<MesaFormModalProps> = ({
  visible,
  mesa,
  onClose,
  onSave,
  onDelete,
}) => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [errors, setErrors] = useState<{ nombre?: string; codigo?: string }>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible) {
      setNombre(mesa?.nombre ?? '');
      setCodigo(mesa?.codigo ?? '');
      setErrors({});
      setGuardando(false);
    }
  }, [visible, mesa]);

  const validate = (): boolean => {
    const e: { nombre?: string; codigo?: string } = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!codigo.trim()) e.codigo = 'El código es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setGuardando(true);
    await onSave({ nombre: nombre.trim(), codigo: codigo.trim() });
    setGuardando(false);
  };

  const handleRequestDelete = () => {
    if (!mesa) return;
    Alert.alert(
      'Eliminar mesa',
      `¿Eliminar "${mesa.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await onDelete(mesa.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Cerrar formulario" />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>{mesa ? 'EDITAR MESA' : 'NUEVA MESA'}</Text>
            <Pressable
              style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
              onPress={onClose}
              hitSlop={6}
            >
              <POSIcon name="close" size={20} color={INK} />
            </Pressable>
          </View>

          {/* ── Nombre ── */}
          <Text style={styles.inputLabel}>NOMBRE</Text>
          <TextInput
            style={[styles.input, !!errors.nombre && styles.inputError]}
            placeholder="Mesa 01"
            placeholderTextColor={COLORS.textSecondary}
            value={nombre}
            onChangeText={t => {
              setNombre(t);
              setErrors(prev => ({ ...prev, nombre: undefined }));
            }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {!!errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          {/* ── Código ── */}
          <Text style={styles.inputLabel}>CÓDIGO</Text>
          <TextInput
            style={[styles.input, !!errors.codigo && styles.inputError]}
            placeholder="M01"
            placeholderTextColor={COLORS.textSecondary}
            value={codigo}
            onChangeText={t => {
              setCodigo(t);
              setErrors(prev => ({ ...prev, codigo: undefined }));
            }}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {!!errors.codigo && <Text style={styles.errorText}>{errors.codigo}</Text>}

          {/* ── Eliminar (solo en edición) ── */}
          {mesa && (
            <Pressable
              style={({ pressed }) => [styles.deleteBtn, hardShadow(pressed)]}
              onPress={handleRequestDelete}
              android_ripple={RIPPLE}
            >
              <POSIcon name="trash-outline" size={18} color={INK} />
              <Text style={styles.deleteBtnText}>ELIMINAR MESA</Text>
            </Pressable>
          )}

          {/* ── Acciones ── */}
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.btnCancel, hardShadow(pressed)]}
              onPress={onClose}
              android_ripple={RIPPLE}
              disabled={guardando}
            >
              <Text style={styles.btnCancelText}>CANCELAR</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSave, hardShadow(pressed)]}
              onPress={handleSave}
              android_ripple={RIPPLE}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color={INK} />
              ) : (
                <Text style={styles.btnSaveText}>GUARDAR</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── MesasScreen ──────────────────────────────────────────────────────────

type FiltroEstado = EstadoMesa | null;

export default function MesasScreen() {
  const {
    mesas,
    loading,
    error,
    sucursalActual,
    cargarMesas,
    createMesa,
    updateMesa,
    deleteMesa,
    clearError,
  } = useMesa();

  const [filtro, setFiltro] = useState<FiltroEstado>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);

  // Carga inicial
  useEffect(() => {
    cargarMesas();
  }, [cargarMesas]);

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // Derivados
  const mesasSeguras = Array.isArray(mesas) ? mesas : [];

  const mesasFiltradas =
    filtro !== null ? mesasSeguras.filter(m => m.estado === filtro) : mesasSeguras;

  const conteos = {
    libre: mesasSeguras.filter(m => m.estado === EstadoMesa.LIBRE).length,
    ocupada: mesasSeguras.filter(m => m.estado === EstadoMesa.OCUPADA).length,
    reservada: mesasSeguras.filter(m => m.estado === EstadoMesa.RESERVADA).length,
  };

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingMesa(null);
    setModalVisible(true);
  }, []);

  const handleOpenEdit = useCallback((mesa: Mesa) => {
    setEditingMesa(mesa);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingMesa(null);
  }, []);

  const handleSave = useCallback(
    async (data: CrearMesaDTO) => {
      if (editingMesa) {
        await updateMesa(editingMesa.id, { ...editingMesa, ...data });
      } else {
        await createMesa(data);
      }
      handleCloseModal();
      cargarMesas();
    },
    [editingMesa, updateMesa, createMesa, handleCloseModal, cargarMesas],
  );

  const handleDelete = useCallback(
    (id: number, nombre: string) => {
      Alert.alert(
        'Eliminar mesa',
        `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              await deleteMesa(id);
              cargarMesas();
            },
          },
        ],
      );
    },
    [deleteMesa, cargarMesas],
  );

  // Render helpers
  const renderCard = useCallback(
    ({ item }: { item: Mesa }) => (
      <MesaCard mesa={item} onEdit={handleOpenEdit} onDelete={handleDelete} />
    ),
    [handleOpenEdit, handleDelete],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconBadge}>
          <POSIcon name="grid-outline" size={40} color={INK} />
        </View>
        <Text style={styles.emptyTitle}>
          {filtro !== null ? 'SIN MESAS EN ESTE ESTADO' : 'AÚN NO HAY MESAS'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {filtro !== null
            ? 'Prueba con otro filtro'
            : 'Toca "+" para agregar la primera'}
        </Text>
      </View>
    ),
    [filtro],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>MESAS</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {sucursalActual?.nombre ?? 'Sin sucursal seleccionada'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.refreshBtn, hardShadow(pressed)]}
          onPress={cargarMesas}
          disabled={loading}
          android_ripple={RIPPLE}
          accessibilityLabel="Recargar mesas"
        >
          <POSIcon name="refresh" size={20} color={INK} />
        </Pressable>
      </View>

      {/* ── Estadísticas ─────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: COLORS.success }]}>
          <Text style={styles.statNum}>{conteos.libre}</Text>
          <Text style={styles.statLabel}>LIBRES</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: COLORS.warning }]}>
          <Text style={styles.statNum}>{conteos.ocupada}</Text>
          <Text style={styles.statLabel}>OCUPADAS</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: COLORS.info }]}>
          <Text style={styles.statNum}>{conteos.reservada}</Text>
          <Text style={styles.statLabel}>RESERVADAS</Text>
        </View>
      </View>

      {/* ── Filtros ──────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <FilterChip
          label="Todas"
          count={mesasSeguras.length}
          active={filtro === null}
          onPress={() => setFiltro(null)}
        />
        <FilterChip
          label="Libres"
          count={conteos.libre}
          active={filtro === EstadoMesa.LIBRE}
          onPress={() => setFiltro(EstadoMesa.LIBRE)}
          color={COLORS.success}
        />
        <FilterChip
          label="Ocupadas"
          count={conteos.ocupada}
          active={filtro === EstadoMesa.OCUPADA}
          onPress={() => setFiltro(EstadoMesa.OCUPADA)}
          color={COLORS.warning}
        />
        <FilterChip
          label="Reservadas"
          count={conteos.reservada}
          active={filtro === EstadoMesa.RESERVADA}
          onPress={() => setFiltro(EstadoMesa.RESERVADA)}
          color={COLORS.info}
        />
      </ScrollView>

      {/* ── Grid / Loading ───────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando mesas…</Text>
        </View>
      ) : (
        <FlatList
          data={mesasFiltradas}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.gridContent,
            mesasFiltradas.length === 0 && styles.gridContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── FAB ──────────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [styles.fab, hardShadow(pressed)]}
        onPress={handleOpenCreate}
        android_ripple={RIPPLE}
        accessibilityLabel="Agregar mesa"
        accessibilityRole="button"
      >
        <POSIcon name="add" size={28} color={INK} />
      </Pressable>

      {/* ── Modal de formulario ───────────────────── */}
      <MesaFormModal
        visible={modalVisible}
        mesa={editingMesa}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={deleteMesa}
      />
    </SafeAreaView>
  );
}

// ─── StyleSheet ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F1EC',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: INK,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    color: INK,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginTop: 2,
  },

  // ── Filter bar ───────────────────────────────────────────────────────────
  filterBar: {
    marginBottom: 10,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
  chipBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
    backgroundColor: '#F1F1EC',
    borderWidth: 1.5,
    borderColor: INK,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridContentEmpty: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },

  // ── Mesa card ────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.55,
  },
  cardStatusBar: {
    height: 6,
    width: '100%',
  },
  cardBody: {
    padding: 12,
  },
  cardNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  cardCodigo: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: INK,
    marginTop: 8,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  ordenText: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
    marginTop: 6,
  },
  inactiveText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEditar: {
    backgroundColor: COLORS.info,
  },
  actionBtnDanger: {
    backgroundColor: '#FF9494',
  },

  // ── Loading ─────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Empty state ─────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIconBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.white,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 220,
  },

  // ── FAB ──────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal ────────────────────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 13, 13, 0.55)',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF1F1',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: -10,
    marginBottom: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#FF9494',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  btnSave: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
});
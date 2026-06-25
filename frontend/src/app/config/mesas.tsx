import { CrearMesaDTO, EstadoMesa, Mesa } from '@/features/mesas/mesas.types';
import { useMesa } from '@/features/mesas/useMesa';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PURPLE = '#6C63FF';

// ─── Estado config ─────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<
  EstadoMesa,
  { label: string; barColor: string; badgeBg: string; badgeText: string }
> = {
  [EstadoMesa.LIBRE]: {
    label: 'Libre',
    barColor: '#639922',
    badgeBg: '#EAF3DE',
    badgeText: '#3B6D11',
  },
  [EstadoMesa.OCUPADA]: {
    label: 'Ocupada',
    barColor: '#BA7517',
    badgeBg: '#FAEEDA',
    badgeText: '#854F0B',
  },
  [EstadoMesa.RESERVADA]: {
    label: 'Reservada',
    barColor: '#378ADD',
    badgeBg: '#E6F1FB',
    badgeText: '#185FA5',
  },
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
      <View style={[styles.cardStatusBar, { backgroundColor: cfg.barColor }]} />

      <View style={styles.cardBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>
          {mesa.nombre}
        </Text>
        <Text style={styles.cardCodigo}>{mesa.codigo}</Text>

        <View style={[styles.estadoBadge, { backgroundColor: cfg.badgeBg }]}>
          <View style={[styles.estadoDot, { backgroundColor: cfg.barColor }]} />
          <Text style={[styles.estadoText, { color: cfg.badgeText }]}>{cfg.label}</Text>
        </View>

        {mesa.estado === EstadoMesa.OCUPADA && mesa.ordenActual > 0 && (
          <Text style={styles.ordenText}>Orden #{mesa.ordenActual}</Text>
        )}

        {!mesa.activa && <Text style={styles.inactiveText}>Inactiva</Text>}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(mesa)}
            accessibilityLabel={`Editar ${mesa.nombre}`}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => onDelete(mesa.id, mesa.nombre)}
            accessibilityLabel={`Eliminar ${mesa.nombre}`}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
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
  dotColor?: string;
  badgeBg?: string;
  badgeText?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  onPress,
  dotColor,
  badgeBg = '#F1EFE8',
  badgeText = '#5F5E5A',
}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    {dotColor && <View style={[styles.chipDot, { backgroundColor: dotColor }]} />}
    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    <View style={[styles.chipBadge, { backgroundColor: badgeBg }]}>
      <Text style={[styles.chipBadgeText, { color: badgeText }]}>{count}</Text>
    </View>
  </TouchableOpacity>
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

  useEffect(() => {
    if (visible) {
      setNombre(mesa?.nombre ?? '');
      setCodigo(mesa?.codigo ?? '');
      setErrors({});
    }
  }, [visible, mesa]);

  const validate = (): boolean => {
    const e: { nombre?: string; codigo?: string } = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!codigo.trim()) e.codigo = 'El código es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ nombre: nombre.trim(), codigo: codigo.trim() });
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
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Cerrar formulario"
        >
          <View style={styles.modalBackdrop} />
        </TouchableOpacity>

        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <Text style={styles.modalTitle}>{mesa ? 'Editar mesa' : 'Nueva mesa'}</Text>

          {/* ── Nombre ── */}
          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            style={[styles.input, !!errors.nombre && styles.inputError]}
            placeholder="Mesa 01"
            placeholderTextColor="#B4B2A9"
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
          <Text style={styles.inputLabel}>Código</Text>
          <TextInput
            style={[styles.input, !!errors.codigo && styles.inputError]}
            placeholder="M01"
            placeholderTextColor="#B4B2A9"
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
            <>
              <View style={styles.formDivider} />
              <TouchableOpacity style={styles.deleteBtn} onPress={handleRequestDelete}>
                <Text style={styles.deleteBtnText}>Eliminar mesa</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Acciones ── */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>Guardar</Text>
            </TouchableOpacity>
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
        <Text style={styles.emptyIcon}>🪑</Text>
        <Text style={styles.emptyTitle}>Sin mesas</Text>
        <Text style={styles.emptySubtitle}>
          {filtro !== null
            ? 'No hay mesas con este estado'
            : 'Agrega la primera mesa con el botón +'}
        </Text>
      </View>
    ),
    [filtro],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ──────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mesas</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {sucursalActual?.nombre ?? 'Sin sucursal seleccionada'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, loading && styles.refreshBtnDisabled]}
          onPress={cargarMesas}
          disabled={loading}
          accessibilityLabel="Recargar mesas"
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* ── Estadísticas ─────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: '#639922' }]}>{conteos.libre}</Text>
          <Text style={styles.statLabel}>Libres</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: '#BA7517' }]}>{conteos.ocupada}</Text>
          <Text style={styles.statLabel}>Ocupadas</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: '#378ADD' }]}>{conteos.reservada}</Text>
          <Text style={styles.statLabel}>Reservadas</Text>
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
          dotColor="#639922"
          badgeBg="#EAF3DE"
          badgeText="#3B6D11"
        />
        <FilterChip
          label="Ocupadas"
          count={conteos.ocupada}
          active={filtro === EstadoMesa.OCUPADA}
          onPress={() => setFiltro(EstadoMesa.OCUPADA)}
          dotColor="#BA7517"
          badgeBg="#FAEEDA"
          badgeText="#854F0B"
        />
        <FilterChip
          label="Reservadas"
          count={conteos.reservada}
          active={filtro === EstadoMesa.RESERVADA}
          onPress={() => setFiltro(EstadoMesa.RESERVADA)}
          dotColor="#378ADD"
          badgeBg="#E6F1FB"
          badgeText="#185FA5"
        />
      </ScrollView>

      {/* ── Grid / Loading ───────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
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
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenCreate}
        accessibilityLabel="Agregar mesa"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888780',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    backgroundColor: '#F1EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnDisabled: {
    opacity: 0.5,
  },
  refreshIcon: {
    fontSize: 18,
    color: '#5F5E5A',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#F1EFE8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11,
    color: '#888780',
    marginTop: 2,
  },

  // Filter bar
  filterBar: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    backgroundColor: '#FFFFFF',
    gap: 5,
  },
  chipActive: {
    borderColor: '#2C2C2A',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipLabel: {
    fontSize: 13,
    color: '#888780',
  },
  chipLabelActive: {
    color: '#1C1C1E',
    fontWeight: '500',
  },
  chipBadge: {
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Grid
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridContentEmpty: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },

  // Mesa card
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.5,
  },
  cardStatusBar: {
    height: 5,
    width: '100%',
  },
  cardBody: {
    padding: 12,
  },
  cardNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  cardCodigo: {
    fontSize: 11,
    color: '#B4B2A9',
    marginTop: 1,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  estadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '500',
  },
  ordenText: {
    fontSize: 12,
    color: '#888780',
    marginTop: 5,
  },
  inactiveText: {
    fontSize: 11,
    color: '#B4B2A9',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    backgroundColor: '#F1EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDanger: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  actionIcon: {
    fontSize: 13,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#888780',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#B4B2A9',
    textAlign: 'center',
    maxWidth: 220,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    marginTop: -2,
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 0.5,
    borderColor: '#D3D1C7',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3D1C7',
    alignSelf: 'center',
    marginVertical: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888780',
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  inputError: {
    borderColor: '#E24B4A',
    backgroundColor: '#FCEBEB',
  },
  errorText: {
    fontSize: 12,
    color: '#E24B4A',
    marginTop: -10,
    marginBottom: 10,
  },
  formDivider: {
    height: 0.5,
    backgroundColor: '#D3D1C7',
    marginVertical: 14,
  },
  deleteBtn: {
    height: 42,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    backgroundColor: '#F1EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    color: '#5F5E5A',
    fontWeight: '500',
  },
  btnSave: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
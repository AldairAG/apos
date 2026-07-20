import { COLORS, POSBadge, POSIcon } from '@/components/pos';
import { Material } from '@/features/inventario/materiales/materiales.types';
import { useMateriales } from '@/features/inventario/materiales/useMateriales';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { Unidad } from '@/types/globalTypes';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ── Design tokens: MD3 + Neo-Brutalismo Funcional (mismos que Dashboard) ──
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

export default function MaterialesScreen() {
  const { sucursalActual } = useSucursal();
  const {
    materiales,
    loading,
    error,
    cargarMateriales,
    crearMaterial,
    actualizarMaterial,
    eliminarMaterial,
    limpiarError,
  } = useMateriales();

  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [modalUnidadesVisible, setModalUnidadesVisible] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    proveedor: '',
    categoriaInventario: '',
    unidadMedida: Unidad.KG,
    costoUnitario: '',
    perecedero: false,
    diasVencimiento: '',
  });

  useEffect(() => {
    cargarMateriales();
  }, [sucursalActual]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: limpiarError }]);
    }
  }, [error]);

  const materialesFiltrados = materiales.filter((material) =>
    material.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEditar = (material: Material) => {
    setMaterialSeleccionado(material);
    setFormData({
      nombre: material.nombre,
      descripcion: material.descripcion || '',
      proveedor: material.proveedor || '',
      categoriaInventario: material.categoriaInventario || '',
      unidadMedida: material.unidadMedida,
      costoUnitario: material.costoUnitario.toString(),
      perecedero: material.perecedero,
      diasVencimiento: material.diasVencimiento?.toString() || '',
    });
    setModalVisible(true);
  };

  const handleNuevo = () => {
    setMaterialSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: '',
      proveedor: '',
      categoriaInventario: '',
      unidadMedida: Unidad.KG,
      costoUnitario: '',
      perecedero: false,
      diasVencimiento: '',
    });
    setModalVisible(true);
  };

  const handleEliminar = (material: Material) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar el material "${material.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await eliminarMaterial(material.id);
            if (result.success) {
              Alert.alert('Éxito', 'Material eliminado correctamente');
            }
          },
        },
      ]
    );
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!formData.costoUnitario || parseFloat(formData.costoUnitario) <= 0) {
      Alert.alert('Error', 'El costo unitario debe ser mayor a 0');
      return;
    }

    const data = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      proveedor: formData.proveedor.trim(),
      categoriaInventario: formData.categoriaInventario.trim(),
      unidadMedida: formData.unidadMedida,
      costoUnitario: parseFloat(formData.costoUnitario),
      perecedero: formData.perecedero,
      diasVencimiento: formData.diasVencimiento ? parseInt(formData.diasVencimiento) : undefined,
      activo: true,
    };

    let result;
    if (materialSeleccionado) {
      result = await actualizarMaterial(materialSeleccionado.id, data);
    } else {
      result = await crearMaterial(data);
    }

    if (result.success) {
      Alert.alert(
        'Éxito',
        materialSeleccionado
          ? 'Material actualizado correctamente'
          : 'Material creado correctamente'
      );
      handleCerrarModal();
    }
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setMaterialSeleccionado(null);
    setModalUnidadesVisible(false);
    setFormData({
      nombre: '',
      descripcion: '',
      proveedor: '',
      categoriaInventario: '',
      unidadMedida: Unidad.KG,
      costoUnitario: '',
      perecedero: false,
      diasVencimiento: '',
    });
  };

  const renderMaterialItem = ({ item }: { item: Material }) => {
    return (
      <View style={styles.materialCard}>
        <View style={styles.materialInfo}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialNombre} numberOfLines={1}>{item.nombre}</Text>
            {item.perecedero && (
              <POSBadge label="PERECEDERO" variant="warning" size="small" />
            )}
          </View>
          <Text style={styles.materialDescripcion} numberOfLines={2}>
            {item.descripcion || 'Sin descripción'}
          </Text>

          <View style={styles.materialDetalles}>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>UNIDAD</Text>
              <Text style={styles.detalleValor}>{item.unidadMedida}</Text>
            </View>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>COSTO</Text>
              <Text style={styles.detalleValor}>${item.costoUnitario.toFixed(2)}</Text>
            </View>
            {item.proveedor && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>PROVEEDOR</Text>
                <Text style={styles.detalleValor} numberOfLines={1}>
                  {item.proveedor}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.materialAcciones}>
          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEditar, hardShadow(pressed)]}
            onPress={() => handleEditar(item)}
            android_ripple={RIPPLE}
            hitSlop={4}
          >
            <POSIcon name="create" size={20} color={INK} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEliminar, hardShadow(pressed)]}
            onPress={() => handleEliminar(item)}
            android_ripple={RIPPLE}
            hitSlop={4}
          >
            <POSIcon name="trash" size={20} color={INK} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>MATERIALES</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{materialesFiltrados.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {materialesFiltrados.length === 1
            ? '1 material encontrado'
            : `${materialesFiltrados.length} materiales encontrados`}
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={INK} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar material..."
          placeholderTextColor={COLORS.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda('')} hitSlop={8}>
            <POSIcon name="close-circle" size={20} color={INK} />
          </Pressable>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando materiales...</Text>
        </View>
      )}

      {/* Lista de Materiales */}
      {!loading && (
        <FlatList
          data={materialesFiltrados}
          renderItem={renderMaterialItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <POSIcon name="cube-outline" size={48} color={INK} />
              </View>
              <Text style={styles.emptyTexto}>
                {busqueda ? 'SIN RESULTADOS' : 'AÚN NO HAY MATERIALES'}
              </Text>
              <Text style={styles.emptySubtexto}>
                {busqueda ? 'Intenta con otra búsqueda' : 'Toca "+ Nuevo material" para comenzar'}
              </Text>
            </View>
          }
        />
      )}

      {/* Botón Flotante Agregar — un solo tap, siempre accesible */}
      <Pressable
        style={({ pressed }) => [styles.botonFlotante, hardShadow(pressed)]}
        onPress={handleNuevo}
        android_ripple={RIPPLE}
      >
        <POSIcon name="add" size={30} color={INK} />
        <Text style={styles.botonFlotanteTexto}>NUEVO</Text>
      </Pressable>

      {/* Modal Crear/Editar Material */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {materialSeleccionado ? 'EDITAR MATERIAL' : 'NUEVO MATERIAL'}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                hitSlop={6}
              >
                <POSIcon name="close" size={22} color={INK} />
              </Pressable>
            </View>

            {/* Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>NOMBRE DEL MATERIAL *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Harina de trigo"
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="Descripción del material"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PROVEEDOR</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nombre del proveedor"
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.proveedor}
                  onChangeText={(text) => setFormData({ ...formData, proveedor: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CATEGORÍA</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Granos, Lácteos, etc."
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.categoriaInventario}
                  onChangeText={(text) =>
                    setFormData({ ...formData, categoriaInventario: text })
                  }
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>UNIDAD DE MEDIDA *</Text>
                  <Pressable
                    style={[styles.formInput, styles.dropdownTrigger]}
                    onPress={() => setModalUnidadesVisible(true)}
                  >
                    <Text style={styles.dropdownTriggerText}>{formData.unidadMedida}</Text>
                    <POSIcon name="chevron-down" size={18} color={INK} />
                  </Pressable>
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>COSTO UNITARIO *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="decimal-pad"
                    value={formData.costoUnitario}
                    onChangeText={(text) =>
                      setFormData({ ...formData, costoUnitario: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>¿ES PERECEDERO?</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.checkboxContainer,
                      formData.perecedero && styles.checkboxContainerActive,
                      hardShadow(pressed),
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, perecedero: !formData.perecedero })
                    }
                  >
                    {formData.perecedero && (
                      <POSIcon name="checkmark" size={18} color={INK} />
                    )}
                    <Text style={styles.checkboxText}>
                      {formData.perecedero ? 'SÍ' : 'NO'}
                    </Text>
                  </Pressable>
                </View>

                {formData.perecedero && (
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>DÍAS DE VENCIMIENTO</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="numeric"
                      value={formData.diasVencimiento}
                      onChangeText={(text) =>
                        setFormData({ ...formData, diasVencimiento: text })
                      }
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonCancelar, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                disabled={loading}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonGuardar, hardShadow(pressed)]}
                onPress={handleGuardar}
                disabled={loading}
                android_ripple={RIPPLE}
              >
                {loading ? (
                  <ActivityIndicator color={INK} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>
                    {materialSeleccionado ? 'ACTUALIZAR' : 'CREAR'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalUnidadesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalUnidadesVisible(false)}
      >
        <View style={styles.unidadModalOverlay}>
          <Pressable
            style={styles.unidadModalBackdrop}
            onPress={() => setModalUnidadesVisible(false)}
          />
          <View style={styles.unidadModalContainer}>
            <View style={styles.unidadModalHeader}>
              <Text style={styles.unidadModalTitle}>SELECCIONA UNA UNIDAD</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalUnidadesVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={22} color={INK} />
              </Pressable>
            </View>

            <FlatList
              data={Object.values(Unidad)}
              keyExtractor={(unidad) => unidad}
              style={styles.unidadList}
              contentContainerStyle={styles.unidadListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const seleccionada = item === formData.unidadMedida;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.unidadOption,
                      seleccionada && styles.unidadOptionActive,
                      pressed && styles.unidadOptionPressed,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, unidadMedida: item });
                      setModalUnidadesVisible(false);
                    }}
                  >
                    <Text style={styles.unidadOptionText}>{item}</Text>
                    {seleccionada && <POSIcon name="checkmark" size={18} color={INK} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1EC',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.info,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Buscador ─────────────────────────────────────────────────────────────
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 14,
    paddingHorizontal: 14,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
    height: 52,
    gap: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
  },

  // ── Lista ────────────────────────────────────────────────────────────────
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  materialCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 14,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  materialInfo: {
    flex: 1,
    marginRight: 10,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  materialNombre: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    flexShrink: 1,
  },
  materialDescripcion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  materialDetalles: {
    flexDirection: 'row',
    gap: 15,
  },
  detalleItem: {
    flex: 1,
  },
  detalleLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
    letterSpacing: 0.4,
    fontWeight: '800',
  },
  detalleValor: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },

  // ── Acciones — objetivos táctiles grandes con borde propio ─────────────────
  materialAcciones: {
    justifyContent: 'center',
    gap: 10,
  },
  botonAccion: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: COLORS.info,
  },
  botonEliminar: {
    backgroundColor: '#FF9494',
  },

  // ── Botón Flotante ──────────────────────────────────────────────────────
  botonFlotante: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    height: 60,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonFlotanteTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },

  // ── Loading ─────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Empty State — invitación clara a actuar ────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTexto: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  emptySubtexto: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // ── Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    padding: 20,
    maxHeight: 500,
    overflow: 'visible',
  },

  // ── Formulario — inputs con borde marcado, alto contraste ──────────────
  formGroup: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    borderWidth: 2,
    borderColor: INK,
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },

  // ── Checkbox / Toggle grande ─────────────────────────────────────────────
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: INK,
  },
  checkboxContainerActive: {
    backgroundColor: COLORS.success,
  },
  checkboxText: {
    fontSize: 15,
    color: INK,
    fontWeight: '800',
  },

  // ── Modal de unidades ──────────────────────────────────────────────────
  unidadModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
  },
  unidadModalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  unidadModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: BORDER_W,
    borderColor: INK,
    overflow: 'hidden',
    maxHeight: '80%',
    zIndex: 1,
  },
  unidadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
    backgroundColor: COLORS.white,
  },
  unidadModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  unidadList: {
    maxHeight: 360,
  },
  unidadListContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unidadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  unidadOptionActive: {
    backgroundColor: COLORS.info,
  },
  unidadOptionPressed: {
    backgroundColor: '#F1F1EC',
  },
  unidadOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },

  // ── Botones Modal ────────────────────────────────────────────────────────
  modalAcciones: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#F1F1EC',
  },
  botonCancelarTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
  },
  botonGuardarTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
});
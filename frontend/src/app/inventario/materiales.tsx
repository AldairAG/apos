import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [mostrarUnidades, setMostrarUnidades] = useState(false);

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
      <POSCard style={styles.materialCard} variant="elevated">
        <View style={styles.materialInfo}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialNombre}>{item.nombre}</Text>
            {item.perecedero && (
              <POSBadge label="Perecedero" variant="warning" size="small" />
            )}
          </View>
          <Text style={styles.materialDescripcion}>
            {item.descripcion || 'Sin descripción'}
          </Text>

          <View style={styles.materialDetalles}>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Unidad</Text>
              <Text style={styles.detalleValor}>{item.unidadMedida}</Text>
            </View>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Costo</Text>
              <Text style={styles.detalleValor}>${item.costoUnitario.toFixed(2)}</Text>
            </View>
            {item.proveedor && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Proveedor</Text>
                <Text style={styles.detalleValor} numberOfLines={1}>
                  {item.proveedor}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.materialAcciones}>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEditar]}
            onPress={() => handleEditar(item)}
            activeOpacity={0.8}
          >
            <POSIcon name="create" size={20} color={COLORS.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => handleEliminar(item)}
            activeOpacity={0.8}
          >
            <POSIcon name="trash" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </POSCard>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Materiales</Text>
          <POSBadge label={`${materialesFiltrados.length}`} variant="info" />
        </View>
        <Text style={styles.subtitle}>
          {materialesFiltrados.length === 1
            ? '1 material encontrado'
            : `${materialesFiltrados.length} materiales encontrados`}
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar material..."
          placeholderTextColor={COLORS.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <POSIcon name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
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
              <POSIcon name="cube-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTexto}>No se encontraron materiales</Text>
              <Text style={styles.emptySubtexto}>
                {busqueda ? 'Intenta con otra búsqueda' : 'Comienza agregando un material'}
              </Text>
            </View>
          }
        />
      )}

      {/* Botón Flotante Agregar */}
      <TouchableOpacity style={styles.botonFlotante} onPress={handleNuevo} activeOpacity={0.9}>
        <POSIcon name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

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
                {materialSeleccionado ? 'Editar Material' : 'Nuevo Material'}
              </Text>
              <TouchableOpacity onPress={handleCerrarModal}>
                <POSIcon name="close" size={26} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del Material *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Harina de trigo"
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
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
                <Text style={styles.formLabel}>Proveedor</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nombre del proveedor"
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.proveedor}
                  onChangeText={(text) => setFormData({ ...formData, proveedor: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoría</Text>
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

              <View style={[styles.formRow, { zIndex: mostrarUnidades ? 1000 : 1 }]}>
                <View
                  style={[
                    styles.formGroup,
                    styles.formGroupHalf,
                    { zIndex: mostrarUnidades ? 1001 : 1, elevation: mostrarUnidades ? 1001 : 1 },
                  ]}
                >
                  <Text style={styles.formLabel}>Unidad de Medida *</Text>
                  <TouchableOpacity
                    style={[styles.formInput, styles.dropdownTrigger]}
                    onPress={() => setMostrarUnidades(!mostrarUnidades)}
                  >
                    <Text style={styles.dropdownTriggerText}>{formData.unidadMedida}</Text>
                    <POSIcon
                      name={mostrarUnidades ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                  {mostrarUnidades && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={styles.dropdownList}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={true}
                      >
                        {Object.values(Unidad).map((unidad) => (
                          <TouchableOpacity
                            key={unidad}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFormData({ ...formData, unidadMedida: unidad });
                              setMostrarUnidades(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{unidad}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>Costo Unitario *</Text>
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
                  <Text style={styles.formLabel}>¿Es Perecedero?</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      formData.perecedero && styles.checkboxContainerActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, perecedero: !formData.perecedero })
                    }
                  >
                    {formData.perecedero && (
                      <POSIcon name="checkmark" size={16} color={COLORS.primary} />
                    )}
                    <Text
                      style={[
                        styles.checkboxText,
                        formData.perecedero && { color: COLORS.primary },
                      ]}
                    >
                      {formData.perecedero ? 'Sí' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {formData.perecedero && (
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>Días de Vencimiento</Text>
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
              <TouchableOpacity
                style={[styles.botonModal, styles.botonCancelar]}
                onPress={handleCerrarModal}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar]}
                onPress={handleGuardar}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>
                    {materialSeleccionado ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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

  // ── Header (igual que HomeScreen) ─────────────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Buscador ───────────────────────────────────────────────────────────────
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    gap: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },

  // ── Lista ──────────────────────────────────────────────────────────────────
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  materialCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
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
    fontWeight: '700',
    color: COLORS.text,
  },
  materialDescripcion: {
    fontSize: 14,
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
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detalleValor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  // ── Acciones ───────────────────────────────────────────────────────────────
  materialAcciones: {
    justifyContent: 'center',
    gap: 8,
  },
  botonAccion: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: '#E3F2FD',
  },
  botonEliminar: {
    backgroundColor: '#FFEBEE',
  },

  // ── Botón Flotante ────────────────────────────────────────────────────────
  botonFlotante: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 6,
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContenido: {
    padding: 20,
    maxHeight: 500,
    overflow: 'visible',
  },

  // ── Formulario ────────────────────────────────────────────────────────────
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },

  // ── Checkbox ──────────────────────────────────────────────────────────────
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxContainerActive: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },

  // ── Dropdown ──────────────────────────────────────────────────────────────
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1002,
    zIndex: 1002,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    elevation: 1000,
    zIndex: 2000,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
  },

  // ── Botones Modal ─────────────────────────────────────────────────────────
  modalAcciones: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#F5F5F5',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
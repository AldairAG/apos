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

  // Estado del formulario
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

  // Cargar materiales al montar el componente
  useEffect(() => {
    cargarMateriales();
  }, [sucursalActual]);

  // Mostrar errores
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
    // Validaciones
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
      // Actualizar
      result = await actualizarMaterial(materialSeleccionado.id, data);
    } else {
      // Crear
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
      <View style={styles.materialCard}>
        <View style={styles.materialInfo}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialNombre}>{item.nombre}</Text>
            {item.perecedero && (
              <View style={styles.alertaBadge}>
                <Text style={styles.alertaTexto}>⏰ Perecedero</Text>
              </View>
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
          >
            <Text style={styles.iconoAccion}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => handleEliminar(item)}
          >
            <Text style={styles.iconoAccion}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Materiales</Text>
        <Text style={styles.headerSubtitulo}>
          {materialesFiltrados.length} materiales encontrados
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <Text style={styles.busquedaIcono}>🔍</Text>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar material..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Text style={styles.busquedaLimpiar}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
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
              <Text style={styles.emptyIcono}>📦</Text>
              <Text style={styles.emptyTexto}>No se encontraron materiales</Text>
              <Text style={styles.emptySubtexto}>
                {busqueda ? 'Intenta con otra búsqueda' : 'Comienza agregando un material'}
              </Text>
            </View>
          }
        />
      )}

      {/* Botón Flotante Agregar */}
      <TouchableOpacity style={styles.botonFlotante} onPress={handleNuevo}>
        <Text style={styles.botonFlotanteIcono}>+</Text>
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
                <Text style={styles.modalCerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del Material *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Harina de trigo"
                  placeholderTextColor="#999"
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="Descripción del material"
                  placeholderTextColor="#999"
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
                  placeholderTextColor="#999"
                  value={formData.proveedor}
                  onChangeText={(text) => setFormData({ ...formData, proveedor: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoría</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Granos, Lácteos, etc."
                  placeholderTextColor="#999"
                  value={formData.categoriaInventario}
                  onChangeText={(text) =>
                    setFormData({ ...formData, categoriaInventario: text })
                  }
                />
              </View>

              <View style={[styles.formRow, { zIndex: mostrarUnidades ? 1000 : 1 }]}>
                <View style={[styles.formGroup, styles.formGroupHalf,
                { zIndex: mostrarUnidades ? 1001 : 1, elevation: mostrarUnidades ? 1001 : 1, }]}
                >
                  <Text style={styles.formLabel}>Unidad de Medida *</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => setMostrarUnidades(!mostrarUnidades)}
                  >
                    <Text style={{ fontSize: 16, color: '#212121' }}>
                      {formData.unidadMedida}
                    </Text>
                  </TouchableOpacity>
                  {mostrarUnidades && (
                    <View style={styles.dropdownContainer}>
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
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>Costo Unitario *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    placeholderTextColor="#999"
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
                    <Text style={styles.checkboxText}>
                      {formData.perecedero ? '✓ Sí' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {formData.perecedero && (
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>Días de Vencimiento</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      placeholderTextColor="#999"
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
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar]}
                onPress={handleGuardar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
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
    backgroundColor: '#FAFAFA',
  },
  // Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  headerSubtitulo: {
    fontSize: 14,
    color: '#757575',
  },
  // Buscador
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
  },
  busquedaIcono: {
    fontSize: 20,
    marginRight: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  busquedaLimpiar: {
    fontSize: 20,
    color: '#757575',
    padding: 5,
  },
  // Lista
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  },
  materialNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginRight: 8,
  },
  alertaBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertaTexto: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
  },
  materialDescripcion: {
    fontSize: 14,
    color: '#757575',
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
    color: '#9E9E9E',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detalleValor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  detalleValorBajo: {
    color: '#F44336',
  },
  // Acciones
  materialAcciones: {
    justifyContent: 'center',
    gap: 8,
  },
  botonAccion: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: '#E3F2FD',
  },
  botonEliminar: {
    backgroundColor: '#FFEBEE',
  },
  iconoAccion: {
    fontSize: 20,
  },
  // Botón Flotante
  botonFlotante: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  botonFlotanteIcono: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcono: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtexto: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#E0E0E0',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  modalCerrar: {
    fontSize: 28,
    color: '#757575',
    fontWeight: '300',
  },
  modalContenido: {
    padding: 20,
    maxHeight: 500,
  },
  // Formulario
  formGroup: {
    marginBottom: 20,
    position: 'relative',
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
    color: '#212121',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Checkbox
  checkboxContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
  },
  checkboxContainerActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  checkboxText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
  // Dropdown
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1002,
    zIndex: 1002,
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
    color: '#212121',
  },
  // Botones Modal
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
    color: '#757575',
  },
  botonGuardar: {
    backgroundColor: '#2196F3',
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

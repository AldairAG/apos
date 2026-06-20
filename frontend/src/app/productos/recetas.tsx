import { Material, useMateriales } from '@/features/inventario/materiales';
import { DetalleReceta, Receta } from '@/features/producto/receta/receta.types';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { Unidad } from '@/types/globalTypes';
import { use, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecetasScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [materialesReceta, setMaterialesReceta] = useState<DetalleReceta[]>([]);
  const [mostrarUnidades, setMostrarUnidades] = useState(false);

  const { cargarRecetas, seleccionarReceta, crearReceta, limpiarRecetas, limpiarError, loading, recetas } = useRecetas();
  const { materiales } = useMateriales();

  useEffect(() => {
    cargarRecetas();
  }, [cargarRecetas]);

  const recetasFiltradas = recetas.filter((receta) =>
    receta.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearReceta = () => {
    const nuevaReceta: Receta = {
      id: 0,
      nombre: recetaSeleccionada?.nombre || '',
      codigo: `REC-${Date.now()}`,
      descripcion: recetaSeleccionada?.descripcion || '',
      instrucciones: recetaSeleccionada?.instrucciones || '',
      imagen: '',
      rendimiento: recetaSeleccionada?.rendimiento || 0,
      unidadRendimiento: recetaSeleccionada?.unidadRendimiento || Unidad.PZ,
      costoTotal: recetaSeleccionada?.costoTotal || 0,
      tiempoPreparacion: recetaSeleccionada?.tiempoPreparacion || 0,
      activa: true,
      fechaCreacion: new Date(),
      createdBy: 1,
      updatedBy: 1,
      detalles: materialesReceta,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    crearReceta(nuevaReceta);
    //setModalVisible(false);
    //setMaterialesReceta([]);
  }

  const handleEditar = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setMaterialesReceta(receta.detalles);
    setModalVisible(true);
  };

  const handleNuevo = () => {
    setRecetaSeleccionada(null);
    setMaterialesReceta([]);
    setModalVisible(true);
  };

  const handleEliminar = (receta: Receta) => {
    console.log('Eliminar:', receta.nombre);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setRecetaSeleccionada(null);
    setMaterialesReceta([]);
  };

  const handleAgregarMaterial = (material: Material) => {
    const nuevoMaterial: DetalleReceta = {
      id: material.id,
      cantidad: 0,
      unidadMedida: material.unidadMedida,
      merma: 0,
      material: null,
    };
    setMaterialesReceta([...materialesReceta, nuevoMaterial]);
    setModalMaterialVisible(false);
  };

  const handleEliminarMaterial = (index: number) => {
    const nuevosM = materialesReceta.filter((_, i) => i !== index);
    setMaterialesReceta(nuevosM);
  };

  const renderRecetaItem = ({ item }: { item: Receta }) => {
    return (
      <View style={styles.recetaCard}>
        <View style={styles.recetaInfo}>
          <View style={styles.recetaHeader}>
            <Text style={styles.recetaNombre}>{item.nombre}</Text>
            <View style={styles.rendimientoBadge}>
              <Text style={styles.rendimientoTexto}>
                ↻ {item.rendimiento} {item.unidadRendimiento}
              </Text>
            </View>
          </View>
          <Text style={styles.recetaDescripcion}>{item.descripcion}</Text>

          <View style={styles.materialesPreview}>
            <Text style={styles.materialesPreviewTitulo}>
              📋 Materiales ({item.detalles.length})
            </Text>
            <View style={styles.materialesPreviewLista}>
              {item.detalles.slice(0, 3).map((mat, idx) => (
                <Text key={idx} style={styles.materialPreviewItem}>
                  • {mat?.material?.nombre}
                </Text>
              ))}
              {item.detalles.length > 3 && (
                <Text style={styles.materialPreviewMas}>
                  +{item.detalles.length - 3} más...
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.recetaAcciones}>
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

  const renderMaterialRecetaItem = (material: DetalleReceta, index: number) => {
    return (
      <View key={index} style={styles.materialRecetaItem}>
        <View style={styles.materialRecetaInfo}>
          <Text style={styles.materialRecetaNombre}>{material?.material?.nombre}</Text>
          <View style={styles.materialRecetaCantidadContainer}>
            <TextInput
              style={styles.materialRecetaCantidadInput}
              placeholder="0"
              keyboardType="decimal-pad"
              defaultValue={material.cantidad.toString()}
            />
            <Text style={styles.materialRecetaUnidad}>{material.unidadMedida}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.botonEliminarMaterial}
          onPress={() => handleEliminarMaterial(index)}
        >
          <Text style={styles.iconoEliminarMaterial}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Recetas</Text>
        <Text style={styles.headerSubtitulo}>
          {recetasFiltradas.length} recetas encontradas
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <Text style={styles.busquedaIcono}>🔍</Text>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar receta..."
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

      {/* Lista de Recetas */}
      <FlatList
        data={recetasFiltradas}
        renderItem={renderRecetaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcono}>📝</Text>
            <Text style={styles.emptyTexto}>No se encontraron recetas</Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Comienza agregando una receta'}
            </Text>
          </View>
        }
      />

      {/* Botón Flotante Agregar */}
      <TouchableOpacity style={styles.botonFlotante} onPress={handleNuevo}>
        <Text style={styles.botonFlotanteIcono}>+</Text>
      </TouchableOpacity>

      {/* Modal Crear/Editar Receta */}
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
                {recetaSeleccionada ? 'Editar Receta' : 'Nueva Receta'}
              </Text>
              <TouchableOpacity onPress={handleCerrarModal}>
                <Text style={styles.modalCerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre de la Receta *</Text>
                <TextInput
                  onChangeText={(text) => setRecetaSeleccionada(prev => prev ? { ...prev, nombre: text } : null)}
                  style={styles.formInput}
                  placeholder="Ej: Pan francés"
                  placeholderTextColor="#999"
                  defaultValue={recetaSeleccionada?.nombre}
                  value={recetaSeleccionada?.nombre}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  onChangeText={(text) => setRecetaSeleccionada(prev => prev ? { ...prev, descripcion: text } : null)}
                  placeholder="Descripción de la receta"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  defaultValue={recetaSeleccionada?.descripcion}
                  value={recetaSeleccionada?.descripcion}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.formLabel}>Rendimiento *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    onChangeText={(text) => setRecetaSeleccionada(prev => prev ? { ...prev, rendimiento: Number(text) } : null)}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    defaultValue={recetaSeleccionada?.rendimiento.toString()}
                    value={recetaSeleccionada?.rendimiento.toString()}
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
                        {recetaSeleccionada?.unidadRendimiento || Unidad.PZ}
                      </Text>
                    </TouchableOpacity>
                    {mostrarUnidades && (
                      <View style={styles.dropdownContainer}>
                        {Object.values(Unidad).map((unidad) => (
                          <TouchableOpacity
                            key={unidad}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setRecetaSeleccionada(prev => prev ? { ...prev, unidadRendimiento: unidad, } : null);
                              setMostrarUnidades(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{unidad}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Sección de Materiales */}
                <View style={styles.materialesSeccion}>
                  <View style={styles.materialesSeccionHeader}>
                    <Text style={styles.materialesSeccionTitulo}>
                      📦 Materiales ({materialesReceta.length})
                    </Text>
                    <TouchableOpacity
                      style={styles.botonAgregarMaterial}
                      onPress={() => setModalMaterialVisible(true)}
                    >
                      <Text style={styles.botonAgregarMaterialTexto}>+ Agregar</Text>
                    </TouchableOpacity>
                  </View>

                  {materialesReceta.length === 0 ? (
                    <View style={styles.materialesVacio}>
                      <Text style={styles.materialesVacioTexto}>
                        No hay materiales agregados
                      </Text>
                      <Text style={styles.materialesVacioSubtexto}>
                        Toca "Agregar" para añadir materiales
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.materialesLista}>
                      {materialesReceta.map((material, index) =>
                        renderMaterialRecetaItem(material, index)
                      )}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonCancelar]}
                onPress={handleCerrarModal}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar]}
                onPress={handleCrearReceta}
              >
                <Text style={styles.botonGuardarTexto}>
                  {recetaSeleccionada ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Seleccionar Material */}
      <Modal
        visible={modalMaterialVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalMaterialVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalMaterialContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Seleccionar Material</Text>
              <TouchableOpacity onPress={() => setModalMaterialVisible(false)}>
                <Text style={styles.modalCerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.materialesDisponiblesLista}>
              {materiales.map((material) => {
                const yaAgregado = materialesReceta.some(
                  (m) => m.id === material.id
                );
                return (
                  <TouchableOpacity
                    key={material.id}
                    style={[
                      styles.materialDisponibleItem,
                      yaAgregado && styles.materialDisponibleItemDeshabilitado,
                    ]}
                    onPress={() => handleAgregarMaterial(material)}
                    disabled={yaAgregado}
                  >
                    <View>
                      <Text
                        style={[
                          styles.materialDisponibleNombre,
                          yaAgregado && styles.materialDisponibleNombreDeshabilitado,
                        ]}
                      >
                        {material.nombre}
                      </Text>
                      <Text style={styles.materialDisponibleUnidad}>
                        Unidad: {material.unidadMedida}
                      </Text>
                    </View>
                    {yaAgregado && <Text style={styles.yaAgregadoTexto}>✓ Agregado</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  recetaCard: {
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
  recetaInfo: {
    flex: 1,
    marginRight: 10,
  },
  recetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  recetaNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginRight: 8,
    flex: 1,
  },
  rendimientoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rendimientoTexto: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  recetaDescripcion: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  materialesPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
  },
  materialesPreviewTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  materialesPreviewLista: {
    gap: 2,
  },
  materialPreviewItem: {
    fontSize: 12,
    color: '#616161',
  },
  materialPreviewMas: {
    fontSize: 11,
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Acciones
  recetaAcciones: {
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
    backgroundColor: '#FF9800',
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
  // Modal Principal
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
  // Sección de Materiales
  materialesSeccion: {
    marginBottom: 20,
  },
  materialesSeccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  materialesSeccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  botonAgregarMaterial: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonAgregarMaterialTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  materialesVacio: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  materialesVacioTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  materialesVacioSubtexto: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  materialesLista: {
    gap: 10,
  },
  materialRecetaItem: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  materialRecetaInfo: {
    flex: 1,
  },
  materialRecetaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  materialRecetaCantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  materialRecetaCantidadInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  materialRecetaUnidad: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  botonEliminarMaterial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconoEliminarMaterial: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  // Modal Materiales Disponibles
  modalMaterialContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  materialesDisponiblesLista: {
    padding: 20,
  },
  materialDisponibleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  materialDisponibleItemDeshabilitado: {
    backgroundColor: '#EEEEEE',
    opacity: 0.6,
  },
  materialDisponibleNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  materialDisponibleNombreDeshabilitado: {
    color: '#9E9E9E',
  },
  materialDisponibleUnidad: {
    fontSize: 12,
    color: '#757575',
  },
  yaAgregadoTexto: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
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
    backgroundColor: '#FF9800',
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
});

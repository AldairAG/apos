import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useMateriales } from '@/features/inventario/materiales';
import { Material } from '@/features/inventario/materiales/materiales.types';
import { CrearRecetaDTO, DetalleReceta, Receta } from '@/features/producto/receta/receta.types';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { Unidad } from '@/types/globalTypes';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RecetasScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [materialesReceta, setMaterialesReceta] = useState<DetalleReceta[]>([]);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    rendimiento: 1,
    unidadRendimiento: Unidad.PZ,
    tiempoPreparacion: 0,
    instrucciones: '',
  });

  const { cargarRecetas, seleccionarReceta, crearReceta, limpiarRecetas, loading, recetas, recetaSeleccionada } = useRecetas();
  const { materiales, cargarMateriales } = useMateriales();

  useEffect(() => {
    cargarRecetas();
    cargarMateriales();
  }, []);

  // Cargar datos al editar
  useEffect(() => {
    if (recetaSeleccionada) {
      setFormData({
        nombre: recetaSeleccionada.nombre,
        codigo: recetaSeleccionada.codigo,
        descripcion: recetaSeleccionada.descripcion,
        rendimiento: recetaSeleccionada.rendimiento,
        unidadRendimiento: recetaSeleccionada.unidadRendimiento as Unidad,
        tiempoPreparacion: recetaSeleccionada.tiempoPreparacion,
        instrucciones: recetaSeleccionada.instrucciones,
      });
      setMaterialesReceta(recetaSeleccionada.detalles);
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        rendimiento: 1,
        unidadRendimiento: Unidad.PZ,
        tiempoPreparacion: 0,
        instrucciones: '',
      });
      setMaterialesReceta([]);
    }
  }, [recetaSeleccionada]);

  // Calcular costos en tiempo real
  const costos = useMemo(() => {
    const detallesConCosto = materialesReceta.map((detalle) => {
      const costoUnitario = detalle.material?.costoUnitario || 0;
      const subtotal = detalle.cantidad * costoUnitario;
      return { ...detalle, costoUnitario, subtotal };
    });

    const costoTotal = detallesConCosto.reduce((sum, item) => sum + item.subtotal, 0);
    const costoPorUnidad = formData.rendimiento > 0 ? costoTotal / formData.rendimiento : 0;

    return { detallesConCosto, costoTotal, costoPorUnidad };
  }, [materialesReceta, formData.rendimiento]);

  const recetasFiltradas = recetas.filter((receta) =>
    receta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    receta.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearReceta = () => {
    if (!formData.nombre || !formData.codigo) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    const nuevaReceta: CrearRecetaDTO = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      instrucciones: formData.instrucciones,
      rendimiento: formData.rendimiento,
      unidadRendimiento: formData.unidadRendimiento,
      costoTotal: costos.costoTotal,
      tiempoPreparacion: formData.tiempoPreparacion,
      activa: true,
      detalles: materialesReceta,
    };
    crearReceta(nuevaReceta);
    handleCerrarModal();
  };

  const handleEditar = (receta: Receta) => {
    seleccionarReceta(receta);
    setModalVisible(true);
  };

  const handleNuevo = () => {
    seleccionarReceta(null);
    setModalVisible(true);
  };

  const handleEliminar = (receta: Receta) => {
    Alert.alert(
      'Eliminar Receta',
      `¿Estás seguro de eliminar "${receta.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => console.log('Eliminar receta:', receta.id) }
      ]
    );
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    seleccionarReceta(null);
  };

  const handleAgregarMaterial = (material: Material) => {
    const nuevoMaterial: DetalleReceta = {
      id: material.id, // Usar el ID del material como identificador temporal
      cantidad: 1,
      unidadMedida: material.unidadMedida,
      merma: 0,
      material: material,
    };
    setMaterialesReceta([...materialesReceta, nuevoMaterial]);
    setModalMaterialVisible(false);
  };

  const handleActualizarCantidad = (index: number, cantidad: number) => {
    const nuevosM = [...materialesReceta];
    nuevosM[index].cantidad = cantidad;
    setMaterialesReceta(nuevosM);
  };

  const handleEliminarMaterial = (index: number) => {
    const nuevosM = materialesReceta.filter((_, i) => i !== index);
    setMaterialesReceta(nuevosM);
  };

  const materialesDisponibles = materiales.filter(
    (mat) => !materialesReceta.some((mr) => mr.material?.id === mat.id)
  );

  const renderRecetaItem = ({ item }: { item: Receta }) => {
    const costoReceta = item.detalles.reduce((sum, det) => {
      return sum + (det.cantidad * (det.material?.costoUnitario || 0));
    }, 0);
    const costoPorUnidad = item.rendimiento > 0 ? costoReceta / item.rendimiento : 0;

    return (
      <POSCard style={styles.recetaCard} variant="elevated">
        <View style={styles.recetaHeader}>
          <View style={styles.recetaHeaderLeft}>
            <Text style={styles.recetaNombre}>{item.nombre}</Text>
            <Text style={styles.recetaCodigo}>{item.codigo}</Text>
          </View>
          <View style={styles.recetaHeaderRight}>
            <POSBadge
              label={item.activa ? 'ACTIVA' : 'INACTIVA'}
              variant={item.activa ? 'success' : 'default'}
              size="small"
            />
          </View>
        </View>

        <Text style={styles.recetaDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.recetaInfoGrid}>
          <View style={styles.recetaInfoItem}>
            <POSIcon name="bar-chart-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.recetaInfoLabel}>Rendimiento</Text>
            <Text style={styles.recetaInfoValue}>
              {item.rendimiento} {item.unidadRendimiento}
            </Text>
          </View>

          <View style={styles.recetaInfoItem}>
            <POSIcon name="list-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.recetaInfoLabel}>Ingredientes</Text>
            <Text style={styles.recetaInfoValue}>{item.detalles.length}</Text>
          </View>

          <View style={styles.recetaInfoItem}>
            <POSIcon name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.recetaInfoLabel}>Tiempo</Text>
            <Text style={styles.recetaInfoValue}>{item.tiempoPreparacion} min</Text>
          </View>
        </View>

        <View style={styles.recetaCostoContainer}>
          <View style={styles.recetaCosto}>
            <Text style={styles.recetaCostoLabel}>Costo Total</Text>
            <Text style={styles.recetaCostoTotal}>${costoReceta.toFixed(2)}</Text>
          </View>
          <View style={styles.recetaCostoDivider} />
          <View style={styles.recetaCosto}>
            <Text style={styles.recetaCostoLabel}>Costo/Unidad</Text>
            <Text style={styles.recetaCostoUnidad}>${costoPorUnidad.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.recetaAcciones}>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEditar]}
            onPress={() => handleEditar(item)}
          >
            <POSIcon name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.botonAccionTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => handleEliminar(item)}
          >
            <POSIcon name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.botonAccionTexto, styles.botonEliminarTexto]}>Eliminar</Text>
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
          <Text style={styles.title}>Gestión de Recetas</Text>
          <POSBadge
            label={`${recetasFiltradas.length} recetas`}
            variant="info"
          />
        </View>
        <Text style={styles.subtitle}>
          Control de costos y producción
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por nombre o código..."
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

      {/* Lista de Recetas */}
      <FlatList
        data={recetasFiltradas}
        renderItem={renderRecetaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <POSIcon name="document-text-outline" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyTexto}>No se encontraron recetas</Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea tu primera receta'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNuevo}>
        <POSIcon name="add" size={32} color={COLORS.white} />
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
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información General */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Información General</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Pan francés"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Código *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: PAN-001"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.codigo}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, codigo: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descripción</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="Descripción de la receta"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
                  />
                </View>
              </View>

              {/* Sección: Rendimiento */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Rendimiento y Tiempo</Text>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>Rendimiento *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="numeric"
                      value={formData.rendimiento.toString()}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, rendimiento: Number(text) || 0 }))}
                    />
                  </View>

                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>Unidad *</Text>
                    <View style={styles.formInput}>
                      <Text style={styles.formInputText}>{formData.unidadRendimiento}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tiempo de Preparación (minutos)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={formData.tiempoPreparacion.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, tiempoPreparacion: Number(text) || 0 }))}
                  />
                </View>
              </View>

              {/* Sección: Ingredientes */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>Ingredientes</Text>
                  <TouchableOpacity
                    style={styles.botonAgregar}
                    onPress={() => setModalMaterialVisible(true)}
                  >
                    <POSIcon name="add-circle" size={20} color={COLORS.white} />
                    <Text style={styles.botonAgregarTexto}>Agregar</Text>
                  </TouchableOpacity>
                </View>

                {materialesReceta.length === 0 ? (
                  <View style={styles.materialesVacio}>
                    <POSIcon name="cube-outline" size={48} color={COLORS.lightGray} />
                    <Text style={styles.materialesVacioTexto}>Sin ingredientes</Text>
                    <Text style={styles.materialesVacioSubtexto}>
                      Agrega materiales para esta receta
                    </Text>
                  </View>
                ) : (
                  <View style={styles.tablaIngredientes}>
                    {/* Encabezado Tabla */}
                    <View style={styles.tablaHeader}>
                      <Text style={[styles.tablaHeaderTexto, { flex: 2 }]}>Material</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'center' }]}>Cantidad</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'right' }]}>Costo Unit.</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'right' }]}>Subtotal</Text>
                      <View style={{ width: 40 }} />
                    </View>

                    {/* Filas de Ingredientes */}
                    {costos.detallesConCosto.map((detalle, index) => (
                      <View key={index} style={styles.tablaFila}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.tablaFilaTexto}>{detalle.material?.nombre}</Text>
                          <Text style={styles.tablaFilaUnidad}>{detalle.unidadMedida}</Text>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <TextInput
                            style={styles.inputCantidad}
                            placeholder="0"
                            keyboardType="decimal-pad"
                            value={detalle.cantidad.toString()}
                            onChangeText={(text) => handleActualizarCantidad(index, Number(text) || 0)}
                          />
                        </View>

                        <Text style={[styles.tablaFilaTexto, { flex: 1, textAlign: 'right' }]}>
                          ${detalle.costoUnitario.toFixed(2)}
                        </Text>

                        <Text style={[styles.tablaFilaSubtotal, { flex: 1, textAlign: 'right' }]}>
                          ${detalle.subtotal.toFixed(2)}
                        </Text>

                        <TouchableOpacity
                          style={styles.botonEliminarFila}
                          onPress={() => handleEliminarMaterial(index)}
                        >
                          <POSIcon name="close-circle" size={24} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Sección: Instrucciones */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Instrucciones de Preparación</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="Escribe las instrucciones paso a paso..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={formData.instrucciones}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, instrucciones: text }))}
                />
              </View>
            </ScrollView>

            {/* Panel de Costos Fijo */}
            <View style={styles.panelCostos}>
              <View style={styles.costoItem}>
                <Text style={styles.costoLabel}>Total Ingredientes</Text>
                <Text style={styles.costoValor}>${costos.costoTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.costoItem}>
                <Text style={styles.costoLabel}>Rendimiento</Text>
                <Text style={styles.costoValor}>{formData.rendimiento} {formData.unidadRendimiento}</Text>
              </View>
              <View style={styles.costoItem}>
                <Text style={styles.costoLabelPrincipal}>Costo por Unidad</Text>
                <Text style={styles.costoValorPrincipal}>${costos.costoPorUnidad.toFixed(2)}</Text>
              </View>
            </View>

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
                  {recetaSeleccionada ? 'Actualizar' : 'Crear Receta'}
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
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.materialesDisponiblesLista}>
              {materialesDisponibles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTexto}>Todos los materiales agregados</Text>
                </View>
              ) : (
                materialesDisponibles.map((material) => (
                  <TouchableOpacity
                    key={material.id}
                    style={styles.materialDisponibleItem}
                    onPress={() => handleAgregarMaterial(material)}
                  >
                    <View style={styles.materialDisponibleInfo}>
                      <Text style={styles.materialDisponibleNombre}>{material.nombre}</Text>
                      <View style={styles.materialDisponibleDetalles}>
                        <POSIcon name="cube-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.materialDisponibleUnidad}>{material.unidadMedida}</Text>
                        <Text style={styles.materialDisponibleSeparador}>•</Text>
                        <Text style={styles.materialDisponibleCosto}>${material.costoUnitario.toFixed(2)}</Text>
                      </View>
                    </View>
                    <POSIcon name="add-circle-outline" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                ))
              )}
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
    backgroundColor: '#F5F5F5',
  },

  // Header
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

  // Buscador
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },

  // Lista
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // Tarjeta Receta
  recetaCard: {
    marginBottom: 16,
    padding: 16,
  },
  recetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recetaHeaderLeft: {
    flex: 1,
  },
  recetaHeaderRight: {
    marginLeft: 12,
  },
  recetaNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  recetaCodigo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  recetaDescripcion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Grid de información
  recetaInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  recetaInfoItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  recetaInfoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  recetaInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Costos destacados
  recetaCostoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  recetaCosto: {
    flex: 1,
    alignItems: 'center',
  },
  recetaCostoDivider: {
    width: 1,
    backgroundColor: '#FFE082',
    marginHorizontal: 12,
  },
  recetaCostoLabel: {
    fontSize: 11,
    color: '#9C6F19',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  recetaCostoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C6F19',
  },
  recetaCostoUnidad: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C6F19',
  },

  // Acciones
  recetaAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  botonEditar: {
    backgroundColor: '#E3F2FD',
  },
  botonEliminar: {
    backgroundColor: '#FFEBEE',
  },
  botonAccionTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  botonEliminarTexto: {
    color: COLORS.danger,
  },

  // FAB Button
  fabButton: {
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

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContenido: {
    maxHeight: '50%',
  },

  // Formulario
  seccionFormulario: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formInputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  formInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Botón Agregar
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  botonAgregarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Materiales Vacío
  materialesVacio: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  materialesVacioTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  materialesVacioSubtexto: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Tabla de Ingredientes
  tablaIngredientes: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tablaHeaderTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  tablaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tablaFilaTexto: {
    fontSize: 14,
    color: COLORS.text,
  },
  tablaFilaUnidad: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tablaFilaSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  inputCantidad: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    minWidth: 60,
  },
  botonEliminarFila: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Panel de Costos
  panelCostos: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFE082',
    gap: 16,
  },
  costoItem: {
    flex: 1,
    alignItems: 'center',
  },
  costoLabel: {
    fontSize: 11,
    color: '#9C6F19',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  costoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C6F19',
  },
  costoLabelPrincipal: {
    fontSize: 12,
    color: '#9C6F19',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  costoValorPrincipal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C6F19',
  },

  // Botones Modal
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#F9FAFB',
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
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Modal Material
  modalMaterialContainer: {
    backgroundColor: COLORS.white,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  materialDisponibleInfo: {
    flex: 1,
  },
  materialDisponibleNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  materialDisponibleDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  materialDisponibleUnidad: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  materialDisponibleSeparador: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  materialDisponibleCosto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
});

import { COLORS, POSBadge, POSIcon } from '@/components/pos';
import { useMateriales } from '@/features/inventario/materiales';
import { Material } from '@/features/inventario/materiales/materiales.types';
import { CrearRecetaDTO, DetalleReceta, Receta } from '@/features/producto/receta/receta.types';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { Unidad } from '@/types/globalTypes';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// ── Design tokens: MD3 + Neo-Brutalismo Funcional (mismos que Dashboard/Materiales) ──
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

  const { cargarRecetas, seleccionarReceta, crearReceta, actualizarReceta, eliminarReceta, limpiarRecetas, loading, recetas, recetaSeleccionada } = useRecetas();
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

  const handleCrearReceta = async () => {
    if (!formData.nombre || !formData.codigo) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    const payload: CrearRecetaDTO = {
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

    let result;
    if (recetaSeleccionada) {
      result = await actualizarReceta(recetaSeleccionada.id, {
        ...recetaSeleccionada,
        ...payload,
        id: recetaSeleccionada.id,
        codigo: formData.codigo,
        fechaCreacion: recetaSeleccionada.fechaCreacion,
        createdAt: recetaSeleccionada.createdAt,
        updatedAt: new Date(),
        createdBy: recetaSeleccionada.createdBy,
        updatedBy: recetaSeleccionada.updatedBy,
      });
    } else {
      result = await crearReceta(payload);
    }

    if (result?.success) {
      Alert.alert('Éxito', recetaSeleccionada ? 'Receta actualizada correctamente' : 'Receta creada correctamente');
      handleCerrarModal();
    } else {
      Alert.alert('Error', result?.error || 'No se pudo guardar la receta');
    }
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
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await eliminarReceta(receta.id);
            if (result.success) {
              Alert.alert('Éxito', 'Receta eliminada correctamente');
            } else {
              Alert.alert('Error', result.error || 'No se pudo eliminar la receta');
            }
          },
        },
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
      <View style={styles.recetaCard}>
        <View style={styles.recetaHeader}>
          <View style={styles.recetaHeaderLeft}>
            <Text style={styles.recetaNombre} numberOfLines={1}>{item.nombre}</Text>
            <Text style={styles.recetaCodigo}>{item.codigo}</Text>
          </View>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: item.activa ? COLORS.success : '#D9D9D0' },
            ]}
          >
            <Text style={styles.estadoBadgeTexto}>{item.activa ? 'ACTIVA' : 'INACTIVA'}</Text>
          </View>
        </View>

        <Text style={styles.recetaDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.recetaInfoGrid}>
          <View style={styles.recetaInfoItem}>
            <POSIcon name="bar-chart-outline" size={16} color={INK} />
            <Text style={styles.recetaInfoLabel}>RENDIMIENTO</Text>
            <Text style={styles.recetaInfoValue}>
              {item.rendimiento} {item.unidadRendimiento}
            </Text>
          </View>

          <View style={styles.recetaInfoItem}>
            <POSIcon name="list-outline" size={16} color={INK} />
            <Text style={styles.recetaInfoLabel}>INGREDIENTES</Text>
            <Text style={styles.recetaInfoValue}>{item.detalles.length}</Text>
          </View>

          <View style={styles.recetaInfoItem}>
            <POSIcon name="time-outline" size={16} color={INK} />
            <Text style={styles.recetaInfoLabel}>TIEMPO</Text>
            <Text style={styles.recetaInfoValue}>{item.tiempoPreparacion} min</Text>
          </View>
        </View>

        <View style={styles.recetaCostoContainer}>
          <View style={styles.recetaCosto}>
            <Text style={styles.recetaCostoLabel}>COSTO TOTAL</Text>
            <Text style={styles.recetaCostoTotal}>${costoReceta.toFixed(2)}</Text>
          </View>
          <View style={styles.recetaCostoDivider} />
          <View style={styles.recetaCosto}>
            <Text style={styles.recetaCostoLabel}>COSTO/UNIDAD</Text>
            <Text style={styles.recetaCostoUnidad}>${costoPorUnidad.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.recetaAcciones}>
          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEditar, hardShadow(pressed)]}
            onPress={() => handleEditar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="create-outline" size={20} color={INK} />
            <Text style={styles.botonAccionTexto}>EDITAR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEliminar, hardShadow(pressed)]}
            onPress={() => handleEliminar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="trash-outline" size={20} color={INK} />
            <Text style={styles.botonAccionTexto}>ELIMINAR</Text>
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
          <Text style={styles.title}>RECETAS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{recetasFiltradas.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Control de costos y producción</Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={INK} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por nombre o código..."
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

      {/* Lista de Recetas */}
      <FlatList
        data={recetasFiltradas}
        renderItem={renderRecetaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <POSIcon name="document-text-outline" size={48} color={INK} />
            </View>
            <Text style={styles.emptyTexto}>
              {busqueda ? 'SIN RESULTADOS' : 'AÚN NO HAY RECETAS'}
            </Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Toca "+ Nueva receta" para comenzar'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <Pressable
        style={({ pressed }) => [styles.fabButton, hardShadow(pressed)]}
        onPress={handleNuevo}
        android_ripple={RIPPLE}
      >
        <POSIcon name="add" size={28} color={INK} />
        <Text style={styles.fabButtonTexto}>NUEVA</Text>
      </Pressable>

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
                {recetaSeleccionada ? 'EDITAR RECETA' : 'NUEVA RECETA'}
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
              {/* Sección: Información General */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>INFORMACIÓN GENERAL</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>NOMBRE *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Pan francés"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>CÓDIGO *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: PAN-001"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.codigo}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, codigo: text }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
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
                <Text style={styles.seccionTitulo}>RENDIMIENTO Y TIEMPO</Text>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, styles.formGroupHalf]}>
                    <Text style={styles.formLabel}>RENDIMIENTO *</Text>
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
                    <Text style={styles.formLabel}>UNIDAD *</Text>
                    <View style={styles.formInput}>
                      <Text style={styles.formInputText}>{formData.unidadRendimiento}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>TIEMPO DE PREPARACIÓN (MIN)</Text>
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
                  <Text style={styles.seccionTitulo}>INGREDIENTES</Text>
                  <Pressable
                    style={({ pressed }) => [styles.botonAgregar, hardShadow(pressed)]}
                    onPress={() => setModalMaterialVisible(true)}
                    android_ripple={RIPPLE}
                  >
                    <POSIcon name="add-circle" size={18} color={INK} />
                    <Text style={styles.botonAgregarTexto}>AGREGAR</Text>
                  </Pressable>
                </View>

                {materialesReceta.length === 0 ? (
                  <View style={styles.materialesVacio}>
                    <POSIcon name="cube-outline" size={40} color={INK} />
                    <Text style={styles.materialesVacioTexto}>SIN INGREDIENTES</Text>
                    <Text style={styles.materialesVacioSubtexto}>
                      Agrega materiales para esta receta
                    </Text>
                  </View>
                ) : (
                  <View style={styles.tablaIngredientes}>
                    {/* Encabezado Tabla */}
                    <View style={styles.tablaHeader}>
                      <Text style={[styles.tablaHeaderTexto, { flex: 2 }]}>MATERIAL</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'center' }]}>CANT.</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'right' }]}>C. UNIT.</Text>
                      <Text style={[styles.tablaHeaderTexto, { flex: 1, textAlign: 'right' }]}>SUBTOTAL</Text>
                      <View style={{ width: 40 }} />
                    </View>

                    {/* Filas de Ingredientes */}
                    {costos.detallesConCosto.map((detalle, index) => (
                      <View key={index} style={styles.tablaFila}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.tablaFilaTexto} numberOfLines={1}>{detalle.material?.nombre}</Text>
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

                        <Pressable
                          style={styles.botonEliminarFila}
                          onPress={() => handleEliminarMaterial(index)}
                          hitSlop={6}
                        >
                          <POSIcon name="close-circle" size={24} color={COLORS.danger} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Sección: Instrucciones */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>INSTRUCCIONES DE PREPARACIÓN</Text>
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

            {/* Panel de Costos Fijo — siempre visible, dato de mayor consecuencia (Trust Design) */}
            <View style={styles.panelCostos}>
              <View style={styles.costoItem}>
                <Text style={styles.costoLabel}>INGREDIENTES</Text>
                <Text style={styles.costoValor}>${costos.costoTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.panelCostosDivider} />
              <View style={styles.costoItem}>
                <Text style={styles.costoLabel}>RENDIMIENTO</Text>
                <Text style={styles.costoValor}>{formData.rendimiento} {formData.unidadRendimiento}</Text>
              </View>
              <View style={styles.panelCostosDivider} />
              <View style={styles.costoItem}>
                <Text style={styles.costoLabelPrincipal}>COSTO/UNIDAD</Text>
                <Text style={styles.costoValorPrincipal}>${costos.costoPorUnidad.toFixed(2)}</Text>
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonCancelar, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonGuardar, hardShadow(pressed)]}
                onPress={handleCrearReceta}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonGuardarTexto}>
                  {recetaSeleccionada ? 'ACTUALIZAR' : 'CREAR RECETA'}
                </Text>
              </Pressable>
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
              <Text style={styles.modalTitulo}>SELECCIONAR MATERIAL</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalMaterialVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={22} color={INK} />
              </Pressable>
            </View>

            <ScrollView style={styles.materialesDisponiblesLista}>
              {materialesDisponibles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTexto}>TODOS LOS MATERIALES AGREGADOS</Text>
                </View>
              ) : (
                materialesDisponibles.map((material) => (
                  <Pressable
                    key={material.id}
                    style={({ pressed }) => [styles.materialDisponibleItem, hardShadow(pressed)]}
                    onPress={() => handleAgregarMaterial(material)}
                    android_ripple={RIPPLE}
                  >
                    <View style={styles.materialDisponibleInfo}>
                      <Text style={styles.materialDisponibleNombre} numberOfLines={1}>{material.nombre}</Text>
                      <View style={styles.materialDisponibleDetalles}>
                        <POSIcon name="cube-outline" size={14} color={INK} />
                        <Text style={styles.materialDisponibleUnidad}>{material.unidadMedida}</Text>
                        <Text style={styles.materialDisponibleSeparador}>·</Text>
                        <Text style={styles.materialDisponibleCosto}>${material.costoUnitario.toFixed(2)}</Text>
                      </View>
                    </View>
                    <View style={styles.materialDisponibleAddIcon}>
                      <POSIcon name="add" size={20} color={INK} />
                    </View>
                  </Pressable>
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
    padding: 16,
    paddingBottom: 110,
  },

  // ── Tarjeta Receta ──────────────────────────────────────────────────────
  recetaCard: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  recetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  recetaHeaderLeft: {
    flex: 1,
  },
  recetaNombre: {
    fontSize: 19,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  recetaCodigo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
  },
  estadoBadgeTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  recetaDescripcion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── Grid de información ────────────────────────────────────────────────
  recetaInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  recetaInfoItem: {
    flex: 1,
    backgroundColor: '#F1F1EC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    gap: 4,
  },
  recetaInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  recetaInfoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },

  // ── Costos destacados — color sólido, no pastel, para máxima lectura ──
  recetaCostoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: INK,
  },
  recetaCosto: {
    flex: 1,
    alignItems: 'center',
  },
  recetaCostoDivider: {
    width: 2,
    backgroundColor: INK,
    marginHorizontal: 12,
    opacity: 0.3,
  },
  recetaCostoLabel: {
    fontSize: 10,
    color: INK,
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: '800',
  },
  recetaCostoTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: INK,
  },
  recetaCostoUnidad: {
    fontSize: 20,
    fontWeight: '800',
    color: INK,
  },

  // ── Acciones ─────────────────────────────────────────────────────────────
  recetaAcciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    gap: 6,
  },
  botonEditar: {
    backgroundColor: COLORS.info,
  },
  botonEliminar: {
    backgroundColor: '#FF9494',
  },
  botonAccionTexto: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── FAB Button ──────────────────────────────────────────────────────────
  fabButton: {
    position: 'absolute',
    bottom: 20,
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
  fabButtonTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },

  // ── Empty State ─────────────────────────────────────────────────────────
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
    maxHeight: '95%',
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
    maxHeight: '50%',
  },

  // ── Formulario ──────────────────────────────────────────────────────────
  seccionFormulario: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#EDEDE6',
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    borderWidth: 2,
    borderColor: INK,
  },
  formInputText: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  formInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // ── Botón Agregar ───────────────────────────────────────────────────────
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    gap: 6,
  },
  botonAgregarTexto: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── Materiales Vacío ────────────────────────────────────────────────────
  materialesVacio: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: 'dashed',
    gap: 4,
  },
  materialesVacioTexto: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginTop: 8,
  },
  materialesVacioSubtexto: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // ── Tabla de Ingredientes ──────────────────────────────────────────────
  tablaIngredientes: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: INK,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tablaHeaderTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.white,
  },
  tablaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDE6',
    backgroundColor: COLORS.white,
  },
  tablaFilaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
  },
  tablaFilaUnidad: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tablaFilaSubtotal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.success,
  },
  inputCantidad: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    minWidth: 60,
  },
  botonEliminarFila: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Panel de Costos — siempre visible, alto contraste ─────────────────
  panelCostos: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: BORDER_W,
    borderTopColor: INK,
  },
  costoItem: {
    flex: 1,
    alignItems: 'center',
  },
  panelCostosDivider: {
    width: 2,
    backgroundColor: INK,
    opacity: 0.25,
  },
  costoLabel: {
    fontSize: 10,
    color: INK,
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: '800',
  },
  costoValor: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
  },
  costoLabelPrincipal: {
    fontSize: 11,
    color: INK,
    marginBottom: 4,
    letterSpacing: 0.3,
    fontWeight: '800',
  },
  costoValorPrincipal: {
    fontSize: 24,
    fontWeight: '800',
    color: INK,
  },

  // ── Botones Modal ────────────────────────────────────────────────────────
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
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

  // ── Modal Material ──────────────────────────────────────────────────────
  modalMaterialContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '70%',
  },
  materialesDisponiblesLista: {
    padding: 20,
  },
  materialDisponibleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  materialDisponibleInfo: {
    flex: 1,
    marginRight: 10,
  },
  materialDisponibleNombre: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    marginBottom: 6,
  },
  materialDisponibleDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  materialDisponibleUnidad: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  materialDisponibleSeparador: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  materialDisponibleCosto: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.success,
  },
  materialDisponibleAddIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
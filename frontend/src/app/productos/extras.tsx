import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useMateriales } from '@/features/inventario/materiales';
import { CreateGrupoExtraDTO, CreateOpcionExtraDTO, GrupoExtra } from '@/features/producto/grupoExtra/grupoExtra.types';
import { useExtra } from '@/features/producto/grupoExtra/useExtra';
import { useProducto } from '@/features/producto/producto/useProducto';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface OpcionForm {
  tempId: string;
  nombre: string;
  precio: string;
  materialId: number | null;
  activo: boolean;
}

export default function ExtrasScreen() {
  const { grupos, loading, cargarGrupos, saveGrupo } = useExtra();
  const { materiales, cargarMateriales } = useMateriales();
  const {productos, loading: loadingProductos,cargarProductos} = useProducto(); // Hook para obtener productos desde el store

  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<GrupoExtra | null>(null);
  const [opcionEditandoIndex, setOpcionEditandoIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const [opciones, setOpciones] = useState<OpcionForm[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<number[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');

  useEffect(() => {
    cargarGrupos();
    cargarMateriales();
    cargarProductos();
  }, []);

  useEffect(() => {
    if (grupoEditando) {
      setFormData({
        nombre: grupoEditando.nombre,
        descripcion: grupoEditando.descripcion,
        activo: grupoEditando.activo,
      });
      
      setOpciones(
        grupoEditando.opciones.map((op) => ({
          tempId: op.id.toString(),
          nombre: op.nombre,
          precio: op.precio.toString(),
          materialId: op.materialId,
          activo: op.activo,
        }))
      );
    } else {
      setFormData({ nombre: '', descripcion: '', activo: true });
      setOpciones([]);
      setProductosSeleccionados([]);
    }
  }, [grupoEditando]);

  const gruposFiltrados = grupos.filter((grupo) =>
    grupo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosFiltrados = productos.filter((prod) =>
    prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const handleNuevo = () => {
    setGrupoEditando(null);
    setModalVisible(true);
  };

  const handleEditar = (grupo: GrupoExtra) => {
    setGrupoEditando(grupo);
    setModalVisible(true);
  };

  const handleEliminar = (grupo: GrupoExtra) => {
    Alert.alert(
      'Eliminar Grupo',
      `¿Estás seguro de eliminar "${grupo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => console.log('Eliminar:', grupo.id) }
      ]
    );
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setGrupoEditando(null);
  };

  const handleAgregarOpcion = () => {
    const nuevaOpcion: OpcionForm = {
      tempId: Date.now().toString(),
      nombre: '',
      precio: '0',
      materialId: null,
      activo: true,
    };
    setOpciones([...opciones, nuevaOpcion]);
  };

  const handleEliminarOpcion = (index: number) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  const handleActualizarOpcion = (index: number, campo: keyof OpcionForm, valor: any) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = { ...nuevasOpciones[index], [campo]: valor };
    setOpciones(nuevasOpciones);
  };

  const handleSeleccionarMaterial = (materialId: number) => {
    if (opcionEditandoIndex !== null) {
      handleActualizarOpcion(opcionEditandoIndex, 'materialId', materialId);
      setModalMaterialVisible(false);
      setOpcionEditandoIndex(null);
    }
  };

  const handleToggleProducto = (productoId: number) => {
    if (productosSeleccionados.includes(productoId)) {
      setProductosSeleccionados(productosSeleccionados.filter((id) => id !== productoId));
    } else {
      setProductosSeleccionados([...productosSeleccionados, productoId]);
    }
  };

  const handleGuardar = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del grupo es requerido');
      return;
    }

    /**const opcionesValidas = opciones.filter((op) => op.nombre.trim() && op.materialId);
    
    if (opcionesValidas.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos una opción válida');
      return;
    }

    const opcionesDTO: CreateOpcionExtraDTO[] = opcionesValidas.map((op) => ({
      nombre: op.nombre,
      precio: parseFloat(op.precio) || 0,
      materialId: op.materialId!,
    }));**/

    const grupoDTO: CreateGrupoExtraDTO = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      /**opciones: opcionesDTO,**/
      productosIds: productosSeleccionados,
    };

    saveGrupo(grupoDTO);
    console.log('Productos seleccionados:', productosSeleccionados);
    handleCerrarModal();
  };

  const renderGrupoItem = ({ item }: { item: GrupoExtra }) => {
    // Mock: conteo de productos asociados (en producción vendría del backend)
    const productosAsociados = Math.floor(Math.random() * 8) + 1;

    return (
      <POSCard style={styles.grupoCard} variant="elevated">
        <View style={styles.grupoHeader}>
          <View style={styles.grupoHeaderLeft}>
            <Text style={styles.grupoNombre}>{item.nombre}</Text>
            <POSBadge 
              label={item.activo ? 'ACTIVO' : 'INACTIVO'} 
              variant={item.activo ? 'success' : 'default'}
              size="small"
            />
          </View>
        </View>

        <Text style={styles.grupoDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.grupoInfoGrid}>
          <View style={styles.grupoInfoItem}>
            <POSIcon name="list-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.grupoInfoLabel}>Opciones</Text>
            <Text style={styles.grupoInfoValue}>{item.opciones.length}</Text>
          </View>

          <View style={styles.grupoInfoItem}>
            <POSIcon name="fast-food-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.grupoInfoLabel}>Productos</Text>
            <Text style={styles.grupoInfoValue}>{productosAsociados}</Text>
          </View>
        </View>

        <View style={styles.grupoAcciones}>
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
          <Text style={styles.title}>Grupos de Extras</Text>
          <POSBadge 
            label={`${gruposFiltrados.length} grupos`} 
            variant="info"
          />
        </View>
        <Text style={styles.subtitle}>
          Gestiona complementos para tus productos
        </Text>
      </View>

      {/* Navegación por Tabs */}
      <View style={styles.navigationTabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/productos')}
        >
          <POSIcon name="restaurant-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.tabText}>Productos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/config/categorias')}
        >
          <POSIcon name="grid-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.tabText}>Categorías</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabActive}>
          <POSIcon name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tabTextActive}>Extras</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar grupo..."
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

      {/* Lista de Grupos */}
      <FlatList
        data={gruposFiltrados}
        renderItem={renderGrupoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <POSIcon name="albums-outline" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyTexto}>No hay grupos de extras</Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea tu primer grupo'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNuevo}>
        <POSIcon name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal Crear/Editar Grupo */}
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
                {grupoEditando ? 'Editar Grupo' : 'Nuevo Grupo'}
              </Text>
              <TouchableOpacity onPress={handleCerrarModal}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Contenido del Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información del Grupo */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Información del Grupo</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Ingredientes Extra"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descripción</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="Describe el grupo de extras"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <View style={styles.switchLabel}>
                    <POSIcon name="power" size={20} color={formData.activo ? COLORS.success : COLORS.gray} />
                    <Text style={styles.switchText}>Grupo Activo</Text>
                  </View>
                  <Switch
                    value={formData.activo}
                    onValueChange={(value) => setFormData({ ...formData, activo: value })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>

              {/* Sección: Opciones del Grupo */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>Opciones del Grupo</Text>
                  <TouchableOpacity
                    style={styles.botonAgregar}
                    onPress={handleAgregarOpcion}
                  >
                    <POSIcon name="add-circle" size={20} color={COLORS.white} />
                    <Text style={styles.botonAgregarTexto}>Agregar</Text>
                  </TouchableOpacity>
                </View>

                {opciones.length === 0 ? (
                  <View style={styles.opcionesVacio}>
                    <POSIcon name="cube-outline" size={48} color={COLORS.lightGray} />
                    <Text style={styles.opcionesVacioTexto}>Sin opciones</Text>
                    <Text style={styles.opcionesVacioSubtexto}>
                      Agrega opciones de extras
                    </Text>
                  </View>
                ) : (
                  <View style={styles.opcionesLista}>
                    {opciones.map((opcion, index) => {
                      const materialSeleccionado = materiales.find((m) => m.id === opcion.materialId);
                      
                      return (
                        <POSCard key={opcion.tempId} style={styles.opcionCard} variant="outlined">
                          <View style={styles.opcionHeader}>
                            <View style={styles.opcionNumero}>
                              <Text style={styles.opcionNumeroTexto}>{index + 1}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.botonEliminarOpcion}
                              onPress={() => handleEliminarOpcion(index)}
                            >
                              <POSIcon name="close-circle" size={24} color={COLORS.danger} />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Nombre *</Text>
                            <TextInput
                              style={styles.formInput}
                              placeholder="Ej: Queso Extra"
                              placeholderTextColor={COLORS.textSecondary}
                              value={opcion.nombre}
                              onChangeText={(text) => handleActualizarOpcion(index, 'nombre', text)}
                            />
                          </View>

                          <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                              <Text style={styles.formLabel}>Precio</Text>
                              <View style={styles.precioContainer}>
                                <Text style={styles.precioSimbolo}>$</Text>
                                <TextInput
                                  style={styles.precioInput}
                                  placeholder="0.00"
                                  placeholderTextColor={COLORS.textSecondary}
                                  keyboardType="decimal-pad"
                                  value={opcion.precio}
                                  onChangeText={(text) => handleActualizarOpcion(index, 'precio', text)}
                                />
                              </View>
                            </View>

                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                              <Text style={styles.formLabel}>Material *</Text>
                              <TouchableOpacity
                                style={styles.materialSelector}
                                onPress={() => {
                                  setOpcionEditandoIndex(index);
                                  setModalMaterialVisible(true);
                                }}
                              >
                                {materialSeleccionado ? (
                                  <>
                                    <POSIcon name="checkmark-circle" size={16} color={COLORS.success} />
                                    <Text style={styles.materialSelectorTexto} numberOfLines={1}>
                                      {materialSeleccionado.nombre}
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <POSIcon name="ellipse-outline" size={16} color={COLORS.textSecondary} />
                                    <Text style={[styles.materialSelectorTexto, styles.materialSelectorPlaceholder]}>
                                      Seleccionar
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.switchContainer}>
                            <Text style={styles.switchTextSmall}>Opción Activa</Text>
                            <Switch
                              value={opcion.activo}
                              onValueChange={(value) => handleActualizarOpcion(index, 'activo', value)}
                              trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
                              thumbColor={COLORS.white}
                            />
                          </View>
                        </POSCard>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Sección: Productos Asociados */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>Productos Asociados</Text>
                  <View style={styles.contadorProductos}>
                    <POSIcon name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.contadorProductosTexto}>
                      {productosSeleccionados.length} seleccionados
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.botonSeleccionarProductos}
                  onPress={() => setModalProductosVisible(true)}
                >
                  <POSIcon name="fast-food-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.botonSeleccionarProductosTexto}>
                    Seleccionar Productos
                  </Text>
                  <POSIcon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                {productosSeleccionados.length > 0 && (
                  <View style={styles.productosSeleccionadosLista}>
                    {productosSeleccionados.map((prodId) => {
                      const producto = grupos.find((p) => p.id === prodId);
                      return producto ? (
                        <View key={prodId} style={styles.chipProducto}>
                          <Text style={styles.chipProductoTexto}>{producto.nombre}</Text>
                          <TouchableOpacity onPress={() => handleToggleProducto(prodId)}>
                            <POSIcon name="close" size={16} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
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
                onPress={handleGuardar}
              >
                <Text style={styles.botonGuardarTexto}>
                  {grupoEditando ? 'Actualizar' : 'Crear Grupo'}
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
              {materiales.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialDisponibleItem}
                  onPress={() => handleSeleccionarMaterial(material.id)}
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
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Seleccionar Productos */}
      <Modal
        visible={modalProductosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalProductosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalProductosContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Seleccionar Productos</Text>
              <TouchableOpacity onPress={() => setModalProductosVisible(false)}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Buscador de Productos */}
            <View style={styles.busquedaProductoContainer}>
              <POSIcon name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.busquedaInput}
                placeholder="Buscar producto..."
                placeholderTextColor={COLORS.textSecondary}
                value={busquedaProducto}
                onChangeText={setBusquedaProducto}
              />
            </View>

            {/* Lista de Productos */}
            <ScrollView style={styles.productosLista}>
              {productosFiltrados.map((producto) => {
                const isSeleccionado = productosSeleccionados.includes(producto.id);
                
                return (
                  <TouchableOpacity
                    key={producto.id}
                    style={[
                      styles.productoItem,
                      isSeleccionado && styles.productoItemSeleccionado,
                    ]}
                    onPress={() => handleToggleProducto(producto.id)}
                  >
                    <View style={styles.productoItemInfo}>
                      <Text style={styles.productoItemNombre}>{producto.nombre}</Text>
                      <Text style={styles.productoItemCategoria}>{producto.categoria.descripcion}</Text>
                    </View>
                    {isSeleccionado ? (
                      <POSIcon name="checkmark-circle" size={28} color={COLORS.success} />
                    ) : (
                      <POSIcon name="ellipse-outline" size={28} color={COLORS.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Botón Confirmar */}
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar, { flex: 1 }]}
                onPress={() => setModalProductosVisible(false)}
              >
                <Text style={styles.botonGuardarTexto}>
                  Confirmar ({productosSeleccionados.length})
                </Text>
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

  // Navegación por Tabs
  navigationTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
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
  
  // Tarjeta Grupo
  grupoCard: {
    marginBottom: 16,
    padding: 16,
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  grupoHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grupoNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  grupoDescripcion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // Grid de información
  grupoInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  grupoInfoItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  grupoInfoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  grupoInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Acciones
  grupoAcciones: {
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
    maxHeight: '65%',
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
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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

  // Opciones Vacío
  opcionesVacio: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  opcionesVacioTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  opcionesVacioSubtexto: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Lista de Opciones
  opcionesLista: {
    gap: 16,
  },
  opcionCard: {
    padding: 16,
  },
  opcionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opcionNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcionNumeroTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  botonEliminarOpcion: {
    padding: 4,
  },

  // Precio
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  precioSimbolo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginRight: 8,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },

  // Material Selector
  materialSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  materialSelectorTexto: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  materialSelectorPlaceholder: {
    color: COLORS.textSecondary,
  },

  // Productos Asociados
  contadorProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  contadorProductosTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  botonSeleccionarProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  botonSeleccionarProductosTexto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
  productosSeleccionadosLista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chipProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  chipProductoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
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

  // Modal Productos
  modalProductosContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  busquedaProductoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  productosLista: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productoItemSeleccionado: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
  },
  productoItemInfo: {
    flex: 1,
  },
  productoItemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productoItemCategoria: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

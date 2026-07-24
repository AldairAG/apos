import { COLORS, POSIcon } from '@/components/pos';
import { useMateriales } from '@/features/inventario/materiales';
import { CreateGrupoExtraDTO, CreateOpcionExtraDTO, GrupoExtra } from '@/features/producto/grupoExtra/grupoExtra.types';
import { useExtra } from '@/features/producto/grupoExtra/useExtra';
import { useProducto } from '@/features/producto/producto/useProducto';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

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
  const { productos, loading: loadingProductos, cargarProductos } = useProducto();

  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMaterialVisible, setModalMaterialVisible] = useState(false);
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<GrupoExtra | null>(null);
  const [opcionEditandoIndex, setOpcionEditandoIndex] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

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

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del grupo es requerido');
      return;
    }

    const opcionesValidas = opciones;

    if (opcionesValidas.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos una opción válida');
      return;
    }

    const opcionesDTO: CreateOpcionExtraDTO[] = opcionesValidas.map((op) => ({
      nombre: op.nombre,
      precio: parseFloat(op.precio) || 0,
      materialId: op.materialId!,
    }));

    const grupoDTO: CreateGrupoExtraDTO = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      opciones: opcionesDTO,
      productosIds: productosSeleccionados,
    };

    setGuardando(true);
    await saveGrupo(grupoDTO);
    setGuardando(false);
    handleCerrarModal();
  };

  const renderGrupoItem = ({ item }: { item: GrupoExtra }) => {
    // Mock: conteo de productos asociados (en producción vendría del backend)
    const productosAsociados = Math.floor(Math.random() * 8) + 1;

    return (
      <View style={styles.grupoCard}>
        <View style={styles.grupoHeader}>
          <Text style={styles.grupoNombre} numberOfLines={1}>{item.nombre}</Text>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: item.activo ? COLORS.success : '#D9D9D0' },
            ]}
          >
            <Text style={styles.estadoBadgeTexto}>{item.activo ? 'ACTIVO' : 'INACTIVO'}</Text>
          </View>
        </View>

        <Text style={styles.grupoDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.grupoInfoGrid}>
          <View style={styles.grupoInfoItem}>
            <POSIcon name="list-outline" size={16} color={INK} />
            <Text style={styles.grupoInfoLabel}>OPCIONES</Text>
            <Text style={styles.grupoInfoValue}>{item.opciones.length}</Text>
          </View>

          <View style={styles.grupoInfoItem}>
            <POSIcon name="fast-food-outline" size={16} color={INK} />
            <Text style={styles.grupoInfoLabel}>PRODUCTOS</Text>
            <Text style={styles.grupoInfoValue}>{productosAsociados}</Text>
          </View>
        </View>

        <View style={styles.grupoAcciones}>
          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEditar, hardShadow(pressed)]}
            onPress={() => handleEditar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="create-outline" size={18} color={INK} />
            <Text style={styles.botonAccionTexto}>EDITAR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEliminar, hardShadow(pressed)]}
            onPress={() => handleEliminar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="trash-outline" size={18} color={INK} />
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
          <Text style={styles.title}>GRUPOS DE EXTRAS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{gruposFiltrados.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Gestiona complementos para tus productos</Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={INK} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar grupo..."
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
          <Text style={styles.loadingText}>Cargando grupos...</Text>
        </View>
      )}

      {/* Lista de Grupos */}
      {!loading && (
        <FlatList
          data={gruposFiltrados}
          renderItem={renderGrupoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <POSIcon name="albums-outline" size={44} color={INK} />
              </View>
              <Text style={styles.emptyTexto}>
                {busqueda ? 'SIN RESULTADOS' : 'AÚN NO HAY GRUPOS'}
              </Text>
              <Text style={styles.emptySubtexto}>
                {busqueda ? 'Intenta con otra búsqueda' : 'Toca "+" para crear el primero'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB Button */}
      <Pressable
        style={({ pressed }) => [styles.fabButton, hardShadow(pressed)]}
        onPress={handleNuevo}
        android_ripple={RIPPLE}
      >
        <POSIcon name="add" size={28} color={INK} />
      </Pressable>

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
                {grupoEditando ? 'EDITAR GRUPO' : 'NUEVO GRUPO'}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            {/* Contenido del Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información del Grupo */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>INFORMACIÓN DEL GRUPO</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>NOMBRE *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Ingredientes Extra"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
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

                <View style={styles.switchBox}>
                  <View style={styles.switchLabel}>
                    <POSIcon name="power" size={18} color={INK} />
                    <Text style={styles.switchText}>GRUPO ACTIVO</Text>
                  </View>
                  <Switch
                    value={formData.activo}
                    onValueChange={(value) => setFormData({ ...formData, activo: value })}
                    trackColor={{ false: '#D9D9D0', true: COLORS.success }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>

              {/* Sección: Opciones del Grupo */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>OPCIONES DEL GRUPO</Text>
                  <Pressable
                    style={({ pressed }) => [styles.botonAgregar, hardShadow(pressed)]}
                    onPress={handleAgregarOpcion}
                    android_ripple={RIPPLE}
                  >
                    <POSIcon name="add-circle" size={18} color={INK} />
                    <Text style={styles.botonAgregarTexto}>AGREGAR</Text>
                  </Pressable>
                </View>

                {opciones.length === 0 ? (
                  <View style={styles.opcionesVacio}>
                    <POSIcon name="cube-outline" size={40} color={INK} />
                    <Text style={styles.opcionesVacioTexto}>SIN OPCIONES</Text>
                    <Text style={styles.opcionesVacioSubtexto}>
                      Agrega opciones de extras
                    </Text>
                  </View>
                ) : (
                  <View style={styles.opcionesLista}>
                    {opciones.map((opcion, index) => {
                      const materialSeleccionado = materiales.find((m) => m.id === opcion.materialId);

                      return (
                        <View key={opcion.tempId} style={styles.opcionCard}>
                          <View style={styles.opcionHeader}>
                            <View style={styles.opcionNumero}>
                              <Text style={styles.opcionNumeroTexto}>{index + 1}</Text>
                            </View>
                            <Pressable
                              style={styles.botonEliminarOpcion}
                              onPress={() => handleEliminarOpcion(index)}
                              hitSlop={8}
                            >
                              <POSIcon name="close-circle" size={24} color={COLORS.danger} />
                            </Pressable>
                          </View>

                          <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>NOMBRE *</Text>
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
                              <Text style={styles.formLabel}>PRECIO</Text>
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
                              <Text style={styles.formLabel}>MATERIAL *</Text>
                              <Pressable
                                style={({ pressed }) => [styles.materialSelector, hardShadow(pressed)]}
                                onPress={() => {
                                  setOpcionEditandoIndex(index);
                                  setModalMaterialVisible(true);
                                }}
                                android_ripple={RIPPLE}
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
                                    <View style={styles.materialSelectorCirculo} />
                                    <Text style={[styles.materialSelectorTexto, styles.materialSelectorPlaceholder]}>
                                      Seleccionar
                                    </Text>
                                  </>
                                )}
                              </Pressable>
                            </View>
                          </View>

                          <View style={styles.switchBoxCompacto}>
                            <Text style={styles.switchTextSmall}>OPCIÓN ACTIVA</Text>
                            <Switch
                              value={opcion.activo}
                              onValueChange={(value) => handleActualizarOpcion(index, 'activo', value)}
                              trackColor={{ false: '#D9D9D0', true: COLORS.success }}
                              thumbColor={COLORS.white}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Sección: Productos Asociados */}
              <View style={[styles.seccionFormulario, styles.ultimaSeccion]}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>PRODUCTOS ASOCIADOS</Text>
                  <View style={styles.contadorProductos}>
                    <POSIcon name="checkmark-circle" size={15} color={INK} />
                    <Text style={styles.contadorProductosTexto}>
                      {productosSeleccionados.length} SELECCIONADOS
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.botonSeleccionarProductos, hardShadow(pressed)]}
                  onPress={() => setModalProductosVisible(true)}
                  android_ripple={RIPPLE}
                >
                  <POSIcon name="fast-food-outline" size={20} color={INK} />
                  <Text style={styles.botonSeleccionarProductosTexto}>
                    SELECCIONAR PRODUCTOS
                  </Text>
                  <POSIcon name="chevron-forward" size={20} color={INK} />
                </Pressable>

                {productosSeleccionados.length > 0 && (
                  <View style={styles.productosSeleccionadosLista}>
                    {productosSeleccionados.map((prodId) => {
                      const producto = productos.find((p) => p.id === prodId);
                      return producto ? (
                        <View key={prodId} style={styles.chipProducto}>
                          <Text style={styles.chipProductoTexto} numberOfLines={1}>{producto.nombre}</Text>
                          <Pressable onPress={() => handleToggleProducto(prodId)} hitSlop={8}>
                            <POSIcon name="close" size={16} color={INK} />
                          </Pressable>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonCancelar, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                android_ripple={RIPPLE}
                disabled={guardando}
              >
                <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonGuardar, hardShadow(pressed)]}
                onPress={handleGuardar}
                android_ripple={RIPPLE}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color={INK} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>
                    {grupoEditando ? 'ACTUALIZAR' : 'CREAR GRUPO'}
                  </Text>
                )}
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
          <View style={styles.modalSecundarioContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>SELECCIONAR MATERIAL</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalMaterialVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            <ScrollView style={styles.materialesDisponiblesLista}>
              {materiales.map((material) => (
                <Pressable
                  key={material.id}
                  style={({ pressed }) => [styles.materialDisponibleItem, hardShadow(pressed)]}
                  onPress={() => handleSeleccionarMaterial(material.id)}
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
                    <POSIcon name="add" size={18} color={INK} />
                  </View>
                </Pressable>
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
          <View style={styles.modalSecundarioContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>SELECCIONAR PRODUCTOS</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalProductosVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            {/* Buscador de Productos */}
            <View style={styles.busquedaProductoContainer}>
              <POSIcon name="search" size={20} color={INK} />
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
              {productos
                .filter((p) => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()))
                .map((producto) => {
                  const isSeleccionado = productosSeleccionados.includes(producto.id);

                  return (
                    <Pressable
                      key={producto.id}
                      style={({ pressed }) => [
                        styles.productoItem,
                        isSeleccionado && styles.productoItemSeleccionado,
                        hardShadow(pressed),
                      ]}
                      onPress={() => handleToggleProducto(producto.id)}
                      android_ripple={RIPPLE}
                    >
                      <View style={styles.productoItemInfo}>
                        <Text style={styles.productoItemNombre} numberOfLines={1}>{producto.nombre}</Text>
                        <Text style={styles.productoItemCategoria}>{producto.categoria.descripcion}</Text>
                      </View>
                      {isSeleccionado ? (
                        <POSIcon name="checkmark-circle" size={26} color={COLORS.success} />
                      ) : (
                        <View style={styles.productoItemCirculo} />
                      )}
                    </Pressable>
                  );
                })}
            </ScrollView>

            {/* Botón Confirmar */}
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonGuardar, { flex: 1 }, hardShadow(pressed)]}
                onPress={() => setModalProductosVisible(false)}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonGuardarTexto}>
                  CONFIRMAR ({productosSeleccionados.length})
                </Text>
              </Pressable>
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
    fontSize: 22,
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

  // ── Lista ────────────────────────────────────────────────────────────────
  listContainer: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Tarjeta Grupo ───────────────────────────────────────────────────────
  grupoCard: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  grupoNombre: {
    fontSize: 19,
    fontWeight: '800',
    color: INK,
    flex: 1,
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
  grupoDescripcion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── Grid de información ────────────────────────────────────────────────
  grupoInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  grupoInfoItem: {
    flex: 1,
    backgroundColor: '#F1F1EC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    gap: 4,
  },
  grupoInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  grupoInfoValue: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },

  // ── Acciones ─────────────────────────────────────────────────────────────
  grupoAcciones: {
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
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalSecundarioContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '80%',
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
    fontSize: 16,
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
    maxHeight: '75%',
  },

  // ── Formulario ──────────────────────────────────────────────────────────
  seccionFormulario: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#EDEDE6',
  },
  ultimaSeccion: {
    borderBottomWidth: 0,
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
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // ── Switch ──────────────────────────────────────────────────────────────
  switchBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  switchBoxCompacto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    backgroundColor: '#F1F1EC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: INK,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
  switchTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
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

  // ── Opciones Vacío ──────────────────────────────────────────────────────
  opcionesVacio: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: 'dashed',
    gap: 4,
  },
  opcionesVacioTexto: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginTop: 8,
  },
  opcionesVacioSubtexto: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // ── Lista de Opciones ───────────────────────────────────────────────────
  opcionesLista: {
    gap: 16,
  },
  opcionCard: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
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
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcionNumeroTexto: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  botonEliminarOpcion: {
    padding: 4,
  },

  // ── Precio ──────────────────────────────────────────────────────────────
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    paddingHorizontal: 16,
  },
  precioSimbolo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success,
    marginRight: 8,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },

  // ── Material Selector ───────────────────────────────────────────────────
  materialSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: INK,
    gap: 8,
  },
  materialSelectorTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  materialSelectorPlaceholder: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  materialSelectorCirculo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
  },

  // ── Productos Asociados ─────────────────────────────────────────────────
  contadorProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
    gap: 5,
  },
  contadorProductosTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
  botonSeleccionarProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: INK,
    gap: 10,
  },
  botonSeleccionarProductosTexto: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
    marginLeft: 4,
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
    backgroundColor: COLORS.info,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: INK,
    gap: 8,
    maxWidth: '100%',
  },
  chipProductoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    maxWidth: 160,
  },

  // ── Botones Modal ────────────────────────────────────────────────────────
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: BORDER_W,
    borderTopColor: INK,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Modal Productos ─────────────────────────────────────────────────────
  busquedaProductoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 14,
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: INK,
    height: 50,
    gap: 10,
  },
  productosLista: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  productoItemSeleccionado: {
    backgroundColor: '#EAF7EF',
    borderWidth: BORDER_W,
  },
  productoItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  productoItemNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  productoItemCategoria: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  productoItemCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
  },
});
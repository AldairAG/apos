import { COLORS, POSIcon } from '@/components/pos';
import { Categoria } from '@/features/producto/categoria/categoria.types';
import { useCategoria } from '@/features/producto/categoria/useCategoria';
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

// Mock: Conteo de productos por categoría
const MOCK_PRODUCTOS_POR_CATEGORIA: { [key: number]: number } = {
  1: 12,
  2: 8,
  3: 15,
  4: 6,
  5: 10,
};

export default function CategoriasScreen() {
  const { categorias, loading, error, cargarCategorias, saveCategoria } = useCategoria();

  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (categoriaEditando) {
      setFormData({
        nombre: categoriaEditando.nombre,
        descripcion: categoriaEditando.descripcion,
        activo: categoriaEditando.activo,
      });
    } else {
      setFormData({ nombre: '', descripcion: '', activo: true });
    }
  }, [categoriaEditando]);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleNueva = () => {
    setCategoriaEditando(null);
    setModalVisible(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setModalVisible(true);
  };

  const handleEliminar = (categoria: Categoria) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de eliminar "${categoria.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => console.log('Eliminar:', categoria.id) }
      ]
    );
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setCategoriaEditando(null);
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return;
    }

    const data = categoriaEditando
      ? { id: categoriaEditando.id, nombre: formData.nombre }
      : { nombre: formData.nombre };

    setGuardando(true);
    const result = await saveCategoria(data);
    setGuardando(false);

    if (result.success) {
      Alert.alert('Éxito', `Categoría ${categoriaEditando ? 'actualizada' : 'creada'} correctamente`);
      handleCerrarModal();
    } else {
      Alert.alert('Error', result.error || 'Ocurrió un error al guardar la categoría');
    }
  };

  const renderCategoriaItem = ({ item }: { item: Categoria }) => {
    const productosAsociados = MOCK_PRODUCTOS_POR_CATEGORIA[item.id] || Math.floor(Math.random() * 15) + 1;

    return (
      <View style={styles.categoriaCard}>
        <View style={styles.categoriaHeader}>
          <Text style={styles.categoriaNombre} numberOfLines={1}>{item.nombre}</Text>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: item.activo ? COLORS.success : '#D9D9D0' },
            ]}
          >
            <Text style={styles.estadoBadgeTexto}>{item.activo ? 'ACTIVA' : 'INACTIVA'}</Text>
          </View>
        </View>

        {item.descripcion && (
          <Text style={styles.categoriaDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        <View style={styles.categoriaInfoGrid}>
          <View style={styles.categoriaInfoItem}>
            <POSIcon name="fast-food-outline" size={16} color={INK} />
            <Text style={styles.categoriaInfoLabel}>PRODUCTOS</Text>
            <Text style={styles.categoriaInfoValue}>{productosAsociados}</Text>
          </View>

          <View style={styles.categoriaInfoItem}>
            <POSIcon name="reorder-three-outline" size={16} color={INK} />
            <Text style={styles.categoriaInfoLabel}>ORDEN</Text>
            <Text style={styles.categoriaInfoValue}>{item.orden}</Text>
          </View>
        </View>

        <View style={styles.categoriaAcciones}>
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
          <Text style={styles.title}>CATEGORÍAS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{categoriasFiltradas.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Organiza tu menú por categorías</Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={INK} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar categoría..."
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
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      )}

      {/* Lista de Categorías */}
      {!loading && (
        <FlatList
          data={categoriasFiltradas}
          renderItem={renderCategoriaItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <POSIcon name="albums-outline" size={44} color={INK} />
              </View>
              <Text style={styles.emptyTexto}>
                {busqueda ? 'SIN RESULTADOS' : 'AÚN NO HAY CATEGORÍAS'}
              </Text>
              <Text style={styles.emptySubtexto}>
                {busqueda ? 'Intenta con otra búsqueda' : 'Toca "+" para crear la primera'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB Button */}
      <Pressable
        style={({ pressed }) => [styles.fabButton, hardShadow(pressed)]}
        onPress={handleNueva}
        android_ripple={RIPPLE}
      >
        <POSIcon name="add" size={28} color={INK} />
      </Pressable>

      {/* Modal Crear/Editar Categoría */}
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
                {categoriaEditando ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
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
              {/* Sección: Información de la Categoría */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>INFORMACIÓN DE LA CATEGORÍA</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>NOMBRE *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Bebidas, Comidas, Postres..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="Describe la categoría"
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
                    <Text style={styles.switchText}>CATEGORÍA ACTIVA</Text>
                  </View>
                  <Switch
                    value={formData.activo}
                    onValueChange={(value) => setFormData({ ...formData, activo: value })}
                    trackColor={{ false: '#D9D9D0', true: COLORS.success }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>

              {/* Sección: Vista Previa de Productos (Mock) */}
              {categoriaEditando && (
                <View style={[styles.seccionFormulario, styles.ultimaSeccion]}>
                  <View style={styles.seccionHeader}>
                    <Text style={styles.seccionTitulo}>PRODUCTOS ASOCIADOS</Text>
                    <View style={styles.contadorProductos}>
                      <POSIcon name="fast-food-outline" size={15} color={INK} />
                      <Text style={styles.contadorProductosTexto}>
                        {MOCK_PRODUCTOS_POR_CATEGORIA[categoriaEditando.id] || 0} PRODUCTOS
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productosPreview}>
                    <View style={styles.productosPreviewIconBadge}>
                      <POSIcon name="information-circle-outline" size={30} color={INK} />
                    </View>
                    <Text style={styles.productosPreviewTexto}>
                      Los productos de esta categoría aparecerán aquí
                    </Text>
                  </View>
                </View>
              )}
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
                    {categoriaEditando ? 'ACTUALIZAR' : 'CREAR CATEGORÍA'}
                  </Text>
                )}
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

  // ── Tarjeta Categoría ───────────────────────────────────────────────────
  categoriaCard: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  categoriaNombre: {
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
  categoriaDescripcion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── Grid de información ────────────────────────────────────────────────
  categoriaInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  categoriaInfoItem: {
    flex: 1,
    backgroundColor: '#F1F1EC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    gap: 4,
  },
  categoriaInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriaInfoValue: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },

  // ── Acciones ─────────────────────────────────────────────────────────────
  categoriaAcciones: {
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
    maxHeight: '85%',
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
    maxHeight: '65%',
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

  // ── Productos Preview ───────────────────────────────────────────────────
  contadorProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
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
  productosPreview: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: 'dashed',
    gap: 6,
  },
  productosPreviewIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  productosPreviewTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
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
});
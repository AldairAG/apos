import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, FlatList, Modal, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { POSCard, POSBadge, POSIcon, COLORS } from '@/components/pos';
import { useCategoria } from '@/features/producto/categoria/useCategoria';
import { Categoria } from '@/features/producto/categoria/categoria.types';

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

    const result = await saveCategoria(data);
    
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
      <POSCard style={styles.categoriaCard} variant="elevated">
        <View style={styles.categoriaHeader}>
          <View style={styles.categoriaHeaderLeft}>
            <Text style={styles.categoriaNombre}>{item.nombre}</Text>
            <POSBadge 
              label={item.activo ? 'ACTIVA' : 'INACTIVA'} 
              variant={item.activo ? 'success' : 'default'}
              size="small"
            />
          </View>
        </View>

        {item.descripcion && (
          <Text style={styles.categoriaDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        <View style={styles.categoriaInfoGrid}>
          <View style={styles.categoriaInfoItem}>
            <POSIcon name="fast-food-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.categoriaInfoLabel}>Productos</Text>
            <Text style={styles.categoriaInfoValue}>{productosAsociados}</Text>
          </View>

          <View style={styles.categoriaInfoItem}>
            <POSIcon name="reorder-three-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.categoriaInfoLabel}>Orden</Text>
            <Text style={styles.categoriaInfoValue}>{item.orden}</Text>
          </View>
        </View>

        <View style={styles.categoriaAcciones}>
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
          <Text style={styles.title}>Categorías</Text>
          <POSBadge 
            label={`${categoriasFiltradas.length} categorías`} 
            variant="info"
          />
        </View>
        <Text style={styles.subtitle}>
          Organiza tu menú por categorías
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
        
        <TouchableOpacity style={styles.tabActive}>
          <POSIcon name="grid-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tabTextActive}>Categorías</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/extras')}
        >
          <POSIcon name="add-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.tabText}>Extras</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar categoría..."
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

      {/* Lista de Categorías */}
      <FlatList
        data={categoriasFiltradas}
        renderItem={renderCategoriaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <POSIcon name="albums-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyTexto}>No hay categorías</Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea tu primera categoría'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNueva}>
        <POSIcon name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

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
                {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={handleCerrarModal}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Contenido del Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información de la Categoría */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Información de la Categoría</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Bebidas, Comidas, Postres..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descripción</Text>
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

                <View style={styles.switchContainer}>
                  <View style={styles.switchLabel}>
                    <POSIcon name="power" size={20} color={formData.activo ? COLORS.success : COLORS.textSecondary} />
                    <Text style={styles.switchText}>Categoría Activa</Text>
                  </View>
                  <Switch
                    value={formData.activo}
                    onValueChange={(value) => setFormData({ ...formData, activo: value })}
                    trackColor={{ false: COLORS.border, true: COLORS.success }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>

              {/* Sección: Vista Previa de Productos (Mock) */}
              {categoriaEditando && (
                <View style={styles.seccionFormulario}>
                  <View style={styles.seccionHeader}>
                    <Text style={styles.seccionTitulo}>Productos Asociados</Text>
                    <View style={styles.contadorProductos}>
                      <POSIcon name="fast-food-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.contadorProductosTexto}>
                        {MOCK_PRODUCTOS_POR_CATEGORIA[categoriaEditando.id] || 0} productos
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productosPreview}>
                    <POSIcon name="information-circle-outline" size={48} color={COLORS.info} />
                    <Text style={styles.productosPreviewTexto}>
                      Los productos de esta categoría aparecerán aquí
                    </Text>
                  </View>
                </View>
              )}
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
                  {categoriaEditando ? 'Actualizar' : 'Crear Categoría'}
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
  
  // Tarjeta Categoría
  categoriaCard: {
    marginBottom: 16,
    padding: 16,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoriaHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoriaNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  categoriaDescripcion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // Grid de información
  categoriaInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  categoriaInfoItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  categoriaInfoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriaInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Acciones
  categoriaAcciones: {
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
    maxHeight: '85%',
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

  // Productos Preview
  contadorProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  contadorProductosTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  productosPreview: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  productosPreviewTexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
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
});

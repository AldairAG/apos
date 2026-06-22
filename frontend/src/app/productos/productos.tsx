import { createProductoDTO, Producto } from '@/features/producto/producto/producto.types';
import { router } from 'expo-router';
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
import { useCategoria } from '@/features/producto/categoria/useCategoria';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { useProducto } from '@/features/producto/producto/useProducto';
import { useSucursal } from '@/features/sucursal/useSucursal';


export default function ProductosScreen() {

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const {sucursalActual}= useSucursal()
  const {categorias,cargarCategorias}=useCategoria()
  const {recetas,cargarRecetas}=useRecetas()
  const {selectedProducto, productos, loading, error, saveProducto, cargarProductos}=useProducto()


  // Form fields
  const [formData, setFormData] = useState<createProductoDTO>({
    nombre: '',
    descripcion: '',
    precioVenta: 0,
    costo: 0,
    margen: 0,
    tiempoPreparacion: 0,
    activo: false,
    destacado: false,
    categoriaId: 0,
    recetaId: 0,
    gruposExtra: [],
  });


  const handleSearch = () => {

  };

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
    } else {
    }
    setModalVisible(true);
  };

  const handleDelete = (producto: Producto) => {

  };

  const handleSubmit = () => {
    if (!formData.nombre || !formData.precioVenta || !formData.categoriaId) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }
    saveProducto(formData);
    setModalVisible(false);
    /* resetForm(); */
  };


  const handleToggleDisponibilidad = async (producto: Producto) => {

  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <View style={styles.badges}>
          {item.destacado && <Text style={styles.badgeDestacado}>★</Text>}
          <Text style={[styles.badge, item.disponible ? styles.badgeAvailable : styles.badgeUnavailable]}>
            {item.disponible ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{item.descripcion}</Text>
      <Text style={styles.cardCategory}>Categoría: {item.categoria.nombre}</Text>
      <View style={styles.cardPricing}>
        <Text style={styles.cardPrice}>Precio: ${item.precioVenta}</Text>
        <Text style={styles.cardCost}>Costo: ${item.costo}</Text>
        <Text style={styles.cardMargin}>Margen: {item.margen}%</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.btnSmall, item.disponible ? styles.btnWarning : styles.btnSuccess]}
          onPress={() => handleToggleDisponibilidad(item)}
        >
          <Text style={styles.btnText}>{item.disponible ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSmall, styles.btnPrimary]} onPress={() => openModal(item)}>
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSmall, styles.btnDanger]} onPress={() => handleDelete(item)}>
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!sucursalActual) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Seleccione una sucursal</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Productos</Text>

      {/* Navigation Tabs */}
      <View style={styles.navigationTabs}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/config/categorias')}
        >
          <Text style={styles.tabText}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/extras')}
        >
          <Text style={styles.tabText}>Grupos Extra</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.btnSearch} onPress={handleSearch}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.btnAdd} onPress={() => openModal()}>
        <Text style={styles.btnText}>+ Nuevo Producto</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {/* Products List */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No hay productos disponibles</Text> : null
        }
      />

      {/* Modal for Create/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput style={styles.input} value={formData.nombre} onChangeText={(text) => setFormData({ ...formData, nombre: text })} />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                multiline
              />

              <Text style={styles.label}>Precio de Venta *</Text>
              <TextInput
                style={styles.input}
                value={formData.precioVenta.toString()}
                onChangeText={(text) => setFormData({ ...formData, precioVenta: Number(text) })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Costo</Text>
              <TextInput style={styles.input} value={formData.costo.toString()  } onChangeText={(text) => setFormData({ ...formData, costo: Number(text) })} keyboardType="numeric" />

              <Text style={styles.label}>Tiempo de Preparación (min)</Text>
              <TextInput
                style={styles.input}
                value={formData.tiempoPreparacion.toString()}
                onChangeText={(text) => setFormData({ ...formData, tiempoPreparacion: Number(text) })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Categoría *</Text>
              <ScrollView horizontal style={styles.chipContainer}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, formData.categoriaId === cat.id && styles.chipSelected]}
                    onPress={() => setFormData({ ...formData, categoriaId: cat.id })}
                  >
                    <Text style={styles.chipText}>{cat.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {!editingProducto && (
                <>
                  <Text style={styles.label}>Receta *</Text>
                  <ScrollView horizontal style={styles.chipContainer}>
                    {recetas.map((receta) => (
                      <TouchableOpacity
                        key={receta.id}
                        style={[styles.chip, formData.recetaId === receta.id && styles.chipSelected]}
                        onPress={() => setFormData({ ...formData, recetaId: receta.id })}
                      >
                        <Text style={styles.chipText}>{receta.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, destacado: !formData.destacado })}
              >
                <View style={[styles.checkbox, formData.destacado && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Producto Destacado</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btnModal, styles.btnSecondary]}
                  onPress={() => {
                    setModalVisible(false);
                    /* resetForm(); */
                  }}
                >
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnModal, styles.btnPrimary]} onPress={handleSubmit} >
                  <Text style={styles.btnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  navigationTabs: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  btnSearch: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  btnAdd: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeDestacado: {
    fontSize: 20,
    marginRight: 5,
    color: '#FFD700',
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeAvailable: {
    backgroundColor: '#34C759',
    color: '#fff',
  },
  badgeUnavailable: {
    backgroundColor: '#FF3B30',
    color: '#fff',
  },
  cardDescription: {
    color: '#666',
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  cardPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardPrice: {
    fontWeight: 'bold',
    color: '#34C759',
  },
  cardCost: {
    color: '#666',
  },
  cardMargin: {
    color: '#FF9500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnSmall: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
  },
  btnDanger: {
    backgroundColor: '#FF3B30',
  },
  btnWarning: {
    backgroundColor: '#FF9500',
  },
  btnSuccess: {
    backgroundColor: '#34C759',
  },
  btnSecondary: {
    backgroundColor: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnModal: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

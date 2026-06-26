import { Categoria } from '@/features/producto/categoria/categoria.types';
import { useCategoria } from '@/features/producto/categoria/useCategoria';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CategoriasScreen() {

  const { categorias, selectedCategoria, loading, error, cargarCategorias, saveCategoria } = useCategoria();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  // Form fields
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const openModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setNombre(categoria.nombre);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingCategoria(null);
    setNombre('');
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      const data = editingCategoria
        ? { id: editingCategoria.id, nombre }
        : { nombre };
      const result = await saveCategoria(data);
      if (result.success) {
        Alert.alert('Éxito', `Categoría ${editingCategoria ? 'actualizada' : 'creada'} correctamente`);
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Error', result.error || 'Ocurrió un error al guardar la categoría');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la categoría');
    }
  };

  const handleDelete = (categoria: Categoria) => {

  };

  const renderCategoria = ({ item }: { item: Categoria }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardOrden}>Orden: {item.orden}</Text>
        </View>
        <View style={[styles.badge, item.activo ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.activo ? 'Activa' : 'Inactiva'}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{item.descripcion}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.btnSmall, styles.btnPrimary]} onPress={() => openModal(item)}>
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSmall, styles.btnDanger]} onPress={() => handleDelete(item)}>
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Categorías</Text>

      {/* Navigation Tabs */}
      <View style={styles.navigationTabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/productos')}
        >
          <Text style={styles.tabText}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/extras')}
        >
          <Text style={styles.tabText}>Grupos Extra</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.btnAdd} onPress={() => openModal()}>
        <Text style={styles.btnText}>+ Nueva Categoría</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {/* Categories List */}
      <FlatList
        data={categorias}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No hay categorías disponibles</Text> : null
        }
      />

      {/* Modal for Create/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Bebidas, Comidas, Postres..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnSecondary]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnModal, styles.btnPrimary]} onPress={handleSubmit}>
                <Text style={styles.btnText}>Guardar</Text>
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
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardOrden: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#34C759',
  },
  badgeInactive: {
    backgroundColor: '#8E8E93',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#666',
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnSmall: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
  },
  btnDanger: {
    backgroundColor: '#FF3B30',
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

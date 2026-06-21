import { setSelectedGrupo } from '@/features/producto/grupoExtra/grupoExtra.slice';
import {
    createGrupoExtra,
    createOpcionExtra,
    deleteGrupoExtra,
    deleteOpcionExtra,
    updateGrupoExtra,
    updateOpcionExtra
} from '@/features/producto/grupoExtra/grupoExtra.thunk';
import { GrupoExtra, OpcionExtra } from '@/features/producto/grupoExtra/grupoExtra.types';
import { AppDispatch, RootState } from '@/store';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';

export default function ExtrasScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { grupos, selectedGrupo, loading, error } = useSelector((state: RootState) => state.gruposExtra);
  const { materiales } = useSelector((state: RootState) => state.materiales);
  const { sucursalActual } = useSelector((state: RootState) => state.sucursal);

  const [modalGrupoVisible, setModalGrupoVisible] = useState(false);
  const [modalOpcionVisible, setModalOpcionVisible] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoExtra | null>(null);
  const [editingOpcion, setEditingOpcion] = useState<OpcionExtra | null>(null);

  // Form fields for Grupo
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [descripcionGrupo, setDescripcionGrupo] = useState('');

  // Form fields for Opcion
  const [nombreOpcion, setNombreOpcion] = useState('');
  const [precioOpcion, setPrecioOpcion] = useState('');
  const [materialIdOpcion, setMaterialIdOpcion] = useState<number | null>(null);


  // ========== Grupo Extra Functions ==========
  const openGrupoModal = (grupo?: GrupoExtra) => {
    if (grupo) {
      setEditingGrupo(grupo);
      setNombreGrupo(grupo.nombre);
      setDescripcionGrupo(grupo.descripcion);
    } else {
      resetGrupoForm();
    }
    setModalGrupoVisible(true);
  };

  const resetGrupoForm = () => {
    setEditingGrupo(null);
    setNombreGrupo('');
    setDescripcionGrupo('');
  };

  const handleGrupoSubmit = async () => {
    if (!nombreGrupo.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      if (editingGrupo) {
        await dispatch(
          updateGrupoExtra({
            id: editingGrupo.id,
            data: { nombre: nombreGrupo, descripcion: descripcionGrupo },
          })
        ).unwrap();
        Alert.alert('Éxito', 'Grupo actualizado');
      } else {
        await dispatch(
          createGrupoExtra({ nombre: nombreGrupo, descripcion: descripcionGrupo })
        ).unwrap();
        Alert.alert('Éxito', 'Grupo creado');
      }
      setModalGrupoVisible(false);
      resetGrupoForm();
    } catch (err: any) {
      Alert.alert('Error', err || 'Error al guardar grupo');
    }
  };

  const handleGrupoDelete = (grupo: GrupoExtra) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar el grupo "${grupo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGrupoExtra(grupo.id)).unwrap();
              Alert.alert('Éxito', 'Grupo eliminado');
              if (selectedGrupo?.id === grupo.id) {
                dispatch(setSelectedGrupo(null));
              }
            } catch (err: any) {
              Alert.alert('Error', err || 'Error al eliminar');
            }
          },
        },
      ]
    );
  };

  // ========== Opcion Extra Functions ==========
  const openOpcionModal = (opcion?: OpcionExtra) => {
    if (!selectedGrupo) {
      Alert.alert('Error', 'Seleccione un grupo primero');
      return;
    }

    if (opcion) {
      setEditingOpcion(opcion);
      setNombreOpcion(opcion.nombre);
      setPrecioOpcion(opcion.precio.toString());
      setMaterialIdOpcion(opcion.materialId);
    } else {
      resetOpcionForm();
    }
    setModalOpcionVisible(true);
  };

  const resetOpcionForm = () => {
    setEditingOpcion(null);
    setNombreOpcion('');
    setPrecioOpcion('');
    setMaterialIdOpcion(null);
  };

  const handleOpcionSubmit = async () => {
    if (!nombreOpcion.trim() || !materialIdOpcion || !selectedGrupo) {
      Alert.alert('Error', 'Nombre y material son obligatorios');
      return;
    }

    try {
      if (editingOpcion) {
        await dispatch(
          updateOpcionExtra({
            id: editingOpcion.id,
            data: {
              nombre: nombreOpcion,
              precio: parseFloat(precioOpcion) || 0,
              materialId: materialIdOpcion,
            },
          })
        ).unwrap();
        Alert.alert('Éxito', 'Opción actualizada');
      } else {
        await dispatch(
          createOpcionExtra({
            nombre: nombreOpcion,
            precio: parseFloat(precioOpcion) || 0,
            grupoExtraId: selectedGrupo.id,
            materialId: materialIdOpcion,
          })
        ).unwrap();
        Alert.alert('Éxito', 'Opción creada');
      }
      setModalOpcionVisible(false);
      resetOpcionForm();
    } catch (err: any) {
      Alert.alert('Error', err || 'Error al guardar opción');
    }
  };

  const handleOpcionDelete = (opcion: OpcionExtra) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar la opción "${opcion.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteOpcionExtra(opcion.id)).unwrap();
              Alert.alert('Éxito', 'Opción eliminada');
            } catch (err: any) {
              Alert.alert('Error', err || 'Error al eliminar');
            }
          },
        },
      ]
    );
  };

  // ========== Render Functions ==========
  const renderGrupo = ({ item }: { item: GrupoExtra }) => {
    const isSelected = selectedGrupo?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => dispatch(setSelectedGrupo(item))}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <View style={[styles.badge, item.activo ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{item.descripcion}</Text>
        <Text style={styles.cardInfo}>Opciones: {item.opciones?.length || 0}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.btnSmall, styles.btnPrimary]} onPress={() => openGrupoModal(item)}>
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSmall, styles.btnDanger]} onPress={() => handleGrupoDelete(item)}>
            <Text style={styles.btnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOpcion = ({ item }: { item: OpcionExtra }) => (
    <View style={styles.opcionCard}>
      <View style={styles.opcionInfo}>
        <Text style={styles.opcionNombre}>{item.nombre}</Text>
        <Text style={styles.opcionPrecio}>+ ${item.precio}</Text>
      </View>
      <View style={styles.opcionActions}>
        <TouchableOpacity style={[styles.btnTiny, styles.btnPrimary]} onPress={() => openOpcionModal(item)}>
          <Text style={styles.btnTextTiny}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnTiny, styles.btnDanger]} onPress={() => handleOpcionDelete(item)}>
          <Text style={styles.btnTextTiny}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Extras</Text>

      {/* Navigation Tabs */}
      <View style={styles.navigationTabs}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.push('/productos/productos')}
        >
          <Text style={styles.tabText}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.push('/config/categorias')}
        >
          <Text style={styles.tabText}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Grupos Extra</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.splitContainer}>
        {/* Left Side: Grupos Extra */}
        <View style={styles.leftPanel}>
          <Text style={styles.sectionTitle}>Grupos Extra</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => openGrupoModal()}>
            <Text style={styles.btnText}>+ Nuevo Grupo</Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}
          {loading && <ActivityIndicator size="large" color="#007AFF" />}

          <FlatList
            data={grupos}
            renderItem={renderGrupo}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              !loading ? <Text style={styles.emptyText}>No hay grupos disponibles</Text> : null
            }
          />
        </View>

        {/* Right Side: Opciones del Grupo Seleccionado */}
        <View style={styles.rightPanel}>
          {selectedGrupo ? (
            <>
              <Text style={styles.sectionTitle}>Opciones de: {selectedGrupo.nombre}</Text>
              <TouchableOpacity style={styles.btnAdd} onPress={() => openOpcionModal()}>
                <Text style={styles.btnText}>+ Nueva Opción</Text>
              </TouchableOpacity>

              <FlatList
                data={selectedGrupo.opciones || []}
                renderItem={renderOpcion}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay opciones</Text>}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Seleccione un grupo para ver sus opciones</Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal for Grupo */}
      <Modal visible={modalGrupoVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={nombreGrupo} onChangeText={setNombreGrupo} />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcionGrupo}
              onChangeText={setDescripcionGrupo}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnSecondary]}
                onPress={() => {
                  setModalGrupoVisible(false);
                  resetGrupoForm();
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnModal, styles.btnPrimary]} onPress={handleGrupoSubmit}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Opcion */}
      <Modal visible={modalOpcionVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingOpcion ? 'Editar Opción' : 'Nueva Opción'}</Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput style={styles.input} value={nombreOpcion} onChangeText={setNombreOpcion} />

              <Text style={styles.label}>Precio Adicional</Text>
              <TextInput
                style={styles.input}
                value={precioOpcion}
                onChangeText={setPrecioOpcion}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Material Asociado *</Text>
              <ScrollView horizontal style={styles.chipContainer}>
                {materiales.map((material) => (
                  <TouchableOpacity
                    key={material.id}
                    style={[styles.chip, materialIdOpcion === material.id && styles.chipSelected]}
                    onPress={() => setMaterialIdOpcion(material.id)}
                  >
                    <Text style={styles.chipText}>{material.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btnModal, styles.btnSecondary]}
                  onPress={() => {
                    setModalOpcionVisible(false);
                    resetOpcionForm();
                  }}
                >
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnModal, styles.btnPrimary]} onPress={handleOpcionSubmit}>
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
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  leftPanel: {
    flex: 1,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  btnAdd: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
  cardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
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
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#007AFF',
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
  opcionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionInfo: {
    flex: 1,
  },
  opcionNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  opcionPrecio: {
    fontSize: 14,
    color: '#34C759',
    marginTop: 4,
  },
  opcionActions: {
    flexDirection: 'row',
  },
  btnTiny: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 5,
  },
  btnTextTiny: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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

import { useSucursal } from '@/features/sucursal/useSucursal';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SucursalSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: () => void;
}

export const SucursalSelector: React.FC<SucursalSelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const {
    sucursales,
    sucursalActual,
    loading,
    seleccionarSucursal,
    crearSucursal,
  } = useSucursal();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaSucursal, setNuevaSucursal] = useState({
    nombre: '',
    direccion: '',
    codigo: '',
    telefono: '',
    email: '',
    horarioApertura: '08:00',
    horarioCierre: '22:00',
    timezone: 'America/Mexico_City',
    activa: true,
  });

  const handleSeleccionarSucursal = (sucursal: any) => {
    seleccionarSucursal(sucursal);
    onSelect?.();
    onClose();
  };

  const handleCrearSucursal = async () => {
    if (!nuevaSucursal.nombre || !nuevaSucursal.direccion || !nuevaSucursal.codigo) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    const result = await crearSucursal(nuevaSucursal);
    if (result.success) {
      Alert.alert('Éxito', 'Sucursal creada correctamente');
      setMostrarFormulario(false);
      setNuevaSucursal({
        nombre: '',
        direccion: '',
        codigo: '',
        telefono: '',
        email: '',
        horarioApertura: '08:00',
        horarioCierre: '22:00',
        timezone: 'America/Mexico_City',
        activa: true,
      });
      onSelect?.();
      onClose();
    } else {
      Alert.alert('Error', result.error || 'Error al crear la sucursal');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>
                {mostrarFormulario ? '🏪➕' : '🏪'}
              </Text>
              <Text style={styles.modalTitle}>
                {mostrarFormulario ? 'Nueva Sucursal' : 'Seleccionar Sucursal'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingIcon}>⏳</Text>
              <Text style={styles.loadingText}>Cargando sucursales...</Text>
            </View>
          ) : mostrarFormulario ? (
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.nombre}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, nombre: text })
                }
                placeholder="Nombre de la sucursal"
              />

              <Text style={styles.label}>Código *</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.codigo}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, codigo: text })
                }
                placeholder="Código único"
              />

              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.direccion}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, direccion: text })
                }
                placeholder="Dirección completa"
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.telefono}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, telefono: text })
                }
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.email}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, email: text })
                }
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setMostrarFormulario(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={handleCrearSucursal}
                >
                  <Text style={styles.buttonText}>Crear Sucursal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <>
              <ScrollView style={styles.listContainer}>
                {sucursales.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏪</Text>
                    <Text style={styles.emptyText}>
                      No hay sucursales registradas
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Crea tu primera sucursal para comenzar
                    </Text>
                  </View>
                ) : (
                  sucursales.map((sucursal) => (
                    <TouchableOpacity
                      key={sucursal.id}
                      style={[
                        styles.sucursalItem,
                        sucursalActual?.id === sucursal.id &&
                          styles.sucursalItemSelected,
                      ]}
                      onPress={() => handleSeleccionarSucursal(sucursal)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.sucursalIconContainer,
                        sucursalActual?.id === sucursal.id 
                          ? styles.iconSelected 
                          : styles.iconUnselected
                      ]}>
                        <Text style={styles.storeIcon}>🏪</Text>
                      </View>
                      <View style={styles.sucursalInfo}>
                        <Text style={styles.sucursalNombre}>
                          {sucursal.nombre}
                        </Text>
                        <Text style={styles.sucursalDireccion}>
                          {sucursal.direccion}
                        </Text>
                        <Text style={styles.sucursalCodigo}>
                          {sucursal.codigo}
                        </Text>
                      </View>
                      {sucursalActual?.id === sucursal.id && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setMostrarFormulario(true)}
              >
                <Text style={styles.newButtonIcon}>➕</Text>
                <Text style={styles.newButtonText}>Nueva Sucursal</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#757575',
    fontWeight: '300',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    color: '#757575',
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  sucursalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sucursalItemSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  sucursalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSelected: {
    backgroundColor: '#4CAF50',
  },
  iconUnselected: {
    backgroundColor: '#9E9E9E',
  },
  storeIcon: {
    fontSize: 24,
  },
  sucursalInfo: {
    flex: 1,
  },
  sucursalNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  sucursalDireccion: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 4,
  },
  sucursalCodigo: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: '700',
    marginLeft: 8,
  },
  newButton: {
    margin: 15,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newButtonIcon: {
    fontSize: 20,
    color: '#fff',
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: '#212121',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

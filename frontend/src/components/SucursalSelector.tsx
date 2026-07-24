import { COLORS, POSIcon } from '@/components/pos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  const [guardando, setGuardando] = useState(false);
  const [nuevaSucursal, setNuevaSucursal] = useState({
    nombre: '',
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
    if (!nuevaSucursal.nombre.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    setGuardando(true);
    const result = await crearSucursal(nuevaSucursal);
    setGuardando(false);

    if (result.success) {
      Alert.alert('Éxito', 'Sucursal creada correctamente');
      setMostrarFormulario(false);
      setNuevaSucursal({
        nombre: '',
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
              <View style={styles.headerIconBadge}>
                <POSIcon
                  name={mostrarFormulario ? 'add-circle' : 'storefront'}
                  size={22}
                  color={INK}
                />
              </View>
              <Text style={styles.modalTitle}>
                {mostrarFormulario ? 'NUEVA SUCURSAL' : 'SELECCIONAR SUCURSAL'}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeButton, hardShadow(pressed)]}
              onPress={onClose}
              hitSlop={6}
            >
              <POSIcon name="close" size={20} color={INK} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando sucursales...</Text>
            </View>
          ) : mostrarFormulario ? (
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>NOMBRE *</Text>
              <TextInput
                style={styles.input}
                value={nuevaSucursal.nombre}
                onChangeText={(text) =>
                  setNuevaSucursal({ ...nuevaSucursal, nombre: text })
                }
                placeholder="Nombre de la sucursal"
                placeholderTextColor={COLORS.textSecondary}
              />

              <View style={styles.buttonContainer}>
                <Pressable
                  style={({ pressed }) => [styles.button, styles.cancelButton, hardShadow(pressed)]}
                  onPress={() => setMostrarFormulario(false)}
                  android_ripple={RIPPLE}
                  disabled={guardando}
                >
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.button, styles.createButton, hardShadow(pressed)]}
                  onPress={handleCrearSucursal}
                  android_ripple={RIPPLE}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color={INK} />
                  ) : (
                    <Text style={styles.createButtonText}>CREAR SUCURSAL</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <>
              <ScrollView style={styles.listContainer}>
                {sucursales.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBadge}>
                      <POSIcon name="storefront-outline" size={40} color={INK} />
                    </View>
                    <Text style={styles.emptyText}>SIN SUCURSALES REGISTRADAS</Text>
                    <Text style={styles.emptySubtext}>
                      Toca "+ Nueva sucursal" para crear la primera
                    </Text>
                  </View>
                ) : (
                  sucursales.map((sucursal) => {
                    const seleccionada = sucursalActual?.id === sucursal.id;
                    return (
                      <Pressable
                        key={sucursal.id}
                        style={({ pressed }) => [
                          styles.sucursalItem,
                          seleccionada && styles.sucursalItemSelected,
                          hardShadow(pressed),
                        ]}
                        onPress={() => handleSeleccionarSucursal(sucursal)}
                        android_ripple={RIPPLE}
                      >
                        <View
                          style={[
                            styles.sucursalIconContainer,
                            { backgroundColor: seleccionada ? COLORS.success : '#E5E5DD' },
                          ]}
                        >
                          <POSIcon name="storefront" size={22} color={INK} />
                        </View>
                        <View style={styles.sucursalInfo}>
                          <Text style={styles.sucursalNombre} numberOfLines={1}>
                            {sucursal.nombre}
                          </Text>
                          <Text style={styles.sucursalDireccion} numberOfLines={1}>
                            {sucursal.direccion}
                          </Text>
                          <Text style={styles.sucursalCodigo}>{sucursal.codigo}</Text>
                        </View>
                        {seleccionada && (
                          <View style={styles.checkBadge}>
                            <POSIcon name="checkmark" size={18} color={INK} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>

              <Pressable
                style={({ pressed }) => [styles.newButton, hardShadow(pressed)]}
                onPress={() => setMostrarFormulario(true)}
                android_ripple={RIPPLE}
              >
                <POSIcon name="add-circle" size={22} color={INK} />
                <Text style={styles.newButtonText}>NUEVA SUCURSAL</Text>
              </Pressable>
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
    backgroundColor: 'rgba(13, 13, 13, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F1EC',
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F1EC',
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Loading ─────────────────────────────────────────────────────────────
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Lista de sucursales ─────────────────────────────────────────────────
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyIconBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F1F1EC',
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sucursalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    marginBottom: 14,
    minHeight: 76,
    borderWidth: 2,
    borderColor: INK,
  },
  sucursalItemSelected: {
    borderWidth: BORDER_W,
    backgroundColor: '#EAF7EF',
  },
  sucursalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sucursalInfo: {
    flex: 1,
  },
  sucursalNombre: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    marginBottom: 3,
  },
  sucursalDireccion: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  sucursalCodigo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // ── Botón nueva sucursal — fijo, siempre a mano ────────────────────────
  newButton: {
    margin: 16,
    paddingVertical: 18,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  newButtonText: {
    color: INK,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ── Formulario ──────────────────────────────────────────────────────────
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: COLORS.white,
    color: INK,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F1EC',
  },
  cancelButtonText: {
    color: INK,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    color: INK,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
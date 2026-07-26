import { COLORS, POSButton, POSCard, POSIcon } from '@/components/pos';
import { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CrearCajaModalProps {
  visible: boolean;
  onCancelar: () => void;
  onCrear: (nombre: string) => void;
}

export function CrearCajaModal({ visible, onCancelar, onCrear }: CrearCajaModalProps) {
  const [nombre, setNombre] = useState('');

  const handleCrear = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la caja');
      return;
    }
    onCrear(nombre.trim());
    setNombre('');
  };

  const handleCancelar = () => {
    setNombre('');
    onCancelar();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelar}
    >
      <View style={styles.overlay}>
        <POSCard style={styles.modal} variant="elevated">
          <View style={styles.header}>
            <View style={styles.headerIcono}>
              <POSIcon name="cash" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.titulo}>Nueva Caja</Text>
            <Text style={styles.subtitulo}>
              Crea una caja para comenzar a registrar movimientos
            </Text>
          </View>

          <View style={styles.contenido}>
            <Text style={styles.label}>Nombre de la caja *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Caja Principal, Caja 1, etc."
              value={nombre}
              onChangeText={setNombre}
              autoFocus
              maxLength={50}
            />
            <Text style={styles.hint}>
              Podrás crear más cajas después desde la configuración
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.botonSecundario} onPress={handleCancelar}>
              <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
            </TouchableOpacity>
            <POSButton
              title="Crear Caja"
              onPress={handleCrear}
              style={styles.botonPrimario}
            />
          </View>
        </POSCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    padding: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  contenido: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  botonSecundario: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  botonSecundarioTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  botonPrimario: {
    flex: 1,
  },
});

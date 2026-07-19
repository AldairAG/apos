// Modal simple para registrar un ingreso o gasto (mock/local).
// Al conectar con Redux/API, `onGuardar` debe disparar el thunk correspondiente.
import { COLORS, POSBadge, POSButton, POSCard, POSIcon } from '@/components/pos';
import { TipoMovimientoCaja } from '@/features/caja/caja/caja.types';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AgregarMovimientoModalProps {
  visible: boolean;
  tipo: TipoMovimientoCaja;
  onCancelar: () => void;
  onGuardar: (categoria: string, monto: number, referencia: string) => void;
}

export const AgregarMovimientoModal: React.FC<AgregarMovimientoModalProps> = ({
  visible,
  tipo,
  onCancelar,
  onGuardar,
}) => {
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [referencia, setReferencia] = useState('');

  const esIngreso = tipo === TipoMovimientoCaja.INGRESO;
  const montoNumerico = parseFloat(monto.replace(',', '.')) || 0;
  const esValido = categoria.trim().length > 0 && montoNumerico > 0;

  const limpiarYCerrar = () => {
    setCategoria('');
    setMonto('');
    setReferencia('');
    onCancelar();
  };

  const guardar = () => {
    if (!esValido) return;
    onGuardar(categoria.trim(), montoNumerico, referencia.trim());
    setCategoria('');
    setMonto('');
    setReferencia('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={limpiarYCerrar}>
      <View style={styles.overlay}>
        <POSCard style={styles.content} variant="elevated">
          <View style={styles.header}>
            <Text style={styles.titulo}>
              {esIngreso ? 'Agregar ingreso' : 'Agregar gasto'}
            </Text>
            <TouchableOpacity onPress={limpiarYCerrar}>
              <POSIcon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <POSBadge
            label={esIngreso ? 'Ingreso' : 'Gasto'}
            variant={esIngreso ? 'success' : 'danger'}
            style={styles.badge}
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Hielo, Salarios, Ventas..."
            placeholderTextColor={COLORS.textSecondary}
            value={categoria}
            onChangeText={setCategoria}
          />

          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
          />

          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Referencia o nota"
            placeholderTextColor={COLORS.textSecondary}
            value={referencia}
            onChangeText={setReferencia}
          />

          <View style={styles.acciones}>
            <POSButton
              title="Guardar"
              variant={esIngreso ? 'success' : 'danger'}
              fullWidth
              disabled={!esValido}
              onPress={guardar}
            />
            <POSButton
              title="Cancelar"
              variant="outline"
              fullWidth
              style={styles.botonCancelar}
              onPress={limpiarYCerrar}
            />
          </View>
        </POSCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  acciones: {
    marginTop: 20,
    gap: 10,
  },
  botonCancelar: {
    marginTop: 2,
  },
});

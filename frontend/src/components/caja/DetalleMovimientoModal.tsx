// Modal de detalle de un movimiento de caja.
import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { MovimientoCaja, TipoMovimientoCaja } from '@/features/caja/caja/caja.types';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DetalleMovimientoModalProps {
  visible: boolean;
  movimiento: MovimientoCaja | null;
  usuario?: string;
  onClose: () => void;
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{value}</Text>
    </View>
  );
}

export const DetalleMovimientoModal: React.FC<DetalleMovimientoModalProps> = ({
  visible,
  movimiento,
  usuario,
  onClose,
}) => {
  if (!movimiento) return null;

  const esIngreso = movimiento.tipoMovimiento === TipoMovimientoCaja.INGRESO;
  const fecha = new Date(movimiento.fecha);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <POSCard style={styles.content} variant="elevated">
          <View style={styles.header}>
            <Text style={styles.titulo}>Detalle del movimiento</Text>
            <TouchableOpacity onPress={onClose}>
              <POSIcon name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.montoContainer}>
            <Text style={[styles.monto, { color: esIngreso ? COLORS.success : COLORS.danger }]}>
              {esIngreso ? '+' : '-'}${movimiento.monto.toFixed(2)}
            </Text>
            <POSBadge
              label={esIngreso ? 'Ingreso' : 'Gasto'}
              variant={esIngreso ? 'success' : 'danger'}
            />
          </View>

          <Fila label="Categoría" value={movimiento.concepto} />
          <Fila
            label="Fecha"
            value={fecha.toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />
          <Fila
            label="Hora"
            value={fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          />
          <Fila label="Usuario" value={usuario ?? `Usuario #${movimiento.empleadoId}`} />
          <Fila label="Descripción" value={movimiento.referencia || 'Sin descripción'} />
          <Fila
            label="Observaciones"
            value={movimiento.aprobado ? 'Movimiento aprobado' : 'Pendiente de aprobación'}
          />
        </POSCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  montoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  monto: {
    fontSize: 32,
    fontWeight: '800',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  filaLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
});

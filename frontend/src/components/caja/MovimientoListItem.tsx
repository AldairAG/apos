// Tarjeta reutilizable para representar un movimiento de caja en la lista del día.
import { COLORS, POSCard, POSIcon } from '@/components/pos';
import { MovimientoCaja, TipoMovimientoCaja } from '@/features/caja/caja/caja.types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MovimientoListItemProps {
  movimiento: MovimientoCaja;
  usuario?: string;
  onPress: (movimiento: MovimientoCaja) => void;
}

export const MovimientoListItem: React.FC<MovimientoListItemProps> = ({
  movimiento,
  usuario,
  onPress,
}) => {
  const esIngreso = movimiento.tipoMovimiento === TipoMovimientoCaja.INGRESO;
  const hora = new Date(movimiento.fecha).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <POSCard style={styles.card} variant="default" onPress={() => onPress(movimiento)}>
      <View
        style={[
          styles.icono,
          { backgroundColor: esIngreso ? '#D4EDDA' : '#F8D7DA' },
        ]}
      >
        <POSIcon
          name={esIngreso ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={esIngreso ? COLORS.success : COLORS.danger}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.categoria} numberOfLines={1}>
          {movimiento.concepto}
        </Text>
        <Text style={styles.detalle} numberOfLines={1}>
          {hora} · {usuario ?? `Usuario #${movimiento.empleadoId}`}
        </Text>
      </View>

      <Text style={[styles.monto, { color: esIngreso ? COLORS.success : COLORS.danger }]}>
        {esIngreso ? '+' : '-'}${movimiento.monto.toFixed(2)}
      </Text>
    </POSCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  categoria: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  detalle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  monto: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

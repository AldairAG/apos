// Calculadora de efectivo reutilizable: captura cantidades por denominación
// (billetes y monedas) y calcula el total automáticamente.
import { COLORS } from '@/components/pos';
import { BILLETES, MONEDAS } from '@/features/caja/caja/caja.mock';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CalculadoraEfectivoProps {
  onTotalChange: (total: number) => void;
}

type Denominaciones = Record<number, number>;

function inicializar(denominaciones: readonly number[]): Denominaciones {
  return denominaciones.reduce((acc, denom) => {
    acc[denom] = 0;
    return acc;
  }, {} as Denominaciones);
}

export const CalculadoraEfectivo: React.FC<CalculadoraEfectivoProps> = ({ onTotalChange }) => {
  const [billetes, setBilletes] = useState<Denominaciones>(() => inicializar(BILLETES));
  const [monedas, setMonedas] = useState<Denominaciones>(() => inicializar(MONEDAS));

  const total = useMemo(() => {
    const totalBilletes = Object.entries(billetes).reduce(
      (sum, [denom, cantidad]) => sum + Number(denom) * cantidad,
      0
    );
    const totalMonedas = Object.entries(monedas).reduce(
      (sum, [denom, cantidad]) => sum + Number(denom) * cantidad,
      0
    );
    return totalBilletes + totalMonedas;
  }, [billetes, monedas]);

  React.useEffect(() => {
    onTotalChange(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const actualizarCantidad = (
    denom: number,
    valor: string,
    setState: React.Dispatch<React.SetStateAction<Denominaciones>>
  ) => {
    const cantidad = valor === '' ? 0 : Math.max(0, parseInt(valor, 10) || 0);
    setState((prev) => ({ ...prev, [denom]: cantidad }));
  };

  const renderFila = (
    denom: number,
    valores: Denominaciones,
    setState: React.Dispatch<React.SetStateAction<Denominaciones>>,
    esMoneda: boolean
  ) => {
    const cantidad = valores[denom];
    const subtotal = denom * cantidad;
    return (
      <View key={denom} style={styles.fila}>
        <Text style={styles.filaLabel}>
          ${esMoneda ? denom.toFixed(2) : denom}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={cantidad === 0 ? '' : String(cantidad)}
          placeholder="0"
          placeholderTextColor={COLORS.textSecondary}
          onChangeText={(valor) => actualizarCantidad(denom, valor, setState)}
        />
        <TouchableOpacity
          style={styles.stepper}
          onPress={() => setState((prev) => ({ ...prev, [denom]: Math.max(0, prev[denom] - 1) }))}
        >
          <Text style={styles.stepperTexto}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepper}
          onPress={() => setState((prev) => ({ ...prev, [denom]: prev[denom] + 1 }))}
        >
          <Text style={styles.stepperTexto}>+</Text>
        </TouchableOpacity>
        <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.seccionTitulo}>Billetes</Text>
      {BILLETES.map((denom) => renderFila(denom, billetes, setBilletes, false))}

      <Text style={styles.seccionTitulo}>Monedas</Text>
      {MONEDAS.map((denom) => renderFila(denom, monedas, setMonedas, true))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total contado</Text>
        <Text style={styles.totalValor}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  filaLabel: {
    width: 56,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    width: 56,
    height: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
  },
  stepper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtotal: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValor: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
});

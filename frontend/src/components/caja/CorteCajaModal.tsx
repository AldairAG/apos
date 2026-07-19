// Modal para realizar el corte de caja: calculadora de efectivo + resumen +
// confirmación. Solo maneja estado local; `onConfirmar` deja lista la acción
// para conectarse posteriormente con Redux/API.
import { COLORS, POSButton, POSCard, POSIcon } from '@/components/pos';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalculadoraEfectivo } from './CalculadoraEfectivo';

interface CorteCajaModalProps {
  visible: boolean;
  montoInicial: number;
  totalIngresos: number;
  totalGastos: number;
  onCancelar: () => void;
  onConfirmar: (saldoContado: number, diferencia: number) => void;
}

function FilaResumen({
  label,
  value,
  destacado,
  color,
}: {
  label: string;
  value: string;
  destacado?: boolean;
  color?: string;
}) {
  return (
    <View style={styles.filaResumen}>
      <Text style={[styles.filaLabel, destacado && styles.filaLabelDestacado]}>{label}</Text>
      <Text
        style={[
          styles.filaValor,
          destacado && styles.filaValorDestacado,
          color ? { color } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export const CorteCajaModal: React.FC<CorteCajaModalProps> = ({
  visible,
  montoInicial,
  totalIngresos,
  totalGastos,
  onCancelar,
  onConfirmar,
}) => {
  const [saldoContado, setSaldoContado] = useState(0);

  const saldoEsperado = montoInicial + totalIngresos - totalGastos;
  const diferencia = useMemo(() => saldoContado - saldoEsperado, [saldoContado, saldoEsperado]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancelar}>
      <View style={styles.overlay}>
        <POSCard style={styles.content} variant="elevated">
          <View style={styles.header}>
            <Text style={styles.titulo}>Corte de caja</Text>
            <TouchableOpacity onPress={onCancelar}>
              <POSIcon name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.seccionTitulo}>Calculadora de efectivo</Text>
            <CalculadoraEfectivo onTotalChange={setSaldoContado} />

            <Text style={styles.seccionTitulo}>Resumen del corte</Text>
            <FilaResumen label="Monto inicial" value={`$${montoInicial.toFixed(2)}`} />
            <FilaResumen
              label="Ingresos"
              value={`+$${totalIngresos.toFixed(2)}`}
              color={COLORS.success}
            />
            <FilaResumen
              label="Gastos"
              value={`-$${totalGastos.toFixed(2)}`}
              color={COLORS.danger}
            />
            <FilaResumen label="Saldo esperado" value={`$${saldoEsperado.toFixed(2)}`} destacado />
            <FilaResumen label="Saldo contado" value={`$${saldoContado.toFixed(2)}`} destacado />
            <FilaResumen
              label="Diferencia"
              value={`${diferencia >= 0 ? '+' : ''}$${diferencia.toFixed(2)}`}
              destacado
              color={diferencia === 0 ? COLORS.success : COLORS.danger}
            />

            <View style={styles.acciones}>
              <POSButton
                title="Cerrar Caja y Generar Corte"
                variant="success"
                fullWidth
                onPress={() => onConfirmar(saldoContado, diferencia)}
              />
              <POSButton
                title="Cancelar"
                variant="outline"
                fullWidth
                style={styles.botonCancelar}
                onPress={onCancelar}
              />
            </View>
          </ScrollView>
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
    maxHeight: '90%',
    paddingBottom: 24,
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
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  filaLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filaLabelDestacado: {
    fontWeight: '700',
    color: COLORS.text,
  },
  filaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filaValorDestacado: {
    fontSize: 16,
    fontWeight: '800',
  },
  acciones: {
    marginTop: 20,
    gap: 10,
  },
  botonCancelar: {
    marginTop: 2,
  },
});

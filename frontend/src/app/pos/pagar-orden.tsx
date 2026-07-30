import { POSIcon } from '@/components/pos';
import { PagarOrdenDTO, PagoDto, TipoPago } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const INK = '#111111';
const PALETTE = {
  bg: '#F4F2EA',
  surface: '#FFFDF8',
  surfaceAlt: '#F0EDE4',
  ink: INK,
  primary: '#1F5BFF',
  primaryDark: '#1137A8',
  success: '#2BAA67',
  successDark: '#16724B',
  warning: '#F1B23E',
  warningDark: '#B8770F',
  danger: '#E45A3B',
  dangerDark: '#A7381D',
  info: '#1F6B7A',
  infoDark: '#144E58',
  neutral: '#5C584F',
  border: INK,
  muted: '#7A756C',
};

const BORDER_W = 3;
const RADIUS = 16;

type PaymentMethodKey = TipoPago.EFECTIVO | TipoPago.TARJETA_DEBITO | TipoPago.TRANSFERENCIA_BANCARIA;

interface PaymentFieldConfig {
  key: PaymentMethodKey;
  label: string;
  placeholder: string;
  accent: string;
}

const PAYMENT_FIELDS: PaymentFieldConfig[] = [
  { key: TipoPago.EFECTIVO, label: 'Efectivo', placeholder: '0.00', accent: PALETTE.success },
  { key: TipoPago.TARJETA_DEBITO, label: 'Tarjeta', placeholder: '0.00', accent: PALETTE.info },
  { key: TipoPago.TRANSFERENCIA_BANCARIA, label: 'Transferencia', placeholder: '0.00', accent: PALETTE.primary },
];

const hardShadow = (color: string = INK, size = 4) => ({
  shadowColor: color,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 2,
});

const parseAmount = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

const createInitialPaymentValues = (total: number): Record<PaymentMethodKey, string> => ({
  [TipoPago.EFECTIVO]: total.toFixed(2),
  [TipoPago.TARJETA_DEBITO]: '',
  [TipoPago.TRANSFERENCIA_BANCARIA]: '',
});

const normalizePaymentValues = (
  currentValues: Record<PaymentMethodKey, string>,
  total: number,
  editedKey: PaymentMethodKey
): Record<PaymentMethodKey, string> => {
  const parsedValues = Object.fromEntries(
    PAYMENT_FIELDS.map((field) => [field.key, parseAmount(currentValues[field.key])])
  ) as Record<PaymentMethodKey, number>;

  const otherNonCashValues = PAYMENT_FIELDS.filter((field) => field.key !== TipoPago.EFECTIVO)
    .filter((field) => field.key !== editedKey)
    .reduce((sum, field) => sum + parsedValues[field.key], 0);

  if (editedKey === TipoPago.EFECTIVO) {
    const maxAllowed = Math.max(total - otherNonCashValues, 0);
    const value = Math.min(parsedValues[TipoPago.EFECTIVO], maxAllowed);
    return {
      ...parsedValues,
      [TipoPago.EFECTIVO]: value.toFixed(2),
      [TipoPago.TARJETA_DEBITO]: parsedValues[TipoPago.TARJETA_DEBITO].toFixed(2),
      [TipoPago.TRANSFERENCIA_BANCARIA]: parsedValues[TipoPago.TRANSFERENCIA_BANCARIA].toFixed(2),
    } as Record<PaymentMethodKey, string>;
  }

  const maxAllowedForEdited = Math.max(total - otherNonCashValues, 0);
  const sanitizedEditedValue = Math.min(parsedValues[editedKey], maxAllowedForEdited);
  const remaining = Math.max(total - sanitizedEditedValue - otherNonCashValues, 0);

  return {
    ...parsedValues,
    [editedKey]: sanitizedEditedValue.toFixed(2),
    [TipoPago.EFECTIVO]: remaining.toFixed(2),
    [TipoPago.TARJETA_DEBITO]: parsedValues[TipoPago.TARJETA_DEBITO].toFixed(2),
    [TipoPago.TRANSFERENCIA_BANCARIA]: parsedValues[TipoPago.TRANSFERENCIA_BANCARIA].toFixed(2),
  } as Record<PaymentMethodKey, string>;
};

export default function PagarOrdenScreen() {
  const { ordenSelected, pagarOrden, loading, sucursalActual } = usePos();
  const { sucursalActual: sucursal } = useSucursal();
  const [cajaId, setCajaId] = useState('1');
  const [descuento, setDescuento] = useState('');
  const [compraGratis, setCompraGratis] = useState(false);
  const [imprimirTicket, setImprimirTicket] = useState(true);
  const [productosGratis, setProductosGratis] = useState<number[]>([]);
  const [paymentValues, setPaymentValues] = useState<Record<PaymentMethodKey, string>>({
    [TipoPago.EFECTIVO]: '0.00',
    [TipoPago.TARJETA_DEBITO]: '',
    [TipoPago.TRANSFERENCIA_BANCARIA]: '',
  });

  const orden = ordenSelected;
  const totalBase = useMemo(() => orden?.total ?? 0, [orden]);

  useEffect(() => {
    if (orden) {
      setPaymentValues(createInitialPaymentValues(totalBase));
      setDescuento('');
      setCompraGratis(false);
      setProductosGratis([]);
    }
  }, [orden?.id, totalBase]);

  const totalProductosGratis = useMemo(() => {
    if (!orden?.detalles) {
      return 0;
    }

    return orden.detalles.reduce((sum, detalle) => {
      if (productosGratis.includes(detalle.id)) {
        return sum + (detalle.total ?? 0);
      }
      return sum;
    }, 0);
  }, [orden?.detalles, productosGratis]);

  const totalConDescuento = useMemo(() => {
    const descuentoAplicado = parseAmount(descuento);
    const totalSinGratis = Math.max(totalBase - totalProductosGratis - descuentoAplicado, 0);
    return compraGratis ? 0 : totalSinGratis;
  }, [compraGratis, descuento, totalBase, totalProductosGratis]);

  const paymentSummary = useMemo<PagoDto[]>(() => {
    if (compraGratis) {
      return [{ metodoPago: TipoPago.GRATIS, monto: 0 }];
    }

    return PAYMENT_FIELDS.filter((field) => parseAmount(paymentValues[field.key]) > 0)
      .map((field) => ({ metodoPago: field.key, monto: parseAmount(paymentValues[field.key]) }));
  }, [compraGratis, paymentValues]);

  const totalPagado = useMemo(() => paymentSummary.reduce((sum, pago) => sum + pago.monto, 0), [paymentSummary]);
  const isBalanced = Math.abs(totalPagado - totalConDescuento) < 0.01;
  const statusLabel = compraGratis ? 'Compra gratis' : isBalanced ? 'Listo para cobrar' : 'Falta por cubrir';
  const statusColor = compraGratis ? PALETTE.success : isBalanced ? PALETTE.success : PALETTE.warning;

  const updatePaymentValue = (key: PaymentMethodKey, value: string) => {
    const normalized = normalizePaymentValues({ ...paymentValues, [key]: value }, totalConDescuento, key);
    setPaymentValues(normalized);
  };

  const toggleProductoGratis = (detalleId: number) => {
    setProductosGratis((prev) =>
      prev.includes(detalleId) ? prev.filter((item) => item !== detalleId) : [...prev, detalleId]
    );
  };

  const handlePagar = async () => {
    if (!orden) {
      Alert.alert('Sin orden', 'Selecciona una orden para cobrar.');
      return;
    }

    if (!paymentSummary.length) {
      Alert.alert('Pago requerido', 'Ingresa al menos un monto para cobrar.');
      return;
    }

    if (!isBalanced) {
      Alert.alert('Monto incompleto', 'El monto pagado debe coincidir con el total final de la venta.');
      return;
    }

    const payload: PagarOrdenDTO = {
      ordenId: orden.id,
      cajaId: Number(cajaId || 1),
      pagoMixto: paymentSummary.length > 1,
      pagos: paymentSummary,
    };

    try {
      await pagarOrden(payload);
      Alert.alert('Éxito', 'La orden se cobró correctamente.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el cobro.');
    }
  };

  if (!orden) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <POSIcon name="arrow-back" size={20} color={PALETTE.ink} />
          </Pressable>
          <Text style={styles.title}>Cobro</Text>
        </View>
        <View style={styles.emptyState}>
          <POSIcon name="receipt" size={64} color={PALETTE.neutral} />
          <Text style={styles.emptyStateText}>No hay orden seleccionada</Text>
          <Text style={styles.emptyStateSubtext}>Regresa a Órdenes y selecciona una orden para cobrar.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <POSIcon name="arrow-back" size={20} color={PALETTE.ink} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Cobrar orden</Text>
            <Text style={styles.sucursalText}>{sucursal?.nombre || sucursalActual?.nombre || 'Sin sucursal'}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { borderColor: PALETTE.primaryDark, backgroundColor: PALETTE.surfaceAlt }]}> 
          <View style={styles.summaryCardHeader}>
            <View style={[styles.statusPill, { backgroundColor: statusColor }]}> 
              <Text style={styles.statusPillText}>{statusLabel}</Text>
            </View>
            <Text style={styles.summaryBadge}>Caja segura</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Orden</Text>
            <Text style={styles.summaryValue}>#{orden.folio}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalBase)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Final</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalConDescuento)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cliente</Text>
            <Text style={styles.summaryValue}>{orden.mesa?.nombre || 'Para llevar'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.panel, { borderColor: PALETTE.primaryDark }]}> 
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Métodos de pago</Text>
            <Text style={styles.panelHint}>Rápido y claro</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Caja</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cajaId}
              onChangeText={setCajaId}
              placeholder="ID"
              placeholderTextColor={PALETTE.neutral}
            />
          </View>

          {PAYMENT_FIELDS.map((field) => (
            <View key={field.key} style={[styles.paymentCard, { borderColor: field.accent }]}> 
              <View style={styles.paymentCardHeader}>
                <View style={[styles.paymentDot, { backgroundColor: field.accent }]} />
                <Text style={styles.paymentLabel}>{field.label}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputLarge, { borderColor: field.accent }]}
                keyboardType="decimal-pad"
                value={paymentValues[field.key]}
                onChangeText={(value) => updatePaymentValue(field.key, value)}
                placeholder={field.placeholder}
                placeholderTextColor={PALETTE.neutral}
              />
            </View>
          ))}
        </View>

        <View style={[styles.panel, { borderColor: PALETTE.successDark }]}> 
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Estado del cobro</Text>
            <Text style={styles.panelHint}>Sin sorpresas</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pagado</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPagado)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pendiente</Text>
            <Text style={styles.summaryValue}>{formatCurrency(Math.max(totalConDescuento - totalPagado, 0))}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Efectivo</Text>
            <Text style={styles.summaryValue}>{formatCurrency(parseAmount(paymentValues[TipoPago.EFECTIVO]))}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transferencia</Text>
            <Text style={styles.summaryValue}>{formatCurrency(parseAmount(paymentValues[TipoPago.TRANSFERENCIA_BANCARIA]))}</Text>
          </View>
        </View>

        <View style={[styles.panel, { borderColor: PALETTE.infoDark }]}> 
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Acciones rápidas</Text>
            <Text style={styles.panelHint}>Menos clics</Text>
          </View>

          <View style={styles.quickGrid}>
            <Pressable
              onPress={() => setImprimirTicket((prev) => !prev)}
              style={[styles.quickAction, imprimirTicket && styles.quickActionActive]}
            >
              <POSIcon name={imprimirTicket ? 'print' : 'print-outline'} size={18} color={imprimirTicket ? '#FFF' : PALETTE.ink} />
              <Text style={[styles.quickActionText, imprimirTicket && styles.quickActionTextActive]}>Imprimir ticket</Text>
            </Pressable>

            <Pressable
              onPress={() => setCompraGratis((prev) => !prev)}
              style={[styles.quickAction, compraGratis && styles.quickActionActive]}
            >
              <POSIcon name={compraGratis ? 'gift' : 'gift-outline'} size={18} color={compraGratis ? '#FFF' : PALETTE.ink} />
              <Text style={[styles.quickActionText, compraGratis && styles.quickActionTextActive]}>Compra gratis</Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descuento</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              keyboardType="decimal-pad"
              value={descuento}
              onChangeText={setDescuento}
              placeholder="0.00"
              placeholderTextColor={PALETTE.neutral}
            />
          </View>

          {orden?.detalles?.length ? (
            <View style={styles.productList}>
              <Text style={styles.inputLabel}>Productos gratis</Text>
              <View style={styles.productListRow}>
                {orden.detalles.map((detalle) => {
                  const activo = productosGratis.includes(detalle.id);
                  return (
                    <Pressable
                      key={detalle.id}
                      onPress={() => toggleProductoGratis(detalle.id)}
                      style={[styles.productChip, activo && styles.productChipActive]}
                    >
                      <Text style={[styles.productChipText, activo && styles.productChipTextActive]}>
                        {detalle.nombreProducto || `Producto ${detalle.id}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Text style={styles.footerHint}>Toca confirmar y el sistema registra el pago.</Text>
          <Pressable
            onPress={handlePagar}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: PALETTE.primary, borderColor: PALETTE.primaryDark },
              hardShadow(PALETTE.primaryDark, pressed ? 1 : 3),
              pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              loading && { opacity: 0.7 },
            ]}
          >
            <POSIcon name="cash" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>{loading ? 'Procesando...' : 'Confirmar cobro'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },
  header: {
    backgroundColor: PALETTE.surface,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: BORDER_W,
    borderBottomColor: PALETTE.border,
    gap: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    backgroundColor: PALETTE.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: { flex: 1, gap: 2 },
  title: { fontSize: 24, fontWeight: '900', color: PALETTE.ink, letterSpacing: -0.4 },
  sucursalText: { fontSize: 12, color: PALETTE.neutral, fontWeight: '700' },
  summaryCard: {
    borderWidth: BORDER_W,
    borderRadius: RADIUS,
    padding: 14,
    gap: 8,
  },
  summaryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  summaryBadge: { fontSize: 12, fontWeight: '800', color: PALETTE.neutral },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: BORDER_W,
    borderColor: PALETTE.border,
  },
  statusPillText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: PALETTE.neutral },
  summaryValue: { fontSize: 15, fontWeight: '900', color: PALETTE.ink },
  content: { padding: 16, gap: 14, paddingBottom: 140 },
  panel: {
    backgroundColor: PALETTE.surface,
    borderWidth: BORDER_W,
    borderRadius: RADIUS,
    padding: 14,
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 380,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 17, fontWeight: '900', color: PALETTE.ink },
  panelHint: { fontSize: 11, fontWeight: '800', color: PALETTE.muted },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: PALETTE.neutral },
  input: {
    backgroundColor: PALETTE.surface,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: PALETTE.ink,
    fontWeight: '700',
    alignSelf: 'stretch',
  },
  inputLarge: { minHeight: 48 },
  paymentCard: {
    borderWidth: BORDER_W,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: PALETTE.surface,
  },
  paymentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentDot: { width: 12, height: 12, borderRadius: 999, borderWidth: 2, borderColor: PALETTE.border },
  paymentLabel: { fontSize: 14, fontWeight: '900', color: PALETTE.ink },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickAction: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: PALETTE.ink,
    backgroundColor: PALETTE.surfaceAlt,
  },
  quickActionActive: { backgroundColor: PALETTE.primary, borderColor: PALETTE.primaryDark },
  quickActionText: { fontSize: 13, fontWeight: '800', color: PALETTE.ink },
  quickActionTextActive: { color: '#FFF' },
  productList: { gap: 8 },
  productListRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productChip: {
    borderWidth: 2,
    borderColor: PALETTE.ink,
    borderRadius: RADIUS,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: PALETTE.surface,
  },
  productChipActive: { backgroundColor: PALETTE.success, borderColor: PALETTE.successDark },
  productChipText: { fontSize: 12, fontWeight: '700', color: PALETTE.ink },
  productChipTextActive: { color: '#FFF' },
  footer: { padding: 16, paddingTop: 0, backgroundColor: PALETTE.bg },
  footerCard: { gap: 10 },
  footerHint: { fontSize: 12, fontWeight: '700', color: PALETTE.neutral, textAlign: 'center' },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  emptyStateText: { fontSize: 18, fontWeight: '900', color: PALETTE.ink },
  emptyStateSubtext: { fontSize: 13, color: PALETTE.neutral, fontWeight: '600', textAlign: 'center' },
});

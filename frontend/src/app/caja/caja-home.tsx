// Pantalla principal de Caja (mobile) — dashboard construido 100% con datos mock.
// No hay integración con API/Redux/hooks; toda la información vive en estado
// local de este componente para facilitar su reemplazo posterior por
// selectores/thunks reales (ver comentarios "// TODO Redux/API").
import {
  AgregarMovimientoModal,
  CorteCajaModal,
  DetalleMovimientoModal,
  MovimientoListItem,
  PieChartCaja,
} from '@/components/caja';
import { COLORS, POSBadge, POSButton, POSCard, POSIcon } from '@/components/pos';
import {
  calcularDistribucionPorCategoria,
  calcularResumen,
  getMovimientosDeHoy,
  MOCK_CAJAS,
  MOCK_MOVIMIENTOS,
  MOCK_SALDO_INICIAL,
  MOCK_USUARIOS,
} from '@/features/caja/caja/caja.mock';
import {
  Caja,
  MovimientoCaja,
  TipoConceptoMovimiento,
  TipoMovimientoCaja,
} from '@/features/caja/caja/caja.types';
import { MetodoPago } from '@/types/pos.types';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TabResumen = 'ingresos' | 'gastos';

const FECHA_HOY = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

let siguienteMovimientoId = 1000;

export default function CajaHome() {
  // ─── Estado local (mock) ─────────────────────────────────────────────
  // TODO Redux/API: reemplazar por useSelector/useDispatch cuando exista
  // el slice de caja conectado al backend.
  const [cajas, setCajas] = useState<Caja[]>(MOCK_CAJAS);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>(MOCK_MOVIMIENTOS);
  const [cajaSeleccionadaId, setCajaSeleccionadaId] = useState<number>(MOCK_CAJAS[0].id);

  const [tab, setTab] = useState<TabResumen>('ingresos');
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoCaja | null>(
    null
  );
  const [corteModalVisible, setCorteModalVisible] = useState(false);
  const [modalMovimientoTipo, setModalMovimientoTipo] = useState<TipoMovimientoCaja | null>(null);

  // ─── Datos derivados ──────────────────────────────────────────────────
  const cajaActual = cajas.find((c) => c.id === cajaSeleccionadaId)!;
  const saldoInicial = MOCK_SALDO_INICIAL[cajaSeleccionadaId] ?? 0;

  const movimientosDeHoy = useMemo(
    () => getMovimientosDeHoy(movimientos, cajaSeleccionadaId),
    [movimientos, cajaSeleccionadaId]
  );

  const resumen = useMemo(
    () => calcularResumen(movimientosDeHoy, saldoInicial),
    [movimientosDeHoy, saldoInicial]
  );

  const distribucion = useMemo(
    () =>
      calcularDistribucionPorCategoria(
        movimientosDeHoy,
        tab === 'ingresos' ? TipoMovimientoCaja.INGRESO : TipoMovimientoCaja.EGRESO
      ),
    [movimientosDeHoy, tab]
  );

  // ─── Acciones (mock) ──────────────────────────────────────────────────
  const abrirCaja = () => {
    // TODO Redux/API: dispatch(abrirCajaThunk(cajaSeleccionadaId))
    setCajas((prev) =>
      prev.map((c) => (c.id === cajaSeleccionadaId ? { ...c, activa: true } : c))
    );
    Alert.alert('Caja abierta', `${cajaActual.nombre} se abrió correctamente.`);
  };

  const cerrarCaja = () => {
    Alert.alert('Cerrar caja', '¿Seguro que deseas cerrar la caja sin generar un corte?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar caja',
        style: 'destructive',
        onPress: () => {
          // TODO Redux/API: dispatch(cerrarCajaThunk(cajaSeleccionadaId))
          setCajas((prev) =>
            prev.map((c) => (c.id === cajaSeleccionadaId ? { ...c, activa: false } : c))
          );
        },
      },
    ]);
  };

  const agregarMovimiento = (
    tipo: TipoMovimientoCaja,
    categoria: string,
    monto: number,
    referencia: string
  ) => {
    // TODO Redux/API: dispatch(registrarMovimientoThunk({ ...movimiento }))
    const nuevo: MovimientoCaja = {
      id: siguienteMovimientoId++,
      tipoMovimiento: tipo,
      conceptoMovimiento:
        tipo === TipoMovimientoCaja.INGRESO
          ? TipoConceptoMovimiento.VENTA
          : TipoConceptoMovimiento.GASTO,
      metodoPago: 'efectivo' as MetodoPago,
      concepto: categoria,
      referencia: referencia || 'Registrado manualmente',
      monto,
      aprobado: true,
      fecha: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: 1,
      cajaId: cajaSeleccionadaId,
      empleadoId: 1,
      ordenId: 0,
    };
    setMovimientos((prev) => [...prev, nuevo]);
    setModalMovimientoTipo(null);
  };

  const confirmarCorte = (saldoContado: number, diferencia: number) => {
    // TODO Redux/API: dispatch(generarCorteThunk({ cajaId, saldoContado, diferencia }))
    setCorteModalVisible(false);
    setCajas((prev) =>
      prev.map((c) => (c.id === cajaSeleccionadaId ? { ...c, activa: false } : c))
    );
    Alert.alert(
      'Corte generado',
      `Saldo contado: $${saldoContado.toFixed(2)}\nDiferencia: ${
        diferencia >= 0 ? '+' : ''
      }$${diferencia.toFixed(2)}`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Encabezado */}
        <View style={styles.header}>
          <Text style={styles.tituloPantalla}>Caja</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectorScroll}
          >
            {cajas.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.selectorChip,
                  c.id === cajaSeleccionadaId && styles.selectorChipActivo,
                ]}
                onPress={() => setCajaSeleccionadaId(c.id)}
              >
                <Text
                  style={[
                    styles.selectorChipTexto,
                    c.id === cajaSeleccionadaId && styles.selectorChipTextoActivo,
                  ]}
                >
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.headerInfoRow}>
            <POSBadge
              label={cajaActual.activa ? 'Abierta' : 'Cerrada'}
              variant={cajaActual.activa ? 'success' : 'danger'}
            />
            <Text style={styles.fecha}>{FECHA_HOY}</Text>
          </View>
        </View>

        {/* 2. Botón principal si la caja está cerrada */}
        {!cajaActual.activa && (
          <POSCard style={styles.cajaCerradaCard} variant="elevated">
            <POSIcon name="lock-closed" size={40} color={COLORS.gray} />
            <Text style={styles.cajaCerradaTexto}>
              {cajaActual.nombre} está cerrada. Ábrela para comenzar a registrar movimientos.
            </Text>
            <POSButton title="Abrir Caja" size="large" fullWidth onPress={abrirCaja} />
          </POSCard>
        )}

        {cajaActual.activa && (
          <>
            {/* 3. Resumen */}
            <View style={styles.resumenGrid}>
              <POSCard style={styles.resumenCard} variant="elevated">
                <POSIcon name="wallet" size={26} color={COLORS.primary} />
                <Text style={styles.resumenValor}>${resumen.saldoActual.toFixed(2)}</Text>
                <Text style={styles.resumenLabel}>Saldo actual</Text>
              </POSCard>

              <POSCard style={styles.resumenCard} variant="elevated">
                <POSIcon name="arrow-down-circle" size={26} color={COLORS.success} />
                <Text style={styles.resumenValor}>${resumen.totalIngresos.toFixed(2)}</Text>
                <Text style={styles.resumenLabel}>Ingresos</Text>
              </POSCard>

              <POSCard style={styles.resumenCard} variant="elevated">
                <POSIcon name="arrow-up-circle" size={26} color={COLORS.danger} />
                <Text style={styles.resumenValor}>${resumen.totalGastos.toFixed(2)}</Text>
                <Text style={styles.resumenLabel}>Gastos</Text>
              </POSCard>

              <POSCard style={styles.resumenCard} variant="elevated">
                <POSIcon name="swap-vertical" size={26} color={COLORS.info} />
                <Text style={styles.resumenValor}>{resumen.totalMovimientos}</Text>
                <Text style={styles.resumenLabel}>Movimientos</Text>
              </POSCard>
            </View>

            {/* 4. Tabs + 5. Gráfica de pastel */}
            <POSCard style={styles.seccionCard} variant="elevated">
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, tab === 'ingresos' && styles.tabActivo]}
                  onPress={() => setTab('ingresos')}
                >
                  <Text style={[styles.tabTexto, tab === 'ingresos' && styles.tabTextoActivo]}>
                    Ingresos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, tab === 'gastos' && styles.tabActivo]}
                  onPress={() => setTab('gastos')}
                >
                  <Text style={[styles.tabTexto, tab === 'gastos' && styles.tabTextoActivo]}>
                    Gastos
                  </Text>
                </TouchableOpacity>
              </View>

              <PieChartCaja
                data={distribucion}
                centroLabel={tab === 'ingresos' ? 'Ingresos' : 'Gastos'}
              />
            </POSCard>

            {/* 6. Lista de movimientos del día */}
            <View style={styles.seccion}>
              <Text style={styles.tituloSeccion}>Movimientos de hoy</Text>
              {movimientosDeHoy.length === 0 ? (
                <POSCard variant="default">
                  <Text style={styles.sinMovimientos}>Aún no hay movimientos registrados hoy.</Text>
                </POSCard>
              ) : (
                movimientosDeHoy.map((m) => (
                  <MovimientoListItem
                    key={m.id}
                    movimiento={m}
                    usuario={MOCK_USUARIOS[m.empleadoId]}
                    onPress={setMovimientoSeleccionado}
                  />
                ))
              )}
            </View>

            {/* 8. Acciones */}
            <View style={styles.seccion}>
              <Text style={styles.tituloSeccion}>Acciones</Text>
              <View style={styles.accionesGrid}>
                <TouchableOpacity
                  style={styles.accionCard}
                  onPress={() => setModalMovimientoTipo(TipoMovimientoCaja.INGRESO)}
                  activeOpacity={0.8}
                >
                  <POSCard style={styles.accionCardInner} variant="elevated">
                    <POSIcon name="add-circle" size={30} color={COLORS.success} />
                    <Text style={styles.accionLabel}>Agregar ingreso</Text>
                  </POSCard>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accionCard}
                  onPress={() => setModalMovimientoTipo(TipoMovimientoCaja.EGRESO)}
                  activeOpacity={0.8}
                >
                  <POSCard style={styles.accionCardInner} variant="elevated">
                    <POSIcon name="remove-circle" size={30} color={COLORS.danger} />
                    <Text style={styles.accionLabel}>Agregar gasto</Text>
                  </POSCard>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accionCard}
                  onPress={() => setCorteModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <POSCard style={styles.accionCardInner} variant="elevated">
                    <POSIcon name="calculator" size={30} color={COLORS.primary} />
                    <Text style={styles.accionLabel}>Realizar corte</Text>
                  </POSCard>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accionCard}
                  onPress={cerrarCaja}
                  activeOpacity={0.8}
                >
                  <POSCard style={styles.accionCardInner} variant="elevated">
                    <POSIcon name="lock-closed" size={30} color={COLORS.gray} />
                    <Text style={styles.accionLabel}>Cerrar caja</Text>
                  </POSCard>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* 7. Detalle de movimiento */}
      <DetalleMovimientoModal
        visible={movimientoSeleccionado !== null}
        movimiento={movimientoSeleccionado}
        usuario={movimientoSeleccionado ? MOCK_USUARIOS[movimientoSeleccionado.empleadoId] : undefined}
        onClose={() => setMovimientoSeleccionado(null)}
      />

      {/* Agregar ingreso / gasto */}
      <AgregarMovimientoModal
        visible={modalMovimientoTipo !== null}
        tipo={modalMovimientoTipo ?? TipoMovimientoCaja.INGRESO}
        onCancelar={() => setModalMovimientoTipo(null)}
        onGuardar={(categoria, monto, referencia) =>
          agregarMovimiento(modalMovimientoTipo ?? TipoMovimientoCaja.INGRESO, categoria, monto, referencia)
        }
      />

      {/* 9-12. Corte de caja */}
      <CorteCajaModal
        visible={corteModalVisible}
        montoInicial={saldoInicial}
        totalIngresos={resumen.totalIngresos}
        totalGastos={resumen.totalGastos}
        onCancelar={() => setCorteModalVisible(false)}
        onConfirmar={confirmarCorte}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  tituloPantalla: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  selectorScroll: {
    marginBottom: 12,
  },
  selectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  selectorChipActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorChipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorChipTextoActivo: {
    color: COLORS.white,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  cajaCerradaCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  cajaCerradaTexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  resumenCard: {
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  resumenValor: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  resumenLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  seccionCard: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActivo: {
    backgroundColor: COLORS.white,
  },
  tabTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextoActivo: {
    color: COLORS.text,
  },
  seccion: {
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  sinMovimientos: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accionCard: {
    width: '47%',
  },
  accionCardInner: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  accionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});


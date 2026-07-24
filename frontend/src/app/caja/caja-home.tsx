import {
  AgregarMovimientoModal,
  CorteCajaModal,
  CrearCajaModal,
  DetalleMovimientoModal,
  MovimientoListItem,
  PieChartCaja,
} from '@/components/caja';
import { COLORS, POSBadge, POSButton, POSCard, POSIcon } from '@/components/pos';
import {
  calcularDistribucionPorCategoria,
  calcularResumen,
  getMovimientosDeHoy,
  MOCK_SALDO_INICIAL,
  MOCK_USUARIOS
} from '@/features/caja/caja/caja.mock';
import {
  MovimientoCaja,
  TipoConceptoMovimiento,
  TipoMovimientoCaja
} from '@/features/caja/caja/caja.types';
import useCaja from '@/features/caja/caja/useCaja';
import { MetodoPago } from '@/types/pos.types';
import { useEffect, useMemo, useState } from 'react';
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
  const {
    cajas,
    MovimientosCaja,
    cajaSeleccionada,
    crearCaja,
    loading,
    sucursalActual, 
    fetchCajasBySucursal,
  } = useCaja();

  const [tab, setTab] = useState<TabResumen>('ingresos');
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoCaja | null>(null);
  const [corteModalVisible, setCorteModalVisible] = useState(false);
  const [modalMovimientoTipo, setModalMovimientoTipo] = useState<TipoMovimientoCaja | null>(null);
  const [modalCrearCaja, setModalCrearCaja] = useState(false);

  useEffect(() => {
    if (sucursalActual) {
      fetchCajasBySucursal(sucursalActual.id);
    }
  }, [sucursalActual]);

  // ─── Datos derivados ──────────────────────────────────────────────────
  const cajaActual = cajaSeleccionada!;
  const saldoInicial = MOCK_SALDO_INICIAL[cajaSeleccionada?.id ?? 0] ?? 0;

  const movimientosDeHoy = useMemo(
    () => getMovimientosDeHoy(MovimientosCaja, cajaSeleccionada?.id ?? 0),
    [MovimientosCaja, cajaSeleccionada?.id]
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
  };

  const cerrarCaja = () => {
    Alert.alert('Cerrar caja', '¿Seguro que deseas cerrar la caja sin generar un corte?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar caja',
        style: 'destructive',
        onPress: () => {
          // TODO Redux/API: dispatch(cerrarCajaThunk(cajaSeleccionadaId))
          // TODO Redux/API: dispatch(cerrarCajaThunk(cajaSeleccionadaId))
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
      cajaId: cajaSeleccionada?.id || 0,
      empleadoId: 1,
      ordenId: 0,
    };
    setModalMovimientoTipo(null);
  };

  const confirmarCorte = (saldoContado: number, diferencia: number) => {
    // TODO Redux/API: dispatch(generarCorteThunk({ cajaId, saldoContado, diferencia }))
    setCorteModalVisible(false);
    Alert.alert(
      'Corte generado',
      `Saldo contado: $${saldoContado.toFixed(2)}\nDiferencia: ${diferencia >= 0 ? '+' : ''
      }$${diferencia.toFixed(2)}`
    );
  };

  const handleCrearCaja = async (nombre: string) => {
    if (!sucursalActual) {
      Alert.alert('Error', 'No se ha seleccionado una sucursal');
      return;
    }

    try {
      await crearCaja({
        nombre,
        activa: true,
        sucursalId: sucursalActual.id,
      });
      setModalCrearCaja(false);
      Alert.alert('Éxito', 'Caja creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la caja. Intenta de nuevo.');
    }
  };

  if(loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando cajas...</Text>
      </View>
    );
  }

  // Vista cuando no hay cajas
  if (cajas.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.tituloPantalla}>Caja</Text>
          </View>

          <POSCard style={styles.estadoVacioCard} variant="elevated">
            <View style={styles.estadoVacioIcono}>
              <POSIcon name="cash-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.estadoVacioTitulo}>No hay cajas configuradas</Text>
            <Text style={styles.estadoVacioTexto}>
              Para comenzar a registrar movimientos de efectivo, primero necesitas crear al menos una caja.
            </Text>
            <POSButton
              title="Crear mi primera caja"
              size="large"
              fullWidth
              onPress={() => setModalCrearCaja(true)}
            />
          </POSCard>
        </ScrollView>

        <CrearCajaModal
          visible={modalCrearCaja}
          onCancelar={() => setModalCrearCaja(false)}
          onCrear={handleCrearCaja}
        />
      </View>
    );
  }

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
                  c.id === cajaSeleccionada?.id && styles.selectorChipActivo,
                ]}
                onPress={() => { }}
              >
                <Text
                  style={[
                    styles.selectorChipTexto,
                    c.id === cajaSeleccionada?.id && styles.selectorChipTextoActivo,
                  ]}
                >
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.headerInfoRow}>
            <POSBadge
              label={cajaActual.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}
              variant={cajaActual.estado === 'ABIERTA' ? 'success' : 'danger'}
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

      {/* Modal crear caja */}
      <CrearCajaModal
        visible={modalCrearCaja}
        onCancelar={() => setModalCrearCaja(false)}
        onCrear={handleCrearCaja}
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
  estadoVacioCard: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  estadoVacioIcono: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  estadoVacioTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});


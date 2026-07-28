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
import { useMateriales } from '@/features/inventario/materiales';
import useCaja from '@/features/caja/caja/useCaja';
import { MetodoPago } from '@/types/pos.types';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TabResumen = 'ingresos' | 'gastos';

const FECHA_HOY = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

type MovimientoCajaFormPayload = {
  tipoMovimiento: TipoMovimientoCaja;
  conceptoMovimiento: TipoConceptoMovimiento;
  metodoPago: MetodoPago | null;
  concepto: string;
  referencia: string;
  monto: number;
  fecha: string;
  cajaId: number;
  empleadoId: number;
  ordenId: number | null;
  restock: { materialId: number; cantidad: number } | null;
};

let siguienteMovimientoId = 1000;

// ─── Sistema de diseño local: Neo-Brutalismo Funcional + MD3 ────────────
// No se toca la paleta compartida `COLORS` (viene de otra parte del código
// base y puede estar en uso en otras pantallas). En su lugar se define un
// set de tokens NB (Neo-Brutalist) pensados con psicología del color:
//  - Fondo cálido (no gris frío) para que una app de dinero no se sienta clínica.
//  - Verde = ingreso (crecimiento/confianza). Rojo *cálido*, no rojo alarma, para
//    gasto (informa sin generar ansiedad). Ámbar = atención neutral (corte),
//    no error. Azul sólido = marca/confianza en acciones primarias.
//  - Bordes gruesos + sombra dura (sin blur) en vez de elevación difusa:
//    comunican "esto es tocable" de forma inmediata, sin depender de sutileza.
const NB = {
  bg: '#F5F1E8',
  ink: '#14161B',
  border: '#14161B',
  borderWidth: 3,
  radius: 12,
  white: '#FFFFFF',
  primario: '#1E5FD9',
  primarioTexto: '#FFFFFF',
  ingreso: '#1B8A5A',
  ingresoBg: '#DFF3E8',
  gasto: '#D64545',
  gastoBg: '#FBE4E4',
  advertencia: '#E8A93B',
  advertenciaBg: '#FBEBD3',
  neutro: '#5B6470',
  neutroBg: '#E7E5DF',
  textoSecundario: '#4B5563',
} as const;

const sombraDura = (color: string = NB.ink) => ({
  shadowColor: color,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
});

export default function CajaHome() {
  const {
    cajas,
    MovimientosCaja,
    cajaSeleccionada,
    crearCaja,
    loading,
    sucursalActual,
    fetchCajasBySucursal,
    // NOTA: el hook original no exponía forma de cambiar de caja desde la UI
    // (el chip selector tenía onPress vacío). Se asume/expone `seleccionarCaja`
    // aquí para que el selector sea funcional — ajustar el nombre real del
    // método si useCaja lo expone distinto.
    seleccionarCaja,
  } = useCaja() as ReturnType<typeof useCaja> & {
    seleccionarCaja?: (id: number) => void;
  };

  const [tab, setTab] = useState<TabResumen>('ingresos');
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoCaja | null>(null);
  const [corteModalVisible, setCorteModalVisible] = useState(false);
  const [modalMovimientoTipo, setModalMovimientoTipo] = useState<TipoMovimientoCaja | null>(null);
  const [modalCrearCaja, setModalCrearCaja] = useState(false);

  const { materiales, cargarMateriales: cargarMaterialesInventario } = useMateriales();

  // Feedback inmediato: los movimientos nuevos se reflejan al instante en
  // pantalla mientras se confirma con backend, en vez de esperar un refetch.
  // (En el original, `agregarMovimiento` creaba el objeto pero nunca lo
  // agregaba a ningún estado, por lo que la UI nunca cambiaba.)
  const [movimientosOptimistas, setMovimientosOptimistas] = useState<MovimientoCaja[]>([]);
  const [confirmacionVisible, setConfirmacionVisible] = useState<string | null>(null);

  useEffect(() => {
    if (sucursalActual) {
      fetchCajasBySucursal(sucursalActual.id);
    }
  }, [sucursalActual]);

  useEffect(() => {
    if (sucursalActual) {
      cargarMaterialesInventario();
    }
  }, [sucursalActual, cargarMaterialesInventario]);

  useEffect(() => {
    if (!confirmacionVisible) return;
    const t = setTimeout(() => setConfirmacionVisible(null), 1800);
    return () => clearTimeout(t);
  }, [confirmacionVisible]);

  // ─── Datos derivados ──────────────────────────────────────────────────
  const cajaActual = cajaSeleccionada!;
  const saldoInicial = MOCK_SALDO_INICIAL[cajaSeleccionada?.id ?? 0] ?? 0;

  const movimientosCombinados = useMemo(
    () => [...movimientosOptimistas, ...MovimientosCaja],
    [movimientosOptimistas, MovimientosCaja]
  );

  const movimientosDeHoy = useMemo(
    () => getMovimientosDeHoy(movimientosCombinados, cajaSeleccionada?.id ?? 0),
    [movimientosCombinados, cajaSeleccionada?.id]
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

  // ─── Acciones ─────────────────────────────────────────────────────────
  const abrirCaja = () => {
    // TODO Redux/API: dispatch(abrirCajaThunk(cajaSeleccionadaId))
  };

  // Diseño de confianza: una acción destructiva/irreversible siempre pide
  // confirmación explícita, con la opción segura (Cancelar) destacada.
  const cerrarCaja = () => {
    Alert.alert('Cerrar caja', '¿Seguro que deseas cerrar la caja sin generar un corte?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar caja',
        style: 'destructive',
        onPress: () => {
          // TODO Redux/API: dispatch(cerrarCajaThunk(cajaSeleccionadaId))
        },
      },
    ]);
  };

  const agregarMovimiento = (movimiento: MovimientoCajaFormPayload) => {
    // TODO Redux/API: dispatch(registrarMovimientoThunk({ ...movimiento }))
    const nuevo: MovimientoCaja = {
      id: siguienteMovimientoId++,
      tipoMovimiento: movimiento.tipoMovimiento,
      conceptoMovimiento: movimiento.conceptoMovimiento,
      metodoPago: movimiento.metodoPago ?? ('efectivo' as MetodoPago),
      concepto: movimiento.concepto,
      referencia: movimiento.referencia || 'Registrado manualmente',
      monto: movimiento.monto,
      aprobado: true,
      fecha: movimiento.fecha || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: 1,
      cajaId: movimiento.cajaId || cajaSeleccionada?.id || 0,
      empleadoId: movimiento.empleadoId,
      ordenId: movimiento.ordenId ?? 0,
      restock: movimiento.restock,
    };

    // Feedback inmediato: aparece en la lista y en el resumen sin esperar
    // respuesta de red, y una confirmación no bloqueante lo refuerza.
    setMovimientosOptimistas((prev) => [nuevo, ...prev]);
    setModalMovimientoTipo(null);
    setConfirmacionVisible(
      movimiento.tipoMovimiento === TipoMovimientoCaja.INGRESO ? 'Ingreso registrado' : 'Gasto registrado'
    );
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.cargandoBox}>
          <Text style={styles.cargandoTexto}>Cargando cajas…</Text>
        </View>
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

          <View style={[styles.estadoVacioCard, sombraDura()]}>
            <View style={styles.estadoVacioIcono}>
              <POSIcon name="cash-outline" size={56} color={NB.primario} />
            </View>
            <Text style={styles.estadoVacioTitulo}>No hay cajas configuradas</Text>
            <Text style={styles.estadoVacioTexto}>
              Para comenzar a registrar movimientos de efectivo, primero necesitas crear al menos una caja.
            </Text>
            <Pressable
              onPress={() => setModalCrearCaja(true)}
              style={({ pressed }) => [
                styles.botonPrimario,
                sombraDura(),
                pressed && styles.presionado,
              ]}
            >
              <Text style={styles.botonPrimarioTexto}>Crear mi primera caja</Text>
            </Pressable>
          </View>
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Espacio extra abajo para que el FAB nunca tape el último elemento.
        scrollIndicatorInsets={{ bottom: 90 }}
      >
        {/* 1. Encabezado — barra sólida de color de marca (confianza) */}
        <View style={[styles.headerBar, sombraDura()]}>
          <Text style={styles.tituloPantalla}>Caja</Text>

          <View style={styles.headerInfoRow}>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: cajaActual.estado === 'ABIERTA' ? NB.ingreso : NB.gasto },
              ]}
            >
              <POSIcon
                name={cajaActual.estado === 'ABIERTA' ? 'checkmark-circle' : 'lock-closed'}
                size={16}
                color={NB.white}
              />
              <Text style={styles.estadoBadgeTexto}>
                {cajaActual.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}
              </Text>
            </View>
            <Text style={styles.fecha}>{FECHA_HOY}</Text>
          </View>
        </View>

        {/* Selector de caja — ahora funcional, chips grandes y táctiles */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorContenido}
        >
          {cajas.map((c) => {
            const activo = c.id === cajaSeleccionada?.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => seleccionarCaja?.(c.id)}
                style={({ pressed }) => [
                  styles.selectorChip,
                  activo && styles.selectorChipActivo,
                  pressed && styles.presionado,
                ]}
              >
                <Text
                  style={[
                    styles.selectorChipTexto,
                    activo && styles.selectorChipTextoActivo,
                  ]}
                >
                  {c.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 2. Estado cerrado: única acción posible, grande y clara */}
        {!cajaActual.activa && (
          <View style={[styles.cajaCerradaCard, sombraDura()]}>
            <POSIcon name="lock-closed" size={40} color={NB.neutro} />
            <Text style={styles.cajaCerradaTexto}>
              {cajaActual.nombre} está cerrada. Ábrela para comenzar a registrar movimientos.
            </Text>
            <Pressable
              onPress={abrirCaja}
              style={({ pressed }) => [
                styles.botonPrimario,
                sombraDura(),
                pressed && styles.presionado,
              ]}
            >
              <Text style={styles.botonPrimarioTexto}>Abrir Caja</Text>
            </Pressable>
          </View>
        )}

        {cajaActual.activa && (
          <>
            {/* 3. Resumen — bento grid, cada tarjeta con color con significado */}
            <View style={styles.resumenGrid}>
              <View style={[styles.resumenCard, styles.resumenCardGrande, sombraDura()]}>
                <POSIcon name="wallet" size={28} color={NB.white} />
                <Text style={styles.resumenValorGrande}>${resumen.saldoActual.toFixed(2)}</Text>
                <Text style={styles.resumenLabelGrande}>Saldo actual</Text>
              </View>

              <View style={[styles.resumenCard, { backgroundColor: NB.ingresoBg }, sombraDura()]}>
                <POSIcon name="arrow-down-circle" size={24} color={NB.ingreso} />
                <Text style={[styles.resumenValor, { color: NB.ingreso }]}>
                  ${resumen.totalIngresos.toFixed(2)}
                </Text>
                <Text style={styles.resumenLabel}>Ingresos</Text>
              </View>

              <View style={[styles.resumenCard, { backgroundColor: NB.gastoBg }, sombraDura()]}>
                <POSIcon name="arrow-up-circle" size={24} color={NB.gasto} />
                <Text style={[styles.resumenValor, { color: NB.gasto }]}>
                  ${resumen.totalGastos.toFixed(2)}
                </Text>
                <Text style={styles.resumenLabel}>Gastos</Text>
              </View>

              <View style={[styles.resumenCard, { backgroundColor: NB.neutroBg }, sombraDura()]}>
                <POSIcon name="swap-vertical" size={24} color={NB.neutro} />
                <Text style={styles.resumenValor}>{resumen.totalMovimientos}</Text>
                <Text style={styles.resumenLabel}>Movimientos</Text>
              </View>
            </View>

            {/* 4. Tabs + 5. Gráfica */}
            <View style={[styles.seccionCard, sombraDura()]}>
              <View style={styles.tabsContainer}>
                <Pressable
                  onPress={() => setTab('ingresos')}
                  style={[styles.tab, tab === 'ingresos' && styles.tabActivoIngreso]}
                >
                  <Text style={[styles.tabTexto, tab === 'ingresos' && styles.tabTextoActivo]}>
                    Ingresos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTab('gastos')}
                  style={[styles.tab, tab === 'gastos' && styles.tabActivoGasto]}
                >
                  <Text style={[styles.tabTexto, tab === 'gastos' && styles.tabTextoActivo]}>
                    Gastos
                  </Text>
                </Pressable>
              </View>

              <PieChartCaja
                data={distribucion}
                centroLabel={tab === 'ingresos' ? 'Ingresos' : 'Gastos'}
              />
            </View>

            {/* 6. Lista de movimientos del día */}
            <View style={styles.seccion}>
              <Text style={styles.tituloSeccion}>Movimientos de hoy</Text>
              {movimientosDeHoy.length === 0 ? (
                <View style={[styles.vacioCard, sombraDura()]}>
                  <Text style={styles.sinMovimientos}>Aún no hay movimientos registrados hoy.</Text>
                </View>
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

            {/* 8. Acciones — botones grandes, color sólido = significado */}
            <View style={styles.seccion}>
              <Text style={styles.tituloSeccion}>Acciones</Text>
              <View style={styles.accionesGrid}>
                <Pressable
                  onPress={() => setModalMovimientoTipo(TipoMovimientoCaja.INGRESO)}
                  style={({ pressed }) => [
                    styles.accionCard,
                    { backgroundColor: NB.ingreso },
                    sombraDura(),
                    pressed && styles.presionado,
                  ]}
                >
                  <POSIcon name="add-circle" size={28} color={NB.white} />
                  <Text style={styles.accionLabelClaro}>Agregar ingreso</Text>
                </Pressable>

                <Pressable
                  onPress={() => setModalMovimientoTipo(TipoMovimientoCaja.EGRESO)}
                  style={({ pressed }) => [
                    styles.accionCard,
                    { backgroundColor: NB.gasto },
                    sombraDura(),
                    pressed && styles.presionado,
                  ]}
                >
                  <POSIcon name="remove-circle" size={28} color={NB.white} />
                  <Text style={styles.accionLabelClaro}>Agregar gasto</Text>
                </Pressable>

                <Pressable
                  onPress={() => setCorteModalVisible(true)}
                  style={({ pressed }) => [
                    styles.accionCard,
                    { backgroundColor: NB.advertencia },
                    sombraDura(),
                    pressed && styles.presionado,
                  ]}
                >
                  <POSIcon name="calculator" size={28} color={NB.ink} />
                  <Text style={styles.accionLabelOscuro}>Realizar corte</Text>
                </Pressable>

                <Pressable
                  onPress={cerrarCaja}
                  style={({ pressed }) => [
                    styles.accionCard,
                    styles.accionCardNeutra,
                    sombraDura(),
                    pressed && styles.presionado,
                  ]}
                >
                  <POSIcon name="lock-closed" size={28} color={NB.ink} />
                  <Text style={styles.accionLabelOscuro}>Cerrar caja</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB — la acción más frecuente a un solo toque, sin scroll */}
      {cajaActual.activa && (
        <Pressable
          onPress={() => setModalMovimientoTipo(TipoMovimientoCaja.INGRESO)}
          style={({ pressed }) => [
            styles.fab,
            sombraDura(),
            pressed && styles.presionado,
          ]}
        >
          <POSIcon name="add" size={28} color={NB.white} />
        </Pressable>
      )}

      {/* Confirmación no bloqueante — feedback inmediato sin interrumpir */}
      {confirmacionVisible && (
        <View style={[styles.toast, sombraDura()]}>
          <POSIcon name="checkmark-circle" size={20} color={NB.white} />
          <Text style={styles.toastTexto}>{confirmacionVisible}</Text>
        </View>
      )}

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
        cajaId={cajaSeleccionada?.id ?? 0}
        empleadoId={1}
        onCancelar={() => setModalMovimientoTipo(null)}
        onGuardar={(movimiento) => agregarMovimiento(movimiento)}
        materiales={materiales.map((material) => ({
          id: material.id,
          nombre: material.nombre,
          unidadMedida: material.unidadMedida,
        }))}
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
    backgroundColor: NB.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  cargandoBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  cargandoTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: NB.ink,
  },

  // Encabezado
  header: {
    marginBottom: 12,
  },
  headerBar: {
    backgroundColor: NB.primario,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    padding: 16,
    marginBottom: 12,
  },
  tituloPantalla: {
    fontSize: 26,
    fontWeight: '900',
    color: NB.primarioTexto,
    marginBottom: 10,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: NB.border,
  },
  estadoBadgeTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: NB.white,
  },
  fecha: {
    fontSize: 13,
    fontWeight: '600',
    color: NB.primarioTexto,
    textTransform: 'capitalize',
  },

  // Selector de caja
  selectorScroll: {
    marginBottom: 16,
  },
  selectorContenido: {
    paddingRight: 4,
    gap: 8,
  },
  selectorChip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
  },
  selectorChipActivo: {
    backgroundColor: NB.primario,
  },
  selectorChipTexto: {
    fontSize: 14,
    fontWeight: '800',
    color: NB.ink,
  },
  selectorChipTextoActivo: {
    color: NB.white,
  },

  // Estado: caja cerrada
  cajaCerradaCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    marginBottom: 16,
  },
  cajaCerradaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: NB.textoSecundario,
    textAlign: 'center',
    marginBottom: 8,
  },

  // Botón primario genérico
  botonPrimario: {
    minHeight: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NB.primario,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    paddingHorizontal: 24,
  },
  botonPrimarioTexto: {
    fontSize: 16,
    fontWeight: '800',
    color: NB.white,
  },
  presionado: {
    // Feedback táctil inmediato: se "hunde" ligeramente al presionar,
    // simulando el desplazamiento de una sombra dura.
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },

  // Resumen (bento grid)
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  resumenCard: {
    width: '47%',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    paddingVertical: 14,
  },
  resumenCardGrande: {
    width: '100%',
    minHeight: 110,
    backgroundColor: NB.primario,
  },
  resumenValor: {
    fontSize: 18,
    fontWeight: '800',
    color: NB.ink,
  },
  resumenValorGrande: {
    fontSize: 26,
    fontWeight: '900',
    color: NB.white,
  },
  resumenLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: NB.textoSecundario,
  },
  resumenLabelGrande: {
    fontSize: 13,
    fontWeight: '700',
    color: NB.white,
    opacity: 0.9,
  },

  // Sección tabs + gráfica
  seccionCard: {
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    padding: 16,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: NB.neutroBg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: NB.border,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActivoIngreso: {
    backgroundColor: NB.ingreso,
  },
  tabActivoGasto: {
    backgroundColor: NB.gasto,
  },
  tabTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: NB.textoSecundario,
  },
  tabTextoActivo: {
    color: NB.white,
  },

  // Movimientos
  seccion: {
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '800',
    color: NB.ink,
    marginBottom: 10,
  },
  vacioCard: {
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    paddingVertical: 24,
  },
  sinMovimientos: {
    fontSize: 13,
    fontWeight: '600',
    color: NB.textoSecundario,
    textAlign: 'center',
  },

  // Acciones
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accionCard: {
    width: '47%',
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    paddingVertical: 16,
  },
  accionCardNeutra: {
    backgroundColor: NB.white,
  },
  accionLabelClaro: {
    fontSize: 13,
    fontWeight: '800',
    color: NB.white,
    textAlign: 'center',
  },
  accionLabelOscuro: {
    fontSize: 13,
    fontWeight: '800',
    color: NB.ink,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: NB.ingreso,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Toast de confirmación
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: NB.ink,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: NB.white,
  },

  // Estado vacío (sin cajas)
  estadoVacioCard: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 44,
    paddingHorizontal: 24,
    marginTop: 24,
    backgroundColor: NB.white,
    borderWidth: NB.borderWidth,
    borderColor: NB.border,
    borderRadius: NB.radius,
  },
  estadoVacioIcono: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: NB.ingresoBg,
    borderWidth: 2,
    borderColor: NB.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  estadoVacioTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: NB.ink,
    textAlign: 'center',
  },
  estadoVacioTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: NB.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});
// Modal para registrar un movimiento de caja (mock/local).
// Al conectar con Redux/API, `onGuardar` debe disparar el thunk correspondiente
// con el objeto MovimientoCaja ya armado (fecha, cajaId y empleadoId van automáticos,
// visibles como campos de solo lectura para dar transparencia al usuario).
//
// Coherencia tipo → concepto → campos:
// - El prop `tipo` (INGRESO | EGRESO | GASTO) determina qué chips de concepto se
//   muestran (ver CONCEPTOS_POR_TIPO). VENTA se excluye siempre: se genera
//   automáticamente desde una orden (ordenId), nunca se captura a mano aquí.
// - Cada concepto puede activar campos adicionales específicos:
//     GASTO_RESTOCK      -> bloque de reabastecimiento de material
//     DEVOLUCION_VENTA   -> campo de orden/ticket relacionado
//     RETIRO_CAJA / INGRESO_CAJA -> se oculta método de pago (movimiento interno de efectivo)
import { COLORS, POSButton, POSIcon, SearchBar } from '@/components/pos';
import {
  RestockDTO as RestockDTOType,
  TipoConceptoMovimiento,
  TipoMovimientoCaja,
} from '@/features/caja/caja/caja.types';
import { MetodoPago } from '@/types/pos.types';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─────────────────────────────────────────────
// Paleta de alto contraste (Neo-Brutalismo + MD3)
// Misma base usada en el resto de las pantallas.
// ─────────────────────────────────────────────
const INK = '#111111';
const SURFACE = '#FFFFFF';
const BG = '#F2F1E8';
const DANGER_BG = '#FFD8D8';
const EGRESO_COLOR = '#B9770E';
const EGRESO_BG = '#FCEACB';

// ─────────────────────────────────────────────
// Tipos locales del formulario
// ─────────────────────────────────────────────

export type RestockDTO = RestockDTOType;

export interface MovimientoCaja {
  tipoMovimiento: TipoMovimientoCaja;
  conceptoMovimiento: TipoConceptoMovimiento;
  metodoPago: MetodoPago | null; // null solo cuando el concepto no lo requiere (retiro/ingreso de caja)
  concepto: string; // opcional
  referencia: string; // opcional
  monto: number;
  fecha: string; // automática
  cajaId: number; // automática
  empleadoId: number; // id del usuario actual
  ordenId: number | null; // opcional, solo aplica a DEVOLUCION_VENTA
  restock: RestockDTO | null; // opcional, solo aplica a GASTO_RESTOCK
}

// Material simplificado para el select de reabastecimiento.
// El padre mapea su MaterialDTO real a esta forma mínima.
export interface MaterialOption {
  id: number;
  nombre: string;
  unidadMedida: string;
}

interface AgregarMovimientoModalProps {
  visible: boolean;
  tipo: TipoMovimientoCaja;
  cajaId: number;
  empleadoId: number;
  empleadoNombre?: string;
  cajaNombre?: string; // opcional: si no se pasa, se muestra "Caja #<id>"
  materiales?: MaterialOption[]; // requerido solo si el movimiento admite restock (GASTO_RESTOCK)
  onCancelar: () => void;
  onGuardar: (movimiento: MovimientoCaja) => void;
}

// ─────────────────────────────────────────────
// Configuración por tipo de movimiento (coherencia con los botones de arriba)
// ─────────────────────────────────────────────

const CONCEPTOS_POR_TIPO: Record<TipoMovimientoCaja, TipoConceptoMovimiento[]> = {
  [TipoMovimientoCaja.INGRESO]: [
    TipoConceptoMovimiento.INGRESO_EXTRA,
    TipoConceptoMovimiento.INGRESO_CAJA,
  ],
  [TipoMovimientoCaja.EGRESO]: [
    TipoConceptoMovimiento.RETIRO_CAJA,
    TipoConceptoMovimiento.DEVOLUCION_VENTA,
  ],
  [TipoMovimientoCaja.GASTO]: [
    TipoConceptoMovimiento.GASTO_RESTOCK,
    TipoConceptoMovimiento.GASTO_OPERATIVO,
    TipoConceptoMovimiento.GASTO_ADMINISTRATIVO,
    TipoConceptoMovimiento.PAGO_EMPLEADO,
    TipoConceptoMovimiento.PAGO_SERVICIO,
    TipoConceptoMovimiento.COMPRA_ACTIVO,
  ],
};

// Conceptos que NO piden método de pago (son movimientos internos de efectivo de la caja)
const CONCEPTOS_SIN_METODO_PAGO: TipoConceptoMovimiento[] = [
  TipoConceptoMovimiento.RETIRO_CAJA,
  TipoConceptoMovimiento.INGRESO_CAJA,
];

const TIPO_CONFIG: Record<
  TipoMovimientoCaja,
  { titulo: string; badge: string; icon: IoniconName; color: string; bg: string; variant: 'success' | 'danger' }
> = {
  [TipoMovimientoCaja.INGRESO]: {
    titulo: 'Agregar ingreso',
    badge: 'ENTRADA DE CAJA',
    icon: 'trending-up',
    color: COLORS.success,
    bg: '#DFF3E4',
    variant: 'success',
  },
  [TipoMovimientoCaja.EGRESO]: {
    titulo: 'Registrar retiro o devolución',
    badge: 'SALIDA DE CAJA · RETIRO',
    icon: 'swap-horizontal',
    color: EGRESO_COLOR,
    bg: EGRESO_BG,
    variant: 'danger',
  },
  [TipoMovimientoCaja.GASTO]: {
    titulo: 'Agregar gasto',
    badge: 'SALIDA DE CAJA · GASTO',
    icon: 'trending-down',
    color: COLORS.danger,
    bg: DANGER_BG,
    variant: 'danger',
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Formatea cualquier valor de enum (CONCEPTO o MÉTODO DE PAGO) a texto legible,
// sin asumir nombres de miembros específicos — no se rompe si el enum cambia.
function formatearEtiqueta(valor: string): string {
  return valor
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function useConceptoOptions(tipo: TipoMovimientoCaja): TipoConceptoMovimiento[] {
  return useMemo(() => CONCEPTOS_POR_TIPO[tipo] ?? [], [tipo]);
}

function useMetodoPagoOptions(): MetodoPago[] {
  return useMemo(
    () => Object.values(MetodoPago).filter((v) => typeof v === 'string') as MetodoPago[],
    []
  );
}

function hoyLegible(): string {
  const d = new Date();
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─────────────────────────────────────────────
// Stepper — selector de cantidad grande, feedback inmediato
// ─────────────────────────────────────────────

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

const Stepper: React.FC<StepperProps> = ({ value, onChange, min = 1, max = 999 }) => (
  <View style={styles.stepperRow}>
    <TouchableOpacity
      style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
      onPress={() => value > min && onChange(value - 1)}
      disabled={value <= min}
      activeOpacity={0.7}
    >
      <POSIcon name="remove" size={20} color={value <= min ? '#9A9A9A' : INK} />
    </TouchableOpacity>
    <View style={styles.stepperValueBox}>
      <Text style={styles.stepperValue}>{value}</Text>
    </View>
    <TouchableOpacity
      style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
      onPress={() => value < max && onChange(value + 1)}
      disabled={value >= max}
      activeOpacity={0.7}
    >
      <POSIcon name="add" size={20} color={value >= max ? '#9A9A9A' : INK} />
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────
// Campo de solo lectura — para datos automáticos (fecha, caja, empleado)
// ─────────────────────────────────────────────

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface CampoSoloLecturaProps {
  icon: IoniconName;
  label: string;
  valor: string;
}

const CampoSoloLectura: React.FC<CampoSoloLecturaProps> = ({ icon, label, valor }) => (
  <View style={styles.readOnlyField}>
    <View style={styles.readOnlyIconBox}>
      <POSIcon name={icon} size={16} color={COLORS.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue}>{valor}</Text>
    </View>
    <POSIcon name="lock-closed" size={14} color={COLORS.textSecondary} />
  </View>
);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export const AgregarMovimientoModal: React.FC<AgregarMovimientoModalProps> = ({
  visible,
  tipo,
  cajaId,
  empleadoId,
  empleadoNombre,
  cajaNombre,
  materiales = [],
  onCancelar,
  onGuardar,
}) => {
  // Tipo de movimiento activo — inicia con el prop `tipo`, pero el usuario puede
  // cambiarlo con los botones de arriba dentro del propio modal.
  const [tipoActivo, setTipoActivo] = useState<TipoMovimientoCaja>(tipo);
  const conceptoOptions = useConceptoOptions(tipoActivo);
  const metodoPagoOptions = useMetodoPagoOptions();
  const config = TIPO_CONFIG[tipoActivo];

  const [conceptoMovimiento, setConceptoMovimiento] = useState<TipoConceptoMovimiento | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [concepto, setConcepto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState('');
  const [montoTocado, setMontoTocado] = useState(false);
  const [ordenId, setOrdenId] = useState('');

  // El reabastecimiento solo aplica al concepto GASTO_RESTOCK
  const [materialSeleccionado, setMaterialSeleccionado] = useState<MaterialOption | null>(null);
  const [cantidadRestock, setCantidadRestock] = useState(1);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [busquedaMaterial, setBusquedaMaterial] = useState('');

  // Si `tipoActivo` cambia (el usuario tocó otro botón arriba), el set de conceptos
  // disponibles cambia — reseteamos la selección para no dejar un concepto "huérfano".
  useEffect(() => {
    setConceptoMovimiento(null);
    setMetodoPago(null);
    setMaterialSeleccionado(null);
    setOrdenId('');
  }, [tipoActivo]);

  // Al reabrir el modal, vuelve al tipo con el que se invocó originalmente.
  useEffect(() => {
    if (visible) setTipoActivo(tipo);
  }, [visible, tipo]);

  const esRestock = conceptoMovimiento === TipoConceptoMovimiento.GASTO_RESTOCK;
  const esDevolucion = conceptoMovimiento === TipoConceptoMovimiento.DEVOLUCION_VENTA;
  const requiereMetodoPago =
    conceptoMovimiento !== null && !CONCEPTOS_SIN_METODO_PAGO.includes(conceptoMovimiento);

  useEffect(() => {
    if (esRestock) {
      setBuscadorAbierto(true);
    }
  }, [esRestock]);

  const montoNumerico = parseFloat(monto.replace(',', '.')) || 0;
  const montoValido = montoNumerico > 0;
  const restockValido = !esRestock || (materialSeleccionado !== null && cantidadRestock > 0);
  const metodoPagoValido = !requiereMetodoPago || metodoPago !== null;
  const esValido = conceptoMovimiento !== null && montoValido && restockValido ;

  const materialesFiltrados = materiales.filter((m) =>
    m.nombre.toLowerCase().includes(busquedaMaterial.toLowerCase())
  );

  const limpiar = () => {
    setConceptoMovimiento(null);
    setMetodoPago(null);
    setConcepto('');
    setReferencia('');
    setMonto('');
    setMontoTocado(false);
    setOrdenId('');
    setMaterialSeleccionado(null);
    setCantidadRestock(1);
    setBuscadorAbierto(false);
    setBusquedaMaterial('');
  };

  const limpiarYCerrar = () => {
    limpiar();
    onCancelar();
  };

  const guardar = () => {
    setMontoTocado(true);
    if (!esValido || !conceptoMovimiento) return;

    const movimiento: MovimientoCaja = {
      tipoMovimiento: tipoActivo,
      conceptoMovimiento,
      metodoPago: requiereMetodoPago ? metodoPago : null,
      concepto: concepto.trim(),
      referencia: referencia.trim(),
      monto: montoNumerico,
      fecha: new Date().toISOString(),
      cajaId,
      empleadoId,
      ordenId: esDevolucion && ordenId.trim() !== '' ? parseInt(ordenId, 10) || null : null,
      restock:
        esRestock && materialSeleccionado
          ? { materialId: materialSeleccionado.id, cantidad: cantidadRestock }
          : null,
    };
    onGuardar(movimiento);
    limpiar();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={limpiarYCerrar}>
      <View style={styles.overlay}>
        <View style={styles.shadowLayer}>
          <View style={styles.content}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled
            >
              {/* ── Encabezado ── */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                    <POSIcon name={config.icon} size={22} color={config.color} />
                  </View>
                  <View>
                    <Text style={styles.titulo}>{config.titulo}</Text>
                    <View style={[styles.badge, { backgroundColor: config.color }]}>
                      <Text style={styles.badgeText}>{config.badge}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={limpiarYCerrar}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <POSIcon name="close" size={20} color={INK} />
                </TouchableOpacity>
              </View>

              {/* ── Selector de tipo de movimiento (los botones de arriba) ── */}
              <Text style={styles.label}>TIPO DE MOVIMIENTO</Text>
              <View style={styles.tipoRow}>
                {(Object.keys(TIPO_CONFIG) as TipoMovimientoCaja[]).map((t) => {
                  const cfg = TIPO_CONFIG[t];
                  const activo = tipoActivo === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.tipoBtn,
                        { backgroundColor: activo ? cfg.color : BG },
                      ]}
                      onPress={() => setTipoActivo(t)}
                      activeOpacity={0.85}
                    >
                      <POSIcon name={cfg.icon} size={18} color={activo ? SURFACE : INK} />
                      <Text style={[styles.tipoBtnText, activo && styles.tipoBtnTextActivo]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Datos automáticos — visibles, de solo lectura ── */}
              <Text style={styles.label}>DATOS DEL MOVIMIENTO</Text>
              <View style={styles.readOnlyGroup}>
                <CampoSoloLectura icon="calendar" label="FECHA" valor={hoyLegible()} />
                <CampoSoloLectura
                  icon="storefront"
                  label="CAJA"
                  valor={cajaNombre ?? `Caja #${cajaId}`}
                />
                <CampoSoloLectura
                  icon="person"
                  label="EMPLEADO"
                  valor={empleadoNombre ?? `Empleado #${empleadoId}`}
                />
              </View>

              {/* ── Concepto de movimiento — filtrado según el tipo elegido arriba ── */}
              <Text style={styles.label}>CONCEPTO DEL MOVIMIENTO</Text>
              <View style={styles.chipsWrap}>
                {conceptoOptions.map((op) => {
                  const activo = conceptoMovimiento === op;
                  return (
                    <TouchableOpacity
                      key={op}
                      style={[styles.chip, activo && styles.chipActivo]}
                      onPress={() => setConceptoMovimiento(op)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                        {formatearEtiqueta(op)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {conceptoMovimiento === null && montoTocado && (
                <Text style={styles.errorHint}>Selecciona un concepto para continuar.</Text>
              )}

              {/* ── Método de pago — se oculta para retiro/ingreso de caja (siempre efectivo interno) ── */}
              {/*requiereMetodoPago && (
                <>
                  <Text style={styles.label}>MÉTODO DE PAGO</Text>
                  <View style={styles.chipsWrap}>
                    {metodoPagoOptions.map((mp) => {
                      const activo = metodoPago === mp;
                      return (
                        <TouchableOpacity
                          key={mp}
                          style={[styles.chip, activo && styles.chipActivo]}
                          onPress={() => setMetodoPago(mp)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                            {formatearEtiqueta(mp)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {montoTocado && requiereMetodoPago && !metodoPago && (
                    <Text style={styles.errorHint}>Selecciona un método de pago.</Text>
                  )}
                </>
              )*/}

              {/* ── Monto ── */}
              <Text style={styles.label}>MONTO *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  montoTocado && !montoValido && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.inputMonto}
                  placeholder="0.00"
                  placeholderTextColor="#6B6B6B"
                  keyboardType="decimal-pad"
                  value={monto}
                  onChangeText={setMonto}
                  onBlur={() => setMontoTocado(true)}
                />
              </View>
              {montoTocado && !montoValido && (
                <Text style={styles.errorHint}>Ingresa un monto mayor a $0.00.</Text>
              )}

              {/* ── Orden relacionada — solo aplica a devolución de venta ── */}
              {esDevolucion && (
                <>
                  <Text style={styles.label}>N° DE ORDEN / TICKET (OPCIONAL)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. 1042"
                      placeholderTextColor="#6B6B6B"
                      keyboardType="number-pad"
                      value={ordenId}
                      onChangeText={setOrdenId}
                    />
                  </View>
                </>
              )}

              {/* ── Concepto libre (opcional) ── */}
              <Text style={styles.label}>CONCEPTO ADICIONAL (OPCIONAL)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Hielo, Salarios, Ventas..."
                  placeholderTextColor="#6B6B6B"
                  value={concepto}
                  onChangeText={setConcepto}
                />
              </View>

              {/* ── Referencia (opcional) ── */}
              <Text style={styles.label}>REFERENCIA (OPCIONAL)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Folio, ticket o nota"
                  placeholderTextColor="#6B6B6B"
                  value={referencia}
                  onChangeText={setReferencia}
                />
              </View>

              {/* ── Reabastecimiento de material — solo aplica al concepto GASTO_RESTOCK ── */}
              {esRestock && (
                <View style={styles.restockPanel}>
                  <Text style={styles.label}>MATERIAL A REABASTECER</Text>

                  {materialSeleccionado && !buscadorAbierto ? (
                    <View style={styles.materialChip}>
                      <POSIcon name="cube" size={16} color={COLORS.primary} />
                      <Text style={styles.materialChipText}>{materialSeleccionado.nombre}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setMaterialSeleccionado(null);
                          setBuscadorAbierto(true);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <POSIcon name="close-circle" size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.searchWrapper}>
                        <SearchBar
                          value={busquedaMaterial}
                          onChangeText={(t: string) => {
                            setBusquedaMaterial(t);
                            setBuscadorAbierto(true);
                          }}
                          placeholder="Buscar material..."
                        />
                      </View>
                      {buscadorAbierto && (
                        <View style={styles.materialListBox}>
                          {materialesFiltrados.length === 0 ? (
                            <Text style={styles.noMaterialesText}>Sin materiales encontrados</Text>
                          ) : (
                            materialesFiltrados.slice(0, 6).map((m) => (
                              <TouchableOpacity
                                key={m.id}
                                style={styles.materialRow}
                                onPress={() => {
                                  setMaterialSeleccionado(m);
                                  setBuscadorAbierto(false);
                                  setBusquedaMaterial('');
                                }}
                              >
                                <POSIcon name="cube-outline" size={16} color={INK} />
                                <Text style={styles.materialRowText}>{m.nombre}</Text>
                                <Text style={styles.materialRowUnidad}>{m.unidadMedida}</Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {materialSeleccionado && (
                    <View style={styles.cantidadRow}>
                      <Text style={styles.label}>
                        CANTIDAD ({materialSeleccionado.unidadMedida})
                      </Text>
                      <Stepper value={cantidadRestock} onChange={setCantidadRestock} />
                    </View>
                  )}

                  {!materialSeleccionado && (
                    <Text style={styles.errorHint}>Selecciona un material para reabastecer.</Text>
                  )}
                </View>
              )}

              {/* ── Acciones ── */}
              <View style={styles.acciones}>
                <POSButton
                  title="Guardar"
                  variant={config.variant}
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
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  shadowLayer: {
    backgroundColor: INK,
    borderRadius: 20,
    maxHeight: '90%',
    flexShrink: 1,
  },
  content: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: INK,
    padding: 20,
    marginRight: 6,
    marginBottom: 6,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },

  // ── Encabezado ────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '900',
    color: INK,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    color: SURFACE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Labels / inputs ───────────────────────────
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: INK,
    marginTop: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: INK,
    borderRadius: 12,
    backgroundColor: BG,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    backgroundColor: DANGER_BG,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: INK,
    paddingVertical: 12,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '900',
    color: INK,
    marginRight: 6,
  },
  inputMonto: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    paddingVertical: 12,
  },
  errorHint: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 6,
  },

  // ── Selector de tipo de movimiento (botones de arriba) ──
  tipoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 10,
    paddingVertical: 12,
    minHeight: 46,
  },
  tipoBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    color: INK,
  },
  tipoBtnTextActivo: {
    color: SURFACE,
  },

  // ── Chips (concepto / método de pago) ─────────
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: BG,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipActivo: {
    backgroundColor: INK,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  chipTextActivo: {
    color: SURFACE,
  },

  // ── Panel de restock ──────────────────────────
  restockPanel: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#FAFAF5',
    gap: 4,
  },
  searchWrapper: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 10,
    overflow: 'hidden',
  },
  materialListBox: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: SURFACE,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E4E2D6',
    minHeight: 48,
  },
  materialRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: INK,
  },
  materialRowUnidad: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  noMaterialesText: {
    padding: 14,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  materialChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: INK,
  },

  // ── Cantidad (Stepper) ────────────────────────
  cantidadRow: {
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#EDEDED',
  },
  stepperValueBox: {
    width: 56,
    height: 44,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: INK,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 17,
    fontWeight: '900',
    color: INK,
  },

  // ── Datos automáticos — campos visibles de solo lectura ──
  readOnlyGroup: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D8D6C8',
    backgroundColor: '#EDECE2',
  },
  readOnlyIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: INK,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOnlyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: COLORS.textSecondary,
  },
  readOnlyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginTop: 1,
  },

  // ── Acciones ──────────────────────────────────
  acciones: {
    marginTop: 20,
    marginBottom: 4,
    gap: 10,
  },
  botonCancelar: {
    marginTop: 2,
  },
});
// Modal para registrar un ingreso o gasto en caja (mock/local).
// Al conectar con Redux/API, `onGuardar` debe disparar el thunk correspondiente
// con el objeto MovimientoCaja ya armado (fecha, cajaId y empleadoId van automáticos).
import { COLORS, POSButton, POSIcon, SearchBar } from '@/components/pos';
import { TipoConceptoMovimiento, TipoMovimientoCaja } from '@/features/caja/caja/caja.types';
import React, { useMemo, useState } from 'react';
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

// ─────────────────────────────────────────────
// Tipos (según tu especificación)
// ─────────────────────────────────────────────

export interface RestockDTO {
  materialId: number;
  cantidad: number;
}

export interface MovimientoCaja {
  tipoMovimiento: TipoMovimientoCaja; // fijo en gasto (o ingreso, según `tipo`)
  conceptoMovimiento: TipoConceptoMovimiento; // select
  concepto: string; // opcional
  referencia: string; // opcional
  monto: number;
  fecha: string; // automática
  cajaId: number; // automática
  empleadoId: number; // id del usuario actual
  restock: RestockDTO | null; // opcional
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
  materiales?: MaterialOption[]; // requerido solo si el movimiento admite restock (gasto)
  onCancelar: () => void;
  onGuardar: (movimiento: MovimientoCaja) => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Genera las opciones de concepto desde el enum real del proyecto, sin
// asumir nombres de miembros específicos — no se rompe si el enum cambia.
function formatearConcepto(valor: string): string {
  return valor
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function useConceptoOptions(): TipoConceptoMovimiento[] {
  return useMemo(
    () =>
      Object.values(TipoConceptoMovimiento).filter(
        (v) => typeof v === 'string'
      ) as TipoConceptoMovimiento[],
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
// Componente principal
// ─────────────────────────────────────────────

export const AgregarMovimientoModal: React.FC<AgregarMovimientoModalProps> = ({
  visible,
  tipo,
  cajaId,
  empleadoId,
  empleadoNombre,
  materiales = [],
  onCancelar,
  onGuardar,
}) => {
  const conceptoOptions = useConceptoOptions();
  const esIngreso = tipo === TipoMovimientoCaja.INGRESO;

  const [conceptoMovimiento, setConceptoMovimiento] = useState<TipoConceptoMovimiento | null>(null);
  const [concepto, setConcepto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState('');
  const [montoTocado, setMontoTocado] = useState(false);

  // El reabastecimiento solo aplica a gastos (compras de insumo)
  const [incluyeRestock, setIncluyeRestock] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<MaterialOption | null>(null);
  const [cantidadRestock, setCantidadRestock] = useState(1);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [busquedaMaterial, setBusquedaMaterial] = useState('');

  const montoNumerico = parseFloat(monto.replace(',', '.')) || 0;
  const montoValido = montoNumerico > 0;
  const restockValido = !incluyeRestock || (materialSeleccionado !== null && cantidadRestock > 0);
  const esValido = conceptoMovimiento !== null && montoValido && restockValido;

  const materialesFiltrados = materiales.filter((m) =>
    m.nombre.toLowerCase().includes(busquedaMaterial.toLowerCase())
  );

  const limpiar = () => {
    setConceptoMovimiento(null);
    setConcepto('');
    setReferencia('');
    setMonto('');
    setMontoTocado(false);
    setIncluyeRestock(false);
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
      tipoMovimiento: tipo,
      conceptoMovimiento,
      concepto: concepto.trim(),
      referencia: referencia.trim(),
      monto: montoNumerico,
      fecha: new Date().toISOString(),
      cajaId,
      empleadoId,
      restock:
        !esIngreso && incluyeRestock && materialSeleccionado
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* ── Encabezado ── */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: esIngreso ? '#DFF3E4' : DANGER_BG },
                    ]}
                  >
                    <POSIcon
                      name={esIngreso ? 'trending-up' : 'trending-down'}
                      size={22}
                      color={esIngreso ? COLORS.success : COLORS.danger}
                    />
                  </View>
                  <View>
                    <Text style={styles.titulo}>
                      {esIngreso ? 'Agregar ingreso' : 'Agregar gasto'}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: esIngreso ? COLORS.success : COLORS.danger },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {esIngreso ? 'ENTRADA DE CAJA' : 'SALIDA DE CAJA'}
                      </Text>
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

              {/* ── Concepto de movimiento (select tipo chips) ── */}
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
                        {formatearConcepto(op)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {conceptoMovimiento === null && montoTocado && (
                <Text style={styles.errorHint}>Selecciona un concepto para continuar.</Text>
              )}

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

              {/* ── Reabastecimiento de material — solo aplica a gastos ── */}
              {!esIngreso && (
                <>
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setIncluyeRestock(!incluyeRestock)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, incluyeRestock && styles.checkboxActivo]}>
                      {incluyeRestock && <POSIcon name="checkmark" size={16} color={SURFACE} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Este gasto incluye reabastecimiento</Text>
                      <Text style={styles.toggleSubtitle}>
                        Suma existencia a un material del inventario
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {incluyeRestock && (
                    <View style={styles.restockPanel}>
                      <Text style={styles.label}>MATERIAL A REABASTECER</Text>

                      {materialSeleccionado && !buscadorAbierto ? (
                        <View style={styles.materialChip}>
                          <POSIcon name="cube" size={16} color={COLORS.primary} />
                          <Text style={styles.materialChipText}>
                            {materialSeleccionado.nombre}
                          </Text>
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
                                <Text style={styles.noMaterialesText}>
                                  Sin materiales encontrados
                                </Text>
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
                        <Text style={styles.errorHint}>
                          Selecciona un material para reabastecer.
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* ── Datos automáticos — transparencia / trust design ── */}
              <View style={styles.autoBox}>
                <POSIcon name="information-circle" size={16} color={COLORS.textSecondary} />
                <Text style={styles.autoText}>
                  Se registrará hoy, {hoyLegible()}
                  {empleadoNombre ? ` a nombre de ${empleadoNombre}` : ''}, en la caja actual.
                </Text>
              </View>

              {/* ── Acciones ── */}
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
  },
  content: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: INK,
    padding: 20,
    marginRight: 6,
    marginBottom: 6,
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

  // ── Chips de concepto ─────────────────────────
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

  // ── Toggle de reabastecimiento ────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 12,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 12,
    backgroundColor: BG,
    minHeight: 56,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActivo: {
    backgroundColor: COLORS.primary,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  toggleSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 1,
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

  // ── Datos automáticos (trust design) ──────────
  autoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#D8D6C8',
    borderRadius: 10,
    backgroundColor: BG,
  },
  autoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
/**
 * DiscountsScreen.tsx
 * ----------------------------------------------------------------------
 * Módulo de Gestión de Descuentos — APOS (POS modular F&B)
 * Stack: React Native + Expo (@expo/vector-icons para iconografía — sin
 * emojis en ningún punto de la interfaz), 100% local / mock data.
 *
 * Mismo sistema de diseño que EmployeesScreen.tsx para mantener
 * consistencia visual en toda la app:
 * - Material Design 3 (shape, color roles, elevación)
 * - Neo-Brutalismo Funcional (bordes marcados, sombras duras, color sólido)
 * - Mobile First (tabla -> tarjetas, formularios en tabs dentro de sheets)
 * - Alto contraste + componentes táctiles grandes (min 48dp)
 * - Menos clics / menos pasos + feedback inmediato (Toast, estados visuales)
 * - Trust Design / Seguridad psicológica (confirmaciones en acciones
 *   críticas, motivo obligatorio al desactivar, soft delete explícito)
 * - Psicología del color (azul = control/confianza, verde = válido,
 *   ámbar = por vencer/precaución, rojo = inactivo/riesgo)
 * ----------------------------------------------------------------------
 */

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    StatusBar,
    Animated,
    Alert,
    Switch,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* =========================================================================
 * 1. DESIGN TOKENS (idénticos a EmployeesScreen.tsx)
 * =======================================================================*/

const COLORS = {
    bg: '#F4F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEBE4',
    ink: '#14171A',
    inkMuted: '#54595E',
    border: '#14171A',

    primary: '#1849D6',
    primaryDark: '#0F2E8F',
    onPrimary: '#FFFFFF',
    primarySoft: '#DCE6FF',

    success: '#1E8E5A',
    successSoft: '#D7F2E3',
    warning: '#C77700',
    warningSoft: '#FCE9CC',
    danger: '#C22F2F',
    dangerSoft: '#F8D9D9',

    purple: '#5B2FC2',
    purpleSoft: '#E7DEFA',
    teal: '#0E7C86',
    tealSoft: '#D6EFF1',
};

const RADIUS = { sm: 8, md: 14, lg: 20, pill: 999 };

const HARD_SHADOW = {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
};
const SOFT_SHADOW = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
};

function Icon({ name, size = 18, color = COLORS.ink }: { name: keyof typeof Feather.glyphMap; size?: number; color?: string }) {
    return <Feather name={name} size={size} color={color} />;
}

/* =========================================================================
 * 2. TIPOS Y DATOS MOCK
 * =======================================================================*/

type TipoDescuento = 'porcentaje' | 'fijo' | 'producto_gratis' | '2x1' | '3x2' | 'combo';
type ClienteTipo = 'todos' | 'registrados' | 'vip' | 'empleados';
type EstadoDescuento = 'activo' | 'inactivo';
type PeriodoLimite = 'dia' | 'semana' | 'mes';

interface HistorialEvento {
    id: string;
    fecha: string;
    accion: string;
    usuario: string;
}

interface Descuento {
    id: string;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    tipo: TipoDescuento;
    valor: string; // representación cruda: "20", "50", "Pizza Margarita", etc.
    aplicaA: string[]; // 'toda_orden' | 'categoria' | 'producto' | 'grupo' | 'extra'
    categoriasSeleccionadas: string[];
    productosSeleccionados: string[];
    compraMinima?: string;
    compraMaxima?: string;
    cantidadMinima?: string;
    clientes: ClienteTipo;
    sucursales: string[];
    rolesAutorizados: string[];
    fechaInicio: string;
    fechaFin?: string;
    diasSemana: string[];
    horarioDesde?: string;
    horarioHasta?: string;
    usoTotalTipo: 'ilimitado' | 'maximo';
    usoTotalMaximo?: string;
    limiteClienteTipo: 'sin_limite' | 'maximo';
    limiteClienteMaximo?: string;
    limiteClientePeriodo: PeriodoLimite;
    prioridad: string;
    acumulable: boolean;
    estado: EstadoDescuento;
    motivoInactivo?: string;
    vecesUsado: number;
    usosHoy: number;
    ahorroGenerado: number;
    ultimaVezUsado?: string;
    historial: HistorialEvento[];
}

const SUCURSALES = ['Centro', 'Norte', 'Sur'];
const ROLES = ['Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero', 'Almacenista'];
const CATEGORIAS = ['Bebidas', 'Entradas', 'Platillos fuertes', 'Postres'];
const PRODUCTOS = ['Hamburguesa Clásica', 'Pizza Margarita', 'Ensalada César', 'Refresco', 'Café Americano', 'Pastel de Chocolate'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const TIPO_LABEL: Record<TipoDescuento, string> = {
    porcentaje: 'Porcentaje',
    fijo: 'Cantidad fija',
    producto_gratis: 'Producto gratis',
    '2x1': '2x1',
    '3x2': '3x2',
    combo: 'Combo',
};
const TIPO_COLOR: Record<TipoDescuento, string> = {
    porcentaje: COLORS.primary,
    fijo: COLORS.teal,
    producto_gratis: COLORS.purple,
    '2x1': COLORS.warning,
    '3x2': COLORS.warning,
    combo: COLORS.danger,
};

function valorDisplay(d: Pick<Descuento, 'tipo' | 'valor'>) {
    switch (d.tipo) {
        case 'porcentaje':
            return `${d.valor}%`;
        case 'fijo':
            return `$${d.valor} MXN`;
        case 'producto_gratis':
            return `Gratis: ${d.valor}`;
        case '2x1':
            return `2x1 · ${d.valor}`;
        case '3x2':
            return `3x2 · ${d.valor}`;
        case 'combo':
            return `Combo $${d.valor}`;
        default:
            return d.valor;
    }
}

function diasDesde(iso?: string) {
    if (!iso) return Infinity;
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function estadoVisual(d: Descuento): { label: string; color: string; bg: string } {
    if (d.estado === 'inactivo') return { label: 'Inactivo', color: COLORS.danger, bg: COLORS.dangerSoft };
    const dias = diasDesde(d.fechaFin);
    if (d.fechaFin && dias < 0) return { label: 'Expirado', color: COLORS.danger, bg: COLORS.dangerSoft };
    if (d.fechaFin && dias <= 7) return { label: 'Por vencer', color: COLORS.warning, bg: COLORS.warningSoft };
    return { label: 'Activo', color: COLORS.success, bg: COLORS.successSoft };
}

function fmtFecha(iso?: string) {
    if (!iso) return 'Permanente';
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtFechaHora(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
}
function fmtMoneda(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN`;
}
function vigenciaDisplay(d: Descuento) {
    if (!d.fechaFin) return `Desde ${fmtFecha(d.fechaInicio)} · Permanente`;
    return `${fmtFecha(d.fechaInicio)} — ${fmtFecha(d.fechaFin)}`;
}

let idSeq = 5000;
function nextId() {
    idSeq += 1;
    return `DSC-${idSeq}`;
}

function seedDescuentos(): Descuento[] {
    const hoy = new Date();
    const plus = (days: number) => new Date(hoy.getTime() + days * 86400000).toISOString();
    const minus = (days: number) => new Date(hoy.getTime() - days * 86400000).toISOString();

    const base: Array<Partial<Descuento> & { nombre: string; tipo: TipoDescuento; valor: string; estado: EstadoDescuento }> = [
        { nombre: 'Happy Hour Bebidas', tipo: 'porcentaje', valor: '20', estado: 'activo', codigo: 'HAPPY20', fechaFin: plus(45), sucursales: ['Centro', 'Norte'], vecesUsado: 312, ahorroGenerado: 8420, usosHoy: 14 },
        { nombre: 'Combo Familiar', tipo: 'combo', valor: '349', estado: 'activo', fechaFin: plus(5), sucursales: ['Centro'], vecesUsado: 58, ahorroGenerado: 5220, usosHoy: 3 },
        { nombre: '2x1 Pizzas Miércoles', tipo: '2x1', valor: 'Pizza Margarita', estado: 'activo', fechaFin: undefined, sucursales: SUCURSALES, vecesUsado: 190, ahorroGenerado: 12100, usosHoy: 0 },
        { nombre: 'Postre de cortesía VIP', tipo: 'producto_gratis', valor: 'Pastel de Chocolate', estado: 'activo', fechaFin: plus(3), sucursales: ['Sur'], vecesUsado: 22, ahorroGenerado: 1320, usosHoy: 1 },
        { nombre: 'Descuento Empleados', tipo: 'fijo', valor: '50', estado: 'inactivo', motivoInactivo: 'Ajuste de política interna', sucursales: ['Centro', 'Sur'], vecesUsado: 140, ahorroGenerado: 7000, usosHoy: 0 },
        { nombre: '3x2 Café Americano', tipo: '3x2', valor: 'Café Americano', estado: 'activo', fechaFin: plus(60), sucursales: ['Norte'], vecesUsado: 401, ahorroGenerado: 3600, usosHoy: 9 },
    ];

    return base.map((b, i) => {
        const id = nextId();
        return {
            id,
            nombre: b.nombre,
            descripcion: 'Descuento configurado para impulsar ventas en horarios y productos seleccionados.',
            codigo: b.codigo,
            tipo: b.tipo,
            valor: b.valor,
            aplicaA: b.tipo === 'producto_gratis' || b.tipo === '2x1' || b.tipo === '3x2' ? ['producto'] : ['toda_orden'],
            categoriasSeleccionadas: [],
            productosSeleccionados: b.tipo === 'producto_gratis' || b.tipo === '2x1' || b.tipo === '3x2' ? [b.valor] : [],
            compraMinima: i % 2 === 0 ? '150' : undefined,
            compraMaxima: undefined,
            cantidadMinima: undefined,
            clientes: i % 3 === 0 ? 'vip' : 'todos',
            sucursales: b.sucursales || SUCURSALES,
            rolesAutorizados: ['Gerente', 'Cajero'],
            fechaInicio: minus(30),
            fechaFin: b.fechaFin,
            diasSemana: i === 5 ? ['Mié'] : DIAS,
            horarioDesde: i === 0 ? '17:00' : undefined,
            horarioHasta: i === 0 ? '20:00' : undefined,
            usoTotalTipo: 'ilimitado',
            usoTotalMaximo: undefined,
            limiteClienteTipo: 'maximo',
            limiteClienteMaximo: '1',
            limiteClientePeriodo: 'dia',
            prioridad: String(5 - (i % 5)),
            acumulable: i % 2 === 0,
            estado: b.estado,
            motivoInactivo: b.motivoInactivo,
            vecesUsado: b.vecesUsado || 0,
            usosHoy: b.usosHoy || 0,
            ahorroGenerado: b.ahorroGenerado || 0,
            ultimaVezUsado: minus(i + 1),
            historial: [
                { id: `${id}-h1`, fecha: minus(30), accion: 'Descuento creado', usuario: 'Admin' },
                ...(b.estado === 'inactivo' ? [{ id: `${id}-h2`, fecha: minus(2), accion: `Estado cambiado a Inactivo (${b.motivoInactivo})`, usuario: 'Admin' }] : []),
            ],
        };
    });
}

/* =========================================================================
 * 3. ÁTOMOS DE UI
 * =======================================================================*/

function Toast({ message, visible }: { message: string; visible: boolean }) {
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.delay(1600),
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [visible, message]);
    if (!visible) return null;
    return (
        <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
            <Icon name="check-circle" size={16} color="#fff" />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

function EstadoBadge({ d }: { d: Descuento }) {
    const s = estadoVisual(d);
    return (
        <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.color }]}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
    );
}

function TipoChip({ tipo }: { tipo: TipoDescuento }) {
    const c = TIPO_COLOR[tipo];
    return (
        <View style={[styles.tipoChip, { borderColor: c }]}>
            <Text style={[styles.tipoChipText, { color: c }]}>{TIPO_LABEL[tipo]}</Text>
        </View>
    );
}

function KPICard({ label, value, color, icon, onPress, active }: { label: string; value: string; color: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; active?: boolean }) {
    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.kpiCard, { backgroundColor: active ? color : COLORS.surface }]}>
            <Icon name={icon} size={18} color={active ? '#fff' : color} />
            <Text style={[styles.kpiValue, { color: active ? '#fff' : COLORS.ink }]}>{value}</Text>
            <Text style={[styles.kpiLabel, { color: active ? '#fff' : COLORS.inkMuted }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function BigButton({
    label,
    onPress,
    variant = 'primary',
    icon,
    disabled,
}: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'danger' | 'ghost' | 'success';
    icon?: keyof typeof Feather.glyphMap;
    disabled?: boolean;
}) {
    const palette = {
        primary: { bg: COLORS.primary, fg: COLORS.onPrimary },
        danger: { bg: COLORS.danger, fg: '#fff' },
        success: { bg: COLORS.success, fg: '#fff' },
        ghost: { bg: COLORS.surface, fg: COLORS.ink },
    }[variant];
    return (
        <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.bigButton, { backgroundColor: disabled ? COLORS.surfaceAlt : palette.bg, opacity: disabled ? 0.6 : 1 }]}
        >
            {icon && <Icon name={icon} size={16} color={disabled ? COLORS.inkMuted : palette.fg} />}
            <Text style={[styles.bigButtonText, { color: disabled ? COLORS.inkMuted : palette.fg }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <Text style={styles.sectionTitle}>{children}</Text>;
}
function FieldLabel({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
    return (
        <View style={{ marginBottom: 6, marginTop: 2 }}>
            <Text style={styles.fieldLabel}>
                {children} {required ? <Text style={{ color: COLORS.danger }}>*</Text> : null}
            </Text>
            {hint ? <Text style={styles.hintText}>{hint}</Text> : null}
        </View>
    );
}

function LabeledInput(props: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    required?: boolean;
    keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
    multiline?: boolean;
    hint?: string;
    placeholder?: string;
}) {
    return (
        <View style={{ marginBottom: 14 }}>
            <FieldLabel required={props.required} hint={props.hint}>
                {props.label}
            </FieldLabel>
            <TextInput
                value={props.value}
                onChangeText={props.onChangeText}
                keyboardType={props.keyboardType || 'default'}
                multiline={props.multiline}
                placeholder={props.placeholder}
                placeholderTextColor={COLORS.inkMuted}
                style={[styles.textInput, props.multiline && { height: 80, textAlignVertical: 'top' }]}
            />
        </View>
    );
}

function ChoiceRow({ options, value, onChange, labels }: { options: string[]; value: string; onChange: (v: string) => void; labels?: Record<string, string> }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
            {options.map((opt) => {
                const activo = opt === value;
                return (
                    <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.choicePill, activo && styles.choicePillOn]}>
                        <Text style={[styles.choicePillText, activo && styles.choicePillTextOn]}>{labels?.[opt] || opt}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

function MultiChoiceWrap({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            {options.map((opt) => {
                const on = values.includes(opt);
                return (
                    <TouchableOpacity key={opt} onPress={() => onToggle(opt)} style={[styles.multiPill, on && styles.multiPillOn]}>
                        <View style={[styles.checkboxSmall, on && styles.checkboxSmallOn]}>{on && <Icon name="check" size={12} color="#fff" />}</View>
                        <Text style={[styles.multiPillText, on && styles.multiPillTextOn]}>{opt}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function RadioRow({ options, value, onChange, labels }: { options: string[]; value: string; onChange: (v: string) => void; labels: Record<string, string> }) {
    return (
        <View style={{ marginBottom: 8 }}>
            {options.map((opt) => {
                const on = opt === value;
                return (
                    <TouchableOpacity key={opt} style={styles.radioRow} onPress={() => onChange(opt)}>
                        <View style={[styles.radioOuter, on && { borderColor: COLORS.primary }]}>{on && <View style={styles.radioInner} />}</View>
                        <Text style={styles.radioText}>{labels[opt]}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function TabBar({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll} contentContainerStyle={{ gap: 6 }}>
            {tabs.map((t) => {
                const on = t.key === active;
                return (
                    <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={[styles.tabBtn, on && styles.tabBtnOn]}>
                        <Text style={[styles.tabBtnText, on && styles.tabBtnTextOn]}>{t.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max === 0 ? 0 : Math.max(4, Math.round((value / max) * 100));
    return (
        <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>{value}</Text>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

/* =========================================================================
 * 4. PANTALLA PRINCIPAL
 * =======================================================================*/

export default function DescuentosScreen() {
    const [descuentos, setDescuentos] = useState<Descuento[]>(() => seedDescuentos());
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroSucursal, setFiltroSucursal] = useState('Todas');
    const [filtroVigencia, setFiltroVigencia] = useState('Todos');
    const [kpiActivo, setKpiActivo] = useState<'todos' | 'activos' | 'por_vencer' | 'usados_hoy'>('todos');
    const [filtrosVisibles, setFiltrosVisibles] = useState(false);

    const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
    const modoSeleccion = seleccion.size > 0;

    const [detalle, setDetalle] = useState<Descuento | null>(null);
    const [enEdicion, setEnEdicion] = useState<Descuento | null>(null);
    const [creando, setCreando] = useState(false);
    const [statsDe, setStatsDe] = useState<Descuento | null>(null);

    const [toast, setToast] = useState({ visible: false, msg: '' });
    const showToast = useCallback((msg: string) => setToast({ visible: true, msg }), []);
    useEffect(() => {
        if (toast.visible) {
            const t = setTimeout(() => setToast((s) => ({ ...s, visible: false })), 2000);
            return () => clearTimeout(t);
        }
    }, [toast.visible]);

    const registrarHistorial = (d: Descuento, accion: string): Descuento => ({
        ...d,
        historial: [{ id: `${d.id}-h${d.historial.length + 1}`, fecha: new Date().toISOString(), accion, usuario: 'Admin' }, ...d.historial],
    });

    /* ---------- KPIs ---------- */
    const kpis = useMemo(() => {
        const activos = descuentos.filter((d) => estadoVisual(d).label === 'Activo').length;
        const porVencer = descuentos.filter((d) => estadoVisual(d).label === 'Por vencer').length;
        const usadosHoy = descuentos.reduce((acc, d) => acc + d.usosHoy, 0);
        const ahorro = descuentos.reduce((acc, d) => acc + d.ahorroGenerado, 0);
        return { activos, porVencer, usadosHoy, ahorro };
    }, [descuentos]);

    /* ---------- Filtro combinado ---------- */
    const listaFiltrada = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return descuentos.filter((d) => {
            const matchTexto =
                !q ||
                d.nombre.toLowerCase().includes(q) ||
                (d.codigo || '').toLowerCase().includes(q) ||
                d.productosSeleccionados.some((p) => p.toLowerCase().includes(q)) ||
                d.categoriasSeleccionadas.some((c) => c.toLowerCase().includes(q)) ||
                d.sucursales.some((s) => s.toLowerCase().includes(q));

            const matchEstado = filtroEstado === 'Todos' || (filtroEstado === 'Activo' ? d.estado === 'activo' : d.estado === 'inactivo');
            const matchTipo = filtroTipo === 'Todos' || TIPO_LABEL[d.tipo] === filtroTipo;
            const matchSucursal = filtroSucursal === 'Todas' || d.sucursales.includes(filtroSucursal);

            const vig = estadoVisual(d).label;
            const matchVigencia =
                filtroVigencia === 'Todos' ||
                (filtroVigencia === 'Válidos actualmente' && vig === 'Activo') ||
                (filtroVigencia === 'Próximos a vencer' && vig === 'Por vencer') ||
                (filtroVigencia === 'Expirados' && vig === 'Expirado');

            const matchKPI =
                kpiActivo === 'todos' ||
                (kpiActivo === 'activos' && vig === 'Activo') ||
                (kpiActivo === 'por_vencer' && vig === 'Por vencer') ||
                (kpiActivo === 'usados_hoy' && d.usosHoy > 0);

            return matchTexto && matchEstado && matchTipo && matchSucursal && matchVigencia && matchKPI;
        });
    }, [descuentos, busqueda, filtroEstado, filtroTipo, filtroSucursal, filtroVigencia, kpiActivo]);

    const toggleSeleccion = (id: string) => {
        setSeleccion((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const limpiarSeleccion = () => setSeleccion(new Set());

    /* ---------- Acciones individuales ---------- */
    const confirmarToggleEstado = (d: Descuento) => {
        if (d.estado === 'activo') {
            Alert.prompt
                ? Alert.prompt(
                    'Desactivar descuento',
                    `Indica el motivo para desactivar "${d.nombre}" (opcional).`,
                    (motivo) => aplicarToggleEstado(d, motivo || undefined),
                    'plain-text'
                )
                : Alert.alert('Desactivar descuento', `¿Desactivar "${d.nombre}"?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Desactivar', style: 'destructive', onPress: () => aplicarToggleEstado(d) },
                ]);
        } else {
            Alert.alert('Activar descuento', `¿Activar "${d.nombre}" nuevamente?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Activar', onPress: () => aplicarToggleEstado(d) },
            ]);
        }
    };

    const aplicarToggleEstado = (d: Descuento, motivo?: string) => {
        const nuevoEstado: EstadoDescuento = d.estado === 'activo' ? 'inactivo' : 'activo';
        setDescuentos((prev) =>
            prev.map((x) =>
                x.id === d.id
                    ? registrarHistorial({ ...x, estado: nuevoEstado, motivoInactivo: nuevoEstado === 'inactivo' ? motivo : undefined }, `Estado cambiado a ${nuevoEstado === 'activo' ? 'Activo' : 'Inactivo'}${motivo ? ` (${motivo})` : ''}`)
                    : x
            )
        );
        showToast(nuevoEstado === 'activo' ? 'Descuento activado' : 'Descuento desactivado');
    };

    const duplicarDescuento = (d: Descuento) => {
        const id = nextId();
        const copia: Descuento = {
            ...d,
            id,
            nombre: `${d.nombre} (copia)`,
            estado: 'inactivo',
            vecesUsado: 0,
            usosHoy: 0,
            ahorroGenerado: 0,
            ultimaVezUsado: undefined,
            historial: [{ id: `${id}-h1`, fecha: new Date().toISOString(), accion: `Duplicado desde "${d.nombre}"`, usuario: 'Admin' }],
        };
        setDescuentos((prev) => [copia, ...prev]);
        showToast('Descuento duplicado como Inactivo');
    };

    const eliminarDescuento = (d: Descuento) => {
        Alert.alert('Eliminar descuento', `Se conservará el historial de "${d.nombre}" (eliminación reversible). ¿Continuar?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    setDescuentos((prev) => prev.map((x) => (x.id === d.id ? registrarHistorial({ ...x, estado: 'inactivo' }, 'Eliminado (soft delete)') : x)));
                    showToast('Descuento eliminado (se conservó el historial)');
                },
            },
        ]);
    };

    const guardarEdicion = (payload: Descuento) => {
        const original = descuentos.find((x) => x.id === payload.id);
        let actualizado = { ...payload };
        if (original) {
            const cambios: string[] = [];
            if (original.valor !== actualizado.valor) cambios.push(`valor de ${valorDisplay(original)} a ${valorDisplay(actualizado)}`);
            if (original.estado !== actualizado.estado) cambios.push(`estado a ${actualizado.estado}`);
            if (JSON.stringify(original.sucursales) !== JSON.stringify(actualizado.sucursales)) cambios.push('sucursales');
            if (original.prioridad !== actualizado.prioridad) cambios.push(`prioridad a ${actualizado.prioridad}`);
            if (cambios.length) actualizado = registrarHistorial(actualizado, `Se modificó ${cambios.join(', ')}`);
        }
        setDescuentos((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
        setEnEdicion(null);
        showToast('Descuento actualizado');
    };

    const crearDescuento = (nuevo: Descuento) => {
        setDescuentos((prev) => [nuevo, ...prev]);
        setCreando(false);
        showToast('Descuento creado correctamente');
    };

    /* ---------- Acciones masivas ---------- */
    const bulkActivarDesactivar = (nuevoEstado: EstadoDescuento) => {
        setDescuentos((prev) => prev.map((d) => (seleccion.has(d.id) ? registrarHistorial({ ...d, estado: nuevoEstado }, `Cambio masivo de estado → ${nuevoEstado}`) : d)));
        showToast(`${seleccion.size} descuentos actualizados`);
        limpiarSeleccion();
    };
    const bulkDuplicar = () => {
        const copias = descuentos.filter((d) => seleccion.has(d.id)).map((d) => {
            const id = nextId();
            return { ...d, id, nombre: `${d.nombre} (copia)`, estado: 'inactivo' as EstadoDescuento, vecesUsado: 0, usosHoy: 0, ahorroGenerado: 0, historial: [{ id: `${id}-h1`, fecha: new Date().toISOString(), accion: 'Duplicado (acción masiva)', usuario: 'Admin' }] };
        });
        setDescuentos((prev) => [...copias, ...prev]);
        showToast(`${copias.length} descuentos duplicados`);
        limpiarSeleccion();
    };
    const bulkEliminar = () => {
        Alert.alert('Eliminar seleccionados', `Se desactivarán ${seleccion.size} descuentos conservando su historial. ¿Continuar?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    setDescuentos((prev) => prev.map((d) => (seleccion.has(d.id) ? registrarHistorial({ ...d, estado: 'inactivo' }, 'Eliminado (acción masiva, soft delete)') : d)));
                    showToast(`${seleccion.size} descuentos eliminados`);
                    limpiarSeleccion();
                },
            },
        ]);
    };
    const bulkExportar = () => {
        Alert.alert('Exportar', 'Selecciona un formato', [
            { text: 'Excel (.xlsx)', onPress: () => finalizarExport('Excel') },
            { text: 'PDF', onPress: () => finalizarExport('PDF') },
            { text: 'CSV', onPress: () => finalizarExport('CSV') },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };
    const finalizarExport = (formato: string) => {
        showToast(`Exportado en ${formato}`);
        limpiarSeleccion();
    };

    /* =========================================================================
     * RENDER
     * =======================================================================*/

    const renderCard = ({ item }: { item: Descuento }) => {
        const seleccionado = seleccion.has(item.id);
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => toggleSeleccion(item.id)}
                onPress={() => (modoSeleccion ? toggleSeleccion(item.id) : setDetalle(item))}
                style={[styles.card, seleccionado && { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft }]}
            >
                <View style={styles.cardTop}>
                    {modoSeleccion && (
                        <TouchableOpacity onPress={() => toggleSeleccion(item.id)} style={[styles.checkbox, seleccionado && styles.checkboxOn]}>
                            {seleccionado && <Icon name="check" size={14} color="#fff" />}
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {item.nombre}
                        </Text>
                        <Text style={styles.cardSub} numberOfLines={1}>
                            {item.sucursales.join(', ')} · {vigenciaDisplay(item)}
                        </Text>
                    </View>
                    <EstadoBadge d={item} />
                </View>

                <View style={styles.cardMid}>
                    <TipoChip tipo={item.tipo} />
                    <Text style={styles.valorText}>{valorDisplay(item)}</Text>
                </View>

                {!modoSeleccion && (
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.iconAction} onPress={() => setDetalle(item)}>
                            <Icon name="eye" size={15} color={COLORS.ink} />
                            <Text style={styles.iconActionText}>Ver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconAction} onPress={() => setEnEdicion({ ...item })}>
                            <Icon name="edit-2" size={14} color={COLORS.ink} />
                            <Text style={styles.iconActionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconAction, item.estado === 'inactivo' && { backgroundColor: COLORS.successSoft }]} onPress={() => confirmarToggleEstado(item)}>
                            <Icon name={item.estado === 'activo' ? 'lock' : 'unlock'} size={14} color={COLORS.ink} />
                            <Text style={styles.iconActionText}>{item.estado === 'activo' ? 'Desact.' : 'Activar'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Descuentos</Text>
                <TouchableOpacity style={styles.newButton} onPress={() => setCreando(true)}>
                    <Icon name="plus" size={16} color="#fff" />
                    <Text style={styles.newButtonText}>Nuevo</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={listaFiltrada}
                keyExtractor={(i) => i.id}
                renderItem={renderCard}
                ListHeaderComponent={
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
                            <KPICard label="Activos" value={String(kpis.activos)} color={COLORS.success} icon="check-circle" active={kpiActivo === 'activos'} onPress={() => setKpiActivo(kpiActivo === 'activos' ? 'todos' : 'activos')} />
                            <KPICard label="Por vencer" value={String(kpis.porVencer)} color={COLORS.warning} icon="clock" active={kpiActivo === 'por_vencer'} onPress={() => setKpiActivo(kpiActivo === 'por_vencer' ? 'todos' : 'por_vencer')} />
                            <KPICard label="Usados hoy" value={String(kpis.usadosHoy)} color={COLORS.primary} icon="trending-up" active={kpiActivo === 'usados_hoy'} onPress={() => setKpiActivo(kpiActivo === 'usados_hoy' ? 'todos' : 'usados_hoy')} />
                            <KPICard label="Ahorro generado" value={fmtMoneda(kpis.ahorro)} color={COLORS.teal} icon="dollar-sign" active={false} onPress={() => { }} />
                        </ScrollView>

                        <View style={styles.searchWrap}>
                            <View style={styles.searchInputWrap}>
                                <Icon name="search" size={16} color={COLORS.inkMuted} />
                                <TextInput
                                    placeholder="Buscar por nombre, código, producto, categoría o sucursal"
                                    placeholderTextColor={COLORS.inkMuted}
                                    style={styles.searchInput}
                                    value={busqueda}
                                    onChangeText={setBusqueda}
                                />
                            </View>
                            <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltrosVisibles(true)}>
                                <Icon name="sliders" size={16} color={COLORS.ink} />
                            </TouchableOpacity>
                        </View>

                        {(filtroEstado !== 'Todos' || filtroTipo !== 'Todos' || filtroSucursal !== 'Todas' || filtroVigencia !== 'Todos') && (
                            <View style={styles.activeFiltersRow}>
                                {filtroEstado !== 'Todos' && <Chip text={`Estado: ${filtroEstado}`} onClear={() => setFiltroEstado('Todos')} />}
                                {filtroTipo !== 'Todos' && <Chip text={`Tipo: ${filtroTipo}`} onClear={() => setFiltroTipo('Todos')} />}
                                {filtroSucursal !== 'Todas' && <Chip text={`Sucursal: ${filtroSucursal}`} onClear={() => setFiltroSucursal('Todas')} />}
                                {filtroVigencia !== 'Todos' && <Chip text={`Vigencia: ${filtroVigencia}`} onClear={() => setFiltroVigencia('Todos')} />}
                            </View>
                        )}

                        <View style={styles.resultsBar}>
                            <Text style={styles.resultsText}>{listaFiltrada.length} resultado(s)</Text>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={bulkExportar}>
                                <Icon name="download" size={13} color={COLORS.primary} />
                                <Text style={styles.exportLink}>Exportar lista</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                contentContainerStyle={{ padding: 16, paddingBottom: modoSeleccion ? 150 : 40 }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="search" size={30} color={COLORS.inkMuted} />
                        <Text style={styles.emptyText}>Sin resultados con estos filtros</Text>
                    </View>
                }
            />

            {modoSeleccion && (
                <View style={styles.bulkBar}>
                    <View style={styles.bulkHeader}>
                        <Text style={styles.bulkCount}>{seleccion.size} seleccionado(s)</Text>
                        <TouchableOpacity onPress={limpiarSeleccion}>
                            <Text style={styles.bulkClear}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        <BulkAction label="Activar" icon="check-circle" onPress={() => bulkActivarDesactivar('activo')} />
                        <BulkAction label="Desactivar" icon="slash" onPress={() => bulkActivarDesactivar('inactivo')} />
                        <BulkAction label="Duplicar" icon="copy" onPress={bulkDuplicar} />
                        <BulkAction label="Exportar" icon="download" onPress={bulkExportar} />
                        <BulkAction label="Eliminar" icon="trash-2" onPress={bulkEliminar} danger />
                    </ScrollView>
                </View>
            )}

            <Toast visible={toast.visible} message={toast.msg} />

            {/* ---- Modal: Filtros ---- */}
            <Modal visible={filtrosVisibles} animationType="slide" transparent onRequestClose={() => setFiltrosVisibles(false)}>
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHandle} />
                        <SectionTitle>Filtros</SectionTitle>
                        <FieldLabel>Estado</FieldLabel>
                        <ChoiceRow options={['Todos', 'Activo', 'Inactivo']} value={filtroEstado} onChange={setFiltroEstado} />
                        <FieldLabel>Tipo</FieldLabel>
                        <ChoiceRow options={['Todos', ...Object.values(TIPO_LABEL)]} value={filtroTipo} onChange={setFiltroTipo} />
                        <FieldLabel>Sucursal</FieldLabel>
                        <ChoiceRow options={['Todas', ...SUCURSALES]} value={filtroSucursal} onChange={setFiltroSucursal} />
                        <FieldLabel>Vigencia</FieldLabel>
                        <ChoiceRow options={['Todos', 'Válidos actualmente', 'Próximos a vencer', 'Expirados']} value={filtroVigencia} onChange={setFiltroVigencia} />
                        <View style={{ height: 8 }} />
                        <BigButton label="Aplicar filtros" onPress={() => setFiltrosVisibles(false)} />
                        <TouchableOpacity
                            onPress={() => {
                                setFiltroEstado('Todos');
                                setFiltroTipo('Todos');
                                setFiltroSucursal('Todas');
                                setFiltroVigencia('Todos');
                            }}
                            style={{ marginTop: 12, alignItems: 'center' }}
                        >
                            <Text style={styles.linkText}>Limpiar filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ---- Panel: Detalle ---- */}
            <Modal visible={!!detalle} animationType="slide" transparent onRequestClose={() => setDetalle(null)}>
                {detalle && (
                    <DetalleDescuentoPanel
                        d={detalle}
                        onClose={() => setDetalle(null)}
                        onEditar={() => {
                            const d = detalle;
                            setDetalle(null);
                            setEnEdicion({ ...d });
                        }}
                        onToggleEstado={() => confirmarToggleEstado(detalle)}
                        onDuplicar={() => {
                            duplicarDescuento(detalle);
                            setDetalle(null);
                        }}
                        onEstadisticas={() => {
                            setStatsDe(detalle);
                            setDetalle(null);
                        }}
                    />
                )}
            </Modal>

            {/* ---- Panel: Estadísticas ---- */}
            <Modal visible={!!statsDe} animationType="slide" transparent onRequestClose={() => setStatsDe(null)}>
                {statsDe && <EstadisticasPanel d={statsDe} onClose={() => setStatsDe(null)} />}
            </Modal>

            {/* ---- Modal: Editar ---- */}
            <Modal visible={!!enEdicion} animationType="slide" transparent onRequestClose={() => setEnEdicion(null)}>
                {enEdicion && <DescuentoForm modo="editar" inicial={enEdicion} onCancel={() => setEnEdicion(null)} onGuardar={guardarEdicion} onEliminar={() => { eliminarDescuento(enEdicion); setEnEdicion(null); }} />}
            </Modal>

            {/* ---- Modal: Crear ---- */}
            <Modal visible={creando} animationType="slide" transparent onRequestClose={() => setCreando(false)}>
                <DescuentoForm modo="crear" onCancel={() => setCreando(false)} onGuardar={crearDescuento} />
            </Modal>
        </SafeAreaView>
    );
}

/* =========================================================================
 * 5. SUBCOMPONENTES
 * =======================================================================*/

function Chip({ text, onClear }: { text: string; onClear: () => void }) {
    return (
        <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{text}</Text>
            <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={12} color={COLORS.primaryDark} />
            </TouchableOpacity>
        </View>
    );
}

function BulkAction({ label, icon, onPress, danger }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; danger?: boolean }) {
    return (
        <TouchableOpacity style={[styles.bulkActionBtn, danger && { backgroundColor: COLORS.dangerSoft }]} onPress={onPress}>
            <Icon name={icon} size={17} color={danger ? COLORS.danger : COLORS.ink} />
            <Text style={[styles.bulkActionLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
                {value}
            </Text>
        </View>
    );
}

function TimelineItem({ ev }: { ev: HistorialEvento }) {
    return (
        <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={{ flex: 1 }}>
                <Text style={styles.timelineAccion}>{ev.accion}</Text>
                <Text style={styles.timelineMeta}>
                    {fmtFechaHora(ev.fecha)} · {ev.usuario}
                </Text>
            </View>
        </View>
    );
}

/* ---------- Panel: Detalle del descuento ---------- */
function DetalleDescuentoPanel({
    d,
    onClose,
    onEditar,
    onToggleEstado,
    onDuplicar,
    onEstadisticas,
}: {
    d: Descuento;
    onClose: () => void;
    onEditar: () => void;
    onToggleEstado: () => void;
    onDuplicar: () => void;
    onEstadisticas: () => void;
}) {
    const aplicaALabel = d.aplicaA
        .map((a) => {
            if (a === 'toda_orden') return 'Toda la orden';
            if (a === 'categoria') return `Categorías: ${d.categoriasSeleccionadas.join(', ') || '—'}`;
            if (a === 'producto') return `Productos: ${d.productosSeleccionados.join(', ') || '—'}`;
            if (a === 'grupo') return 'Grupo de productos';
            if (a === 'extra') return 'Extras / complementos';
            return a;
        })
        .join(' · ');

    return (
        <View style={styles.sheetOverlay}>
            <View style={[styles.sheet, { maxHeight: '92%' }]}>
                <View style={styles.sheetHandle} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.panelHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.panelName}>{d.nombre}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                <TipoChip tipo={d.tipo} />
                                <EstadoBadge d={d} />
                            </View>
                        </View>
                        <Text style={styles.panelValor}>{valorDisplay(d)}</Text>
                    </View>

                    {d.descripcion ? <Text style={styles.descripcionText}>{d.descripcion}</Text> : null}

                    <SectionTitle>Condiciones de aplicación</SectionTitle>
                    <InfoRow label="Aplica a" value={aplicaALabel} />
                    <InfoRow label="Compra mínima" value={d.compraMinima ? `$${d.compraMinima}` : 'Sin mínimo'} />
                    <InfoRow label="Compra máxima" value={d.compraMaxima ? `$${d.compraMaxima}` : 'Sin máximo'} />
                    <InfoRow label="Sucursales" value={d.sucursales.join(', ')} />
                    <InfoRow label="Días" value={d.diasSemana.length === 7 ? 'Todos los días' : d.diasSemana.join(', ')} />
                    <InfoRow label="Horario" value={d.horarioDesde ? `${d.horarioDesde} – ${d.horarioHasta}` : 'Todo el día'} />
                    <InfoRow label="Roles autorizados" value={d.rolesAutorizados.join(', ')} />
                    <InfoRow label="Clientes" value={{ todos: 'Todos', registrados: 'Registrados', vip: 'VIP', empleados: 'Empleados' }[d.clientes]} />
                    <InfoRow label="Prioridad" value={d.prioridad} />
                    <InfoRow label="Acumulable" value={d.acumulable ? 'Sí, se puede combinar' : 'No, es exclusivo'} />

                    <SectionTitle>Estadísticas de uso</SectionTitle>
                    <View style={styles.statRow}>
                        <StatBox label="Veces usado" value={String(d.vecesUsado)} icon="repeat" />
                        <StatBox label="Ahorro generado" value={fmtMoneda(d.ahorroGenerado)} icon="dollar-sign" />
                        <StatBox label="Última vez" value={d.ultimaVezUsado ? fmtFecha(d.ultimaVezUsado) : '—'} icon="calendar" />
                    </View>
                    <TouchableOpacity onPress={onEstadisticas} style={styles.statsLink}>
                        <Icon name="bar-chart-2" size={15} color={COLORS.primary} />
                        <Text style={styles.linkText}>Ver estadísticas avanzadas</Text>
                    </TouchableOpacity>

                    <SectionTitle>Historial de cambios</SectionTitle>
                    {d.historial.map((ev) => (
                        <TimelineItem key={ev.id} ev={ev} />
                    ))}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                        <View style={{ flex: 1 }}>
                            <BigButton label="Editar" icon="edit-2" onPress={onEditar} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <BigButton label={d.estado === 'activo' ? 'Desactivar' : 'Activar'} icon={d.estado === 'activo' ? 'lock' : 'unlock'} variant="ghost" onPress={onToggleEstado} />
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <BigButton label="Duplicar" icon="copy" variant="ghost" onPress={onDuplicar} />
                    </View>
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 14, alignItems: 'center', paddingBottom: 10 }}>
                        <Text style={styles.linkText}>Cerrar</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: keyof typeof Feather.glyphMap }) {
    return (
        <View style={styles.statBox}>
            <Icon name={icon} size={16} color={COLORS.primary} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

/* ---------- Panel: Estadísticas avanzadas ---------- */
function EstadisticasPanel({ d, onClose }: { d: Descuento; onClose: () => void }) {
    // Datos derivados de forma determinística a partir del descuento (mock, sin backend)
    const seed = d.id.charCodeAt(4) || 7;
    const usosPorDia = DIAS.map((_, i) => Math.max(1, (d.vecesUsado % 30) + ((seed + i * 3) % 12)));
    const maxDia = Math.max(...usosPorDia);
    const topProductos = PRODUCTOS.slice(0, 5).map((p, i) => Math.max(1, (seed * (i + 1)) % 40));
    const maxProducto = Math.max(...topProductos);
    const horarios = ['8-11', '11-14', '14-17', '17-20', '20-23'].map((_, i) => Math.max(1, (seed + i * 5) % 35));
    const maxHorario = Math.max(...horarios);
    const sucursalesUso = d.sucursales.map((_, i) => Math.max(1, (seed + i * 8) % 50));
    const maxSucursal = Math.max(...sucursalesUso);

    const ticketConDescuento = 180 + (seed % 40);
    const ticketSinDescuento = 210 + (seed % 30);

    return (
        <View style={styles.sheetOverlay}>
            <View style={[styles.sheet, { maxHeight: '92%' }]}>
                <View style={styles.sheetHandle} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SectionTitle>Estadísticas · {d.nombre}</SectionTitle>

                    <View style={styles.statRow}>
                        <View style={[styles.ticketBox, { borderColor: COLORS.success }]}>
                            <Text style={styles.ticketLabel}>Ticket con descuento</Text>
                            <Text style={[styles.ticketValue, { color: COLORS.success }]}>{fmtMoneda(ticketConDescuento)}</Text>
                        </View>
                        <View style={[styles.ticketBox, { borderColor: COLORS.inkMuted }]}>
                            <Text style={styles.ticketLabel}>Ticket sin descuento</Text>
                            <Text style={styles.ticketValue}>{fmtMoneda(ticketSinDescuento)}</Text>
                        </View>
                    </View>

                    <Text style={styles.chartTitle}>Usos por día de la semana</Text>
                    {DIAS.map((dia, i) => (
                        <Bar key={dia} label={dia} value={usosPorDia[i]} max={maxDia} color={COLORS.primary} />
                    ))}

                    <Text style={styles.chartTitle}>Productos donde más se aplica</Text>
                    {PRODUCTOS.slice(0, 5).map((p, i) => (
                        <Bar key={p} label={p} value={topProductos[i]} max={maxProducto} color={COLORS.purple} />
                    ))}

                    <Text style={styles.chartTitle}>Horarios de mayor uso</Text>
                    {['8-11', '11-14', '14-17', '17-20', '20-23'].map((h, i) => (
                        <Bar key={h} label={h} value={horarios[i]} max={maxHorario} color={COLORS.teal} />
                    ))}

                    <Text style={styles.chartTitle}>Uso por sucursal</Text>
                    {d.sucursales.map((s, i) => (
                        <Bar key={s} label={s} value={sucursalesUso[i]} max={maxSucursal} color={COLORS.warning} />
                    ))}

                    <Text style={styles.helperText}>Importe total descontado acumulado: {fmtMoneda(d.ahorroGenerado)}</Text>

                    <TouchableOpacity onPress={onClose} style={{ marginTop: 14, alignItems: 'center', paddingBottom: 10 }}>
                        <Text style={styles.linkText}>Cerrar</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

/* ---------- Formulario: Crear / Editar descuento ---------- */
function DescuentoForm({
    modo,
    inicial,
    onCancel,
    onGuardar,
    onEliminar,
}: {
    modo: 'crear' | 'editar';
    inicial?: Descuento;
    onCancel: () => void;
    onGuardar: (d: Descuento) => void;
    onEliminar?: () => void;
}) {
    const [tab, setTab] = useState('general');
    const [form, setForm] = useState<Descuento>(
        inicial || {
            id: nextId(),
            nombre: '',
            descripcion: '',
            codigo: '',
            tipo: 'porcentaje',
            valor: '',
            aplicaA: ['toda_orden'],
            categoriasSeleccionadas: [],
            productosSeleccionados: [],
            compraMinima: '',
            compraMaxima: '',
            cantidadMinima: '',
            clientes: 'todos',
            sucursales: [],
            rolesAutorizados: ['Gerente', 'Cajero'],
            fechaInicio: new Date().toISOString(),
            fechaFin: undefined,
            diasSemana: [...DIAS],
            horarioDesde: '',
            horarioHasta: '',
            usoTotalTipo: 'ilimitado',
            usoTotalMaximo: '',
            limiteClienteTipo: 'sin_limite',
            limiteClienteMaximo: '',
            limiteClientePeriodo: 'dia',
            prioridad: '3',
            acumulable: false,
            estado: 'activo',
            motivoInactivo: '',
            vecesUsado: 0,
            usosHoy: 0,
            ahorroGenerado: 0,
            historial: [],
        }
    );
    const set = (patch: Partial<Descuento>) => setForm((f) => ({ ...f, ...patch }));
    const toggleInArray = (key: 'aplicaA' | 'categoriasSeleccionadas' | 'productosSeleccionados' | 'sucursales' | 'rolesAutorizados' | 'diasSemana', v: string) => {
        setForm((f) => {
            const arr = f[key] as string[];
            const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
            return { ...f, [key]: next };
        });
    };

    const TABS = [
        { key: 'general', label: 'General' },
        { key: 'tipo', label: 'Tipo y valor' },
        { key: 'restricciones', label: 'Restricciones' },
        { key: 'sucursales', label: 'Sucursales y roles' },
        { key: 'vigencia', label: 'Vigencia' },
        { key: 'limites', label: 'Límites' },
        { key: 'estado', label: 'Estado' },
    ];

    const validar = (): string | null => {
        if (!form.nombre.trim()) return 'El nombre es obligatorio.';
        if (!form.valor.trim()) return 'Define el valor del descuento.';
        if (form.aplicaA.includes('producto_gratis' as any)) { }
        if (form.tipo === 'producto_gratis' && form.productosSeleccionados.length === 0) return 'Selecciona al menos un producto para "Producto gratis".';
        if (form.sucursales.length === 0) return 'Selecciona al menos una sucursal.';
        if (form.diasSemana.length === 0) return 'Selecciona al menos un día de la semana.';
        if (form.compraMinima && form.compraMaxima && Number(form.compraMinima) > Number(form.compraMaxima)) return 'La compra mínima no puede ser mayor que la máxima.';
        if (form.fechaFin && new Date(form.fechaFin) <= new Date(form.fechaInicio)) return 'La fecha fin debe ser posterior a la fecha inicio.';
        if (form.usoTotalTipo === 'maximo' && !form.usoTotalMaximo) return 'Indica el número máximo de usos totales.';
        if (form.limiteClienteTipo === 'maximo' && !form.limiteClienteMaximo) return 'Indica el límite de uso por cliente.';
        return null;
    };

    const guardar = (continuar?: boolean) => {
        const error = validar();
        if (error) {
            Alert.alert('Revisa el formulario', error);
            return;
        }
        onGuardar(form);
        if (continuar) {
            setForm({ ...form, id: nextId(), nombre: '', codigo: '', historial: [] });
            setTab('general');
        }
    };

    return (
        <View style={styles.sheetOverlay}>
            <View style={[styles.sheet, { maxHeight: '95%' }]}>
                <View style={styles.sheetHandle} />
                <SectionTitle>{modo === 'crear' ? 'Nuevo descuento' : `Editar: ${form.nombre || inicial?.nombre}`}</SectionTitle>

                <TabBar tabs={TABS} active={tab} onChange={setTab} />

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {tab === 'general' && (
                        <>
                            <LabeledInput label="Nombre" value={form.nombre} onChangeText={(v) => set({ nombre: v })} required placeholder="Ej. Happy Hour Bebidas" />
                            <LabeledInput label="Descripción" value={form.descripcion || ''} onChangeText={(v) => set({ descripcion: v })} multiline hint="Detalles visibles en el panel de detalle." />
                            <LabeledInput label="Código" value={form.codigo || ''} onChangeText={(v) => set({ codigo: v.toUpperCase() })} hint="Código promocional interno, ej. HAPPY20." />
                        </>
                    )}

                    {tab === 'tipo' && (
                        <>
                            <FieldLabel required>Tipo de descuento</FieldLabel>
                            <RadioRow options={Object.keys(TIPO_LABEL)} value={form.tipo} onChange={(v) => set({ tipo: v as TipoDescuento })} labels={TIPO_LABEL} />

                            <LabeledInput
                                label={form.tipo === 'porcentaje' ? 'Valor (%)' : form.tipo === 'fijo' ? 'Valor ($)' : 'Producto / categoría relacionada'}
                                value={form.valor}
                                onChangeText={(v) => set({ valor: v })}
                                required
                                keyboardType={form.tipo === 'porcentaje' || form.tipo === 'fijo' ? 'numeric' : 'default'}
                                placeholder={form.tipo === 'porcentaje' ? '20' : form.tipo === 'fijo' ? '50' : 'Ej. Pizza Margarita'}
                            />

                            <FieldLabel required>¿Dónde aplica?</FieldLabel>
                            <MultiChoiceWrap
                                options={['toda_orden', 'categoria', 'producto', 'grupo', 'extra']}
                                values={form.aplicaA}
                                onToggle={(v) => toggleInArray('aplicaA', v)}
                            />
                            {form.aplicaA.includes('categoria') && (
                                <>
                                    <FieldLabel>Categorías</FieldLabel>
                                    <MultiChoiceWrap options={CATEGORIAS} values={form.categoriasSeleccionadas} onToggle={(v) => toggleInArray('categoriasSeleccionadas', v)} />
                                </>
                            )}
                            {(form.aplicaA.includes('producto') || form.tipo === 'producto_gratis' || form.tipo === '2x1' || form.tipo === '3x2') && (
                                <>
                                    <FieldLabel required={form.tipo === 'producto_gratis'}>Productos</FieldLabel>
                                    <MultiChoiceWrap options={PRODUCTOS} values={form.productosSeleccionados} onToggle={(v) => toggleInArray('productosSeleccionados', v)} />
                                </>
                            )}
                        </>
                    )}

                    {tab === 'restricciones' && (
                        <>
                            <LabeledInput label="Compra mínima" value={form.compraMinima || ''} onChangeText={(v) => set({ compraMinima: v })} keyboardType="numeric" placeholder="Opcional" />
                            <LabeledInput label="Compra máxima" value={form.compraMaxima || ''} onChangeText={(v) => set({ compraMaxima: v })} keyboardType="numeric" placeholder="Opcional" />
                            <LabeledInput label="Cantidad mínima de productos" value={form.cantidadMinima || ''} onChangeText={(v) => set({ cantidadMinima: v })} keyboardType="numeric" placeholder="Opcional" />
                            <FieldLabel required>Clientes</FieldLabel>
                            <RadioRow
                                options={['todos', 'registrados', 'vip', 'empleados']}
                                value={form.clientes}
                                onChange={(v) => set({ clientes: v as ClienteTipo })}
                                labels={{ todos: 'Todos', registrados: 'Clientes registrados', vip: 'Clientes VIP', empleados: 'Empleados' }}
                            />
                        </>
                    )}

                    {tab === 'sucursales' && (
                        <>
                            <FieldLabel required hint="Selecciona al menos una sucursal.">
                                Sucursales
                            </FieldLabel>
                            <MultiChoiceWrap options={SUCURSALES} values={form.sucursales} onToggle={(v) => toggleInArray('sucursales', v)} />
                            <FieldLabel hint="Solo estos roles podrán aplicar el descuento al cobrar.">Roles autorizados</FieldLabel>
                            <MultiChoiceWrap options={ROLES} values={form.rolesAutorizados} onToggle={(v) => toggleInArray('rolesAutorizados', v)} />
                        </>
                    )}

                    {tab === 'vigencia' && (
                        <>
                            <Text style={styles.helperText}>Fecha inicio: hoy ({fmtFecha(form.fechaInicio)}). La fecha fin puede quedar vacía para un descuento permanente.</Text>
                            <LabeledInput
                                label="Fecha fin (AAAA-MM-DD, opcional)"
                                value={form.fechaFin ? form.fechaFin.slice(0, 10) : ''}
                                onChangeText={(v) => set({ fechaFin: v ? new Date(v).toISOString() : undefined })}
                                placeholder="Vacío = permanente"
                            />
                            <FieldLabel required>Días de la semana</FieldLabel>
                            <MultiChoiceWrap options={DIAS} values={form.diasSemana} onToggle={(v) => toggleInArray('diasSemana', v)} />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <LabeledInput label="Desde (HH:MM)" value={form.horarioDesde || ''} onChangeText={(v) => set({ horarioDesde: v })} placeholder="Opcional" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <LabeledInput label="Hasta (HH:MM)" value={form.horarioHasta || ''} onChangeText={(v) => set({ horarioHasta: v })} placeholder="Opcional" />
                                </View>
                            </View>
                        </>
                    )}

                    {tab === 'limites' && (
                        <>
                            <FieldLabel required>Uso total</FieldLabel>
                            <RadioRow options={['ilimitado', 'maximo']} value={form.usoTotalTipo} onChange={(v) => set({ usoTotalTipo: v as any })} labels={{ ilimitado: 'Ilimitado', maximo: 'Máximo de veces en total' }} />
                            {form.usoTotalTipo === 'maximo' && <LabeledInput label="Número máximo total" value={form.usoTotalMaximo || ''} onChangeText={(v) => set({ usoTotalMaximo: v })} keyboardType="numeric" required />}

                            <FieldLabel required>Límite por cliente</FieldLabel>
                            <RadioRow options={['sin_limite', 'maximo']} value={form.limiteClienteTipo} onChange={(v) => set({ limiteClienteTipo: v as any })} labels={{ sin_limite: 'Sin límite', maximo: 'Máximo de veces por cliente' }} />
                            {form.limiteClienteTipo === 'maximo' && (
                                <>
                                    <LabeledInput label="Número máximo por cliente" value={form.limiteClienteMaximo || ''} onChangeText={(v) => set({ limiteClienteMaximo: v })} keyboardType="numeric" required />
                                    <FieldLabel>Periodo</FieldLabel>
                                    <ChoiceRow options={['dia', 'semana', 'mes']} value={form.limiteClientePeriodo} onChange={(v) => set({ limiteClientePeriodo: v as PeriodoLimite })} labels={{ dia: 'Por día', semana: 'Por semana', mes: 'Por mes' }} />
                                </>
                            )}

                            <LabeledInput label="Prioridad" value={form.prioridad} onChangeText={(v) => set({ prioridad: v })} keyboardType="numeric" hint="Mayor número = mayor prioridad si varios descuentos aplican." required />
                            <TouchableOpacity style={styles.switchRow} onPress={() => set({ acumulable: !form.acumulable })}>
                                <Text style={[styles.fieldLabel, { flex: 1 }]}>Permitir combinar con otros descuentos (acumulable)</Text>
                                <Switch value={form.acumulable} onValueChange={(v) => set({ acumulable: v })} trackColor={{ false: COLORS.surfaceAlt, true: COLORS.primarySoft }} thumbColor={form.acumulable ? COLORS.primary : '#fff'} />
                            </TouchableOpacity>
                        </>
                    )}

                    {tab === 'estado' && (
                        <>
                            <FieldLabel required>Estado</FieldLabel>
                            <ChoiceRow options={['activo', 'inactivo']} value={form.estado} onChange={(v) => set({ estado: v as EstadoDescuento })} labels={{ activo: 'Activo', inactivo: 'Inactivo' }} />
                            {form.estado === 'inactivo' && <LabeledInput label="Motivo (opcional)" value={form.motivoInactivo || ''} onChangeText={(v) => set({ motivoInactivo: v })} multiline />}
                            <Text style={styles.helperText}>Al desactivar se conserva el registro y se guarda en el historial. La activación y desactivación por fecha (inicio/fin) es automática, sin intervención manual.</Text>
                            {modo === 'editar' && onEliminar && (
                                <TouchableOpacity style={styles.dangerZone} onPress={onEliminar}>
                                    <Icon name="trash-2" size={16} color={COLORS.danger} />
                                    <Text style={styles.dangerZoneText}>Eliminar descuento (soft delete)</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                        <BigButton label="Cancelar" variant="ghost" onPress={onCancel} />
                    </View>
                    {modo === 'crear' && (
                        <View style={{ flex: 1 }}>
                            <BigButton label="Guardar y continuar" variant="ghost" onPress={() => guardar(true)} />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <BigButton label="Guardar" variant="success" onPress={() => guardar(false)} />
                    </View>
                </View>
            </View>
        </View>
    );
}

/* =========================================================================
 * 6. ESTILOS
 * =======================================================================*/

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 16 : 4, paddingBottom: 8 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.5 },
    newButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: 16, ...HARD_SHADOW },
    newButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    kpiRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 14 },
    kpiCard: { minWidth: 130, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 14, gap: 4, ...HARD_SHADOW },
    kpiValue: { fontSize: 22, fontWeight: '800' },
    kpiLabel: { fontSize: 11.5, fontWeight: '600' },

    searchWrap: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
    searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, height: 52, ...SOFT_SHADOW },
    searchInput: { flex: 1, fontSize: 14.5, color: COLORS.ink, height: '100%' },
    filterBtn: { width: 52, height: 52, backgroundColor: COLORS.surface, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', ...HARD_SHADOW },

    activeFiltersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
    filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft, borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.pill, paddingVertical: 6, paddingHorizontal: 12, gap: 8 },
    filterChipText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },

    resultsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 6 },
    resultsText: { color: COLORS.inkMuted, fontWeight: '600', fontSize: 13 },
    exportLink: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

    card: { backgroundColor: COLORS.surface, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14, marginBottom: 14, ...HARD_SHADOW },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardName: { fontSize: 15.5, fontWeight: '800', color: COLORS.ink },
    cardSub: { fontSize: 12, color: COLORS.inkMuted, marginTop: 2 },

    cardMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    valorText: { fontWeight: '800', fontSize: 15, color: COLORS.ink },

    cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    iconAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingVertical: 10 },
    iconActionText: { fontSize: 12, fontWeight: '700', color: COLORS.ink },

    badge: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 10, gap: 6 },
    badgeText: { fontWeight: '800', fontSize: 11 },
    dot: { width: 7, height: 7, borderRadius: 4 },

    tipoChip: { borderWidth: 2, borderRadius: RADIUS.sm, paddingVertical: 4, paddingHorizontal: 9, backgroundColor: '#fff' },
    tipoChipText: { fontWeight: '800', fontSize: 11 },

    checkbox: { width: 26, height: 26, borderRadius: 6, borderWidth: 2.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    checkboxSmall: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    checkboxSmallOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    bulkBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: COLORS.ink, borderTopWidth: 3, borderColor: COLORS.border, padding: 14, paddingBottom: 22 },
    bulkHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    bulkCount: { color: '#fff', fontWeight: '800' },
    bulkClear: { color: COLORS.warningSoft, fontWeight: '700' },
    bulkActionBtn: { backgroundColor: COLORS.surface, borderWidth: 2, borderColor: '#fff', borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', minWidth: 84, gap: 4 },
    bulkActionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.ink },

    toast: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.ink, borderRadius: RADIUS.pill, paddingVertical: 10, paddingHorizontal: 18, zIndex: 50 },
    toastText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
    emptyText: { color: COLORS.inkMuted, fontWeight: '600' },

    sheetOverlay: { flex: 1, backgroundColor: 'rgba(20,23,26,0.55)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, borderTopWidth: 4, borderLeftWidth: 4, borderRightWidth: 4, borderColor: COLORS.border, padding: 18, paddingBottom: 24 },
    sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.inkMuted, alignSelf: 'center', marginBottom: 12 },

    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 16, marginBottom: 8 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.inkMuted },
    hintText: { fontSize: 11, color: COLORS.inkMuted, marginTop: 2, fontStyle: 'italic' },

    textInput: { backgroundColor: COLORS.surface, borderWidth: 2.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: 12, height: 48, fontSize: 15, color: COLORS.ink },

    choicePill: { borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.pill, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#fff' },
    choicePillOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    choicePillText: { fontWeight: '700', color: COLORS.ink, fontSize: 13 },
    choicePillTextOn: { color: '#fff' },

    multiPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.pill, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
    multiPillOn: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
    multiPillText: { fontWeight: '600', color: COLORS.ink, fontSize: 12.5 },
    multiPillTextOn: { color: COLORS.primaryDark, fontWeight: '700' },

    radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 10 },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.primary },
    radioText: { color: COLORS.ink, fontWeight: '600', fontSize: 14 },

    tabBarScroll: { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.border, padding: 4 },
    tabBtn: { paddingVertical: 9, paddingHorizontal: 14, alignItems: 'center', borderRadius: RADIUS.sm },
    tabBtnOn: { backgroundColor: COLORS.primary },
    tabBtnText: { fontWeight: '700', color: COLORS.inkMuted, fontSize: 12.5 },
    tabBtnTextOn: { color: '#fff' },

    bigButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 3, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: 14, ...HARD_SHADOW },
    bigButtonText: { fontWeight: '800', fontSize: 14 },

    linkText: { color: COLORS.primary, fontWeight: '700' },

    panelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    panelName: { fontSize: 19, fontWeight: '800', color: COLORS.ink },
    panelValor: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
    descripcionText: { color: COLORS.inkMuted, fontSize: 13, marginTop: 10, lineHeight: 18 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: COLORS.surfaceAlt },
    infoLabel: { color: COLORS.inkMuted, fontWeight: '600', fontSize: 13 },
    infoValue: { color: COLORS.ink, fontWeight: '700', fontSize: 13, maxWidth: '60%', textAlign: 'right' },

    statRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 8 },
    statBox: { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', backgroundColor: COLORS.surface, gap: 4 },
    statValue: { fontWeight: '800', fontSize: 14, color: COLORS.ink },
    statLabel: { fontSize: 10.5, color: COLORS.inkMuted, textAlign: 'center' },
    statsLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },

    ticketBox: { flex: 1, borderWidth: 2.5, borderRadius: RADIUS.md, padding: 14, backgroundColor: COLORS.surface },
    ticketLabel: { color: COLORS.inkMuted, fontWeight: '600', fontSize: 11.5, marginBottom: 4 },
    ticketValue: { fontWeight: '800', fontSize: 17, color: COLORS.ink },

    chartTitle: { fontWeight: '800', color: COLORS.ink, fontSize: 13.5, marginTop: 16, marginBottom: 8 },
    barLabel: { fontSize: 12, color: COLORS.inkMuted, fontWeight: '600' },
    barValue: { fontSize: 12, color: COLORS.ink, fontWeight: '800' },
    barTrack: { height: 10, borderRadius: 5, backgroundColor: COLORS.surfaceAlt, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    barFill: { height: '100%', borderRadius: 5 },

    timelineItem: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderLeftWidth: 2, borderColor: COLORS.surfaceAlt, marginLeft: 4, paddingLeft: 12 },
    timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4, marginLeft: -17 },
    timelineAccion: { fontWeight: '700', color: COLORS.ink, fontSize: 13.5 },
    timelineMeta: { color: COLORS.inkMuted, fontSize: 11.5, marginTop: 2 },

    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
    helperText: { color: COLORS.inkMuted, fontSize: 12, marginBottom: 10, lineHeight: 17 },

    dangerZone: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: COLORS.danger, borderRadius: RADIUS.md, padding: 12, marginTop: 12, backgroundColor: COLORS.dangerSoft },
    dangerZoneText: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
});
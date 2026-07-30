/**
 * EmployeesScreen.tsx
 * ----------------------------------------------------------------------
 * Módulo de Gestión de Empleados — APOS (POS modular F&B)
 * Stack: React Native + Expo (sin librerías externas, 100% local / mock data)
 *
 * Principios de diseño aplicados:
 * - Material Design 3 (color roles, shape, elevation, state layers)
 * - Neo-Brutalismo Funcional (bordes marcados, sombras duras, color sólido)
 * - Mobile First (tabla -> lista de tarjetas, filtros en drawer inferior)
 * - Alto contraste + Componentes táctiles grandes (min 48x48dp)
 * - Menos clics / menos pasos (acciones directas en la tarjeta)
 * - Feedback inmediato (Toast local + estados visuales de botones)
 * - Trust Design / Seguridad psicológica (confirmaciones antes de acciones
 *   destructivas, motivo obligatorio al dar de baja, colores consistentes)
 * - Psicología del color (azul = confianza/control, verde = correcto/activo,
 *   ámbar = precaución/inactivo, rojo = alerta/baja — nunca rojo agresivo puro)
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

/* =========================================================================
 * 1. DESIGN TOKENS
 * =======================================================================*/

const COLORS = {
  // Base / superficie
  bg: '#F4F3EE', // fondo cálido, no blanco puro -> reduce fatiga visual
  surface: '#FFFFFF',
  surfaceAlt: '#ECEBE4',
  ink: '#14171A', // texto principal, casi negro (alto contraste)
  inkMuted: '#54595E',
  border: '#14171A', // borde marcado neo-brutalista

  // Marca / confianza (azul -> control, seguridad, estabilidad)
  primary: '#1849D6',
  primaryDark: '#0F2E8F',
  onPrimary: '#FFFFFF',
  primarySoft: '#DCE6FF',

  // Estados semánticos
  success: '#1E8E5A', // activo
  successSoft: '#D7F2E3',
  warning: '#C77700', // inactivo / precaución
  warningSoft: '#FCE9CC',
  danger: '#C22F2F', // baja / bloqueo (rojo controlado, no saturado agresivo)
  dangerSoft: '#F8D9D9',

  // Roles (chips)
  roleAdmin: '#5B2FC2',
  roleGerente: '#1849D6',
  roleCajero: '#1E8E5A',
  roleMesero: '#C77700',
  roleCocinero: '#B5461B',
  roleAlmacenista: '#3D5A80',
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

/* =========================================================================
 * 2. TIPOS Y DATOS MOCK (local)
 * =======================================================================*/

type Estado = 'activo' | 'inactivo' | 'baja';
type Rol = 'Administrador' | 'Gerente' | 'Cajero' | 'Mesero' | 'Cocinero' | 'Almacenista';

interface HistorialEvento {
  id: string;
  fecha: string; // ISO
  accion: string;
  usuario: string; // quién lo hizo
}

interface Empleado {
  id: string;
  nombre: string;
  apellidos: string;
  usuario: string;
  correo: string;
  telefono: string;
  curp?: string;
  rfc?: string;
  direccion?: string;
  fechaNacimiento?: string;
  rol: Rol;
  sucursal: string;
  estado: Estado;
  fechaIngreso: string;
  fechaBaja?: string;
  motivoBaja?: string;
  salario?: string;
  horario?: string;
  ultimoAcceso: string;
  bloqueado: boolean;
  permisos: Record<string, boolean>;
  historial: HistorialEvento[];
}

const SUCURSALES = ['Centro', 'Norte', 'Sur'];
const ROLES: Rol[] = ['Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero', 'Almacenista'];

const PERMISOS_MODULOS: Record<string, string[]> = {
  Caja: ['Abrir caja', 'Cerrar caja', 'Cobrar'],
  Ventas: ['Ver órdenes', 'Cancelar órdenes'],
  Productos: ['Crear productos', 'Modificar recetas'],
  Empleados: ['Gestionar empleados'],
};

const ROLE_COLOR: Record<Rol, string> = {
  Administrador: COLORS.roleAdmin,
  Gerente: COLORS.roleGerente,
  Cajero: COLORS.roleCajero,
  Mesero: COLORS.roleMesero,
  Cocinero: COLORS.roleCocinero,
  Almacenista: COLORS.roleAlmacenista,
};

const ROLE_PERMISOS_DEFAULT: Record<Rol, Record<string, boolean>> = {
  Administrador: allTrue(),
  Gerente: { 'Abrir caja': true, 'Cerrar caja': true, Cobrar: true, 'Ver órdenes': true, 'Cancelar órdenes': true, 'Crear productos': true, 'Modificar recetas': true, 'Gestionar empleados': true },
  Cajero: { 'Abrir caja': true, 'Cerrar caja': true, Cobrar: true, 'Ver órdenes': true, 'Cancelar órdenes': false, 'Crear productos': false, 'Modificar recetas': false, 'Gestionar empleados': false },
  Mesero: { 'Abrir caja': false, 'Cerrar caja': false, Cobrar: false, 'Ver órdenes': true, 'Cancelar órdenes': false, 'Crear productos': false, 'Modificar recetas': false, 'Gestionar empleados': false },
  Cocinero: { 'Abrir caja': false, 'Cerrar caja': false, Cobrar: false, 'Ver órdenes': true, 'Cancelar órdenes': false, 'Crear productos': false, 'Modificar recetas': true, 'Gestionar empleados': false },
  Almacenista: { 'Abrir caja': false, 'Cerrar caja': false, Cobrar: false, 'Ver órdenes': false, 'Cancelar órdenes': false, 'Crear productos': true, 'Modificar recetas': false, 'Gestionar empleados': false },
};

function allTrue() {
  const out: Record<string, boolean> = {};
  Object.values(PERMISOS_MODULOS).flat().forEach((p) => (out[p] = true));
  return out;
}

function iniciales(nombre: string, apellidos: string) {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}

function fmtFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtFechaHora(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
}

let idSeq = 1000;
function nextId() {
  idSeq += 1;
  return `EMP-${idSeq}`;
}

function seedEmpleados(): Empleado[] {
  const base: Array<Partial<Empleado> & { nombre: string; apellidos: string; rol: Rol; sucursal: string; estado: Estado }> = [
    { nombre: 'Marisol', apellidos: 'Ramírez Cortés', rol: 'Administrador', sucursal: 'Centro', estado: 'activo' },
    { nombre: 'Julián', apellidos: 'Domínguez Paz', rol: 'Gerente', sucursal: 'Norte', estado: 'activo' },
    { nombre: 'Ana', apellidos: 'Torres Vega', rol: 'Cajero', sucursal: 'Centro', estado: 'activo' },
    { nombre: 'Braulio', apellidos: 'Salinas Ortega', rol: 'Mesero', sucursal: 'Sur', estado: 'inactivo' },
    { nombre: 'Renata', apellidos: 'Cabrera Luna', rol: 'Cocinero', sucursal: 'Norte', estado: 'activo' },
    { nombre: 'Iker', apellidos: 'Montes Rivas', rol: 'Almacenista', sucursal: 'Centro', estado: 'baja' },
    { nombre: 'Fernanda', apellidos: 'Quiroz Meza', rol: 'Cajero', sucursal: 'Sur', estado: 'activo' },
  ];

  return base.map((b, i) => {
    const id = nextId();
    const usuario = `${b.nombre!.toLowerCase()}.${b.apellidos!.split(' ')[0].toLowerCase()}`;
    const fechaIngreso = new Date(2023, i % 12, (i * 3) % 27 + 1).toISOString();
    return {
      id,
      nombre: b.nombre!,
      apellidos: b.apellidos!,
      usuario,
      correo: `${usuario}@apos-restaurante.mx`,
      telefono: `221-${100 + i * 7}-${2000 + i}`,
      curp: undefined,
      rfc: undefined,
      direccion: undefined,
      fechaNacimiento: undefined,
      rol: b.rol,
      sucursal: b.sucursal,
      estado: b.estado,
      fechaIngreso,
      fechaBaja: b.estado === 'baja' ? new Date(2025, 6, 12).toISOString() : undefined,
      motivoBaja: b.estado === 'baja' ? 'Renuncia voluntaria' : undefined,
      salario: undefined,
      horario: 'L-S 9:00–18:00',
      ultimoAcceso: new Date(Date.now() - i * 3600 * 1000 * 7).toISOString(),
      bloqueado: false,
      permisos: { ...ROLE_PERMISOS_DEFAULT[b.rol] },
      historial: [
        {
          id: `${id}-h1`,
          fecha: fechaIngreso,
          accion: 'Alta de empleado en el sistema',
          usuario: 'Sistema',
        },
        {
          id: `${id}-h2`,
          fecha: new Date(Date.now() - i * 3600 * 1000 * 7).toISOString(),
          accion: 'Inicio de sesión',
          usuario: b.nombre!,
        },
      ],
    };
  });
}

/* =========================================================================
 * 3. COMPONENTES BASE (átomos)
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
      <Text style={styles.toastText}>✓ {message}</Text>
    </Animated.View>
  );
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const map = {
    activo: { bg: COLORS.successSoft, fg: COLORS.success, label: 'Activo' },
    inactivo: { bg: COLORS.warningSoft, fg: COLORS.warning, label: 'Inactivo' },
    baja: { bg: COLORS.dangerSoft, fg: COLORS.danger, label: 'Baja' },
  } as const;
  const s = map[estado];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.fg }]}>
      <View style={[styles.dot, { backgroundColor: s.fg }]} />
      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

function RolChip({ rol }: { rol: Rol }) {
  const c = ROLE_COLOR[rol];
  return (
    <View style={[styles.roleChip, { borderColor: c, backgroundColor: '#fff' }]}>
      <Text style={[styles.roleChipText, { color: c }]}>{rol}</Text>
    </View>
  );
}

function Avatar({ nombre, apellidos, size = 48 }: { nombre: string; apellidos: string; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, borderWidth: size > 40 ? 3 : 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{iniciales(nombre, apellidos)}</Text>
    </View>
  );
}

function KPICard({ label, value, color, onPress, active }: { label: string; value: number | string; color: string; onPress: () => void; active?: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.kpiCard,
        { borderColor: COLORS.border, backgroundColor: active ? color : COLORS.surface },
      ]}
    >
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
  icon?: string;
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
      style={[
        styles.bigButton,
        { backgroundColor: disabled ? COLORS.surfaceAlt : palette.bg, borderColor: COLORS.border, opacity: disabled ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.bigButtonText, { color: disabled ? COLORS.inkMuted : palette.fg }]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {children} {required ? <Text style={{ color: COLORS.danger }}>*</Text> : null}
    </Text>
  );
}

/* =========================================================================
 * 4. PANTALLA PRINCIPAL
 * =======================================================================*/

export default function EmployeesScreen() {
  const [empleados, setEmpleados] = useState<Empleado[]>(() => seedEmpleados());
  const [busqueda, setBusqueda] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState<string>('Todas');
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [filtroEstadoKPI, setFiltroEstadoKPI] = useState<Estado | 'todos' | 'sucursales'>('todos');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);

  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const modoSeleccion = seleccion.size > 0;

  const [empleadoActivo, setEmpleadoActivo] = useState<Empleado | null>(null); // para ver
  const [empleadoEnEdicion, setEmpleadoEnEdicion] = useState<Empleado | null>(null);
  const [creando, setCreando] = useState(false);
  const [pickerBulk, setPickerBulk] = useState<null | 'sucursal' | 'rol'>(null);

  const [toast, setToast] = useState({ visible: false, msg: '' });
  const showToast = useCallback((msg: string) => setToast({ visible: true, msg }), []);
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast((s) => ({ ...s, visible: false })), 2000);
      return () => clearTimeout(t);
    }
  }, [toast.visible]);

  const auditoriaRef = useRef<{ fecha: string; accion: string }[]>([]);
  const registrarAuditoria = (accion: string) => {
    auditoriaRef.current.unshift({ fecha: new Date().toISOString(), accion });
  };

  const registrarHistorial = (emp: Empleado, accion: string): Empleado => ({
    ...emp,
    historial: [{ id: `${emp.id}-h${emp.historial.length + 1}`, fecha: new Date().toISOString(), accion, usuario: 'Admin' }, ...emp.historial],
  });

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    const total = empleados.length;
    const activos = empleados.filter((e) => e.estado === 'activo').length;
    const inactivos = empleados.filter((e) => e.estado !== 'activo').length;
    const sucursales = new Set(empleados.map((e) => e.sucursal)).size;
    return { total, activos, inactivos, sucursales };
  }, [empleados]);

  /* ---------- Filtro combinado ---------- */
  const listaFiltrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return empleados.filter((e) => {
      const matchTexto =
        !q ||
        `${e.nombre} ${e.apellidos}`.toLowerCase().includes(q) ||
        e.usuario.toLowerCase().includes(q) ||
        e.correo.toLowerCase().includes(q) ||
        e.telefono.includes(q) ||
        e.rol.toLowerCase().includes(q);
      const matchSucursal = filtroSucursal === 'Todas' || e.sucursal === filtroSucursal;
      const matchRol = filtroRol === 'Todos' || e.rol === filtroRol;
      const matchKPI =
        filtroEstadoKPI === 'todos' ||
        filtroEstadoKPI === 'sucursales' ||
        e.estado === filtroEstadoKPI ||
        (filtroEstadoKPI === 'inactivo' && e.estado === 'baja');
      return matchTexto && matchSucursal && matchRol && matchKPI;
    });
  }, [empleados, busqueda, filtroSucursal, filtroRol, filtroEstadoKPI]);

  /* ---------- Acciones individuales ---------- */
  const toggleSeleccion = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const abrirVer = (e: Empleado) => setEmpleadoActivo(e);
  const abrirEditar = (e: Empleado) => setEmpleadoEnEdicion({ ...e });

  const confirmarBloqueo = (e: Empleado) => {
    Alert.alert(
      e.bloqueado ? 'Desbloquear acceso' : 'Bloquear acceso',
      `¿Seguro que deseas ${e.bloqueado ? 'desbloquear' : 'bloquear'} la cuenta de ${e.nombre} ${e.apellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: e.bloqueado ? 'Desbloquear' : 'Bloquear',
          style: e.bloqueado ? 'default' : 'destructive',
          onPress: () => {
            setEmpleados((prev) =>
              prev.map((x) =>
                x.id === e.id ? registrarHistorial({ ...x, bloqueado: !x.bloqueado }, x.bloqueado ? 'Cuenta desbloqueada' : 'Cuenta bloqueada') : x
              )
            );
            registrarAuditoria(`${e.bloqueado ? 'Desbloqueo' : 'Bloqueo'} de cuenta: ${e.usuario}`);
            showToast(e.bloqueado ? 'Cuenta desbloqueada' : 'Cuenta bloqueada');
          },
        },
      ]
    );
  };

  const guardarEdicion = (motivo?: string) => {
    if (!empleadoEnEdicion) return;
    const original = empleados.find((e) => e.id === empleadoEnEdicion.id);
    let actualizado = { ...empleadoEnEdicion };

    if (original) {
      if (original.rol !== actualizado.rol) {
        actualizado = registrarHistorial(actualizado, `Cambio de rol: ${original.rol} → ${actualizado.rol}`);
      }
      if (original.sucursal !== actualizado.sucursal) {
        actualizado = registrarHistorial(actualizado, `Cambio de sucursal: ${original.sucursal} → ${actualizado.sucursal}`);
      }
      if (original.estado !== actualizado.estado) {
        actualizado.motivoBaja = motivo;
        actualizado.fechaBaja = actualizado.estado !== 'activo' ? new Date().toISOString() : undefined;
        actualizado = registrarHistorial(actualizado, `Cambio de estado: ${original.estado} → ${actualizado.estado}${motivo ? ` (${motivo})` : ''}`);
      }
    }

    setEmpleados((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)));
    registrarAuditoria(`Edición de datos: ${actualizado.usuario}`);
    setEmpleadoEnEdicion(null);
    showToast('Cambios guardados');
  };

  const restablecerContrasena = (e: Empleado) => {
    Alert.alert('Restablecer contraseña', `Se enviará una contraseña temporal al correo ${e.correo}.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: () => {
          setEmpleados((prev) => prev.map((x) => (x.id === e.id ? registrarHistorial(x, 'Restablecimiento de contraseña') : x)));
          registrarAuditoria(`Restablecimiento de contraseña: ${e.usuario}`);
          showToast('Contraseña temporal enviada');
        },
      },
    ]);
  };

  /* ---------- Acciones masivas ---------- */
  const limpiarSeleccion = () => setSeleccion(new Set());

  const bulkActivarDesactivar = (nuevoEstado: Estado) => {
    setEmpleados((prev) =>
      prev.map((e) => (seleccion.has(e.id) ? registrarHistorial({ ...e, estado: nuevoEstado }, `Cambio masivo de estado → ${nuevoEstado}`) : e))
    );
    registrarAuditoria(`Acción masiva: estado → ${nuevoEstado} (${seleccion.size} empleados)`);
    showToast(`${seleccion.size} empleados actualizados`);
    limpiarSeleccion();
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
    registrarAuditoria(`Exportación (${formato}) de ${seleccion.size || listaFiltrada.length} empleados`);
    showToast(`Exportado en ${formato}`);
    limpiarSeleccion();
  };

  const bulkEnviarCredenciales = () => {
    registrarAuditoria(`Envío de credenciales a ${seleccion.size} empleados`);
    showToast('Credenciales enviadas por correo');
    limpiarSeleccion();
  };

  const bulkAplicarSucursal = (sucursal: string) => {
    setEmpleados((prev) =>
      prev.map((e) => (seleccion.has(e.id) ? registrarHistorial({ ...e, sucursal }, `Cambio masivo de sucursal → ${sucursal}`) : e))
    );
    registrarAuditoria(`Acción masiva: sucursal → ${sucursal} (${seleccion.size} empleados)`);
    showToast(`Sucursal actualizada para ${seleccion.size} empleados`);
    setPickerBulk(null);
    limpiarSeleccion();
  };

  const bulkAplicarRol = (rol: Rol) => {
    setEmpleados((prev) =>
      prev.map((e) => (seleccion.has(e.id) ? registrarHistorial({ ...e, rol, permisos: { ...ROLE_PERMISOS_DEFAULT[rol] } }, `Cambio masivo de rol → ${rol}`) : e))
    );
    registrarAuditoria(`Acción masiva: rol → ${rol} (${seleccion.size} empleados)`);
    showToast(`Rol actualizado para ${seleccion.size} empleados`);
    setPickerBulk(null);
    limpiarSeleccion();
  };

  const crearEmpleado = (nuevo: Empleado) => {
    setEmpleados((prev) => [nuevo, ...prev]);
    registrarAuditoria(`Alta de empleado: ${nuevo.usuario}`);
    setCreando(false);
    showToast('Empleado creado correctamente');
  };

  /* =========================================================================
   * RENDER
   * =======================================================================*/

  const renderCard = ({ item }: { item: Empleado }) => {
    const seleccionado = seleccion.has(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => toggleSeleccion(item.id)}
        onPress={() => (modoSeleccion ? toggleSeleccion(item.id) : abrirVer(item))}
        style={[
          styles.empCard,
          seleccionado && { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
        ]}
      >
        <View style={styles.empCardTop}>
          {modoSeleccion && (
            <TouchableOpacity onPress={() => toggleSeleccion(item.id)} style={[styles.checkbox, seleccionado && styles.checkboxOn]}>
              {seleccionado && <Text style={styles.checkboxMark}>✓</Text>}
            </TouchableOpacity>
          )}
          <Avatar nombre={item.nombre} apellidos={item.apellidos} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.empName} numberOfLines={1}>
              {item.nombre} {item.apellidos}
            </Text>
            <Text style={styles.empSub} numberOfLines={1}>
              @{item.usuario} · {item.sucursal}
            </Text>
          </View>
          <EstadoBadge estado={item.estado} />
        </View>

        <View style={styles.empCardMid}>
          <RolChip rol={item.rol} />
          <Text style={styles.lastAccess}>Último acceso: {fmtFechaHora(item.ultimoAcceso)}</Text>
        </View>

        {!modoSeleccion && (
          <View style={styles.empCardActions}>
            <TouchableOpacity style={styles.iconAction} onPress={() => abrirVer(item)}>
              <Text style={styles.iconActionText}>👁️  Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={() => abrirEditar(item)}>
              <Text style={styles.iconActionText}>✏️  Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconAction, item.bloqueado && { backgroundColor: COLORS.dangerSoft }]} onPress={() => confirmarBloqueo(item)}>
              <Text style={styles.iconActionText}>{item.bloqueado ? '🔓  Desbloq.' : '🔒  Bloquear'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ---- Cabecera ---- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Empleados</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setCreando(true)}>
          <Text style={styles.newButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listaFiltrada}
        keyExtractor={(i) => i.id}
        renderItem={renderCard}
        ListHeaderComponent={
          <View>
            {/* ---- KPIs ---- */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
              <KPICard label="Empleados totales" value={kpis.total} color={COLORS.primary} active={filtroEstadoKPI === 'todos'} onPress={() => setFiltroEstadoKPI('todos')} />
              <KPICard label="Activos" value={kpis.activos} color={COLORS.success} active={filtroEstadoKPI === 'activo'} onPress={() => setFiltroEstadoKPI('activo')} />
              <KPICard label="Inactivos" value={kpis.inactivos} color={COLORS.warning} active={filtroEstadoKPI === 'inactivo'} onPress={() => setFiltroEstadoKPI('inactivo')} />
              <KPICard label="Sucursales" value={kpis.sucursales} color={COLORS.roleAlmacenista} active={filtroEstadoKPI === 'sucursales'} onPress={() => setFiltroEstadoKPI('sucursales')} />
            </ScrollView>

            {/* ---- Búsqueda ---- */}
            <View style={styles.searchWrap}>
              <TextInput
                placeholder="Buscar por nombre, usuario, correo, teléfono o rol"
                placeholderTextColor={COLORS.inkMuted}
                style={styles.searchInput}
                value={busqueda}
                onChangeText={setBusqueda}
              />
              <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltrosVisibles(true)}>
                <Text style={styles.filterBtnText}>⚙︎ Filtros</Text>
              </TouchableOpacity>
            </View>

            {(filtroSucursal !== 'Todas' || filtroRol !== 'Todos') && (
              <View style={styles.activeFiltersRow}>
                {filtroSucursal !== 'Todas' && <Chip text={`Sucursal: ${filtroSucursal}`} onClear={() => setFiltroSucursal('Todas')} />}
                {filtroRol !== 'Todos' && <Chip text={`Rol: ${filtroRol}`} onClear={() => setFiltroRol('Todos')} />}
              </View>
            )}

            <View style={styles.resultsBar}>
              <Text style={styles.resultsText}>{listaFiltrada.length} resultado(s)</Text>
              <TouchableOpacity onPress={bulkExportar}>
                <Text style={styles.exportLink}>⤓ Exportar lista</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: modoSeleccion ? 140 : 40 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Sin resultados con estos filtros</Text>
          </View>
        }
      />

      {/* ---- Barra de acciones masivas ---- */}
      {modoSeleccion && (
        <View style={styles.bulkBar}>
          <View style={styles.bulkHeader}>
            <Text style={styles.bulkCount}>{seleccion.size} seleccionado(s)</Text>
            <TouchableOpacity onPress={limpiarSeleccion}>
              <Text style={styles.bulkClear}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <BulkAction label="Sucursal" icon="🏬" onPress={() => setPickerBulk('sucursal')} />
            <BulkAction label="Rol" icon="🧾" onPress={() => setPickerBulk('rol')} />
            <BulkAction label="Activar" icon="✅" onPress={() => bulkActivarDesactivar('activo')} />
            <BulkAction label="Desactivar" icon="⛔" onPress={() => bulkActivarDesactivar('inactivo')} />
            <BulkAction label="Exportar" icon="⤓" onPress={bulkExportar} />
            <BulkAction label="Credenciales" icon="✉️" onPress={bulkEnviarCredenciales} />
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
            <FieldLabel>Sucursal</FieldLabel>
            <ChoiceRow options={['Todas', ...SUCURSALES]} value={filtroSucursal} onChange={setFiltroSucursal} />
            <FieldLabel>Rol</FieldLabel>
            <ChoiceRow options={['Todos', ...ROLES]} value={filtroRol} onChange={setFiltroRol} />
            <View style={{ height: 12 }} />
            <BigButton label="Aplicar filtros" onPress={() => setFiltrosVisibles(false)} />
            <TouchableOpacity
              onPress={() => {
                setFiltroSucursal('Todas');
                setFiltroRol('Todos');
              }}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={styles.linkText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---- Modal: Picker bulk sucursal/rol ---- */}
      <Modal visible={!!pickerBulk} animationType="fade" transparent onRequestClose={() => setPickerBulk(null)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <SectionTitle>{pickerBulk === 'sucursal' ? 'Cambiar sucursal a seleccionados' : 'Cambiar rol a seleccionados'}</SectionTitle>
            {(pickerBulk === 'sucursal' ? SUCURSALES : ROLES).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.pickerRow}
                onPress={() => (pickerBulk === 'sucursal' ? bulkAplicarSucursal(opt) : bulkAplicarRol(opt as Rol))}
              >
                <Text style={styles.pickerRowText}>{opt}</Text>
                <Text style={{ color: COLORS.inkMuted }}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setPickerBulk(null)} style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={styles.linkText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---- Panel lateral: Ver empleado ---- */}
      <Modal visible={!!empleadoActivo} animationType="slide" transparent onRequestClose={() => setEmpleadoActivo(null)}>
        {empleadoActivo && (
          <VerEmpleadoPanel
            empleado={empleadoActivo}
            onClose={() => setEmpleadoActivo(null)}
            onEditar={() => {
              const e = empleadoActivo;
              setEmpleadoActivo(null);
              setEmpleadoEnEdicion({ ...e });
            }}
            onRestablecerContrasena={() => restablecerContrasena(empleadoActivo)}
          />
        )}
      </Modal>

      {/* ---- Modal: Editar empleado ---- */}
      <Modal visible={!!empleadoEnEdicion} animationType="slide" transparent onRequestClose={() => setEmpleadoEnEdicion(null)}>
        {empleadoEnEdicion && (
          <EditarEmpleadoForm
            empleado={empleadoEnEdicion}
            onChange={setEmpleadoEnEdicion}
            onCancel={() => setEmpleadoEnEdicion(null)}
            onGuardar={guardarEdicion}
            onBloquear={() => confirmarBloqueo(empleadoEnEdicion)}
            onRestablecerContrasena={() => restablecerContrasena(empleadoEnEdicion)}
          />
        )}
      </Modal>

      {/* ---- Modal: Crear empleado ---- */}
      <Modal visible={creando} animationType="slide" transparent onRequestClose={() => setCreando(false)}>
        <CrearEmpleadoForm onCancel={() => setCreando(false)} onCrear={crearEmpleado} />
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================================
 * 5. SUBCOMPONENTES DE UI
 * =======================================================================*/

function Chip({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <View style={styles.filterChip}>
      <Text style={styles.filterChipText}>{text}</Text>
      <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.filterChipClose}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChoiceRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
      {options.map((opt) => {
        const activo = opt === value;
        return (
          <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.choicePill, activo && styles.choicePillOn]}>
            <Text style={[styles.choicePillText, activo && styles.choicePillTextOn]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function BulkAction({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.bulkActionBtn} onPress={onPress}>
      <Text style={styles.bulkActionIcon}>{icon}</Text>
      <Text style={styles.bulkActionLabel}>{label}</Text>
    </TouchableOpacity>
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

/* ---------- Panel: Ver empleado ---------- */
function VerEmpleadoPanel({
  empleado,
  onClose,
  onEditar,
  onRestablecerContrasena,
}: {
  empleado: Empleado;
  onClose: () => void;
  onEditar: () => void;
  onRestablecerContrasena: () => void;
}) {
  return (
    <View style={styles.sheetOverlay}>
      <View style={[styles.sheet, { maxHeight: '92%' }]}>
        <View style={styles.sheetHandle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.panelHeader}>
            <Avatar nombre={empleado.nombre} apellidos={empleado.apellidos} size={64} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.panelName}>
                {empleado.nombre} {empleado.apellidos}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <RolChip rol={empleado.rol} />
                <EstadoBadge estado={empleado.estado} />
              </View>
            </View>
          </View>

          <SectionTitle>Datos personales</SectionTitle>
          <InfoRow label="Teléfono" value={empleado.telefono} />
          <InfoRow label="Correo" value={empleado.correo} />
          <InfoRow label="CURP" value={empleado.curp || '—'} />
          <InfoRow label="RFC" value={empleado.rfc || '—'} />
          <InfoRow label="Dirección" value={empleado.direccion || '—'} />
          <InfoRow label="Fecha de nacimiento" value={empleado.fechaNacimiento ? fmtFecha(empleado.fechaNacimiento) : '—'} />

          <SectionTitle>Datos laborales</SectionTitle>
          <InfoRow label="Sucursal" value={empleado.sucursal} />
          <InfoRow label="Fecha de ingreso" value={fmtFecha(empleado.fechaIngreso)} />
          <InfoRow label="Horario" value={empleado.horario || '—'} />
          {empleado.estado !== 'activo' && <InfoRow label="Motivo" value={empleado.motivoBaja || '—'} />}

          <SectionTitle>Cuenta</SectionTitle>
          <InfoRow label="Usuario" value={empleado.usuario} />
          <InfoRow label="Estado de cuenta" value={empleado.bloqueado ? 'Bloqueada' : 'Habilitada'} />
          <InfoRow label="Último acceso" value={fmtFechaHora(empleado.ultimoAcceso)} />

          <SectionTitle>Permisos</SectionTitle>
          {Object.entries(PERMISOS_MODULOS).map(([modulo, permisos]) => (
            <View key={modulo} style={{ marginBottom: 8 }}>
              <Text style={styles.moduloLabel}>{modulo}</Text>
              {permisos.map((p) => (
                <View key={p} style={styles.permisoRowReadonly}>
                  <View style={[styles.checkboxSmall, empleado.permisos[p] && styles.checkboxSmallOn]}>
                    {empleado.permisos[p] && <Text style={styles.checkboxMarkSmall}>✓</Text>}
                  </View>
                  <Text style={styles.permisoText}>{p}</Text>
                </View>
              ))}
            </View>
          ))}

          <SectionTitle>Historial</SectionTitle>
          <View style={{ marginBottom: 12 }}>
            {empleado.historial.map((ev) => (
              <TimelineItem key={ev.id} ev={ev} />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <BigButton label="Editar" icon="✏️" onPress={onEditar} />
            </View>
            <View style={{ flex: 1 }}>
              <BigButton label="Restablecer contraseña" variant="ghost" icon="🔑" onPress={onRestablecerContrasena} />
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10, alignItems: 'center', paddingBottom: 10 }}>
            <Text style={styles.linkText}>Cerrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
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

/* ---------- Formulario: Editar empleado ---------- */
function EditarEmpleadoForm({
  empleado,
  onChange,
  onCancel,
  onGuardar,
  onBloquear,
  onRestablecerContrasena,
}: {
  empleado: Empleado;
  onChange: (e: Empleado) => void;
  onCancel: () => void;
  onGuardar: (motivo?: string) => void;
  onBloquear: () => void;
  onRestablecerContrasena: () => void;
}) {
  const [tab, setTab] = useState<'personal' | 'laboral' | 'cuenta' | 'permisos'>('personal');
  const [motivo, setMotivo] = useState(empleado.motivoBaja || '');
  const estadoOriginalRef = useRef(empleado.estado);
  const requiereMotivo = empleado.estado !== 'activo' && estadoOriginalRef.current === 'activo';

  const set = (patch: Partial<Empleado>) => onChange({ ...empleado, ...patch });

  const guardar = () => {
    if (requiereMotivo && !motivo.trim()) {
      Alert.alert('Motivo requerido', 'Indica el motivo del cambio de estado antes de guardar.');
      return;
    }
    onGuardar(motivo.trim() || undefined);
  };

  return (
    <View style={styles.sheetOverlay}>
      <View style={[styles.sheet, { maxHeight: '94%' }]}>
        <View style={styles.sheetHandle} />
        <SectionTitle>
          Editar: {empleado.nombre} {empleado.apellidos}
        </SectionTitle>

        <TabBar
          tabs={[
            { key: 'personal', label: 'Personal' },
            { key: 'laboral', label: 'Laboral' },
            { key: 'cuenta', label: 'Cuenta' },
            { key: 'permisos', label: 'Permisos' },
          ]}
          active={tab}
          onChange={(k) => setTab(k as any)}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
          {tab === 'personal' && (
            <>
              <LabeledInput label="Nombre" value={empleado.nombre} onChangeText={(v) => set({ nombre: v })} required />
              <LabeledInput label="Apellidos" value={empleado.apellidos} onChangeText={(v) => set({ apellidos: v })} required />
              <LabeledInput label="Teléfono" value={empleado.telefono} onChangeText={(v) => set({ telefono: v })} keyboardType="phone-pad" required />
              <LabeledInput label="Email" value={empleado.correo} onChangeText={(v) => set({ correo: v })} keyboardType="email-address" required />
              <LabeledInput label="CURP" value={empleado.curp || ''} onChangeText={(v) => set({ curp: v })} />
              <LabeledInput label="RFC" value={empleado.rfc || ''} onChangeText={(v) => set({ rfc: v })} />
              <LabeledInput label="Dirección" value={empleado.direccion || ''} onChangeText={(v) => set({ direccion: v })} multiline />
            </>
          )}

          {tab === 'laboral' && (
            <>
              <FieldLabel required>Sucursal</FieldLabel>
              <ChoiceRow options={SUCURSALES} value={empleado.sucursal} onChange={(v) => set({ sucursal: v })} />
              <FieldLabel required>Rol</FieldLabel>
              <ChoiceRow options={ROLES} value={empleado.rol} onChange={(v) => set({ rol: v as Rol, permisos: { ...ROLE_PERMISOS_DEFAULT[v as Rol] } })} />
              <FieldLabel required>Estado</FieldLabel>
              <ChoiceRow options={['activo', 'inactivo', 'baja']} value={empleado.estado} onChange={(v) => set({ estado: v as Estado })} />
              {empleado.estado !== 'activo' && (
                <LabeledInput label="Motivo del cambio de estado" value={motivo} onChangeText={setMotivo} required multiline />
              )}
              <LabeledInput label="Horario" value={empleado.horario || ''} onChangeText={(v) => set({ horario: v })} />
              <LabeledInput label="Salario (opcional)" value={empleado.salario || ''} onChangeText={(v) => set({ salario: v })} keyboardType="numeric" />
            </>
          )}

          {tab === 'cuenta' && (
            <>
              <LabeledInput label="Usuario" value={empleado.usuario} onChangeText={(v) => set({ usuario: v })} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <BigButton label="Restablecer contraseña" icon="🔑" variant="ghost" onPress={onRestablecerContrasena} />
                </View>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Cuenta bloqueada</Text>
                <Switch
                  value={empleado.bloqueado}
                  onValueChange={() => onBloquear()}
                  trackColor={{ false: COLORS.surfaceAlt, true: COLORS.dangerSoft }}
                  thumbColor={empleado.bloqueado ? COLORS.danger : '#fff'}
                />
              </View>
              <Text style={styles.helperText}>Nota: la desactivación es un soft delete. No se elimina el historial de ventas ni movimientos del empleado.</Text>
            </>
          )}

          {tab === 'permisos' && (
            <>
              <Text style={styles.helperText}>Plantilla cargada según el rol. Puedes sobrescribir permisos individuales.</Text>
              {Object.entries(PERMISOS_MODULOS).map(([modulo, permisos]) => (
                <View key={modulo} style={{ marginBottom: 10 }}>
                  <Text style={styles.moduloLabel}>{modulo}</Text>
                  {permisos.map((p) => {
                    const on = !!empleado.permisos[p];
                    return (
                      <TouchableOpacity
                        key={p}
                        style={styles.permisoRow}
                        onPress={() => set({ permisos: { ...empleado.permisos, [p]: !on } })}
                      >
                        <View style={[styles.checkboxSmall, on && styles.checkboxSmallOn]}>{on && <Text style={styles.checkboxMarkSmall}>✓</Text>}</View>
                        <Text style={styles.permisoText}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <BigButton label="Cancelar" variant="ghost" onPress={onCancel} />
          </View>
          <View style={{ flex: 1 }}>
            <BigButton label="Guardar cambios" variant="success" onPress={guardar} />
          </View>
        </View>
      </View>
    </View>
  );
}

/* ---------- Formulario: Crear empleado ---------- */
function CrearEmpleadoForm({ onCancel, onCrear }: { onCancel: () => void; onCrear: (e: Empleado) => void }) {
  const [tab, setTab] = useState<'personal' | 'laboral' | 'cuenta'>('personal');
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: '',
    curp: '',
    rfc: '',
    direccion: '',
    sucursal: SUCURSALES[0],
    rol: ROLES[0] as Rol,
    salario: '',
    horario: '',
    usuario: '',
    password: '',
    passwordConfirm: '',
    forzarCambio: true,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const camposObligatoriosPersonal = form.nombre.trim() && form.apellidos.trim() && form.telefono.trim() && form.correo.trim();
  const camposObligatoriosCuenta = form.usuario.trim() && form.password.length >= 6 && form.password === form.passwordConfirm;

  const puedeCrear = camposObligatoriosPersonal && camposObligatoriosCuenta;

  const crear = () => {
    if (!camposObligatoriosPersonal) {
      Alert.alert('Faltan datos', 'Completa nombre, apellidos, teléfono y correo.');
      setTab('personal');
      return;
    }
    if (!form.usuario.trim()) {
      Alert.alert('Falta usuario', 'Define un nombre de usuario.');
      setTab('cuenta');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña temporal debe tener al menos 6 caracteres.');
      setTab('cuenta');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      Alert.alert('No coincide', 'La confirmación de contraseña no coincide.');
      setTab('cuenta');
      return;
    }

    const id = nextId();
    const nuevo: Empleado = {
      id,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      usuario: form.usuario.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono.trim(),
      curp: form.curp || undefined,
      rfc: form.rfc || undefined,
      direccion: form.direccion || undefined,
      rol: form.rol,
      sucursal: form.sucursal,
      estado: 'activo',
      fechaIngreso: new Date().toISOString(),
      salario: form.salario || undefined,
      horario: form.horario || undefined,
      ultimoAcceso: new Date().toISOString(),
      bloqueado: false,
      permisos: { ...ROLE_PERMISOS_DEFAULT[form.rol] },
      historial: [
        { id: `${id}-h1`, fecha: new Date().toISOString(), accion: 'Alta de empleado en el sistema', usuario: 'Admin' },
        ...(form.forzarCambio ? [{ id: `${id}-h2`, fecha: new Date().toISOString(), accion: 'Cambio de contraseña obligatorio en primer inicio de sesión', usuario: 'Admin' }] : []),
      ],
    };
    onCrear(nuevo);
  };

  return (
    <View style={styles.sheetOverlay}>
      <View style={[styles.sheet, { maxHeight: '94%' }]}>
        <View style={styles.sheetHandle} />
        <SectionTitle>Nuevo empleado</SectionTitle>

        <TabBar
          tabs={[
            { key: 'personal', label: 'Personal' },
            { key: 'laboral', label: 'Laboral' },
            { key: 'cuenta', label: 'Cuenta' },
          ]}
          active={tab}
          onChange={(k) => setTab(k as any)}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
          {tab === 'personal' && (
            <>
              <LabeledInput label="Nombre" value={form.nombre} onChangeText={(v) => set({ nombre: v })} required />
              <LabeledInput label="Apellidos" value={form.apellidos} onChangeText={(v) => set({ apellidos: v })} required />
              <LabeledInput label="Teléfono" value={form.telefono} onChangeText={(v) => set({ telefono: v })} keyboardType="phone-pad" required />
              <LabeledInput label="Correo" value={form.correo} onChangeText={(v) => set({ correo: v })} keyboardType="email-address" required />
              <LabeledInput label="CURP (opcional)" value={form.curp} onChangeText={(v) => set({ curp: v })} />
              <LabeledInput label="RFC (opcional)" value={form.rfc} onChangeText={(v) => set({ rfc: v })} />
              <LabeledInput label="Dirección (opcional)" value={form.direccion} onChangeText={(v) => set({ direccion: v })} multiline />
            </>
          )}

          {tab === 'laboral' && (
            <>
              <FieldLabel required>Sucursal</FieldLabel>
              <ChoiceRow options={SUCURSALES} value={form.sucursal} onChange={(v) => set({ sucursal: v })} />
              <FieldLabel required>Rol</FieldLabel>
              <ChoiceRow options={ROLES} value={form.rol} onChange={(v) => set({ rol: v as Rol })} />
              <Text style={styles.helperText}>Fecha de ingreso: hoy ({fmtFecha(new Date().toISOString())})</Text>
              <LabeledInput label="Salario (opcional)" value={form.salario} onChangeText={(v) => set({ salario: v })} keyboardType="numeric" />
              <LabeledInput label="Horario (opcional)" value={form.horario} onChangeText={(v) => set({ horario: v })} />
            </>
          )}

          {tab === 'cuenta' && (
            <>
              <LabeledInput label="Usuario" value={form.usuario} onChangeText={(v) => set({ usuario: v })} required />
              <LabeledInput label="Contraseña temporal" value={form.password} onChangeText={(v) => set({ password: v })} secureTextEntry required />
              <LabeledInput label="Confirmar contraseña" value={form.passwordConfirm} onChangeText={(v) => set({ passwordConfirm: v })} secureTextEntry required />
              <View style={styles.switchRow}>
                <Text style={[styles.fieldLabel, { flex: 1 }]}>Obligar cambio de contraseña al iniciar sesión</Text>
                <Switch
                  value={form.forzarCambio}
                  onValueChange={(v) => set({ forzarCambio: v })}
                  trackColor={{ false: COLORS.surfaceAlt, true: COLORS.primarySoft }}
                  thumbColor={form.forzarCambio ? COLORS.primary : '#fff'}
                />
              </View>
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <BigButton label="Cancelar" variant="ghost" onPress={onCancel} />
          </View>
          <View style={{ flex: 1 }}>
            <BigButton label="Crear empleado" variant="success" onPress={crear} disabled={!puedeCrear && tab === 'cuenta'} />
          </View>
        </View>
      </View>
    </View>
  );
}

function TabBar({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={[styles.tabBtn, on && styles.tabBtnOn]}>
            <Text style={[styles.tabBtnText, on && styles.tabBtnTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function LabeledInput(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  required?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <FieldLabel required={props.required}>{props.label}</FieldLabel>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType || 'default'}
        secureTextEntry={props.secureTextEntry}
        multiline={props.multiline}
        style={[styles.textInput, props.multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholderTextColor={COLORS.inkMuted}
      />
    </View>
  );
}

/* =========================================================================
 * 6. ESTILOS
 * =======================================================================*/

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 4,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.5 },
  newButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...HARD_SHADOW,
  },
  newButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  kpiRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 14 },
  kpiCard: {
    minWidth: 128,
    borderWidth: 3,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    ...HARD_SHADOW,
  },
  kpiValue: { fontSize: 26, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  searchWrap: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 15,
    color: COLORS.ink,
    ...SOFT_SHADOW,
  },
  filterBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    justifyContent: 'center',
    ...HARD_SHADOW,
  },
  filterBtnText: { fontWeight: '700', color: COLORS.ink },

  activeFiltersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChipText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },
  filterChipClose: { color: COLORS.primaryDark, fontWeight: '900' },

  resultsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 6 },
  resultsText: { color: COLORS.inkMuted, fontWeight: '600', fontSize: 13 },
  exportLink: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  empCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 14,
    ...HARD_SHADOW,
  },
  empCardTop: { flexDirection: 'row', alignItems: 'center' },
  empName: { fontSize: 16, fontWeight: '800', color: COLORS.ink },
  empSub: { fontSize: 12.5, color: COLORS.inkMuted, marginTop: 2 },

  empCardMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  lastAccess: { fontSize: 11.5, color: COLORS.inkMuted },

  empCardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  iconAction: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  iconActionText: { fontSize: 12.5, fontWeight: '700', color: COLORS.ink },

  avatar: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: COLORS.primaryDark },

  badge: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 10, gap: 6 },
  badgeText: { fontWeight: '800', fontSize: 11.5 },
  dot: { width: 7, height: 7, borderRadius: 4 },

  roleChip: { borderWidth: 2, borderRadius: RADIUS.sm, paddingVertical: 4, paddingHorizontal: 9 },
  roleChipText: { fontWeight: '800', fontSize: 11.5 },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: COLORS.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxMark: { color: '#fff', fontWeight: '900' },

  checkboxSmall: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxSmallOn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkboxMarkSmall: { color: '#fff', fontWeight: '900', fontSize: 12 },

  bulkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.ink,
    borderTopWidth: 3,
    borderColor: COLORS.border,
    padding: 14,
    paddingBottom: 22,
  },
  bulkHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bulkCount: { color: '#fff', fontWeight: '800' },
  bulkClear: { color: COLORS.warningSoft, fontWeight: '700' },
  bulkActionBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 84,
  },
  bulkActionIcon: { fontSize: 18 },
  bulkActionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.ink, marginTop: 2 },

  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 50,
  },
  toastText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: COLORS.inkMuted, fontWeight: '600' },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(20,23,26,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: COLORS.border,
    padding: 18,
    paddingBottom: 24,
  },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.inkMuted, alignSelf: 'center', marginBottom: 12 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink, marginTop: 16, marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.inkMuted, marginBottom: 6, marginTop: 2 },

  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: COLORS.ink,
  },

  choicePill: { borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.pill, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#fff' },
  choicePillOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  choicePillText: { fontWeight: '700', color: COLORS.ink, fontSize: 13 },
  choicePillTextOn: { color: '#fff' },

  bigButton: { borderWidth: 3, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center', ...HARD_SHADOW },
  bigButtonText: { fontWeight: '800', fontSize: 15 },

  linkText: { color: COLORS.primary, fontWeight: '700' },

  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  panelName: { fontSize: 20, fontWeight: '800', color: COLORS.ink },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: COLORS.surfaceAlt },
  infoLabel: { color: COLORS.inkMuted, fontWeight: '600', fontSize: 13 },
  infoValue: { color: COLORS.ink, fontWeight: '700', fontSize: 13, maxWidth: '60%', textAlign: 'right' },

  moduloLabel: { fontWeight: '800', color: COLORS.ink, marginBottom: 4, fontSize: 13.5 },
  permisoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  permisoRowReadonly: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, opacity: 0.9 },
  permisoText: { color: COLORS.ink, fontSize: 13.5 },

  timelineItem: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderLeftWidth: 2, borderColor: COLORS.surfaceAlt, marginLeft: 4, paddingLeft: 12 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4, marginLeft: -17 },
  timelineAccion: { fontWeight: '700', color: COLORS.ink, fontSize: 13.5 },
  timelineMeta: { color: COLORS.inkMuted, fontSize: 11.5, marginTop: 2 },

  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.border, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: RADIUS.sm },
  tabBtnOn: { backgroundColor: COLORS.primary },
  tabBtnText: { fontWeight: '700', color: COLORS.inkMuted, fontSize: 12.5 },
  tabBtnTextOn: { color: '#fff' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  helperText: { color: COLORS.inkMuted, fontSize: 12, marginBottom: 10, lineHeight: 17 },

  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: COLORS.surfaceAlt },
  pickerRowText: { fontWeight: '700', color: COLORS.ink, fontSize: 15 },
});
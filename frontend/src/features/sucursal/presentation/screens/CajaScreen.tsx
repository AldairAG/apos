import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikHelpers } from "formik";
import { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import * as Yup from "yup";

/**
 * CajaScreen — Centro financiero de la sucursal.
 *
 * IMPORTANTE — este archivo es SOLO LA INTERFAZ (UI), autocontenida con datos
 * mock y estado local, tal como se pidió. NO está conectado a Redux, a los
 * use cases reales (obtenerCajaPorId / abrirCaja / cerrarCaja) ni a los
 * DTOs/enums reales del proyecto. Cada punto de integración está marcado
 * con // TODO para que se conecte a la arquitectura real de Appos:
 *
 *   - Reemplazar los tipos/enums placeholder por los reales del dominio.
 *   - Reemplazar `CAJAS_MOCK` / `MOVIMIENTOS_MOCK` por datos de Redux
 *     (selector de caja actual, selector de sucursal actual) y por
 *     query use cases reales.
 *   - Reemplazar cada `// TODO: ejecutar use case` por el dispatch/llamada
 *     al use case correspondiente (abrirCaja, cerrarCaja, crearMovimiento,
 *     crearCaja) y manejar loading/error reales en vez de los estados locales.
 *   - La gráfica usa react-native-svg de forma genérica porque no se conoce
 *     qué librería de gráficas ya está instalada en el proyecto; si ya existe
 *     una (Victory, react-native-chart-kit, etc.) reemplazar `DonutChart` por
 *     esa, reutilizando el cálculo de `agruparPorCategoria`.
 */

// =====================================================================
// Tipos y enums placeholder — TODO: reemplazar por los reales del dominio
// =====================================================================

enum EstadoCaja {
    ABIERTA = "ABIERTA",
    CERRADA = "CERRADA",
}

enum TipoMovimiento {
    INGRESO = "INGRESO",
    EGRESO = "EGRESO",
}

enum CategoriaIngreso {
    VENTA = "VENTA",
    ABONO_CLIENTE = "ABONO_CLIENTE",
    OTRO_INGRESO = "OTRO_INGRESO",
}

enum CategoriaEgreso {
    INSUMOS = "INSUMOS",
    NOMINA = "NOMINA",
    SERVICIOS = "SERVICIOS",
    RENTA = "RENTA",
    OTRO_GASTO = "OTRO_GASTO",
}

const CATEGORIA_INGRESO_LABELS: Record<CategoriaIngreso, string> = {
    [CategoriaIngreso.VENTA]: "Venta",
    [CategoriaIngreso.ABONO_CLIENTE]: "Abono de cliente",
    [CategoriaIngreso.OTRO_INGRESO]: "Otro ingreso",
};

const CATEGORIA_EGRESO_LABELS: Record<CategoriaEgreso, string> = {
    [CategoriaEgreso.INSUMOS]: "Insumos",
    [CategoriaEgreso.NOMINA]: "Nómina",
    [CategoriaEgreso.SERVICIOS]: "Servicios",
    [CategoriaEgreso.RENTA]: "Renta",
    [CategoriaEgreso.OTRO_GASTO]: "Otro gasto",
};

// CajaDto — igual al DTO real compartido
interface CajaDto {
    id: number;
    nombre: string;
    saldo: number;
    saldoInicial: number;
    estado: EstadoCaja; // TODO: confirmar si el estado vive en CajaDto o se deriva del corte actual
}

interface MovimientoDto {
    id: number;
    descripcion: string;
    monto: number;
    tipo: TipoMovimiento;
    categoria: CategoriaIngreso | CategoriaEgreso;
    createdAt: Date;
}

// =====================================================================
// Datos mock — TODO: reemplazar por selectors de Redux + query use cases
// =====================================================================

const CAJAS_MOCK: CajaDto[] = [
    { id: 1, nombre: "Caja Principal", saldo: 8540, saldoInicial: 3000, estado: EstadoCaja.ABIERTA },
    { id: 2, nombre: "Caja Barra", saldo: 1200, saldoInicial: 1200, estado: EstadoCaja.CERRADA },
    { id: 3, nombre: "Caja Terraza", saldo: 0, saldoInicial: 0, estado: EstadoCaja.CERRADA },
];

const MOVIMIENTOS_MOCK: MovimientoDto[] = [
    { id: 1, descripcion: "Venta mostrador", monto: 450, tipo: TipoMovimiento.INGRESO, categoria: CategoriaIngreso.VENTA, createdAt: new Date(2026, 8, 13, 12, 35) },
    { id: 2, descripcion: "Venta mostrador", monto: 320, tipo: TipoMovimiento.INGRESO, categoria: CategoriaIngreso.VENTA, createdAt: new Date(2026, 8, 13, 11, 10) },
    { id: 3, descripcion: "Abono cliente frecuente", monto: 1000, tipo: TipoMovimiento.INGRESO, categoria: CategoriaIngreso.ABONO_CLIENTE, createdAt: new Date(2026, 8, 13, 9, 5) },
    { id: 4, descripcion: "Compra de insumos", monto: 850, tipo: TipoMovimiento.EGRESO, categoria: CategoriaEgreso.INSUMOS, createdAt: new Date(2026, 8, 13, 10, 20) },
    { id: 5, descripcion: "Pago de luz", monto: 350, tipo: TipoMovimiento.EGRESO, categoria: CategoriaEgreso.SERVICIOS, createdAt: new Date(2026, 8, 13, 8, 40) },
];

const HISTORIAL_CORTES_MOCK = [
    { id: 1, fecha: "13 Sep 2026", saldoFinal: 8800, cerradoAt: "22:15" },
    { id: 2, fecha: "12 Sep 2026", saldoFinal: 7450, cerradoAt: "22:03" },
    { id: 3, fecha: "11 Sep 2026", saldoFinal: 9120, cerradoAt: "21:58" },
]; // TODO: sustituir por query use case "obtenerHistorialCortes" cuando exista

const DENOMINACIONES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

// =====================================================================
// Helpers
// =====================================================================

function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}

function formatFecha(date: Date): string {
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function formatHora(date: Date): string {
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function agruparPorCategoria(
    movimientos: MovimientoDto[]
): { categoria: string; total: number; porcentaje: number; color: string }[] {
    const total = movimientos.reduce((acc, m) => acc + m.monto, 0);
    const mapa = new Map<string, number>();

    movimientos.forEach((m) => {
        const label =
            m.tipo === TipoMovimiento.INGRESO
                ? CATEGORIA_INGRESO_LABELS[m.categoria as CategoriaIngreso]
                : CATEGORIA_EGRESO_LABELS[m.categoria as CategoriaEgreso];
        mapa.set(label, (mapa.get(label) ?? 0) + m.monto);
    });

    const paleta = ["#1857B6", "#4C8DDA", "#79A9E3", "#B3261E", "#E46962", "#F2A93B", "#79747E"];

    return Array.from(mapa.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([categoria, monto], i) => ({
            categoria,
            total: monto,
            porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
            color: paleta[i % paleta.length],
        }));
}

// =====================================================================
// Sub-componente: Donut chart (genérico con react-native-svg)
// TODO: reemplazar por la librería de gráficas ya instalada en el proyecto
// =====================================================================

function DonutChart({
    data,
}: {
    data: { categoria: string; total: number; porcentaje: number; color: string }[];
}) {
    const size = 160;
    const strokeWidth = 22;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let acumulado = 0;

    return (
        <View className="items-center">
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#F1EEF4"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {data.map((segmento, i) => {
                    const dash = (segmento.porcentaje / 100) * circumference;
                    const offset = circumference - (acumulado / 100) * circumference;
                    acumulado += segmento.porcentaje;
                    return (
                        <Circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={segmento.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={offset}
                            strokeLinecap="butt"
                            rotation={-90}
                            origin={`${size / 2}, ${size / 2}`}
                        />
                    );
                })}
            </Svg>
        </View>
    );
}

// =====================================================================
// Componente principal
// =====================================================================

export default function CajaScreen() {
    // TODO: reemplazar por selector de Redux (sucursal seleccionada vía [sucursalId])
    const [cajas, setCajas] = useState<CajaDto[]>(CAJAS_MOCK);
    const [cajaSeleccionadaId, setCajaSeleccionadaId] = useState<number>(CAJAS_MOCK[0].id);
    // TODO: reemplazar por selector de Redux del corte actual (ingresos/egresos/ventas/gastos)
    const [movimientos] = useState<MovimientoDto[]>(MOVIMIENTOS_MOCK);

    const caja = useMemo(
        () => cajas.find((c) => c.id === cajaSeleccionadaId)!,
        [cajas, cajaSeleccionadaId]
    );

    // Resumen financiero derivado de los movimientos (mock).
    // TODO: sustituir por los campos reales de CorteCajaDto (ingresos, egresos, ventas, gastos)
    const resumen = useMemo(() => {
        const ingresos = movimientos
            .filter((m) => m.tipo === TipoMovimiento.INGRESO && m.categoria !== CategoriaIngreso.VENTA)
            .reduce((acc, m) => acc + m.monto, 0);
        const ventas = movimientos
            .filter((m) => m.categoria === CategoriaIngreso.VENTA)
            .reduce((acc, m) => acc + m.monto, 0);
        const egresos = movimientos
            .filter((m) => m.tipo === TipoMovimiento.EGRESO && m.categoria !== CategoriaEgreso.INSUMOS)
            .reduce((acc, m) => acc + m.monto, 0);
        const gastos = movimientos
            .filter((m) => m.categoria === CategoriaEgreso.INSUMOS)
            .reduce((acc, m) => acc + m.monto, 0);

        return { ingresos, ventas, egresos, gastos };
    }, [movimientos]);

    const saldoEsperado =
        caja.saldoInicial + resumen.ventas + resumen.ingresos - resumen.egresos - resumen.gastos;

    // --- Estado de UI (modales, tabs) ---
    const [selectorCajaVisible, setSelectorCajaVisible] = useState(false);
    const [crearCajaVisible, setCrearCajaVisible] = useState(false);
    const [abrirCajaVisible, setAbrirCajaVisible] = useState(false);
    const [nuevoMovimientoVisible, setNuevoMovimientoVisible] = useState(false);
    const [corteVisible, setCorteVisible] = useState(false);

    const [tabMovimientos, setTabMovimientos] = useState<TipoMovimiento>(TipoMovimiento.INGRESO);
    const [tabGrafica, setTabGrafica] = useState<TipoMovimiento>(TipoMovimiento.INGRESO);

    const movimientosFiltrados = movimientos.filter((m) => m.tipo === tabMovimientos);
    const dataGrafica = agruparPorCategoria(movimientos.filter((m) => m.tipo === tabGrafica));

    // --- Acciones (placeholders — TODO: conectar use cases reales) ---

    const abrirCaja = (saldoInicial: number) => {
        // TODO: dispatch(abrirCajaThunk({ cajaId: caja.id, saldoInicial }))
        setCajas((prev) =>
            prev.map((c) =>
                c.id === caja.id ? { ...c, estado: EstadoCaja.ABIERTA, saldoInicial, saldo: saldoInicial } : c
            )
        );
        setAbrirCajaVisible(false);
    };

    const crearCaja = (nombre: string) => {
        // TODO: dispatch(crearCajaThunk({ sucursalId, nombre }))
        const nueva: CajaDto = {
            id: Date.now(),
            nombre,
            saldo: 0,
            saldoInicial: 0,
            estado: EstadoCaja.CERRADA,
        };
        setCajas((prev) => [...prev, nueva]);
        setCajaSeleccionadaId(nueva.id);
        setCrearCajaVisible(false);
    };

    const cerrarCaja = () => {
        // TODO: dispatch(cerrarCajaThunk({ cajaId: caja.id, corte: {...} }))
        setCajas((prev) =>
            prev.map((c) => (c.id === caja.id ? { ...c, estado: EstadoCaja.CERRADA, saldo: 0 } : c))
        );
        setCorteVisible(false);
    };

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
                {/* 1. Selector de caja */}
                <View>
                    <Text className="text-xs font-medium text-[#79747E] mb-1">Caja</Text>
                    <Pressable
                        onPress={() => setSelectorCajaVisible(true)}
                        className="flex-row items-center justify-between bg-white border border-[#E7E0EC] rounded-2xl px-4 py-3"
                    >
                        <View>
                            <Text className="text-base font-semibold text-[#1C1B1F]">{caja.nombre}</Text>
                            <Text className="text-xs text-[#79747E] mt-0.5">
                                Saldo actual: {formatMoney(caja.saldo)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={18} color="#79747E" />
                    </Pressable>
                </View>

                {/* 2/3. Estado de caja + saldo */}
                <View
                    className={`rounded-2xl p-5 border ${
                        caja.estado === EstadoCaja.ABIERTA
                            ? "bg-[#E7EFFC] border-[#1857B6]"
                            : "bg-white border-[#E7E0EC]"
                    }`}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-[#1C1B1F]">{caja.nombre}</Text>
                        <View
                            className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${
                                caja.estado === EstadoCaja.ABIERTA ? "bg-[#1857B6]" : "bg-[#79747E]"
                            }`}
                        >
                            <Ionicons
                                name={caja.estado === EstadoCaja.ABIERTA ? "lock-open" : "lock-closed"}
                                size={12}
                                color="#FFFFFF"
                            />
                            <Text className="text-[10px] font-bold text-white tracking-wide">
                                {caja.estado === EstadoCaja.ABIERTA ? "ABIERTA" : "CERRADA"}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-xs text-[#79747E]">
                        {caja.estado === EstadoCaja.ABIERTA ? "Saldo actual" : "Último saldo"}
                    </Text>
                    <Text className="text-3xl font-bold text-[#1C1B1F] mt-1 mb-4">
                        {formatMoney(caja.estado === EstadoCaja.ABIERTA ? saldoEsperado : caja.saldo)}
                    </Text>

                    {caja.estado === EstadoCaja.CERRADA ? (
                        <Pressable
                            onPress={() => setAbrirCajaVisible(true)}
                            className="bg-[#1857B6] rounded-xl py-3 items-center active:opacity-90"
                        >
                            <Text className="text-white text-sm font-semibold">Abrir caja</Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={() => setCorteVisible(true)}
                            className="bg-white border border-[#1857B6] rounded-xl py-3 items-center active:bg-[#F1EEF4]"
                        >
                            <Text className="text-[#1857B6] text-sm font-semibold">Realizar corte</Text>
                        </Pressable>
                    )}
                </View>

                {caja.estado === EstadoCaja.ABIERTA && (
                    <>
                        {/* 4. Resumen financiero */}
                        <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                            <Text className="text-xs font-medium text-[#79747E] mb-3">Resumen financiero</Text>
                            <View className="flex-row flex-wrap gap-y-3">
                                <ResumenItem label="Inicial" value={caja.saldoInicial} />
                                <ResumenItem label="Ventas" value={resumen.ventas} />
                                <ResumenItem label="Ingresos" value={resumen.ingresos} />
                                <ResumenItem label="Gastos" value={resumen.gastos} negativo />
                                <ResumenItem label="Egresos" value={resumen.egresos} negativo />
                            </View>
                        </View>

                        {/* 5. Acción principal: nuevo movimiento */}
                        <Pressable
                            onPress={() => setNuevoMovimientoVisible(true)}
                            className="flex-row items-center justify-center gap-2 bg-[#1857B6] rounded-2xl py-3 active:opacity-90"
                        >
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                            <Text className="text-white text-sm font-semibold">Movimiento</Text>
                        </Pressable>

                        {/* 6. Gráfica por categoría */}
                        <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                            <Text className="text-xs font-medium text-[#79747E] mb-3">
                                Distribución por categoría
                            </Text>
                            <SegmentedTabs
                                value={tabGrafica}
                                onChange={setTabGrafica}
                                options={[
                                    { value: TipoMovimiento.INGRESO, label: "Ingresos" },
                                    { value: TipoMovimiento.EGRESO, label: "Egresos" },
                                ]}
                            />
                            {dataGrafica.length === 0 ? (
                                <Text className="text-sm text-[#79747E] text-center py-8">
                                    Sin datos para graficar.
                                </Text>
                            ) : (
                                <View className="mt-4 items-center">
                                    <DonutChart data={dataGrafica} />
                                    <View className="w-full mt-4 gap-2">
                                        {dataGrafica.map((seg) => (
                                            <View key={seg.categoria} className="flex-row items-center justify-between">
                                                <View className="flex-row items-center gap-2">
                                                    <View
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: seg.color }}
                                                    />
                                                    <Text className="text-sm text-[#1C1B1F]">{seg.categoria}</Text>
                                                </View>
                                                <Text className="text-sm text-[#79747E]">{seg.porcentaje}%</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* 7. Movimientos con tabs */}
                        <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                            <Text className="text-xs font-medium text-[#79747E] mb-3">Movimientos</Text>
                            <SegmentedTabs
                                value={tabMovimientos}
                                onChange={setTabMovimientos}
                                options={[
                                    { value: TipoMovimiento.INGRESO, label: "Ingresos" },
                                    { value: TipoMovimiento.EGRESO, label: "Egresos" },
                                ]}
                            />
                            <View className="mt-3 gap-2">
                                {movimientosFiltrados.length === 0 ? (
                                    <Text className="text-sm text-[#79747E] text-center py-8">
                                        {tabMovimientos === TipoMovimiento.INGRESO
                                            ? "No hay ingresos registrados hoy."
                                            : "No hay egresos registrados hoy."}
                                    </Text>
                                ) : (
                                    movimientosFiltrados.map((m) => (
                                        <View
                                            key={m.id}
                                            className="flex-row items-center justify-between py-2 border-b border-[#F1EEF4]"
                                        >
                                            <View className="flex-1">
                                                <Text className="text-sm font-medium text-[#1C1B1F]">
                                                    {m.descripcion}
                                                </Text>
                                                <Text className="text-xs text-[#79747E] mt-0.5">
                                                    {formatFecha(m.createdAt)} · {formatHora(m.createdAt)} ·{" "}
                                                    {m.tipo === TipoMovimiento.INGRESO
                                                        ? CATEGORIA_INGRESO_LABELS[m.categoria as CategoriaIngreso]
                                                        : CATEGORIA_EGRESO_LABELS[m.categoria as CategoriaEgreso]}
                                                </Text>
                                            </View>
                                            <Text
                                                className={`text-sm font-semibold ${
                                                    m.tipo === TipoMovimiento.INGRESO
                                                        ? "text-[#1C7C3F]"
                                                        : "text-[#B3261E]"
                                                }`}
                                            >
                                                {m.tipo === TipoMovimiento.INGRESO ? "+" : "-"}
                                                {formatMoney(m.monto)}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </>
                )}

                {/* 8. Historial de cortes */}
                <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                    <Text className="text-xs font-medium text-[#79747E] mb-3">Cortes recientes</Text>
                    {/* TODO: falta el query use case "obtenerHistorialCortes" — esta sección
                        usa datos mock mientras tanto, y debe ocultarse o mostrar empty state
                        si el backend aún no lo expone. */}
                    <View className="gap-3">
                        {HISTORIAL_CORTES_MOCK.map((corte) => (
                            <View key={corte.id} className="flex-row items-center justify-between">
                                <Text className="text-sm text-[#1C1B1F]">{corte.fecha}</Text>
                                <View className="items-end">
                                    <Text className="text-sm font-semibold text-[#1C1B1F]">
                                        {formatMoney(corte.saldoFinal)}
                                    </Text>
                                    <Text className="text-xs text-[#79747E]">Cerrado {corte.cerradoAt}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Modal: selector de caja */}
            <Modal
                visible={selectorCajaVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectorCajaVisible(false)}
            >
                <Pressable
                    className="flex-1 justify-end bg-black/40"
                    onPress={() => setSelectorCajaVisible(false)}
                >
                    <View className="bg-white rounded-t-3xl p-4">
                        <Text className="text-base font-semibold text-[#1C1B1F] mb-3">Seleccionar caja</Text>
                        <FlatList
                            data={cajas}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setCajaSeleccionadaId(item.id);
                                        setSelectorCajaVisible(false);
                                    }}
                                    className={`flex-row items-center justify-between py-3 px-2 rounded-xl ${
                                        item.id === cajaSeleccionadaId ? "bg-[#F1EEF4]" : ""
                                    }`}
                                >
                                    <View>
                                        <Text className="text-sm font-medium text-[#1C1B1F]">{item.nombre}</Text>
                                        <Text className="text-xs text-[#79747E] mt-0.5">
                                            {item.estado === EstadoCaja.ABIERTA ? "Abierta" : "Cerrada"} ·{" "}
                                            {formatMoney(item.saldo)}
                                        </Text>
                                    </View>
                                    {item.id === cajaSeleccionadaId && (
                                        <Ionicons name="checkmark" size={18} color="#1857B6" />
                                    )}
                                </Pressable>
                            )}
                        />
                        <Pressable
                            onPress={() => {
                                setSelectorCajaVisible(false);
                                setCrearCajaVisible(true);
                            }}
                            className="flex-row items-center justify-center gap-2 border border-dashed border-[#1857B6] rounded-xl py-3 mt-2 active:bg-[#F1EEF4]"
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#1857B6" />
                            <Text className="text-sm font-medium text-[#1857B6]">Crear nueva caja</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal: crear caja */}
            <ModalCrearCaja
                visible={crearCajaVisible}
                onClose={() => setCrearCajaVisible(false)}
                onCrear={crearCaja}
            />

            {/* Modal: abrir caja */}
            <ModalAbrirCaja
                visible={abrirCajaVisible}
                onClose={() => setAbrirCajaVisible(false)}
                onAbrir={abrirCaja}
            />

            {/* Modal: nuevo movimiento */}
            <ModalNuevoMovimiento
                visible={nuevoMovimientoVisible}
                onClose={() => setNuevoMovimientoVisible(false)}
                onRegistrar={() => {
                    // TODO: dispatch(crearMovimientoThunk(payload)) y refrescar movimientos
                    setNuevoMovimientoVisible(false);
                }}
            />

            {/* Modal: corte de caja */}
            <ModalCorte
                visible={corteVisible}
                onClose={() => setCorteVisible(false)}
                saldoInicial={caja.saldoInicial}
                ventas={resumen.ventas}
                ingresos={resumen.ingresos}
                gastos={resumen.gastos}
                egresos={resumen.egresos}
                saldoEsperado={saldoEsperado}
                onCerrarCaja={cerrarCaja}
            />
        </View>
    );
}

// =====================================================================
// Sub-componentes de presentación
// =====================================================================

function ResumenItem({
    label,
    value,
    negativo = false,
}: {
    label: string;
    value: number;
    negativo?: boolean;
}) {
    return (
        <View className="w-1/2 pr-2">
            <Text className="text-xs text-[#79747E]">{label}</Text>
            <Text className={`text-sm font-semibold ${negativo ? "text-[#B3261E]" : "text-[#1C1B1F]"}`}>
                {negativo ? "-" : ""}
                {formatMoney(value)}
            </Text>
        </View>
    );
}

function SegmentedTabs<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
}) {
    return (
        <View className="flex-row bg-[#F1EEF4] rounded-xl p-1">
            {options.map((opt) => {
                const activo = opt.value === value;
                return (
                    <Pressable
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        className={`flex-1 items-center py-2 rounded-lg ${activo ? "bg-white" : ""}`}
                    >
                        <Text
                            className={`text-sm font-medium ${activo ? "text-[#1857B6]" : "text-[#79747E]"}`}
                        >
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

// --- Modal: crear caja ---

interface CrearCajaForm {
    nombre: string;
}

function ModalCrearCaja({
    visible,
    onClose,
    onCrear,
}: {
    visible: boolean;
    onClose: () => void;
    onCrear: (nombre: string) => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl">
                    <ModalHeader title="Nueva caja" onClose={onClose} />
                    <View className="px-4 pt-6 pb-8">
                        <Formik<CrearCajaForm>
                            initialValues={{ nombre: "" }}
                            validationSchema={Yup.object({
                                nombre: Yup.string()
                                    .trim()
                                    .required("El nombre de la caja es obligatorio")
                                    .min(3, "Debe tener al menos 3 caracteres")
                                    .max(50, "No puede superar los 50 caracteres"),
                            })}
                            onSubmit={(values, helpers: FormikHelpers<CrearCajaForm>) => {
                                onCrear(values.nombre.trim());
                                helpers.resetForm();
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <View>
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Nombre</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.nombre && errors.nombre ? "border-[#B3261E]" : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="Ej. Caja Terraza"
                                        placeholderTextColor="#79747E"
                                        value={values.nombre}
                                        onChangeText={handleChange("nombre")}
                                        onBlur={handleBlur("nombre")}
                                        autoFocus
                                    />
                                    {touched.nombre && errors.nombre ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.nombre}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <View className="flex-row gap-3 mt-4">
                                        <Pressable
                                            onPress={onClose}
                                            className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            className="flex-1 bg-[#1857B6] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-semibold text-white">Crear caja</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// --- Modal: abrir caja ---

interface AbrirCajaForm {
    saldoInicial: string;
}

function ModalAbrirCaja({
    visible,
    onClose,
    onAbrir,
}: {
    visible: boolean;
    onClose: () => void;
    onAbrir: (saldoInicial: number) => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl">
                    <ModalHeader title="Abrir caja" onClose={onClose} />
                    <View className="px-4 pt-6 pb-8">
                        <Formik<AbrirCajaForm>
                            initialValues={{ saldoInicial: "" }}
                            validationSchema={Yup.object({
                                saldoInicial: Yup.string()
                                    .required("El saldo inicial es obligatorio")
                                    .test("valido", "Debe ser un monto válido (puede ser 0)", (value) => {
                                        if (value === undefined) return false;
                                        const n = Number(value.replace(",", "."));
                                        return !isNaN(n) && n >= 0;
                                    }),
                            })}
                            onSubmit={(values) => {
                                onAbrir(Number(values.saldoInicial.replace(",", ".")));
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <View>
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Saldo inicial</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.saldoInicial && errors.saldoInicial
                                                ? "border-[#B3261E]"
                                                : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="0.00"
                                        placeholderTextColor="#79747E"
                                        keyboardType="decimal-pad"
                                        value={values.saldoInicial}
                                        onChangeText={handleChange("saldoInicial")}
                                        onBlur={handleBlur("saldoInicial")}
                                        autoFocus
                                    />
                                    {touched.saldoInicial && errors.saldoInicial ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.saldoInicial}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <View className="flex-row gap-3 mt-4">
                                        <Pressable
                                            onPress={onClose}
                                            className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            className="flex-1 bg-[#1857B6] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-semibold text-white">Abrir caja</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// --- Modal: nuevo movimiento ---

interface NuevoMovimientoForm {
    monto: string;
    descripcion: string;
    categoria: string;
}

function ModalNuevoMovimiento({
    visible,
    onClose,
    onRegistrar,
}: {
    visible: boolean;
    onClose: () => void;
    onRegistrar: () => void;
}) {
    const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.INGRESO);
    const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);
    const [fecha, setFecha] = useState(new Date());

    const opcionesCategoria =
        tipo === TipoMovimiento.INGRESO
            ? Object.entries(CATEGORIA_INGRESO_LABELS)
            : Object.entries(CATEGORIA_EGRESO_LABELS);

    const quickDates = useMemo(() => {
        const hoy = new Date();
        return Array.from({ length: 4 }).map((_, i) => {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() - i);
            return d;
        });
    }, []);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[90%]">
                    <ModalHeader title="Nuevo movimiento" onClose={onClose} />
                    <ScrollView className="px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
                        <SegmentedTabs
                            value={tipo}
                            onChange={setTipo}
                            options={[
                                { value: TipoMovimiento.INGRESO, label: "Ingreso" },
                                { value: TipoMovimiento.EGRESO, label: "Egreso" },
                            ]}
                        />

                        <Formik<NuevoMovimientoForm>
                            initialValues={{ monto: "", descripcion: "", categoria: "" }}
                            validationSchema={Yup.object({
                                monto: Yup.string()
                                    .required("El monto es obligatorio")
                                    .test("valido", "Debe ser mayor que 0", (v) => {
                                        if (!v) return false;
                                        const n = Number(v.replace(",", "."));
                                        return !isNaN(n) && n > 0;
                                    }),
                                descripcion: Yup.string()
                                    .trim()
                                    .required("La descripción es obligatoria")
                                    .min(3, "Al menos 3 caracteres")
                                    .max(255, "Máximo 255 caracteres"),
                                categoria: Yup.string().required("Selecciona una categoría"),
                            })}
                            onSubmit={() => onRegistrar()}
                            enableReinitialize
                        >
                            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit }) => (
                                <View className="mt-4">
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Monto</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.monto && errors.monto ? "border-[#B3261E]" : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="0.00"
                                        placeholderTextColor="#79747E"
                                        keyboardType="decimal-pad"
                                        value={values.monto}
                                        onChangeText={handleChange("monto")}
                                        onBlur={handleBlur("monto")}
                                    />
                                    {touched.monto && errors.monto ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.monto}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Descripción</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.descripcion && errors.descripcion
                                                ? "border-[#B3261E]"
                                                : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="Ej. Venta mostrador"
                                        placeholderTextColor="#79747E"
                                        value={values.descripcion}
                                        onChangeText={handleChange("descripcion")}
                                        onBlur={handleBlur("descripcion")}
                                    />
                                    {touched.descripcion && errors.descripcion ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.descripcion}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Categoría</Text>
                                    <Pressable
                                        onPress={() => setCategoriaModalVisible(true)}
                                        className={`border rounded-xl px-4 py-3 mb-1 flex-row items-center justify-between ${
                                            touched.categoria && errors.categoria
                                                ? "border-[#B3261E]"
                                                : "border-[#E7E0EC]"
                                        }`}
                                    >
                                        <Text
                                            className={`text-base ${
                                                values.categoria ? "text-[#1C1B1F]" : "text-[#79747E]"
                                            }`}
                                        >
                                            {values.categoria
                                                ? opcionesCategoria.find(([v]) => v === values.categoria)?.[1]
                                                : "Seleccionar"}
                                        </Text>
                                        <Ionicons name="chevron-down" size={16} color="#79747E" />
                                    </Pressable>
                                    {touched.categoria && errors.categoria ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.categoria}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <Modal
                                        visible={categoriaModalVisible}
                                        transparent
                                        animationType="fade"
                                        onRequestClose={() => setCategoriaModalVisible(false)}
                                    >
                                        <Pressable
                                            className="flex-1 bg-black/40 justify-end"
                                            onPress={() => setCategoriaModalVisible(false)}
                                        >
                                            <View className="bg-white rounded-t-2xl p-4">
                                                <Text className="text-base font-semibold text-[#1C1B1F] mb-2">
                                                    Selecciona una categoría
                                                </Text>
                                                {opcionesCategoria.map(([value, label]) => (
                                                    <Pressable
                                                        key={value}
                                                        className="py-3 border-b border-[#F1EEF4]"
                                                        onPress={() => {
                                                            setFieldValue("categoria", value);
                                                            setCategoriaModalVisible(false);
                                                        }}
                                                    >
                                                        <Text className="text-base text-[#1C1B1F]">{label}</Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </Pressable>
                                    </Modal>

                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Fecha</Text>
                                    <View className="flex-row gap-2 mb-4">
                                        {quickDates.map((d, i) => {
                                            const seleccionada = d.toDateString() === fecha.toDateString();
                                            return (
                                                <Pressable
                                                    key={i}
                                                    onPress={() => setFecha(d)}
                                                    className={`flex-1 rounded-xl py-2 items-center border ${
                                                        seleccionada
                                                            ? "bg-[#1857B6] border-[#1857B6]"
                                                            : "bg-white border-[#E7E0EC]"
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-xs font-semibold ${
                                                            seleccionada ? "text-white" : "text-[#1C1B1F]"
                                                        }`}
                                                    >
                                                        {i === 0 ? "Hoy" : i === 1 ? "Ayer" : formatFecha(d)}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    <View className="flex-row gap-3">
                                        <Pressable
                                            onPress={onClose}
                                            className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            className="flex-1 bg-[#1857B6] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-semibold text-white">Registrar</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// --- Modal: corte de caja (con calculadora de billetes) ---

function ModalCorte({
    visible,
    onClose,
    saldoInicial,
    ventas,
    ingresos,
    gastos,
    egresos,
    saldoEsperado,
    onCerrarCaja,
}: {
    visible: boolean;
    onClose: () => void;
    saldoInicial: number;
    ventas: number;
    ingresos: number;
    gastos: number;
    egresos: number;
    saldoEsperado: number;
    onCerrarCaja: () => void;
}) {
    const [conteo, setConteo] = useState<Record<number, string>>({});
    const [confirmarConDiferencia, setConfirmarConDiferencia] = useState(false);

    const efectivoContado = DENOMINACIONES.reduce((acc, d) => {
        const cantidad = Number(conteo[d] ?? 0);
        return acc + d * (isNaN(cantidad) ? 0 : cantidad);
    }, 0);

    const diferencia = efectivoContado - saldoEsperado;
    const cuadra = Math.abs(diferencia) < 0.01;

    const actualizarCantidad = (denominacion: number, delta: number) => {
        setConteo((prev) => {
            const actual = Number(prev[denominacion] ?? 0);
            const nuevo = Math.max(0, actual + delta);
            return { ...prev, [denominacion]: String(nuevo) };
        });
    };

    const handleCerrar = () => {
        if (!cuadra && !confirmarConDiferencia) {
            setConfirmarConDiferencia(true);
            return;
        }
        onCerrarCaja();
        setConteo({});
        setConfirmarConDiferencia(false);
    };

    const handleClose = () => {
        setConteo({});
        setConfirmarConDiferencia(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[92%]">
                    <ModalHeader title="Corte de caja" onClose={handleClose} />
                    <ScrollView className="px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Resumen calculado por el sistema */}
                        <View className="bg-[#F1EEF4] rounded-2xl p-4 mb-4">
                            <ResumenLinea label="Saldo inicial" value={saldoInicial} />
                            <ResumenLinea label="Ventas" value={ventas} />
                            <ResumenLinea label="Ingresos" value={ingresos} />
                            <ResumenLinea label="Gastos" value={gastos} negativo />
                            <ResumenLinea label="Egresos" value={egresos} negativo />
                            <View className="h-px bg-[#E7E0EC] my-2" />
                            <ResumenLinea label="Saldo esperado" value={saldoEsperado} destacado />
                        </View>

                        {/* Calculadora de billetes y monedas */}
                        <Text className="text-sm font-semibold text-[#1C1B1F] mb-2">Contar efectivo</Text>
                        <View className="gap-2">
                            {DENOMINACIONES.map((denominacion) => {
                                const cantidad = Number(conteo[denominacion] ?? 0);
                                return (
                                    <View
                                        key={denominacion}
                                        className="flex-row items-center justify-between bg-white border border-[#E7E0EC] rounded-xl px-3 py-2"
                                    >
                                        <Text className="text-sm text-[#1C1B1F] w-16">
                                            {formatMoney(denominacion)}
                                        </Text>
                                        <View className="flex-row items-center gap-3">
                                            <Pressable
                                                onPress={() => actualizarCantidad(denominacion, -1)}
                                                className="w-8 h-8 rounded-full bg-[#F1EEF4] items-center justify-center"
                                            >
                                                <Ionicons name="remove" size={16} color="#1C1B1F" />
                                            </Pressable>
                                            <TextInput
                                                className="w-12 text-center text-sm text-[#1C1B1F] border border-[#E7E0EC] rounded-lg py-1"
                                                keyboardType="number-pad"
                                                value={conteo[denominacion] ?? "0"}
                                                onChangeText={(v) =>
                                                    setConteo((prev) => ({
                                                        ...prev,
                                                        [denominacion]: v.replace(/[^0-9]/g, ""),
                                                    }))
                                                }
                                            />
                                            <Pressable
                                                onPress={() => actualizarCantidad(denominacion, 1)}
                                                className="w-8 h-8 rounded-full bg-[#F1EEF4] items-center justify-center"
                                            >
                                                <Ionicons name="add" size={16} color="#1C1B1F" />
                                            </Pressable>
                                        </View>
                                        <Text className="text-sm font-semibold text-[#1C1B1F] w-20 text-right">
                                            {formatMoney(denominacion * cantidad)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        <View className="flex-row items-center justify-between mt-4 px-1">
                            <Text className="text-sm font-medium text-[#79747E]">EFECTIVO CONTADO</Text>
                            <Text className="text-xl font-bold text-[#1C1B1F]">{formatMoney(efectivoContado)}</Text>
                        </View>

                        {/* Verificación */}
                        <View
                            className={`rounded-2xl p-4 mt-4 border ${
                                cuadra ? "bg-[#E4F5E9] border-[#1C7C3F]" : "bg-[#FDECEA] border-[#B3261E]"
                            }`}
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons
                                    name={cuadra ? "checkmark-circle" : "warning"}
                                    size={18}
                                    color={cuadra ? "#1C7C3F" : "#B3261E"}
                                />
                                <Text
                                    className={`text-sm font-semibold ${
                                        cuadra ? "text-[#1C7C3F]" : "text-[#B3261E]"
                                    }`}
                                >
                                    {cuadra ? "Caja cuadrada" : "Diferencia en caja"}
                                </Text>
                            </View>
                            <ResumenLinea label="Esperado" value={saldoEsperado} />
                            <ResumenLinea label="Contado" value={efectivoContado} />
                            <ResumenLinea
                                label="Diferencia"
                                value={diferencia}
                                negativo={diferencia < 0}
                                destacado
                            />
                        </View>

                        {!cuadra && confirmarConDiferencia && (
                            <View className="bg-[#FDECEA] border border-[#B3261E] rounded-2xl p-4 mt-3">
                                <Text className="text-sm text-[#B3261E] mb-3">
                                    Existe una diferencia de {formatMoney(diferencia)}. ¿Deseas cerrar la caja de
                                    todas formas?
                                </Text>
                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={() => setConfirmarConDiferencia(false)}
                                        className="flex-1 border border-[#B3261E] rounded-xl py-2.5 items-center"
                                    >
                                        <Text className="text-sm font-medium text-[#B3261E]">Volver al conteo</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleCerrar}
                                        className="flex-1 bg-[#B3261E] rounded-xl py-2.5 items-center"
                                    >
                                        <Text className="text-sm font-semibold text-white">Cerrar caja</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {!confirmarConDiferencia && (
                            <View className="flex-row gap-3 mt-5">
                                <Pressable
                                    onPress={handleClose}
                                    className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                >
                                    <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleCerrar}
                                    className={`flex-1 rounded-xl py-3 items-center ${
                                        cuadra ? "bg-[#1857B6]" : "bg-[#B3261E]"
                                    }`}
                                >
                                    <Text className="text-sm font-semibold text-white">Cerrar caja</Text>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function ResumenLinea({
    label,
    value,
    negativo = false,
    destacado = false,
}: {
    label: string;
    value: number;
    negativo?: boolean;
    destacado?: boolean;
}) {
    return (
        <View className="flex-row items-center justify-between py-0.5">
            <Text className={`text-sm ${destacado ? "font-semibold text-[#1C1B1F]" : "text-[#79747E]"}`}>
                {label}
            </Text>
            <Text
                className={`text-sm ${destacado ? "font-bold" : "font-medium"} ${
                    negativo ? "text-[#B3261E]" : "text-[#1C1B1F]"
                }`}
            >
                {negativo && value > 0 ? "-" : ""}
                {formatMoney(Math.abs(value))}
            </Text>
        </View>
    );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
            <Text className="text-base font-semibold text-[#1C1B1F]">{title}</Text>
            <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
            >
                <Ionicons name="close" size={20} color="#1C1B1F" />
            </Pressable>
        </View>
    );
}
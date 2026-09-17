import { CajaDto } from "@/features/caja/domain/Caja.types";
import { EstadoCaja } from "@/features/caja/enum/Caja.Enums";
import useCaja from "@/features/caja/presentation/hook/useCaja";
import { CategoriaMovimiento } from "@/features/movimiento/domain/enum/CategoriaMovimiento";
import { TipoMovimiento } from "@/features/movimiento/domain/enum/TipoMovimiento";
import { MovimientoDto } from "@/features/movimiento/domain/types/Movimiento.types";
import { useMovimientos } from "@/features/movimiento/presentation/hook/useMovimientos";
import { buildPieData, formatMoney } from "@/helpers/FormatHelpers";
import { formatFecha, formatHora } from "@/helpers/TimeHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSucursal } from "../hook/useSucursal";
import ModalCrearCaja from "@/features/caja/presentation/components/modal/ModalCrearCaja";
import ModalAbrirCaja from "@/features/caja/presentation/components/modal/ModalAbrirCaja";
import PieCard from "@/components/graficas/PieCard";
import { AMARILLO, AZUL } from "@/types/colors";
import { router } from "expo-router";
import { rutaCrearGasto, rutaCrearIngreso } from "@/helpers/RutaHelpers";
import ModalCorte from "@/features/caja/presentation/components/modal/ModalCorte";

const CATEGORIA_INGRESO_LABELS: Partial<Record<CategoriaMovimiento, string>> = {
    [CategoriaMovimiento.VENTA]: "Venta",
    [CategoriaMovimiento.INGRESO]: "Abono de cliente",
};

const CATEGORIA_EGRESO_LABELS: Partial<Record<CategoriaMovimiento, string>> = {
    [CategoriaMovimiento.INSUMOS]: "Insumos",
    [CategoriaMovimiento.NOMINA]: "Nómina",
    [CategoriaMovimiento.SERVICIOS]: "Servicios",
    [CategoriaMovimiento.RENTA]: "Renta",
    [CategoriaMovimiento.OTROS]: "Otro gasto",
};


// =====================================================================
// Datos mock — TODO: reemplazar por selectors de Redux + query use cases
// =====================================================================

const HISTORIAL_CORTES_MOCK = [
    { id: 1, fecha: "13 Sep 2026", saldoFinal: 8800, cerradoAt: "22:15" },
    { id: 2, fecha: "12 Sep 2026", saldoFinal: 7450, cerradoAt: "22:03" },
    { id: 3, fecha: "11 Sep 2026", saldoFinal: 9120, cerradoAt: "21:58" },
]; // TODO: sustituir por query use case "obtenerHistorialCortes" cuando exista


const PALETA_INGRESOS = ["#1857B6", "#3568C4", "#5580D1", "#7A9BDE", "#A9C1EA"];
const PALETA_GASTOS = ["#8A6D00", "#B98600", "#D9A400", "#F0BE33", "#FFD666"];
// =====================================================================
// Helpers
// =====================================================================
function agruparPorCategoria(
    movimientos: MovimientoDto[]
): { categoria: string; total: number; porcentaje: number; color: string }[] {
    const total = movimientos.reduce((acc, m) => acc + m.monto, 0);
    const mapa = new Map<string, number>();

    movimientos.forEach((m) => {
        const label =
            m.tipo === TipoMovimiento.INGRESO
                ? CATEGORIA_INGRESO_LABELS[m.categoria as CategoriaMovimiento]
                : CATEGORIA_EGRESO_LABELS[m.categoria as CategoriaMovimiento];
        mapa.set(label!, (mapa.get(label!) ?? 0) + m.monto);
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
// Componente principal
// =====================================================================

export default function CajaScreen() {

    const {
        cajas,
        cajaSeleccionadaId,
        findCajasBySucursalId,
        handleSeleccionarCaja,
        findCorteCajaActualByCajaId,
        crearCaja,
        cerrarCaja,
        abrirCaja,
        loading,
        error
    } = useCaja();
    const { sucursalSeleccionadaId } = useSucursal();
    const { movimientos } = useMovimientos();

    useEffect(() => {
        findCajasBySucursalId(sucursalSeleccionadaId || 0);
    }, [findCajasBySucursalId, sucursalSeleccionadaId]);

    useEffect(() => {
        if (cajaSeleccionadaId) {
            findCorteCajaActualByCajaId(cajaSeleccionadaId);
        }
    }, [cajaSeleccionadaId, findCorteCajaActualByCajaId]);

    const caja = useMemo(
        () => cajas.find((c) => c.id === cajaSeleccionadaId)!,
        [cajas, cajaSeleccionadaId]
    );

    const resumen = useMemo(() => {
        if (!movimientos || movimientos.length === 0) {
            return { ingresos: 0, ventas: 0, egresos: 0, gastos: 0 };
        }

        const ingresos = movimientos
            .filter((m) => m.tipo === TipoMovimiento.INGRESO && m.categoria !== CategoriaMovimiento.VENTA)
            .reduce((acc, m) => acc + m.monto, 0);
        const ventas = movimientos
            .filter((m) => m.categoria === CategoriaMovimiento.VENTA)
            .reduce((acc, m) => acc + m.monto, 0);
        const egresos = movimientos
            .filter((m) => m.tipo === TipoMovimiento.EGRESO && m.categoria !== CategoriaMovimiento.INSUMOS)
            .reduce((acc, m) => acc + m.monto, 0);
        const gastos = movimientos
            .filter((m) => m.categoria === CategoriaMovimiento.INSUMOS)
            .reduce((acc, m) => acc + m.monto, 0);

        return { ingresos, ventas, egresos, gastos };
    }, [movimientos]);

    // --- Estado de UI (modales, tabs) ---
    const [selectorCajaVisible, setSelectorCajaVisible] = useState(false);
    const [crearCajaVisible, setCrearCajaVisible] = useState(false);
    const [abrirCajaVisible, setAbrirCajaVisible] = useState(false);
    const [corteVisible, setCorteVisible] = useState(false);

    const [tabMovimientos, setTabMovimientos] = useState<TipoMovimiento>(TipoMovimiento.INGRESO);
    const [tabGrafica, setTabGrafica] = useState<TipoMovimiento>(TipoMovimiento.INGRESO);

    const gastos = useMemo(
        () => movimientos.filter((m) => m.tipo === TipoMovimiento.EGRESO),
        [movimientos]
    );
    const ingresos = useMemo(
        () => movimientos.filter((m) => m.tipo === TipoMovimiento.INGRESO),
        [movimientos]
    );

    const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);

    const dataGastos = useMemo(() => buildPieData(gastos, PALETA_GASTOS), [gastos]);
    const dataIngresos = useMemo(() => buildPieData(ingresos, PALETA_INGRESOS), [ingresos]);

    const movimientosFiltrados = movimientos.filter((m) => m.tipo === tabMovimientos);
    const dataGrafica = agruparPorCategoria(movimientos.filter((m) => m.tipo === tabGrafica));

    // --- Acciones (placeholders — TODO: conectar use cases reales) ---

    const handleAbrirCaja = () => {
        abrirCaja();
        setAbrirCajaVisible(false);
    };

    const handleCrearCaja = (nombre: string) => {
        const nueva: CajaDto = {
            id: Date.now(),
            nombre,
            saldo: 0,
            saldoInicial: 0,
            estado: EstadoCaja.CERRADA,
        };

        crearCaja(nueva);

        setCrearCajaVisible(false);
    };

    const handleCerrarCaja = () => {
        cerrarCaja();
        setCorteVisible(false);
    };

    const saldoEsperado =
        (Number(caja?.saldoInicial) || 0) +
        (Number(resumen?.ventas) || 0) +
        (Number(resumen?.ingresos) || 0) -
        (Number(resumen?.egresos) || 0) -
        (Number(resumen?.gastos) || 0);

    return (
        <View className="flex-1 bg-[#FAF9FC]">

            {!caja ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="cash-outline" size={32} color="#79747E" />
                    <Text className="text-sm text-[#79747E] mt-3 text-center">
                        Aún no hay cajas registradas.
                    </Text>
                    <Pressable
                        onPress={() => setCrearCajaVisible(true)}
                        className="flex-row items-center gap-2 bg-[#1857B6] rounded-full px-5 py-3 mt-4 active:opacity-90"
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white">
                            Crear caja
                        </Text>
                    </Pressable>
                </View>
            ) : (
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
                        className={`rounded-2xl p-5 border ${caja.estado === EstadoCaja.ABIERTA
                            ? "bg-[#E7EFFC] border-[#1857B6]"
                            : "bg-white border-[#E7E0EC]"
                            }`}
                    >
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold text-[#1C1B1F]">{caja.nombre}</Text>
                            <View
                                className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${caja.estado === EstadoCaja.ABIERTA ? "bg-[#1857B6]" : "bg-[#79747E]"
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
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => router.push(rutaCrearIngreso("caja") as any)}
                                    className="flex-1 h-12 rounded-full flex-row items-center justify-center gap-1.5"
                                    style={{ backgroundColor: AZUL }}
                                >
                                    <Ionicons name="add" size={18} color="#FFFFFF" />
                                    <Text className="text-sm font-medium text-white">Ingreso</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.push(rutaCrearGasto("caja") as any)}
                                    className="flex-1 h-12 rounded-full flex-row items-center justify-center gap-1.5 border-2"
                                    style={{ borderColor: AMARILLO }}
                                >
                                    <Ionicons name="add" size={18} color={AMARILLO} />
                                    <Text className="text-sm font-medium" style={{ color: AMARILLO }}>
                                        Gasto
                                    </Text>
                                </Pressable>
                            </View>

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
                                    <View className="mt-4">
                                        <PieCard
                                            titulo={tabGrafica === TipoMovimiento.EGRESO ? "Gastos por categoría" : "Ingresos por categoría"}
                                            total={tabGrafica === TipoMovimiento.EGRESO ? totalGastos : totalIngresos}
                                            data={tabGrafica === TipoMovimiento.EGRESO ? dataGastos : dataIngresos}
                                            colorTotal={tabGrafica === TipoMovimiento.EGRESO ? AMARILLO : AZUL}
                                            vacio={tabGrafica === TipoMovimiento.EGRESO ? "Aún no registras gastos hoy." : "Aún no registras ingresos hoy."}
                                        />
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
                                                            ? CATEGORIA_INGRESO_LABELS[m.categoria as CategoriaMovimiento]
                                                            : CATEGORIA_EGRESO_LABELS[m.categoria as CategoriaMovimiento]}
                                                    </Text>
                                                </View>
                                                <Text
                                                    className={`text-sm font-semibold ${m.tipo === TipoMovimiento.INGRESO
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
            )}

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
                                        handleSeleccionarCaja(item.id);
                                        setSelectorCajaVisible(false);
                                    }}
                                    className={`flex-row items-center justify-between py-3 px-2 rounded-xl ${item.id === cajaSeleccionadaId ? "bg-[#F1EEF4]" : ""
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
                onCrear={handleCrearCaja}
            />

            {/* Modal: abrir caja */}
            <ModalAbrirCaja
                visible={abrirCajaVisible}
                onClose={() => setAbrirCajaVisible(false)}
                onAbrir={handleAbrirCaja}
                saldoInicial={caja?.saldoInicial || 0}
            />

            {/* Modal: corte de caja */}
            {caja && (
                <ModalCorte
                    visible={corteVisible}
                    onClose={() => setCorteVisible(false)}
                    saldoInicial={caja.saldoInicial}
                    ventas={resumen.ventas}
                    ingresos={resumen.ingresos}
                    gastos={resumen.gastos}
                    egresos={resumen.egresos}
                    saldoEsperado={saldoEsperado}
                    onCerrarCaja={handleCerrarCaja}
                />
            )}
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

import MaterialSelector from "@/components/MaterialSelector";
import { useInventario } from "@/features/inventario/presentation/hook/useInventario";
import type { RecetaDto } from "@/features/receta/domain/types/receta.types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

type VistaInventario = "existencias" | "movimientos" | "elaborar";
type OperacionInventario = "entrada" | "salida" | "merma" | "consumo-personal";

const OPERACIONES: { id: OperacionInventario; titulo: string }[] = [
    { id: "entrada", titulo: "Entrada" },
    { id: "salida", titulo: "Salida" },
    { id: "merma", titulo: "Merma" },
    { id: "consumo-personal", titulo: "Consumo personal" },
];

const VISTAS: { id: VistaInventario; titulo: string }[] = [
    { id: "existencias", titulo: "Existencias" },
    { id: "movimientos", titulo: "Movimientos" },
    { id: "elaborar", titulo: "Elaborar material" },
];

const TAMANO_EXISTENCIAS_ELABORACION = 1000;

const ESTADO_LABELS = {
    STOCK_COMPLETO: "Disponible",
    STOCK_BAJO: "Stock bajo",
    SIN_STOCK: "Sin stock",
} as const;

const InventarioScreen = () => {
    const { sucursalActual } = useSucursal();
    const sucursalId = sucursalActual?.id;
    const {
        existencias,
        movimientos,
        pageInfo,
        movimientosPageInfo,
        materiales,
        loading,
        saving,
        error,
        cargarInventario,
        cargarMovimientos,
        cargarCatalogos,
        registrarMovimiento,
        recetasMaterial,
        producirMaterial,
    } = useInventario();
    const [vista, setVista] = useState<VistaInventario>("existencias");
    const [operacion, setOperacion] = useState<OperacionInventario>("entrada");
    const [paginaExistencias, setPaginaExistencias] = useState(0);
    const [paginaMovimientos, setPaginaMovimientos] = useState(0);
    const [materialId, setMaterialId] = useState<number | null>(null);
    const [cantidad, setCantidad] = useState("");
    const [selectorMaterialVisible, setSelectorMaterialVisible] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<RecetaDto | null>(null);
    const [cantidadProduccion, setCantidadProduccion] = useState("");
    const [errorProduccion, setErrorProduccion] = useState<string | null>(null);

    useEffect(() => {
        cargarCatalogos();
    }, [cargarCatalogos]);

    useEffect(() => {
        if (!sucursalId) return;
        if (vista === "elaborar") {
            cargarInventario(sucursalId, 0, TAMANO_EXISTENCIAS_ELABORACION);
            return;
        }
        cargarInventario(sucursalId, paginaExistencias);
    }, [cargarInventario, paginaExistencias, sucursalId, vista]);

    useEffect(() => {
        if (sucursalId) cargarMovimientos(sucursalId, paginaMovimientos);
    }, [cargarMovimientos, paginaMovimientos, sucursalId]);

    const materialesOrdenados = [...materiales].sort((a, b) => a.nombre.localeCompare(b.nombre));
    const materialSeleccionado = materialesOrdenados.find((material) => material.id === materialId) ?? null;
    const cantidadNumerica = Number(cantidad.replace(",", "."));
    const cantidadProduccionNumerica = Number(cantidadProduccion.replace(",", "."));
    const existenciasPorMaterial = useMemo(
        () => new Map(existencias.map((existencia) => [existencia.materialId, existencia])),
        [existencias]
    );
    const recetasOrdenadas = useMemo(
        () => recetasMaterial
            .filter((receta) => receta.tipoResultado === "MATERIAL")
            .filter((receta) => receta.recetaDetalles.length > 0 && receta.rendimiento > 0)
            .filter((receta) => receta.recetaDetalles.every((detalle) => {
                const existencia = existenciasPorMaterial.get(detalle.materialId);
                return detalle.materialId !== receta.materialResultadoId
                    && detalle.cantidad > 0
                    && existencia !== undefined
                    && existencia.cantidadActual > 0;
            }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre)),
        [existenciasPorMaterial, recetasMaterial]
    );
    const maximoElaborable = (receta: RecetaDto) => receta.recetaDetalles.reduce(
        (maximo, detalle) => {
            const existencia = existenciasPorMaterial.get(detalle.materialId);
            if (!existencia || detalle.cantidad <= 0) return 0;
            return Math.min(maximo, (existencia.cantidadActual / detalle.cantidad) * receta.rendimiento);
        },
        Number.POSITIVE_INFINITY
    );
    const seleccionInvalida = !materialId;

    const enviarOperacion = async () => {
        if (!sucursalId || !materialId || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) return;
        try {
            await registrarMovimiento(operacion, {
                materialId,
                sucursalId,
                cantidad: cantidadNumerica,
            });
            setCantidad("");
            setPaginaExistencias(0);
            setPaginaMovimientos(0);
        } catch {
            // El error de la operación queda expuesto por el slice.
        }
    };

    const elaborarReceta = async () => {
        if (!sucursalId || recetaSeleccionada?.id == null) return;
        const maximo = maximoElaborable(recetaSeleccionada);
        if (!Number.isFinite(cantidadProduccionNumerica) || cantidadProduccionNumerica <= 0 || cantidadProduccionNumerica > maximo) {
            setErrorProduccion(`La cantidad debe ser mayor que 0 y no superar ${maximo.toLocaleString("es-MX", { maximumFractionDigits: 2 })}.`);
            return;
        }

        setErrorProduccion(null);
        try {
            await producirMaterial({
                recetaId: recetaSeleccionada.id,
                sucursalId,
                cantidad: cantidadProduccionNumerica,
            });
            cargarInventario(sucursalId, 0, TAMANO_EXISTENCIAS_ELABORACION);
            setRecetaSeleccionada(null);
            setCantidadProduccion("");
            setPaginaExistencias(0);
            setPaginaMovimientos(0);
        } catch (cause: unknown) {
            setErrorProduccion(typeof cause === "string" ? cause : "No se pudo elaborar el material.");
        }
    };

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            <View className="border-b border-[#E7E0EC] bg-white px-4 pb-3 pt-5">
                <Text className="text-xl font-bold text-[#1C1B1F]">Inventario</Text>
                <Text className="mt-1 text-xs text-[#79747E]">Sucursal · {sucursalActual?.nombre ?? "Sin seleccionar"}</Text>
                <View className="mt-4 flex-row border-b border-[#E7E0EC]">
                    {VISTAS.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => setVista(item.id)}
                            className={`mr-6 border-b-2 pb-2 ${vista === item.id ? "border-[#1857B6]" : "border-transparent"}`}
                        >
                            <Text className={`text-sm font-semibold ${vista === item.id ? "text-[#1857B6]" : "text-[#79747E]"}`}>
                                {item.titulo}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {error && <Text className="px-4 pt-3 text-sm text-[#B3261E]">{error}</Text>}

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                {vista === "existencias" ? (
                    <View>
                        <View className="mb-2 flex-row border-b border-[#D8D4DC] px-3 py-2">
                            <Text className="flex-1 text-xs font-semibold uppercase text-[#79747E]">Material</Text>
                            <Text className="w-24 text-right text-xs font-semibold uppercase text-[#79747E]">Existencia</Text>
                            <Text className="w-24 text-right text-xs font-semibold uppercase text-[#79747E]">Estado</Text>
                        </View>
                        {loading && existencias.length === 0 ? (
                            <ActivityIndicator className="py-12" color="#1857B6" />
                        ) : existencias.length === 0 ? (
                            <View className="items-center py-12">
                                <Ionicons name="cube-outline" size={30} color="#79747E" />
                                <Text className="mt-3 text-sm text-[#79747E]">No hay existencias registradas.</Text>
                            </View>
                        ) : existencias.map((item) => (
                            <View key={item.id} className="flex-row items-center border-b border-[#E7E0EC] px-3 py-3">
                                <View className="flex-1 pr-2">
                                    <Text className="text-sm font-semibold text-[#1C1B1F]">{item.material.nombre}</Text>
                                    <Text className="mt-0.5 text-xs text-[#79747E]">{item.unidadMedida}</Text>
                                </View>
                                <Text className="w-24 text-right text-sm font-semibold text-[#1C1B1F]">
                                    {item.cantidadActual.toLocaleString("es-MX")}
                                </Text>
                                <Text className={`w-24 text-right text-xs font-medium ${item.estado === "STOCK_BAJO" || item.estado === "SIN_STOCK" ? "text-[#B3261E]" : "text-[#1C7C3F]"}`}>
                                    {ESTADO_LABELS[item.estado]}
                                </Text>
                            </View>
                        ))}
                        {pageInfo.totalPages > 1 && (
                            <View className="mt-3 flex-row items-center justify-between px-2">
                                <Pressable
                                    onPress={() => setPaginaExistencias((page) => Math.max(0, page - 1))}
                                    disabled={paginaExistencias === 0 || loading}
                                    className="flex-row items-center gap-1 py-2 disabled:opacity-40"
                                >
                                    <Ionicons name="chevron-back" size={16} color="#1857B6" />
                                    <Text className="text-sm font-medium text-[#1857B6]">Anterior</Text>
                                </Pressable>
                                <Text className="text-xs text-[#79747E]">{paginaExistencias + 1} / {pageInfo.totalPages}</Text>
                                <Pressable
                                    onPress={() => setPaginaExistencias((page) => Math.min(pageInfo.totalPages - 1, page + 1))}
                                    disabled={paginaExistencias >= pageInfo.totalPages - 1 || loading}
                                    className="flex-row items-center gap-1 py-2 disabled:opacity-40"
                                >
                                    <Text className="text-sm font-medium text-[#1857B6]">Siguiente</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#1857B6" />
                                </Pressable>
                            </View>
                        )}
                    </View>
                ) : vista === "movimientos" ? (
                    <View>
                        <View className="mb-2 flex-row border-b border-[#D8D4DC] px-3 py-2">
                            <Text className="flex-1 text-xs font-semibold uppercase text-[#79747E]">Material / usuario</Text>
                            <Text className="w-24 text-right text-xs font-semibold uppercase text-[#79747E]">Cantidad</Text>
                            <Text className="w-28 text-right text-xs font-semibold uppercase text-[#79747E]">Tipo · fecha</Text>
                        </View>
                        {loading && movimientos.length === 0 ? (
                            <ActivityIndicator className="py-12" color="#1857B6" />
                        ) : movimientos.length === 0 ? (
                            <Text className="py-12 text-center text-sm text-[#79747E]">Aún no hay movimientos.</Text>
                        ) : movimientos.map((item) => (
                            <View key={item.id} className="flex-row items-center border-b border-[#E7E0EC] px-3 py-3">
                                <View className="flex-1 pr-2">
                                    <Text className="text-sm font-semibold text-[#1C1B1F]">{item.materialNombre}</Text>
                                    <Text className="mt-0.5 text-xs text-[#79747E]">{item.usuarioNombre}</Text>
                                </View>
                                <Text className="w-24 text-right text-sm text-[#1C1B1F]">{item.cantidad}</Text>
                                <View className="w-28 items-end">
                                    <Text className="text-xs font-semibold text-[#1C1B1F]">{item.conceptoMovimiento.replaceAll("_", " ")}</Text>
                                    <Text className="mt-0.5 text-[10px] text-[#79747E]">
                                        {new Date(item.fecha).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        {movimientosPageInfo.totalPages > 1 && (
                            <View className="mt-3 flex-row items-center justify-between px-2">
                                <Pressable
                                    onPress={() => setPaginaMovimientos((page) => Math.max(0, page - 1))}
                                    disabled={paginaMovimientos === 0 || loading}
                                    className="flex-row items-center gap-1 py-2 disabled:opacity-40"
                                >
                                    <Ionicons name="chevron-back" size={16} color="#1857B6" />
                                    <Text className="text-sm font-medium text-[#1857B6]">Anterior</Text>
                                </Pressable>
                                <Text className="text-xs text-[#79747E]">{paginaMovimientos + 1} / {movimientosPageInfo.totalPages}</Text>
                                <Pressable
                                    onPress={() => setPaginaMovimientos((page) => Math.min(movimientosPageInfo.totalPages - 1, page + 1))}
                                    disabled={paginaMovimientos >= movimientosPageInfo.totalPages - 1 || loading}
                                    className="flex-row items-center gap-1 py-2 disabled:opacity-40"
                                >
                                    <Text className="text-sm font-medium text-[#1857B6]">Siguiente</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#1857B6" />
                                </Pressable>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        {!sucursalId ? (
                            <Text className="py-12 text-center text-sm text-[#79747E]">Selecciona una sucursal para consultar recetas elaborables.</Text>
                        ) : loading && existencias.length === 0 ? (
                            <ActivityIndicator className="py-12" color="#1857B6" />
                        ) : recetasOrdenadas.length === 0 ? (
                            <View className="items-center py-12">
                                <Ionicons name="construct-outline" size={30} color="#79747E" />
                                <Text className="mt-3 text-sm text-[#79747E]">No hay recetas de materiales con insumos disponibles en esta sucursal.</Text>
                            </View>
                        ) : recetasOrdenadas.map((receta) => (
                            <View key={receta.id} className="mb-3 flex-row items-center justify-between border border-[#E7E0EC] bg-white px-4 py-3">
                                <View className="flex-1 pr-3">
                                    <Text className="text-sm font-semibold text-[#1C1B1F]">{receta.nombre}</Text>
                                    <Text className="mt-1 text-xs text-[#79747E]">
                                        {receta.materialResultadoNombre ?? "Material elaborado"} · Rendimiento {receta.rendimiento}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => {
                                        setRecetaSeleccionada(receta);
                                        setCantidadProduccion(Math.min(receta.rendimiento, maximoElaborable(receta)).toString());
                                        setErrorProduccion(null);
                                    }}
                                    className="flex-row items-center gap-1.5 bg-[#1857B6] px-3 py-2"
                                >
                                    <Ionicons name="construct-outline" size={16} color="#FFFFFF" />
                                    <Text className="text-xs font-semibold text-white">Elaborar</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                {vista === "existencias" && <View className="mt-7 border-t border-[#D8D4DC] pt-5">
                    <Text className="text-base font-bold text-[#1C1B1F]">Registrar operación</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                        {OPERACIONES.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => {
                                    setOperacion(item.id);
                                    setMaterialId(null);
                                }}
                                className={`mr-2 border px-3 py-2 ${operacion === item.id ? "border-[#1857B6] bg-[#EAF1FC]" : "border-[#D8D4DC] bg-white"}`}
                            >
                                <Text className={`text-xs font-semibold ${operacion === item.id ? "text-[#1857B6]" : "text-[#55515A]"}`}>{item.titulo}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    <Text className="mb-2 mt-4 text-sm font-semibold text-[#1C1B1F]">Material</Text>
                    <Pressable
                        onPress={() => setSelectorMaterialVisible(true)}
                        className="flex-row items-center justify-between border border-[#D8D4DC] bg-white px-3 py-3"
                    >
                        <Text className={`text-sm font-medium ${materialSeleccionado ? "text-[#1C1B1F]" : "text-[#79747E]"}`}>
                            {materialSeleccionado ? materialSeleccionado.nombre : "Buscar y seleccionar material"}
                        </Text>
                        <Ionicons name="search" size={18} color="#79747E" />
                    </Pressable>

                    <Text className="mb-2 mt-4 text-sm font-semibold text-[#1C1B1F]">Cantidad</Text>
                    <TextInput
                        className="border border-[#D8D4DC] bg-white px-3 py-3 text-base text-[#1C1B1F]"
                        placeholder="0.00"
                        placeholderTextColor="#79747E"
                        keyboardType="decimal-pad"
                        value={cantidad}
                        onChangeText={setCantidad}
                    />
                    <Pressable
                        onPress={enviarOperacion}
                        disabled={saving || seleccionInvalida || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0}
                        className={`mt-3 flex-row items-center justify-center gap-2 px-4 py-3 ${saving || seleccionInvalida || cantidadNumerica <= 0 ? "bg-[#9EB7DE]" : "bg-[#1857B6]"}`}
                    >
                        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                        <Text className="text-sm font-semibold text-white">{saving ? "Guardando..." : "Confirmar"}</Text>
                    </Pressable>
                </View>}
            </ScrollView>

            <MaterialSelector
                visible={selectorMaterialVisible}
                materiales={materialesOrdenados}
                onSelect={(material) => material.id != null && setMaterialId(material.id)}
                onClose={() => setSelectorMaterialVisible(false)}
            />

            <Modal
                visible={recetaSeleccionada !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setRecetaSeleccionada(null)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="rounded-t-2xl bg-white p-4">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-base font-semibold text-[#1C1B1F]">Elaborar material</Text>
                                <Text className="mt-1 text-xs text-[#79747E]">{recetaSeleccionada?.nombre}</Text>
                            </View>
                            <Pressable onPress={() => setRecetaSeleccionada(null)} accessibilityRole="button" accessibilityLabel="Cerrar">
                                <Ionicons name="close" size={22} color="#49454F" />
                            </Pressable>
                        </View>
                        <Text className="mb-2 text-sm font-medium text-[#1C1B1F]">Cantidad a elaborar</Text>
                        <TextInput
                            value={cantidadProduccion}
                            onChangeText={setCantidadProduccion}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            className="border border-[#E7E0EC] bg-white px-3 py-3 text-base text-[#1C1B1F]"
                        />
                        {recetaSeleccionada && (
                            <Text className="mt-2 text-xs text-[#79747E]">
                                Máximo disponible: {maximoElaborable(recetaSeleccionada).toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                            </Text>
                        )}
                        {errorProduccion && <Text className="mt-2 text-sm text-[#B3261E]">{errorProduccion}</Text>}
                        <Pressable
                            onPress={elaborarReceta}
                            disabled={saving || !Number.isFinite(cantidadProduccionNumerica) || cantidadProduccionNumerica <= 0}
                            className={`mt-4 flex-row items-center justify-center gap-2 px-4 py-3 ${saving || !Number.isFinite(cantidadProduccionNumerica) || cantidadProduccionNumerica <= 0 ? "bg-[#9EB7DE]" : "bg-[#1857B6]"}`}
                        >
                            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="construct-outline" size={18} color="#FFFFFF" />}
                            <Text className="text-sm font-semibold text-white">{saving ? "Elaborando..." : "Elaborar"}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default InventarioScreen;

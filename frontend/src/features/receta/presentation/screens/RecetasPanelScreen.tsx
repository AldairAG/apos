import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

/**
 * RecetasPanelScreen — Panel de administración de recetas.
 *
 * UI autocontenida con datos mock y estado local (búsqueda, paginación,
 * confirmación de eliminar). NO está conectado a Redux ni a los use cases
 * reales — cada punto de integración está marcado con // TODO.
 */

// =====================================================================
// Tipos y datos mock — TODO: reemplazar por el DTO real y por el query
// use case / selector de Redux que traiga las recetas reales.
// =====================================================================

enum TipoReceta {
    PRODUCCION = "PRODUCCION",
    FINAL = "FINAL",
}

interface RecetaDto {
    id: number;
    nombre: string;
    costo: number;
    porcentajeGanancia: number;
    tipo: TipoReceta;
}

const RECETAS_MOCK: RecetaDto[] = [
    { id: 1, nombre: "Café americano", costo: 8.5, porcentajeGanancia: 65, tipo: TipoReceta.FINAL },
    { id: 2, nombre: "Base de espresso", costo: 4.2, porcentajeGanancia: 40, tipo: TipoReceta.PRODUCCION },
    { id: 3, nombre: "Capuchino", costo: 12.0, porcentajeGanancia: 58, tipo: TipoReceta.FINAL },
    { id: 4, nombre: "Leche vaporizada", costo: 3.5, porcentajeGanancia: 20, tipo: TipoReceta.PRODUCCION },
    { id: 5, nombre: "Latte vainilla", costo: 14.0, porcentajeGanancia: 55, tipo: TipoReceta.FINAL },
    { id: 6, nombre: "Jarabe de vainilla casero", costo: 6.0, porcentajeGanancia: 30, tipo: TipoReceta.PRODUCCION },
    { id: 7, nombre: "Mocha", costo: 16.5, porcentajeGanancia: 52, tipo: TipoReceta.FINAL },
    { id: 8, nombre: "Ganache de chocolate", costo: 9.0, porcentajeGanancia: 35, tipo: TipoReceta.PRODUCCION },
    { id: 9, nombre: "Frappé de café", costo: 18.0, porcentajeGanancia: 60, tipo: TipoReceta.FINAL },
    { id: 10, nombre: "Base de frappé", costo: 7.5, porcentajeGanancia: 28, tipo: TipoReceta.PRODUCCION },
    { id: 11, nombre: "Té chai latte", costo: 15.0, porcentajeGanancia: 50, tipo: TipoReceta.FINAL },
    { id: 12, nombre: "Concentrado de chai", costo: 10.0, porcentajeGanancia: 32, tipo: TipoReceta.PRODUCCION },
    { id: 13, nombre: "Pan de plátano", costo: 20.0, porcentajeGanancia: 45, tipo: TipoReceta.FINAL },
    { id: 14, nombre: "Cheesecake individual", costo: 22.0, porcentajeGanancia: 48, tipo: TipoReceta.FINAL },
    { id: 15, nombre: "Crema batida casera", costo: 5.5, porcentajeGanancia: 25, tipo: TipoReceta.PRODUCCION },
];

const RECETAS_POR_PAGINA = 6;

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

export default function RecetasPanelScreen() {
    const router = useRouter();

    // TODO: reemplazar por selector de Redux / query use case de recetas
    const [recetas, setRecetas] = useState<RecetaDto[]>(RECETAS_MOCK);

    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);
    const [recetaAEliminar, setRecetaAEliminar] = useState<RecetaDto | null>(null);

    const recetasFiltradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return recetas;
        return recetas.filter((r) => r.nombre.toLowerCase().includes(q));
    }, [recetas, busqueda]);

    const totalPaginas = Math.max(1, Math.ceil(recetasFiltradas.length / RECETAS_POR_PAGINA));
    const paginaSegura = Math.min(pagina, totalPaginas);

    const recetasPagina = useMemo(() => {
        const inicio = (paginaSegura - 1) * RECETAS_POR_PAGINA;
        return recetasFiltradas.slice(inicio, inicio + RECETAS_POR_PAGINA);
    }, [recetasFiltradas, paginaSegura]);

    const handleBuscar = (texto: string) => {
        setBusqueda(texto);
        setPagina(1); // al buscar, siempre regresamos a la primera página
    };

    const handleEditar = (receta: RecetaDto) => {
        // TODO: ajustar a la ruta real de edición de recetas
        router.push(`/recetas/${receta.id}/editar` as any);
    };

    const handleNuevaReceta = () => {
        // TODO: ajustar a la ruta real de creación de recetas
        router.push(ROUTES.ADMIN.RECETAS.CREAR as any);
    };

    const confirmarEliminar = () => {
        if (!recetaAEliminar) return;
        // TODO: dispatch(eliminarRecetaThunk(recetaAEliminar.id)) y manejar error/loading
        setRecetas((prev) => prev.filter((r) => r.id !== recetaAEliminar.id));
        setRecetaAEliminar(null);
    };

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            {/* Header + buscador */}
            <View className="px-4 pt-6 pb-3 bg-white border-b border-[#E7E0EC]">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-[#1C1B1F]">Recetas</Text>
                    <Pressable
                        onPress={handleNuevaReceta}
                        className="flex-row items-center gap-1.5 bg-[#1857B6] rounded-full px-4 py-2.5 active:opacity-90"
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white">Nueva</Text>
                    </Pressable>
                </View>

                <View className="flex-row items-center bg-[#F1EEF4] rounded-xl px-3">
                    <Ionicons name="search" size={18} color="#79747E" />
                    <TextInput
                        className="flex-1 py-2.5 px-2 text-base text-[#1C1B1F]"
                        placeholder="Buscar receta por nombre..."
                        placeholderTextColor="#79747E"
                        value={busqueda}
                        onChangeText={handleBuscar}
                        returnKeyType="search"
                    />
                    {busqueda.length > 0 && (
                        <Pressable onPress={() => handleBuscar("")} hitSlop={8}>
                            <Ionicons name="close-circle" size={18} color="#79747E" />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Lista de recetas */}
            <FlatList
                data={recetasPagina}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-16">
                        <Ionicons name="restaurant-outline" size={32} color="#79747E" />
                        <Text className="text-sm text-[#79747E] mt-3 text-center">
                            {busqueda
                                ? `No se encontraron recetas para "${busqueda}".`
                                : "Aún no hay recetas registradas."}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                        <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1 pr-2">
                                <Text className="text-base font-semibold text-[#1C1B1F]" numberOfLines={1}>
                                    {item.nombre}
                                </Text>
                                <View
                                    className={`self-start mt-1.5 px-2 py-0.5 rounded-full ${
                                        item.tipo === TipoReceta.FINAL ? "bg-[#D8E2FF]" : "bg-[#FDEBD0]"
                                    }`}
                                >
                                    <Text
                                        className={`text-[10px] font-bold tracking-wide ${
                                            item.tipo === TipoReceta.FINAL ? "text-[#1857B6]" : "text-[#8A5A00]"
                                        }`}
                                    >
                                        {item.tipo === TipoReceta.FINAL ? "RECETA FINAL" : "DE PRODUCCIÓN"}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row gap-2">
                                <Pressable
                                    onPress={() => handleEditar(item)}
                                    className="w-9 h-9 rounded-full bg-[#F1EEF4] items-center justify-center active:opacity-70"
                                >
                                    <Ionicons name="pencil" size={16} color="#1857B6" />
                                </Pressable>
                                <Pressable
                                    onPress={() => setRecetaAEliminar(item)}
                                    className="w-9 h-9 rounded-full bg-[#FDECEA] items-center justify-center active:opacity-70"
                                >
                                    <Ionicons name="trash" size={16} color="#B3261E" />
                                </Pressable>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-6 mt-2">
                            <View>
                                <Text className="text-xs text-[#79747E]">Costo</Text>
                                <Text className="text-sm font-semibold text-[#1C1B1F]">
                                    {formatMoney(item.costo)}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-xs text-[#79747E]">Ganancia</Text>
                                <Text className="text-sm font-semibold text-[#1C7C3F]">
                                    {item.porcentajeGanancia}%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Paginación */}
            {recetasFiltradas.length > 0 && (
                <View className="flex-row items-center justify-between px-4 py-3 bg-white border-t border-[#E7E0EC]">
                    <Pressable
                        onPress={() => setPagina((p) => Math.max(1, p - 1))}
                        disabled={paginaSegura === 1}
                        className={`flex-row items-center gap-1 px-3 py-2 rounded-lg ${
                            paginaSegura === 1 ? "opacity-40" : "active:bg-[#F1EEF4]"
                        }`}
                    >
                        <Ionicons name="chevron-back" size={16} color="#1857B6" />
                        <Text className="text-sm font-medium text-[#1857B6]">Anterior</Text>
                    </Pressable>

                    <Text className="text-xs text-[#79747E]">
                        Página {paginaSegura} de {totalPaginas}
                    </Text>

                    <Pressable
                        onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaSegura === totalPaginas}
                        className={`flex-row items-center gap-1 px-3 py-2 rounded-lg ${
                            paginaSegura === totalPaginas ? "opacity-40" : "active:bg-[#F1EEF4]"
                        }`}
                    >
                        <Text className="text-sm font-medium text-[#1857B6]">Siguiente</Text>
                        <Ionicons name="chevron-forward" size={16} color="#1857B6" />
                    </Pressable>
                </View>
            )}

            {/* Modal: confirmar eliminación */}
            <Modal
                visible={!!recetaAEliminar}
                transparent
                animationType="fade"
                onRequestClose={() => setRecetaAEliminar(null)}
            >
                <View className="flex-1 items-center justify-center bg-black/40 px-8">
                    <View className="bg-white rounded-2xl p-5 w-full">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons name="warning" size={20} color="#B3261E" />
                            <Text className="text-base font-semibold text-[#1C1B1F]">Eliminar receta</Text>
                        </View>
                        <Text className="text-sm text-[#79747E] mb-5">
                            ¿Seguro que deseas eliminar{" "}
                            <Text className="font-semibold text-[#1C1B1F]">{recetaAEliminar?.nombre}</Text>?
                            Esta acción no se puede deshacer.
                        </Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setRecetaAEliminar(null)}
                                className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                            >
                                <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                            </Pressable>
                            <Pressable
                                onPress={confirmarEliminar}
                                className="flex-1 bg-[#B3261E] rounded-xl py-3 items-center"
                            >
                                <Text className="text-sm font-semibold text-white">Eliminar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
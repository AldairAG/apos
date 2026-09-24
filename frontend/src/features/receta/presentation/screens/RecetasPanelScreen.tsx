import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { RecetaDto } from "../../domain/types/receta.types";
import { useReceta } from "../hook/useReceta";

const RECETAS_POR_PAGINA = 10;

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

    const { recetas, pageInfo, loading, error, findRecetas } = useReceta();

    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            findRecetas({
                nombre: busqueda.trim() || undefined,
                page: pagina,
                size: RECETAS_POR_PAGINA,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [busqueda, pagina, findRecetas]);

    const handleBuscar = (texto: string) => {
        setBusqueda(texto);
        setPagina(0);
    };

    const handleEditar = (receta: RecetaDto) => {
        // TODO: ajustar a la ruta real de edición de recetas
        router.push(`/recetas/${receta.id}/editar` as any);
    };

    const handleNuevaReceta = () => {
        // TODO: ajustar a la ruta real de creación de recetas
        router.push(ROUTES.ADMIN.RECETAS.CREAR as any);
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

            {error && <Text className="px-4 pt-2 text-xs text-[#B3261E]">{error}</Text>}

            {/* Lista de recetas */}
            {loading && recetas.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#1857B6" />
                </View>
            ) : (
                <FlatList
                data={recetas}
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
                                        "bg-[#D8E2FF]"
                                    }`}
                                >
                                    <Text
                                        className="text-[10px] font-bold tracking-wide text-[#1857B6]"
                                    >
                                        RECETA
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
                            </View>
                        </View>

                        <View className="flex-row items-center gap-6 mt-2">
                            <View>
                                <Text className="text-xs text-[#79747E]">Costo</Text>
                                <Text className="text-sm font-semibold text-[#1C1B1F]">
                                    {formatMoney(item.costoTotal)}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-xs text-[#79747E]">Sobre costo</Text>
                                <Text className="text-sm font-semibold text-[#1C7C3F]">
                                    {item.porcentajeSobreCostos ?? 0}%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                />
            )}

            {/* Paginación */}
            {pageInfo.totalElements > 0 && (
                <View className="flex-row items-center justify-between px-4 py-3 bg-white border-t border-[#E7E0EC]">
                    <Pressable
                        onPress={() => setPagina((p) => Math.max(0, p - 1))}
                        disabled={pagina === 0 || loading}
                        className={`flex-row items-center gap-1 px-3 py-2 rounded-lg ${
                            pagina === 0 || loading ? "opacity-40" : "active:bg-[#F1EEF4]"
                        }`}
                    >
                        <Ionicons name="chevron-back" size={16} color="#1857B6" />
                        <Text className="text-sm font-medium text-[#1857B6]">Anterior</Text>
                    </Pressable>

                    <Text className="text-xs text-[#79747E]">
                        Página {pagina + 1} de {pageInfo.totalPages}
                    </Text>

                    <Pressable
                        onPress={() => setPagina((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                        disabled={pagina >= pageInfo.totalPages - 1 || loading}
                        className={`flex-row items-center gap-1 px-3 py-2 rounded-lg ${
                            pagina >= pageInfo.totalPages - 1 || loading ? "opacity-40" : "active:bg-[#F1EEF4]"
                        }`}
                    >
                        <Text className="text-sm font-medium text-[#1857B6]">Siguiente</Text>
                        <Ionicons name="chevron-forward" size={16} color="#1857B6" />
                    </Pressable>
                </View>
            )}

        </View>
    );
}
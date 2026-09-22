import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { UnidadMedida } from "../../domain/types/material.types";
import { useMaterial } from "../hook/useMaterial";

const UNIDAD_LABELS: Record<UnidadMedida, string> = {
    [UnidadMedida.GR]: "g",
    [UnidadMedida.KG]: "kg",
    [UnidadMedida.MG]: "mg",
    [UnidadMedida.LB]: "lb",
    [UnidadMedida.ML]: "ml",
    [UnidadMedida.LT]: "l",
    [UnidadMedida.OZ]: "oz",
    [UnidadMedida.GAL]: "gal",
    [UnidadMedida.CUP]: "taza",
    [UnidadMedida.TBSP]: "cda",
    [UnidadMedida.TSP]: "cdta",
    [UnidadMedida.PZ]: "pz",
    [UnidadMedida.UNIDAD]: "unidad",
    [UnidadMedida.USO]: "uso",
    [UnidadMedida.POR]: "porción",
    [UnidadMedida.REBANADA]: "rebanada",
    [UnidadMedida.PAQUETE]: "paquete",
    [UnidadMedida.BARRA]: "barra",
    [UnidadMedida.RAMO]: "ramo",
    [UnidadMedida.LATA]: "lata",
    [UnidadMedida.BOLSA]: "bolsa",
};

function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}

/**
 * Panel de administración de materiales. Consume el estado de Redux a
 * través de `useMaterial`; toda la comunicación con el backend ocurre en
 * los thunks (query/usecase), no en esta pantalla.
 */
export default function MaterialesPanelScreen() {
    const router = useRouter();
    const { materiales, loading, error, findMateriales } = useMaterial();
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            findMateriales({ nombre: busqueda || undefined });
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busqueda]);

    const materialesOrdenados = useMemo(
        () => [...materiales].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        [materiales]
    );

    const handleNuevoMaterial = () => {
        router.push(ROUTES.ADMIN.MATERIALES.CREAR as any);
    };

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            {/* Header + buscador */}
            <View className="px-4 pt-6 pb-3 bg-white border-b border-[#E7E0EC]">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-[#1C1B1F]">Materiales</Text>
                    <Pressable
                        onPress={handleNuevoMaterial}
                        className="flex-row items-center gap-1.5 bg-[#1857B6] rounded-full px-4 py-2.5 active:opacity-90"
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white">Nuevo</Text>
                    </Pressable>
                </View>

                <View className="flex-row items-center bg-[#F1EEF4] rounded-xl px-3">
                    <Ionicons name="search" size={18} color="#79747E" />
                    <TextInput
                        className="flex-1 py-2.5 px-2 text-base text-[#1C1B1F]"
                        placeholder="Buscar material por nombre..."
                        placeholderTextColor="#79747E"
                        value={busqueda}
                        onChangeText={setBusqueda}
                        returnKeyType="search"
                    />
                    {busqueda.length > 0 && (
                        <Pressable onPress={() => setBusqueda("")} hitSlop={8}>
                            <Ionicons name="close-circle" size={18} color="#79747E" />
                        </Pressable>
                    )}
                </View>

                {error && (
                    <Text className="text-[#B3261E] text-xs mt-2">{error}</Text>
                )}
            </View>

            {/* Lista de materiales */}
            {loading && materialesOrdenados.length === 0 ? (
                <View className="items-center justify-center py-16">
                    <ActivityIndicator color="#1857B6" />
                </View>
            ) : (
                <FlatList
                    data={materialesOrdenados}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16">
                            <Ionicons name="cube-outline" size={32} color="#79747E" />
                            <Text className="text-sm text-[#79747E] mt-3 text-center">
                                {busqueda
                                    ? `No se encontraron materiales para "${busqueda}".`
                                    : "Aún no hay materiales registrados."}
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
                                    {!!item.proveedor && (
                                        <Text className="text-xs text-[#79747E] mt-0.5" numberOfLines={1}>
                                            {item.proveedor}
                                        </Text>
                                    )}
                                </View>
                                <View className="self-start px-2 py-0.5 rounded-full bg-[#D8E2FF]">
                                    <Text className="text-[10px] font-bold tracking-wide text-[#1857B6]">
                                        {UNIDAD_LABELS[item.unidad]}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-6 mt-2">
                                <View>
                                    <Text className="text-xs text-[#79747E]">Cantidad</Text>
                                    <Text className="text-sm font-semibold text-[#1C1B1F]">
                                        {item.cantidad} {UNIDAD_LABELS[item.unidad]}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-xs text-[#79747E]">Precio</Text>
                                    <Text className="text-sm font-semibold text-[#1C7C3F]">
                                        {formatMoney(item.precio)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

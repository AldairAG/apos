import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useModificador } from "../hook/useModificador";

function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}

export default function ModificadoresPanelScreen() {
    const router = useRouter();
    const { modificadores, loading, error, findModificadoresByEmpresa } = useModificador();

    useEffect(() => {
        findModificadoresByEmpresa();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            <View className="px-4 pt-6 pb-3 bg-white border-b border-[#E7E0EC]">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-[#1C1B1F]">Modificadores</Text>
                    <Pressable
                        onPress={() => router.push(ROUTES.ADMIN.MODIFICADORES.CREAR as any)}
                        className="flex-row items-center gap-1.5 bg-[#1857B6] rounded-full px-4 py-2.5 active:opacity-90"
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white">Nuevo</Text>
                    </Pressable>
                </View>
                {error && <Text className="text-[#B3261E] text-xs mt-2">{error}</Text>}
            </View>

            {loading && modificadores.length === 0 ? (
                <View className="items-center justify-center py-16">
                    <ActivityIndicator color="#1857B6" />
                </View>
            ) : (
                <FlatList
                    data={modificadores}
                    keyExtractor={(item, index) => String(item.id ?? `${item.nombre}-${index}`)}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16">
                            <Ionicons name="options-outline" size={32} color="#79747E" />
                            <Text className="text-sm text-[#79747E] mt-3 text-center">
                                Aún no hay modificadores registrados.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-2xl border border-[#E7E0EC] p-4">
                            <Text className="text-base font-semibold text-[#1C1B1F]">
                                {item.nombre}
                            </Text>
                            <View className="mt-3 gap-2">
                                {item.opciones.map((opcion, index) => (
                                    <View
                                        key={opcion.id ?? `${opcion.nombre}-${index}`}
                                        className="flex-row items-center justify-between border-t border-[#F1EEF4] pt-2"
                                    >
                                        <View className="flex-1 pr-2">
                                            <Text className="text-sm text-[#1C1B1F]">{opcion.nombre}</Text>
                                            <Text className="text-xs text-[#79747E]">
                                                Costo {formatMoney(opcion.costo)} · Máximo {opcion.maximo}
                                            </Text>
                                        </View>
                                        <Text className="text-sm font-semibold text-[#1C7C3F]">
                                            {formatMoney(opcion.precio)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}
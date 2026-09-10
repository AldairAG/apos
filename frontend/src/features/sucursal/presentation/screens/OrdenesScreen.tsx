import { FlatList, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/** Módulo de órdenes de la sucursal actual. Lista mock de órdenes recientes. */
const ORDENES_MOCK = [
    { id: "1023", mesa: "5", estado: "En preparación", total: 245 },
    { id: "1024", mesa: "2", estado: "Lista", total: 120 },
    { id: "1025", mesa: "8", estado: "Entregada", total: 310 },
];

const ESTADO_COLOR: Record<string, string> = {
    "En preparación": "#8A6D00",
    Lista: "#1857B6",
    Entregada: "#3A7D44",
};

const OrdenesScreen = () => {
    const { sucursalActual } = useSucursal();

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <Text className="text-xs text-[#79747E] px-4 pt-4 pb-2">Órdenes · {sucursalActual?.nombre}</Text>
            <FlatList
                data={ORDENES_MOCK}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => (
                    <View className="bg-white rounded-2xl p-4 border border-[#E7E0EC] flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-medium text-[#1C1B1F]">
                                Orden #{item.id} · Mesa {item.mesa}
                            </Text>
                            <Text className="text-xs mt-1" style={{ color: ESTADO_COLOR[item.estado] }}>
                                {item.estado}
                            </Text>
                        </View>
                        <Text className="text-sm font-medium text-[#1C1B1F]">${item.total}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default OrdenesScreen;

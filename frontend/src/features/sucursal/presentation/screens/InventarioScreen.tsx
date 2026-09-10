import { FlatList, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/** Módulo de inventario de la sucursal actual. Lista mock de existencias por producto. */
const INVENTARIO_MOCK = [
    { id: "1", producto: "Pan de hamburguesa", existencias: 120, minimo: 50 },
    { id: "2", producto: "Carne 100g", existencias: 30, minimo: 40 },
    { id: "3", producto: "Refresco 600ml", existencias: 200, minimo: 60 },
];

const InventarioScreen = () => {
    const { sucursalActual } = useSucursal();

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <Text className="text-xs text-[#79747E] px-4 pt-4 pb-2">Inventario · {sucursalActual?.nombre}</Text>
            <FlatList
                data={INVENTARIO_MOCK}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => {
                    const bajoStock = item.existencias < item.minimo;
                    return (
                        <View className="bg-white rounded-2xl p-4 border border-[#E7E0EC] flex-row items-center justify-between">
                            <Text className="text-sm text-[#1C1B1F]">{item.producto}</Text>
                            <Text className={`text-sm font-medium ${bajoStock ? "text-[#B3261E]" : "text-[#1C1B1F]"}`}>
                                {item.existencias} pzas
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

export default InventarioScreen;

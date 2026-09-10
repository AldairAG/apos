import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/** Módulo de productos de la sucursal actual. Lista mock: sustituir por la consulta real por sucursal. */
const PRODUCTOS_MOCK = [
    { id: "1", nombre: "Hamburguesa clásica", precio: 89 },
    { id: "2", nombre: "Refresco 600ml", precio: 25 },
    { id: "3", nombre: "Papas fritas", precio: 45 },
];

const ProductosScreen = () => {
    const { sucursalActual } = useSucursal();

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <Text className="text-xs text-[#79747E] px-4 pt-4 pb-2">Productos · {sucursalActual?.nombre}</Text>
            <FlatList
                data={PRODUCTOS_MOCK}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="cube-outline" size={20} color="#1857B6" />
                            <Text className="text-sm text-[#1C1B1F]">{item.nombre}</Text>
                        </View>
                        <Text className="text-sm font-medium text-[#1C1B1F]">${item.precio}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default ProductosScreen;

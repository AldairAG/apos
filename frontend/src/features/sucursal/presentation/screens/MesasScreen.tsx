import { FlatList, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/** Módulo de mesas de la sucursal actual. Estado de ocupación mock. */
const MESAS_MOCK = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    ocupada: i % 3 === 0,
}));

const MesasScreen = () => {
    const { sucursalActual } = useSucursal();

    return (
        <View className="flex-1 bg-[#F1EEF4] px-4 pt-4">
            <Text className="text-xs text-[#79747E] mb-3">Mesas · {sucursalActual?.nombre}</Text>
            <FlatList
                data={MESAS_MOCK}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                    <View
                        className={`flex-1 aspect-square rounded-2xl items-center justify-center border ${item.ocupada ? "bg-[#FDE2E1] border-[#B3261E]" : "bg-white border-[#E7E0EC]"}`}
                    >
                        <Text className={`text-sm font-medium ${item.ocupada ? "text-[#B3261E]" : "text-[#1C1B1F]"}`}>
                            Mesa {item.id}
                        </Text>
                        <Text className="text-xs text-[#79747E] mt-1">{item.ocupada ? "Ocupada" : "Libre"}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default MesasScreen;

import { rutaSucursal } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/**
 * Pantalla para seleccionar la sucursal con la que se va a trabajar.
 * Al elegir una sucursal, sincroniza Redux y navega a su dashboard
 * (app/(admin)/sucursal/[sucursalId]).
 */
const SeleccionarSucursalScreen = () => {
    const router = useRouter();
    const { sucursales, cambiarSucursal, loading } = useSucursal();

    const seleccionar = (id: string) => {
        cambiarSucursal(id);
        router.push(rutaSucursal(id) as any);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#1857B6" />
            </View>
        );
    }

    if (sucursales.length === 0) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <Ionicons name="business-outline" size={32} color="#79747E" />
                <Text className="text-sm text-[#79747E] mt-3 text-center">
                    Aún no hay sucursales registradas.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={sucursales}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
                <Pressable
                    onPress={() => seleccionar(item.id)}
                    className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-[#E7E0EC] active:bg-[#F1EEF4]"
                >
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-[#1C1B1F]">{item.nombre}</Text>
                        <Text className="text-xs text-[#79747E] mt-0.5">{item.direccion}</Text>
                    </View>
                    <View
                        className={`px-2 py-1 rounded-full mr-2 ${item.estado === "ACTIVA" ? "bg-[#D8E2FF]" : "bg-[#FDE2E1]"}`}
                    >
                        <Text className={`text-xs ${item.estado === "ACTIVA" ? "text-[#1857B6]" : "text-[#B3261E]"}`}>
                            {item.estado === "ACTIVA" ? "Activa" : "Inactiva"}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#79747E" />
                </Pressable>
            )}
        />
    );
};

export default SeleccionarSucursalScreen;
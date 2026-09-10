import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

/**
 * Pantalla inicial del módulo POS (contexto independiente al panel administrativo).
 * Únicamente valida que la navegación del módulo funciona; los accesos son mock
 * y se implementarán en próximas iteraciones (órdenes, productos, categorías, carrito,
 * mesas, cobro, métodos de pago, caja, cocina).
 */
const ACCESOS_MOCK: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Órdenes", icon: "receipt-outline" },
    { label: "Productos", icon: "cube-outline" },
    { label: "Categorías", icon: "pricetags-outline" },
    { label: "Carrito", icon: "cart-outline" },
    { label: "Mesas", icon: "restaurant-outline" },
    { label: "Cobro", icon: "card-outline" },
    { label: "Métodos de pago", icon: "wallet-outline" },
    { label: "Caja", icon: "cash-outline" },
    { label: "Cocina", icon: "flame-outline" },
];

const PosHomeScreen = () => {
    return (
        <View className="flex-1 bg-[#F9F7FA] px-4 pt-6">
            <Text className="text-lg font-medium text-[#1C1B1F] mb-1">Punto de venta</Text>
            <Text className="text-xs text-[#79747E] mb-5">
                Módulo POS independiente. Los accesos se habilitarán en próximas iteraciones.
            </Text>

            <View className="flex-row flex-wrap gap-3">
                {ACCESOS_MOCK.map((acceso) => (
                    <Pressable
                        key={acceso.label}
                        className="w-[30%] items-center bg-white rounded-2xl py-4 border border-[#E7E0EC] active:bg-[#F1EEF4]"
                    >
                        <Ionicons name={acceso.icon} size={22} color="#1857B6" />
                        <Text className="text-xs text-[#1C1B1F] mt-2 text-center">{acceso.label}</Text>
                    </Pressable>
                ))}
            </View>

            <Pressable
                onPress={() => router.replace("/admin_home" as any)}
                className="flex-row items-center gap-2 mt-8 self-start"
            >
                <Ionicons name="arrow-back" size={16} color="#49454F" />
                <Text className="text-sm text-[#49454F]">Volver a administración</Text>
            </Pressable>
        </View>
    );
};

export default PosHomeScreen;

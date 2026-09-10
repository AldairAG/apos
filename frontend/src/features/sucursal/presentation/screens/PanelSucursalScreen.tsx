import { ModuloSucursalKey, rutaSucursal } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/**
 * Dashboard/panel principal de la sucursal seleccionada.
 * El resumen (ventas, órdenes, caja, mesas, inventario) es mock hasta que
 * existan los endpoints reales de resumen por sucursal en el backend.
 */

// TODO: sustituir por datos reales cuando exista el endpoint de resumen de sucursal.
const RESUMEN_MOCK = {
    ventasDelDia: 12850.5,
    numeroOrdenes: 37,
    cajaAbierta: true,
    mesasOcupadas: 6,
    mesasTotales: 12,
    productosBajoStock: 4,
};

const ACCESOS_RAPIDOS: { key: ModuloSucursalKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "productos", label: "Productos", icon: "cube-outline" },
    { key: "inventario", label: "Inventario", icon: "archive-outline" },
    { key: "caja", label: "Caja", icon: "cash-outline" },
    { key: "mesas", label: "Mesas", icon: "restaurant-outline" },
    { key: "ordenes", label: "Órdenes", icon: "receipt-outline" },
    { key: "configuracion", label: "Configuración", icon: "settings-outline" },
];

const formatCurrency = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PanelSucursalScreen = () => {
    const router = useRouter();
    const { sucursalActual } = useSucursal();

    if (!sucursalActual) return null;

    return (
        <ScrollView className="flex-1 bg-[#F1EEF4]" contentContainerStyle={{ padding: 16, gap: 16 }}>
            {/* Estado de la sucursal */}
            <View className="bg-white rounded-2xl p-5 border border-[#E7E0EC]">
                <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-medium text-[#1C1B1F]">{sucursalActual.nombre}</Text>
                    <View
                        className={`px-2.5 py-1 rounded-full ${sucursalActual.estado === "ACTIVA" ? "bg-[#D8E2FF]" : "bg-[#FDE2E1]"}`}
                    >
                        <Text
                            className={`text-xs font-medium ${sucursalActual.estado === "ACTIVA" ? "text-[#1857B6]" : "text-[#B3261E]"}`}
                        >
                            {sucursalActual.estado === "ACTIVA" ? "Activa" : "Inactiva"}
                        </Text>
                    </View>
                </View>
                <Text className="text-xs text-[#79747E] mt-1">{sucursalActual.direccion}</Text>
            </View>

            {/* Resumen del día */}
            <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                    <Text className="text-xs text-[#79747E]">Ventas del día</Text>
                    <Text className="text-lg font-medium text-[#1857B6] mt-1">
                        {formatCurrency(RESUMEN_MOCK.ventasDelDia)}
                    </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                    <Text className="text-xs text-[#79747E]">Órdenes</Text>
                    <Text className="text-lg font-medium text-[#1C1B1F] mt-1">{RESUMEN_MOCK.numeroOrdenes}</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                    <Text className="text-xs text-[#79747E]">Caja</Text>
                    <Text
                        className="text-lg font-medium mt-1"
                        style={{ color: RESUMEN_MOCK.cajaAbierta ? "#1857B6" : "#B3261E" }}
                    >
                        {RESUMEN_MOCK.cajaAbierta ? "Abierta" : "Cerrada"}
                    </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                    <Text className="text-xs text-[#79747E]">Mesas ocupadas</Text>
                    <Text className="text-lg font-medium text-[#1C1B1F] mt-1">
                        {RESUMEN_MOCK.mesasOcupadas}/{RESUMEN_MOCK.mesasTotales}
                    </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-[#E7E0EC]">
                    <Text className="text-xs text-[#79747E]">Inventario bajo</Text>
                    <Text className="text-lg font-medium text-[#B3261E] mt-1">
                        {RESUMEN_MOCK.productosBajoStock} productos
                    </Text>
                </View>
            </View>

            {/* Accesos rápidos a los módulos de la sucursal */}
            <View>
                <Text className="text-sm font-medium text-[#1C1B1F] mb-3">Accesos rápidos</Text>
                <View className="flex-row flex-wrap gap-3">
                    {ACCESOS_RAPIDOS.map((acceso) => (
                        <Pressable
                            key={acceso.key}
                            onPress={() => router.push(rutaSucursal(sucursalActual.id, acceso.key) as any)}
                            className="w-[30%] items-center bg-white rounded-2xl py-4 border border-[#E7E0EC] active:bg-[#F1EEF4]"
                        >
                            <Ionicons name={acceso.icon} size={22} color="#1857B6" />
                            <Text className="text-xs text-[#1C1B1F] mt-2 text-center">{acceso.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

export default PanelSucursalScreen;
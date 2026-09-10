import { ModuloSucursalKey, rutaSucursal } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/**
 * Selector de sucursal reutilizable dentro del contexto de sucursal.
 * Al cambiar de sucursal conserva el módulo actual (ej. productos, inventario);
 * si el destino no tiene sentido, `rutaSucursal` ya resuelve al dashboard.
 */
interface SucursalSwitcherProps {
    moduloActual: ModuloSucursalKey;
}

export default function SucursalSwitcher({ moduloActual }: SucursalSwitcherProps) {
    const router = useRouter();
    const { sucursales, sucursalActual, cambiarSucursal } = useSucursal();
    const [abierto, setAbierto] = useState(false);

    const seleccionar = (id: string) => {
        cambiarSucursal(id);
        setAbierto(false);
        router.replace(rutaSucursal(id, moduloActual) as any);
    };

    return (
        <View>
            <Pressable
                onPress={() => setAbierto(true)}
                className="flex-row items-center gap-1 px-3 h-9 rounded-full bg-[#F1EEF4]"
                accessibilityRole="button"
                accessibilityLabel="Cambiar de sucursal"
            >
                <Ionicons name="business-outline" size={16} color="#1C1B1F" />
                <Text className="text-sm text-[#1C1B1F]" numberOfLines={1}>
                    {sucursalActual?.nombre ?? "Selecciona sucursal"}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#49454F" />
            </Pressable>

            <Modal
                transparent
                visible={abierto}
                animationType="fade"
                onRequestClose={() => setAbierto(false)}
            >
                <Pressable className="flex-1 bg-black/30" onPress={() => setAbierto(false)}>
                    <View className="mt-24 mx-6 bg-white rounded-2xl overflow-hidden shadow-lg">
                        <Text className="px-4 pt-4 pb-2 text-xs text-[#79747E]">Cambiar sucursal</Text>
                        <ScrollView style={{ maxHeight: 320 }}>
                            {sucursales.map((s) => (
                                <Pressable
                                    key={s.id}
                                    onPress={() => seleccionar(s.id)}
                                    className="flex-row items-center justify-between px-4 py-3 active:bg-[#F1EEF4]"
                                >
                                    <View className="flex-1">
                                        <Text className="text-sm text-[#1C1B1F]">{s.nombre}</Text>
                                        <Text className="text-xs text-[#79747E]">{s.direccion}</Text>
                                    </View>
                                    {s.id === sucursalActual?.id && (
                                        <Ionicons name="checkmark" size={18} color="#1857B6" />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

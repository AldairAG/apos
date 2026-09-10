import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/** Módulo de configuración de la sucursal actual. Opciones mock, sin lógica de backend todavía. */
const OPCIONES: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "datos", label: "Datos de la sucursal", icon: "information-circle-outline" },
    { key: "horarios", label: "Horarios de atención", icon: "time-outline" },
    { key: "usuarios", label: "Usuarios y roles", icon: "people-outline" },
    { key: "impresoras", label: "Impresoras y tickets", icon: "print-outline" },
];

const ConfiguracionScreen = () => {
    const { sucursalActual } = useSucursal();

    return (
        <View className="flex-1 bg-[#F1EEF4] px-4 pt-4 gap-3">
            <Text className="text-xs text-[#79747E]">Configuración · {sucursalActual?.nombre}</Text>
            {OPCIONES.map((op) => (
                <Pressable
                    key={op.key}
                    className="flex-row items-center gap-3 bg-white rounded-2xl p-4 border border-[#E7E0EC] active:bg-[#F1EEF4]"
                >
                    <Ionicons name={op.icon} size={20} color="#1857B6" />
                    <Text className="text-sm text-[#1C1B1F]">{op.label}</Text>
                </Pressable>
            ))}
        </View>
    );
};

export default ConfiguracionScreen;

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

/**
 * Módulo de caja de la sucursal actual.
 * Abrir caja / hacer corte son acciones hardcodeadas (estado local) mientras no exista backend.
 */
const CajaScreen = () => {
    const { sucursalActual } = useSucursal();
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const montoInicial = 500;

    const abrirCaja = () => {
        setCajaAbierta(true);
        Alert.alert("Caja abierta", `Monto inicial: $${montoInicial}`);
    };

    const hacerCorte = () => {
        setCajaAbierta(false);
        Alert.alert("Corte de caja", "Corte generado (mock).");
    };

    return (
        <View className="flex-1 bg-[#F1EEF4] px-4 pt-4 gap-4">
            <Text className="text-xs text-[#79747E]">Caja · {sucursalActual?.nombre}</Text>

            <View className="bg-white rounded-2xl p-5 border border-[#E7E0EC] items-center gap-3">
                <Ionicons name="cash-outline" size={28} color={cajaAbierta ? "#1857B6" : "#79747E"} />
                <Text className="text-base font-medium text-[#1C1B1F]">
                    {cajaAbierta ? "Caja abierta" : "Caja cerrada"}
                </Text>

                {!cajaAbierta ? (
                    <Pressable onPress={abrirCaja} className="bg-[#1857B6] rounded-full px-6 py-3">
                        <Text className="text-white text-sm font-medium">Abrir caja</Text>
                    </Pressable>
                ) : (
                    <Pressable onPress={hacerCorte} className="bg-[#B3261E] rounded-full px-6 py-3">
                        <Text className="text-white text-sm font-medium">Hacer corte</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default CajaScreen;

import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text } from "react-native";
import type { MetodoPago } from "@/features/pos/domain/types/pos.types";

interface PaymentMethodsProps {
    selectedMethod: MetodoPago | null;
    onSelectMethod: (method: MetodoPago) => void;
}

interface PaymentMethod {
    value: MetodoPago;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { value: "EFECTIVO", label: "Efectivo", icon: "cash", color: "#2E7D32" },
    { value: "TARJETA_DEBITO", label: "Débito", icon: "card-outline", color: "#1857B6" },
    { value: "TARJETA_CREDITO", label: "Crédito", icon: "card-outline", color: "#8B6914" },
    { value: "TRANSFERENCIA_BANCARIA", label: "Transferencia", icon: "swap-horizontal", color: "#6750A4" },
    { value: "DIGITAL", label: "Digital", icon: "phone-portrait-outline", color: "#D35400" },
];

export default function PaymentMethods({ selectedMethod, onSelectMethod }: PaymentMethodsProps) {
    return (
        <View className="gap-3">
            <Text className="text-sm font-medium text-[#49454F]">Método de pago</Text>
            <View className="flex-row flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                    <Pressable
                        key={method.value}
                        onPress={() => onSelectMethod(method.value)}
                        className={`flex-1 min-w-[100px] items-center gap-2 rounded-xl px-4 py-4 border-2 ${
                            selectedMethod === method.value
                                ? "border-[#1857B6] bg-[#EAF1FC]"
                                : "border-[#E7E0EC] bg-white"
                        }`}
                    >
                        <Ionicons
                            name={method.icon}
                            size={24}
                            color={
                                selectedMethod === method.value ? "#1857B6" : method.color
                            }
                        />
                        <Text
                            className={`text-xs font-semibold text-center ${
                                selectedMethod === method.value ? "text-[#1857B6]" : "text-[#49454F]"
                            }`}
                        >
                            {method.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

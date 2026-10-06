import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface CartSummaryProps {
    itemCount: number;
    subtotal: number;
    onViewCart: () => void;
}

const moneda = (monto: number) =>
    `$${(monto || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CartSummary({ itemCount, subtotal, onViewCart }: CartSummaryProps) {
    if (itemCount === 0) {
        return null;
    }

    return (
        <Pressable
            onPress={onViewCart}
            className="mx-4 mb-4 flex-row items-center justify-between rounded-xl border-2 border-[#1857B6] bg-[#EAF1FC] px-4 py-3"
        >
            <View className="flex-row items-center gap-3">
                <View className="items-center justify-center rounded-full bg-[#1857B6] px-2 py-1 min-w-[28px]">
                    <Text className="text-sm font-bold text-white">{itemCount}</Text>
                </View>
                <View>
                    <Text className="text-xs text-[#79747E]">Carrito</Text>
                    <Text className="text-base font-bold text-[#1857B6]">{moneda(subtotal)}</Text>
                </View>
            </View>
            <View className="flex-row items-center gap-2">
                <Text className="text-xs font-medium text-[#1857B6]">Ver</Text>
                <Ionicons name="chevron-forward" size={16} color="#1857B6" />
            </View>
        </Pressable>
    );
}

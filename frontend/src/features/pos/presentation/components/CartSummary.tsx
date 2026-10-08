import { moneda } from "@/helpers/FormatHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import useCart from "../hook/useCart";
import { useEffect } from "react";

interface CartSummaryProps {
    onViewCart: () => void;
}

export default function CartSummary({ onViewCart }: CartSummaryProps) {

    const { carrito, subtotal } = useCart();

    useEffect(() => {
        console.log(carrito.length);
    }, [carrito]);

    console.log("render CartSummary");
    if (carrito.length === 0) {
        console.log("retorno null");
        
        return null;
    }

    return (
        <Pressable
            onPress={onViewCart}
            className="mx-4 mb-4 flex-row items-center justify-between rounded-xl border-2 border-[#1857B6] bg-[#EAF1FC] px-4 py-3"
        >
            <View className="flex-row items-center gap-3">
                <View className="items-center justify-center rounded-full bg-[#1857B6] px-2 py-1 min-w-[28px]">
                    <Text className="text-sm font-bold text-white">{carrito.length}</Text>
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

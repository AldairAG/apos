import { formatMoney } from "@/helpers/FormatHelpers";
import { Text, View } from "react-native";

export default function ResumenLinea({
    label,
    value,
    negativo = false,
    destacado = false,
}: {
    label: string;
    value: number;
    negativo?: boolean;
    destacado?: boolean;
}) {
    return (
        <View className="flex-row items-center justify-between py-0.5">
            <Text className={`text-sm ${destacado ? "font-semibold text-[#1C1B1F]" : "text-[#79747E]"}`}>
                {label}
            </Text>
            <Text
                className={`text-sm ${destacado ? "font-bold" : "font-medium"} ${negativo ? "text-[#B3261E]" : "text-[#1C1B1F]"
                    }`}
            >
                {negativo && value > 0 ? "-" : ""}
                {formatMoney(Math.abs(value))}
            </Text>
        </View>
    );
}

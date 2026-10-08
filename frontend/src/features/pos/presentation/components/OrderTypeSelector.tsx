import { TIPO_ORDEN_LABELS, type TipoOrden } from "@/features/pos/domain/types/pos.types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text } from "react-native";

interface OrderTypeSelectorProps {
    selectedType: TipoOrden | null;
    onSelectType: (type: TipoOrden) => void;
}

const orderTypeIcons: Record<Exclude<TipoOrden, "EN_MESA">, keyof typeof Ionicons.glyphMap> = {
    PARA_LLEVAR: "bag-handle",
    RECOGER: "cube",
    DELIVERY: "location",
};

export default function OrderTypeSelector({ selectedType, onSelectType }: OrderTypeSelectorProps) {
    const types: Exclude<TipoOrden, "EN_MESA">[] = ["PARA_LLEVAR", "RECOGER", "DELIVERY"];

    return (
        <View className="mb-4 gap-3">
            <Text className="text-sm font-medium text-[#49454F]">Tipo de orden</Text>
            <View className="flex-row flex-wrap gap-3">
                {types.map((type) => (
                    <Pressable
                        key={type}
                        onPress={() => onSelectType(type)}
                        className={`flex-1 min-w-[100px] flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 border-2 ${
                            selectedType === type
                                ? "border-[#1857B6] bg-[#EAF1FC]"
                                : "border-[#E7E0EC] bg-white"
                        }`}
                    >
                        <Ionicons
                            name={orderTypeIcons[type]}
                            size={20}
                            color={selectedType === type ? "#1857B6" : "#79747E"}
                        />
                        <Text
                            className={`text-xs font-semibold text-center ${
                                selectedType === type ? "text-[#1857B6]" : "text-[#49454F]"
                            }`}
                        >
                            {TIPO_ORDEN_LABELS[type]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
            <Text className="text-base font-semibold text-[#1C1B1F]">{title}</Text>
            <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
            >
                <Ionicons name="close" size={20} color="#1C1B1F" />
            </Pressable>
        </View>
    );
}
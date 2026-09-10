import { Stack } from "expo-router";
import { Text, View } from "react-native";

/**
 * Layout raíz del contexto POS (app/(pos)).
 * Es un contexto de navegación independiente al panel administrativo:
 * no reutiliza el sidebar de (admin) porque el flujo operativo del POS es distinto.
 */
export default function PosLayout() {
  return (
    <View className="flex-1 bg-[#F9F7FA]">
      <View className="h-14 flex-row items-center px-4 bg-white border-b border-[#E7E0EC]">
        <Text className="text-base font-medium text-[#1C1B1F]">POS</Text>
      </View>
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

import { Stack } from "expo-router";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SidebarProvider, useSidebar } from "@/components/siderbar/SiderBarContext";
import Sidebar from "@/components/siderbar/SiderBar";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
}

function AdminLayoutContent() {
  const { openSidebar } = useSidebar();

  return (
    <View className="flex-1 bg-[#F9F7FA]">

      {/* Top App Bar */}
      <View className="relative h-16 shrink-0 flex-row items-center px-4 bg-white border-b border-[#E7E0EC]">

        {/* Menu */}
        <Pressable
          onPress={openSidebar}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-[#F1EEF4]"
          accessibilityLabel="Abrir menú"
          accessibilityRole="button"
        >
          <Ionicons
            name="menu"
            size={22}
            color="#1C1B1F"
          />
        </Pressable>

        {/* Title */}
        <Text
          className="absolute left-0 right-0 text-center text-base font-medium text-[#1C1B1F]"
          pointerEvents="none"
        >
          Resumen del día
        </Text>

      </View>

      {/* Content */}
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>

      {/* Sidebar */}
      <Sidebar />

    </View>
  );
}
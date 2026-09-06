import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Animated,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useEffect, useRef } from "react";
import { useSidebar } from "./SiderBarContext";
import { NAV_ITEMS } from "@/types/navigation";


const SIDEBAR_WIDTH = 280;

const ROJO = "#BA1A1A";

export default function Sidebar() {
    const { visible, closeSidebar } = useSidebar();

    const translateX = useRef(
        new Animated.Value(-SIDEBAR_WIDTH)
    ).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : -SIDEBAR_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    return (
        <View
            pointerEvents={visible ? "auto" : "none"}
            className="absolute inset-0 z-50"
        >
            {/* Overlay */}
            {visible && (
                <Pressable
                    onPress={closeSidebar}
                    className="absolute inset-0 bg-black/40"
                    accessibilityLabel="Cerrar menú"
                />
            )}

            {/* Sidebar */}
            <Animated.View
                style={{
                    width: SIDEBAR_WIDTH,
                    transform: [{ translateX }],
                }}
                className="absolute left-0 top-0 bottom-0 bg-white"
            >
                {/* Header */}
                <View className="h-16 flex-row items-center justify-between px-4 border-b border-[#E7E0EC]">
                    <Text className="text-base font-medium text-[#1C1B1F]">
                        Menú
                    </Text>

                    <Pressable
                        onPress={closeSidebar}
                        className="w-10 h-10 rounded-full items-center justify-center active:bg-[#F1EEF4]"
                        accessibilityLabel="Cerrar menú"
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name="close"
                            size={22}
                            color="#1C1B1F"
                        />
                    </Pressable>
                </View>

                {/* Navigation */}
                <ScrollView className="flex-1 pt-2">
                    {NAV_ITEMS.map((item) => (
                        <Pressable
                            key={item.route}
                            onPress={() => {
                                closeSidebar();
                                router.push(item.route as any);
                            }}
                            className="flex-row items-center gap-3 px-5 py-3 active:bg-[#F1EEF4]"
                        >
                            <Ionicons
                                name={item.icon}
                                size={20}
                                color="#49454F"
                            />

                            <Text className="text-sm text-[#1C1B1F]">
                                {item.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Logout */}
                <Pressable
                    onPress={() => {
                        closeSidebar();
                        router.replace("/login" as any);
                    }}
                    className="flex-row items-center gap-3 px-5 py-4 border-t border-[#E7E0EC]"
                >
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color={ROJO}
                    />

                    <Text
                        className="text-sm"
                        style={{ color: ROJO }}
                    >
                        Cerrar sesión
                    </Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}
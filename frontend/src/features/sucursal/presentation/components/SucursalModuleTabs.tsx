import { MODULOS_SUCURSAL, ModuloSucursalKey, rutaSucursal } from "@/routes/routes";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

/**
 * Tabs de navegación entre los módulos que dependen de una sucursal.
 * Mantiene el sucursalId activo al cambiar de módulo.
 */
interface SucursalModuleTabsProps {
    sucursalId: string;
    moduloActual: ModuloSucursalKey;
}

export default function SucursalModuleTabs({ sucursalId, moduloActual }: SucursalModuleTabsProps) {
    const router = useRouter();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
            className="border-b border-[#E7E0EC] bg-white"
        >
            {MODULOS_SUCURSAL.map((modulo) => {
                const activo = modulo.key === moduloActual;
                return (
                    <Pressable
                        key={modulo.key}
                        onPress={() => router.push(rutaSucursal(sucursalId, modulo.key) as any)}
                        className={`px-3 py-2.5 border-b-2 ${activo ? "border-[#1857B6]" : "border-transparent"}`}
                    >
                        <Text className={`text-sm ${activo ? "text-[#1857B6] font-medium" : "text-[#49454F]"}`}>
                            {modulo.label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

import SucursalModuleTabs from "@/features/sucursal/presentation/components/SucursalModuleTabs";
import SucursalSwitcher from "@/features/sucursal/presentation/components/SucursalSwitcher";
import { useSucursal } from "@/features/sucursal/presentation/hook/useSucursal";
import { MODULOS_SUCURSAL, ModuloSucursalKey } from "@/routes/routes";
import { Stack, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

/**
 * Layout del contexto de una sucursal: app/(admin)/sucursal/[sucursalId].
 * Responsable de sincronizar el sucursalId de la URL con Redux, mostrar el
 * selector de sucursal y la navegación entre módulos, y renderizar las
 * pantallas hijas (dashboard, productos, inventario, caja, mesas, ordenes, configuracion).
 * No contiene lógica de negocio de los módulos.
 */
export default function SucursalLayout() {
  const { sucursalId } = useLocalSearchParams<{ sucursalId: string }>();
  const pathname = usePathname();
  const { sucursalActual, sucursalSeleccionadaId, cambiarSucursal, loading } = useSucursal();

  // La URL es la fuente de verdad: sincroniza Redux si no coincide (deep link, refresh, etc).
  useEffect(() => {
    if (sucursalId && sucursalId !== sucursalSeleccionadaId) {
      cambiarSucursal(sucursalId);
    }
  }, [sucursalId, sucursalSeleccionadaId]);

  // El módulo activo se infiere del último segmento de la ruta (dashboard por defecto).
  const ultimoSegmento = pathname.split("/").filter(Boolean).pop();
  const moduloActual: ModuloSucursalKey = MODULOS_SUCURSAL.some((m) => m.key === ultimoSegmento)
    ? (ultimoSegmento as ModuloSucursalKey)
    : "dashboard";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1857B6" />
      </View>
    );
  }

  if (!sucursalActual) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-sm text-[#79747E] text-center">
          No se encontró la sucursal seleccionada.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="h-14 flex-row items-center justify-between px-4 border-b border-[#E7E0EC]">
        <Text className="text-base font-medium text-[#1C1B1F]" numberOfLines={1}>
          {sucursalActual.nombre}
        </Text>
        <SucursalSwitcher moduloActual={moduloActual} />
      </View>

      <SucursalModuleTabs sucursalId={sucursalId} moduloActual={moduloActual} />

      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

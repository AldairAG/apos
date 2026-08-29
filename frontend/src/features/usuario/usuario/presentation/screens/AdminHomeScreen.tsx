import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { router } from "expo-router";
import { useUsuario } from "../../hook/useUsuario";
import { useAuth } from "@/features/usuario/auth/presentation/hook/useAuth";

/**
 * Requiere:
 *   npm install react-native-gifted-charts react-native-svg
 *   (Ionicons ya viene incluido con Expo vía @expo/vector-icons)
 *
 * Paleta M3 (azul / amarillo) — igual que el resto de la app.
 */
const AZUL = "#1857B6";
const AZUL_CONTAINER = "#D8E2FF";
const AMARILLO = "#8A6D00";
const AMARILLO_CONTAINER = "#FFE28A";
const SURFACE = "#F1EEF4";
const ROJO = "#B3261E";

const PALETA_INGRESOS = ["#1857B6", "#3568C4", "#5580D1", "#7A9BDE", "#A9C1EA"];
const PALETA_GASTOS = ["#8A6D00", "#B98600", "#D9A400", "#F0BE33", "#FFD666"];

const SIDEBAR_WIDTH = 280;

// ---------- Tipos y datos de ejemplo ----------
// Sustituye MOVIMIENTOS_MOCK y CUENTAS por tus datos reales (API / store).

interface Movimiento {
  id: string;
  tipo: "ingreso" | "gasto";
  categoria: string;
  monto: number;
  cuenta: string;
}

const CUENTAS = ["Todas las cuentas", "Efectivo", "Banco azul", "Tarjeta de crédito"];

const MOVIMIENTOS_MOCK: Movimiento[] = [
  { id: "1", tipo: "gasto", categoria: "Comida", monto: 320, cuenta: "Efectivo" },
  { id: "2", tipo: "gasto", categoria: "Transporte", monto: 150, cuenta: "Efectivo" },
  { id: "3", tipo: "gasto", categoria: "Servicios", monto: 480, cuenta: "Banco azul" },
  { id: "4", tipo: "gasto", categoria: "Comida", monto: 210, cuenta: "Tarjeta de crédito" },
  { id: "5", tipo: "ingreso", categoria: "Ventas", monto: 1800, cuenta: "Banco azul" },
  { id: "6", tipo: "ingreso", categoria: "Freelance", monto: 650, cuenta: "Efectivo" },
  { id: "7", tipo: "ingreso", categoria: "Otros", monto: 200, cuenta: "Tarjeta de crédito" },
];

const formatCurrency = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const buildPieData = (items: Movimiento[], paleta: string[]) => {
  const total = items.reduce((sum, m) => sum + m.monto, 0);
  const porCategoria = items.reduce<Record<string, number>>((acc, m) => {
    acc[m.categoria] = (acc[m.categoria] ?? 0) + m.monto;
    return acc;
  }, {});

  return Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, monto], i) => ({
      value: monto,
      color: paleta[i % paleta.length],
      categoria,
      monto,
      porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
    }));
};

// ---------- Menú lateral ----------

interface SidebarProps {
  visible: boolean;
  translateX: Animated.Value;
  onClose: () => void;
}

const NAV_ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Resumen del día", icon: "home-outline", route: "/dashboard" },
  { label: "Movimientos", icon: "swap-vertical-outline", route: "/movimientos" },
  { label: "Cuentas", icon: "wallet-outline", route: "/cuentas" },
  { label: "Categorías", icon: "pricetags-outline", route: "/categorias" },
  { label: "Reportes", icon: "bar-chart-outline", route: "/reportes" },
  { label: "Configuración", icon: "settings-outline", route: "/configuracion" },
];

function Sidebar({ visible, translateX, onClose }: SidebarProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50" pointerEvents="box-none">
      <Pressable
        onPress={onClose}
        className="absolute inset-0 bg-black/40"
        accessibilityLabel="Cerrar menú"
      />
      <Animated.View
        style={{ transform: [{ translateX }], width: SIDEBAR_WIDTH }}
        className="absolute left-0 top-0 h-full bg-white"
      >
        <View className="h-16 flex-row items-center justify-between px-4 border-b border-[#E7E0EC]">
          <Text className="text-base font-medium text-[#1C1B1F]">Menú</Text>
          <Pressable
            onPress={onClose}
            className="w-9 h-9 rounded-full items-center justify-center"
            accessibilityLabel="Cerrar"
          >
            <Ionicons name="close" size={20} color="#1C1B1F" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 pt-2">
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => {
                onClose();
                router.push(item.route as any);
              }}
              className="flex-row items-center gap-3 px-5 py-3 active:bg-[#F1EEF4]"
            >
              <Ionicons name={item.icon} size={20} color="#49454F" />
              <Text className="text-sm text-[#1C1B1F]">{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => {
            onClose();
            router.replace("/login" as any);
          }}
          className="flex-row items-center gap-3 px-5 py-4 border-t border-[#E7E0EC]"
        >
          <Ionicons name="log-out-outline" size={20} color={ROJO} />
          <Text className="text-sm" style={{ color: ROJO }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ---------- Tarjeta de gráfica de pastel ----------

function PieCard({
  titulo,
  total,
  data,
  colorTotal,
  vacio,
}: {
  titulo: string;
  total: number;
  data: ReturnType<typeof buildPieData>;
  colorTotal: string;
  vacio: string;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      <Text className="text-sm font-medium text-[#1C1B1F] mb-4">{titulo}</Text>

      {data.length === 0 ? (
        <Text className="text-sm text-[#79747E] py-6 text-center">{vacio}</Text>
      ) : (
        <View className="items-center">
          <PieChart
            data={data}
            donut
            radius={78}
            innerRadius={50}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-[11px] text-[#79747E]">Total</Text>
                <Text className="text-sm font-medium" style={{ color: colorTotal }}>
                  {formatCurrency(total)}
                </Text>
              </View>
            )}
          />

          <View className="w-full mt-5 gap-2.5">
            {data.map((item) => (
              <View key={item.categoria} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 shrink">
                  <View
                    style={{ backgroundColor: item.color }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  <Text className="text-xs text-[#1C1B1F]" numberOfLines={1}>
                    {item.categoria}
                  </Text>
                </View>
                <Text className="text-xs text-[#49454F]">
                  {item.porcentaje}% · {formatCurrency(item.monto)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ---------- Pantalla principal ----------

const AdminHomeScreen = () => {
  const { obtenerUsuarioActual, loading } = useUsuario();
  const {isAuthenticated} = useAuth();

  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(CUENTAS[0]);
  const [selectorCuentaVisible, setSelectorCuentaVisible] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    const fetchObtenerUsuario = async () => {
      
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      const result = await obtenerUsuarioActual();

      if (!result.empresa) {
        router.replace("/empresa/crear");
      }
    };
    fetchObtenerUsuario();
  }, [obtenerUsuarioActual]);

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(translateX, {
      toValue: -SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  };

  // TODO: sustituir por datos reales (API) filtrados al día actual
  const movimientosDelDia = useMemo(() => {
    return MOVIMIENTOS_MOCK.filter(
      (m) => cuentaSeleccionada === "Todas las cuentas" || m.cuenta === cuentaSeleccionada
    );
  }, [cuentaSeleccionada]);

  const gastos = useMemo(
    () => movimientosDelDia.filter((m) => m.tipo === "gasto"),
    [movimientosDelDia]
  );
  const ingresos = useMemo(
    () => movimientosDelDia.filter((m) => m.tipo === "ingreso"),
    [movimientosDelDia]
  );

  const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
  const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
  const balance = totalIngresos - totalGastos;

  const dataGastos = useMemo(() => buildPieData(gastos, PALETA_GASTOS), [gastos]);
  const dataIngresos = useMemo(() => buildPieData(ingresos, PALETA_INGRESOS), [ingresos]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={AZUL} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F1EEF4]">
      {/* Top app bar */}
      <View className="h-16 shrink-0 bg-white flex-row items-center justify-between px-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <Pressable
          onPress={openSidebar}
          className="w-10 h-10 rounded-full items-center justify-center"
          accessibilityLabel="Abrir menú"
        >
          <Ionicons name="menu" size={22} color="#1C1B1F" />
        </Pressable>
        <Text className="text-base font-medium text-[#1C1B1F]">Resumen del día</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
      >
        {/* Selector de cuenta */}
        <Pressable
          onPress={() => setSelectorCuentaVisible(true)}
          className="flex-row items-center justify-between bg-white rounded-2xl px-4 h-14 border border-[#E7E0EC]"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="wallet-outline" size={18} color={AZUL} />
            <Text className="text-sm text-[#1C1B1F]">{cuentaSeleccionada}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#49454F" />
        </Pressable>

        {/* Tarjetas resumen */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: AZUL_CONTAINER }}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="arrow-up-circle" size={16} color={AZUL} />
              <Text className="text-xs text-[#001B3D]">Ingresos de hoy</Text>
            </View>
            <Text className="text-lg font-medium text-[#001B3D]">
              {formatCurrency(totalIngresos)}
            </Text>
          </View>

          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: AMARILLO_CONTAINER }}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="arrow-down-circle" size={16} color={AMARILLO} />
              <Text className="text-xs text-[#2A1F00]">Gastos de hoy</Text>
            </View>
            <Text className="text-lg font-medium text-[#2A1F00]">
              {formatCurrency(totalGastos)}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between">
          <Text className="text-sm text-[#49454F]">Balance del día</Text>
          <Text
            className="text-sm font-medium"
            style={{ color: balance >= 0 ? AZUL : ROJO }}
          >
            {balance >= 0 ? "+" : ""}
            {formatCurrency(balance)}
          </Text>
        </View>

        {/* Botones agregar */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/movimientos/nuevo?tipo=ingreso" as any)}
            className="flex-1 h-12 rounded-full flex-row items-center justify-center gap-1.5"
            style={{ backgroundColor: AZUL }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white">Ingreso</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/movimientos/nuevo?tipo=gasto" as any)}
            className="flex-1 h-12 rounded-full flex-row items-center justify-center gap-1.5 border-2"
            style={{ borderColor: AMARILLO }}
          >
            <Ionicons name="add" size={18} color={AMARILLO} />
            <Text className="text-sm font-medium" style={{ color: AMARILLO }}>
              Gasto
            </Text>
          </Pressable>
        </View>

        {/* Gráficas */}
        <PieCard
          titulo="Gastos por categoría"
          total={totalGastos}
          data={dataGastos}
          colorTotal={AMARILLO}
          vacio="Aún no registras gastos hoy."
        />
        <PieCard
          titulo="Ingresos por categoría"
          total={totalIngresos}
          data={dataIngresos}
          colorTotal={AZUL}
          vacio="Aún no registras ingresos hoy."
        />
      </ScrollView>

      {/* Selector de cuenta (modal) */}
      <Modal visible={selectorCuentaVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-8"
          onPress={() => setSelectorCuentaVisible(false)}
        >
          <View className="w-full bg-white rounded-2xl overflow-hidden">
            {CUENTAS.map((cuenta) => (
              <Pressable
                key={cuenta}
                onPress={() => {
                  setCuentaSeleccionada(cuenta);
                  setSelectorCuentaVisible(false);
                }}
                className="flex-row items-center justify-between px-5 py-4 active:bg-[#F1EEF4]"
              >
                <Text className="text-sm text-[#1C1B1F]">{cuenta}</Text>
                {cuenta === cuentaSeleccionada && (
                  <Ionicons name="checkmark" size={18} color={AZUL} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Menú lateral */}
      <Sidebar visible={sidebarVisible} translateX={translateX} onClose={closeSidebar} />
    </View>
  );
};

export default AdminHomeScreen;
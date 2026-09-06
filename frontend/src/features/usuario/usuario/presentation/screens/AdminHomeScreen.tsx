import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { router } from "expo-router";
import { useUsuario } from "../../hook/useUsuario";
import { useAuth } from "@/features/usuario/auth/presentation/hook/useAuth";
import { CuentaDto } from "@/features/cuenta/domain/types/cuenta.types";
import { AMARILLO, AMARILLO_CONTAINER, AZUL, AZUL_CONTAINER, ROJO } from "@/types/colors";
import { ROUTES } from "@/routes/routes";

const PALETA_INGRESOS = ["#1857B6", "#3568C4", "#5580D1", "#7A9BDE", "#A9C1EA"];
const PALETA_GASTOS = ["#8A6D00", "#B98600", "#D9A400", "#F0BE33", "#FFD666"];


// ---------- Tipos y datos de ejemplo ----------
// Sustituye MOVIMIENTOS_MOCK y CUENTAS por tus datos reales (API / store).

interface Movimiento {
  id: string;
  tipo: "ingreso" | "gasto";
  categoria: string;
  monto: number;
  cuenta: string;
}

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
  const { obtenerUsuarioActual, loading, usuario } = useUsuario();
  const { isAuthenticated } = useAuth();

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

  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaDto | null>(null);
  const [selectorCuentaVisible, setSelectorCuentaVisible] = useState(false);

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
            <Text className="text-sm text-[#1C1B1F]">{cuentaSeleccionada?.nombre || "Todas las cuentas"}</Text>
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
            onPress={() => router.push(ROUTES.ADMIN.MOVIMIENTOS.CREAR_INGRESO as any)}
            className="flex-1 h-12 rounded-full flex-row items-center justify-center gap-1.5"
            style={{ backgroundColor: AZUL }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white">Ingreso</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.MOVIMIENTOS.CREAR_GASTO as any)}
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
      <Modal
        visible={selectorCuentaVisible}
        transparent
        animationType="fade"
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-8"
          onPress={() => setSelectorCuentaVisible(false)}
        >
          <View className="w-full bg-white rounded-2xl overflow-hidden">

            {/* Todas las cuentas */}
            <Pressable
              onPress={() => {
                setCuentaSeleccionada(null);
                setSelectorCuentaVisible(false);
              }}
              className="flex-row items-center justify-between px-5 py-4 active:bg-[#F1EEF4]"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color="#6B6870"
                />

                <Text className="text-sm text-[#1C1B1F] ml-3">
                  Todas las cuentas
                </Text>
              </View>

              {cuentaSeleccionada === null && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={AZUL}
                />
              )}
            </Pressable>

            {/* Separador */}
            {(usuario?.empresa?.cuentas?.length ?? 0) > 0 && (
              <View className="h-[1px] bg-[#E8E5EA]" />
            )}

            {/* Cuentas */}
            {usuario?.empresa.cuentas?.length === 0 ? (
              <View className="px-5 py-6 items-center">
                <Ionicons
                  name="wallet-outline"
                  size={32}
                  color="#8A8790"
                />

                <Text className="text-sm text-[#6B6870] text-center mt-2">
                  No tienes cuentas registradas
                </Text>
              </View>
            ) : (
              usuario?.empresa.cuentas?.map((cuenta) => (
                <Pressable
                  key={cuenta.id}
                  onPress={() => {
                    setCuentaSeleccionada(cuenta);
                    setSelectorCuentaVisible(false);
                  }}
                  className="flex-row items-center justify-between px-5 py-4 active:bg-[#F1EEF4]"
                >
                  <Text className="text-sm text-[#1C1B1F]">
                    {cuenta.nombre}
                  </Text>

                  {cuenta.id === cuentaSeleccionada?.id && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={AZUL}
                    />
                  )}
                </Pressable>
              ))
            )}

          </View>
        </Pressable>
      </Modal>

    </View>
  );
};

export default AdminHomeScreen;
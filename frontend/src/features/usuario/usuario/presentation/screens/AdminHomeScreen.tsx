import PieCard from "@/components/graficas/PieCard";
import { CuentaDto } from "@/features/cuenta/domain/types/cuenta.types";
import { useCuenta } from "@/features/cuenta/presentation/hook/useCuenta";
import { useEmpresa } from "@/features/empresa/presentation/hook/useEmpresa";
import { TipoMovimiento } from "@/features/movimiento/domain/enum/TipoMovimiento";
import { useMovimientos } from "@/features/movimiento/presentation/hook/useMovimientos";
import { useAuth } from "@/features/usuario/auth/presentation/hook/useAuth";
import { buildPieData, formatCurrency } from "@/helpers/FormatHelpers";
import { ROUTES } from "@/routes/routes";
import { AMARILLO, AMARILLO_CONTAINER, AZUL, AZUL_CONTAINER, ROJO } from "@/types/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useUsuario } from "../../hook/useUsuario";

const PALETA_INGRESOS = ["#1857B6", "#3568C4", "#5580D1", "#7A9BDE", "#A9C1EA"];
const PALETA_GASTOS = ["#8A6D00", "#B98600", "#D9A400", "#F0BE33", "#FFD666"];

// ---------- Pantalla principal ----------

const AdminHomeScreen = () => {
  const { obtenerUsuarioActual, desactivarUsuarioActual, loading, usuario } = useUsuario();
  const { isAuthenticated, logout } = useAuth();
  const { desactivarEmpresaActual } = useEmpresa();
  const { movimientos, error, findByDate } = useMovimientos();
  const { desactivarCuenta } = useCuenta();

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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    findByDate(`${today}T00:00:00`);
  }, [findByDate]);

  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaDto | null>(null);
  const [selectorCuentaVisible, setSelectorCuentaVisible] = useState(false);

  const confirmarDesactivacionCuenta = (cuenta: CuentaDto) => {
    Alert.alert("Desactivar cuenta", `¿Desactivar ${cuenta.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar",
        style: "destructive",
        onPress: () => {
          void desactivarCuenta(cuenta.id)
            .then(() => {
              if (cuentaSeleccionada?.id === cuenta.id) setCuentaSeleccionada(null);
            })
            .catch((cause: unknown) => Alert.alert(
              "No se pudo desactivar",
              typeof cause === "string" ? cause : "Intenta nuevamente más tarde."
            ));
        },
      },
    ]);
  };

  const confirmarDesactivacionUsuario = () => {
    Alert.alert("Desactivar usuario", "Tu acceso se desactivará y tendrás que cerrar sesión.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar usuario",
        style: "destructive",
        onPress: () => {
          void desactivarUsuarioActual()
            .then(async () => {
              await logout();
              router.replace("/login");
            })
            .catch((cause: unknown) => Alert.alert(
              "No se pudo desactivar",
              typeof cause === "string" ? cause : "Intenta nuevamente más tarde."
            ));
        },
      },
    ]);
  };

  const confirmarDesactivacionEmpresa = () => {
    Alert.alert("Desactivar empresa", "La empresa dejará de estar disponible para todos sus usuarios.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar empresa",
        style: "destructive",
        onPress: () => {
          void desactivarEmpresaActual()
            .then(async () => {
              await logout();
              router.replace("/login");
            })
            .catch((cause: unknown) => Alert.alert(
              "No se pudo desactivar",
              typeof cause === "string" ? cause : "Intenta nuevamente más tarde."
            ));
        },
      },
    ]);
  };

  const movimientosDelDia = useMemo(() => {
    return movimientos.filter(
      (m) => cuentaSeleccionada === null || m.cuentaId === cuentaSeleccionada?.id
    );
  }, [cuentaSeleccionada, movimientos]);

  const gastos = useMemo(
    () => movimientosDelDia.filter((m) => m.tipo === TipoMovimiento.EGRESO),
    [movimientosDelDia]
  );
  const ingresos = useMemo(
    () => movimientosDelDia.filter((m) => m.tipo === TipoMovimiento.INGRESO),
    [movimientosDelDia]
  );

  const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
  const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
  const balance = totalIngresos - totalGastos;

  const dataGastos = useMemo(() => buildPieData(gastos, PALETA_GASTOS), [gastos]);
  const dataIngresos = useMemo(() => buildPieData(ingresos, PALETA_INGRESOS), [ingresos]);

  const saldoMostrado = cuentaSeleccionada
    ? Number(cuentaSeleccionada.saldo || 0)
    : usuario?.empresa.cuentas.reduce(
      (total, cuenta) => total + Number(cuenta.saldo || 0),
      0
    );

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
            <View className="flex-row items-center">
              <Text className="text-sm text-[#1C1B1F]">
                {cuentaSeleccionada?.nombre || "Todas las cuentas"}
              </Text>

              <View className="ml-2 rounded-full bg-green-50 px-2 py-0.5">
                <Text className="text-xs font-semibold text-green-700">
                  ${saldoMostrado?.toFixed(2)}
                </Text>
              </View>
            </View>
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

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`${ROUTES.ADMIN.MOVIMIENTOS.CREAR_COMPRA}${cuentaSeleccionada ? `?cuentaId=${cuentaSeleccionada.id}` : ""}` as any)}
          className="h-12 flex-row items-center justify-center gap-2 rounded-full border-2 border-[#1857B6] bg-white"
        >
          <Ionicons name="cart-outline" size={18} color={AZUL} />
          <Text className="text-sm font-semibold text-[#1857B6]">Comprar material</Text>
        </Pressable>

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

        <View className="border-t border-[#D8D4DC] pt-4">
          <Text className="mb-2 text-xs font-semibold uppercase text-[#79747E]">Administración</Text>
          <Pressable
            accessibilityRole="button"
            onPress={confirmarDesactivacionUsuario}
            className="flex-row items-center gap-2 py-3"
          >
            <Ionicons name="person-remove-outline" size={18} color="#B3261E" />
            <Text className="text-sm font-medium text-[#B3261E]">Desactivar mi usuario</Text>
          </Pressable>
          {usuario?.rol === "ADMINISTRADOR" && (
            <Pressable
              accessibilityRole="button"
              onPress={confirmarDesactivacionEmpresa}
              className="flex-row items-center gap-2 py-3"
            >
              <Ionicons name="business-outline" size={18} color="#B3261E" />
              <Text className="text-sm font-medium text-[#B3261E]">Desactivar empresa</Text>
            </Pressable>
          )}
        </View>
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
                <View key={cuenta.id} className="flex-row items-center px-3">
                  <Pressable
                    onPress={() => {
                      setCuentaSeleccionada(cuenta);
                      setSelectorCuentaVisible(false);
                    }}
                    className="flex-1 flex-row items-center justify-between py-4 pl-2 active:bg-[#F1EEF4]"
                  >
                    <Text className="text-sm text-[#1C1B1F]">{cuenta.nombre}</Text>
                    {cuenta.id === cuentaSeleccionada?.id && <Ionicons name="checkmark" size={18} color={AZUL} />}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Desactivar cuenta ${cuenta.nombre}`}
                    onPress={() => confirmarDesactivacionCuenta(cuenta)}
                    className="h-9 w-9 items-center justify-center"
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={17} color="#B3261E" />
                  </Pressable>
                </View>
              ))
            )}

          </View>
        </Pressable>
      </Modal>

    </View>
  );
};

export default AdminHomeScreen;
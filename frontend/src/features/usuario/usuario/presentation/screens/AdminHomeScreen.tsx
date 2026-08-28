import { useAuth } from "@/features/usuario/auth/presentation/hook/useAuth";
import { Header, Text } from "expo-router/build/react-navigation";
import { ActivityIndicator, View } from "react-native";
import { useUsuario } from "../../hook/useUsuario";
import { useEffect } from "react";

const DashboardScreen = () => {
  const { usuario, obtenerUsuarioActual, loading } = useUsuario();

  useEffect(() => {

    const fetchObtenerUsuario = async () => {
      const result = await obtenerUsuarioActual();
    }
    fetchObtenerUsuario();

  }, [obtenerUsuarioActual]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">

        <Text>{"Hola mundo"}</Text>
      </View>
    </View>
  );
};

export default DashboardScreen;
import { useAuth } from "@/features/usuario/auth/presentation/hook/useAuth";
import { Header, Text } from "expo-router/build/react-navigation";
import { ActivityIndicator, View } from "react-native";

const DashboardScreen = () => {
  return (
    <View className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
  
                <Text>{"Hola mundo"}</Text>
        </View>
    </View>
  );
};

export default DashboardScreen;
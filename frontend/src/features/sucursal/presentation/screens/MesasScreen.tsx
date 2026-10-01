import ModalHeader from "@/components/modal/ModalHeader";
import { useMesa } from "@/features/mesa/presentation/hook/useMesa";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useSucursal } from "../hook/useSucursal";

const ESTADO_LABELS: Record<string, string> = {
    LIBRE: "Libre",
    OCUPADA: "Ocupada",
    RESERVADA: "Reservada",
};

/** Módulo de mesas de la sucursal actual. */
const MesasScreen = () => {
    const { sucursalActual } = useSucursal();
    const { mesas, loading, saving, error, cargarMesas, crearMesa, limpiarError } = useMesa();
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState("");
    const [numero, setNumero] = useState("");

    useEffect(() => {
        if (sucursalActual?.id) cargarMesas(sucursalActual.id);
    }, [sucursalActual?.id, cargarMesas]);

    const abrirModal = () => {
        limpiarError();
        setNombre("");
        setNumero("");
        setModalVisible(true);
    };

    const guardarMesa = async () => {
        if (!sucursalActual?.id || !nombre.trim()) return;
        try {
            await crearMesa({
                nombre: nombre.trim(),
                numero: numero.trim() ? Number(numero) : undefined,
                sucursalId: sucursalActual.id,
            }).unwrap();
            setModalVisible(false);
        } catch {
            // El error se presenta desde el estado del feature.
        }
    };

    return (
        <View className="flex-1 bg-[#F1EEF4] px-4 pt-4">
            <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-xs text-[#79747E]">Mesas · {sucursalActual?.nombre}</Text>
                <Pressable
                    onPress={abrirModal}
                    className="flex-row items-center gap-1 rounded-lg bg-[#1857B6] px-3 py-2"
                >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text className="text-xs font-semibold text-white">Nueva mesa</Text>
                </Pressable>
            </View>
            {loading ? <Text className="text-sm text-[#79747E]">Cargando mesas...</Text> : null}
            {!loading && mesas.length === 0 ? (
                <Text className="text-sm text-[#79747E]">No hay mesas registradas en esta sucursal.</Text>
            ) : null}
            <FlatList
                data={mesas}
                keyExtractor={(item) => String(item.id)}
                numColumns={3}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => {
                    const ocupada = item.estado === "OCUPADA";
                    return (
                        <View
                            className={`flex-1 aspect-square rounded-2xl items-center justify-center border ${ocupada ? "bg-[#FDE2E1] border-[#B3261E]" : "bg-white border-[#E7E0EC]"}`}
                        >
                            <Text className={`text-sm font-medium ${ocupada ? "text-[#B3261E]" : "text-[#1C1B1F]"}`}>
                                {item.nombre}
                            </Text>
                            <Text className="text-xs text-[#79747E] mt-1">
                                {item.estado ? ESTADO_LABELS[item.estado] : ""}
                            </Text>
                        </View>
                    );
                }}
            />

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="rounded-t-3xl bg-white">
                        <ModalHeader title="Nueva mesa" onClose={() => setModalVisible(false)} />
                        <View className="px-4 py-4">
                            {error ? <Text className="mb-2 text-xs text-[#B3261E]">{error}</Text> : null}
                            <Text className="mb-1 text-xs font-medium text-[#49454F]">Nombre</Text>
                            <TextInput
                                value={nombre}
                                onChangeText={setNombre}
                                placeholder="Ej. Mesa 1"
                                placeholderTextColor="#79747E"
                                className="mb-3 rounded-lg border border-[#D8D2DC] px-3 py-2 text-sm text-[#1C1B1F]"
                                autoFocus
                            />
                            <Text className="mb-1 text-xs font-medium text-[#49454F]">Número (opcional)</Text>
                            <TextInput
                                value={numero}
                                onChangeText={setNumero}
                                keyboardType="number-pad"
                                placeholder="Ej. 1"
                                placeholderTextColor="#79747E"
                                className="mb-4 rounded-lg border border-[#D8D2DC] px-3 py-2 text-sm text-[#1C1B1F]"
                            />
                            <Pressable
                                disabled={!nombre.trim() || saving}
                                onPress={guardarMesa}
                                className={`items-center rounded-lg px-4 py-3 ${!nombre.trim() || saving ? "bg-[#B8B3BC]" : "bg-[#1857B6]"}`}
                            >
                                <Text className="font-semibold text-white">{saving ? "Guardando..." : "Crear mesa"}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default MesasScreen;


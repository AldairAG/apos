import ModalHeader from "@/components/modal/ModalHeader";
import type { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { Ionicons } from "@expo/vector-icons";
import { Modal as RNModal, Pressable, ScrollView, Text, View } from "react-native";

interface TableSelectorProps {
    visible: boolean;
    mesas: MesaDto[];
    loading?: boolean;
    onSelect: (mesa: MesaDto) => void;
    onClose: () => void;
}

interface MesaStatus {
    mesa: MesaDto;
    estado: "disponible" | "ocupada";
    resumen?: {
        total: number;
        hora: string;
    };
}

export default function TableSelector({
    visible,
    mesas,
    loading,
    onSelect,
    onClose,
}: TableSelectorProps) {
    const handleSelect = (mesa: MesaDto) => {
        onSelect(mesa);
        onClose();
    };

    const getMesasState = (mesasData: MesaDto[]): MesaStatus[] => {
        // Por ahora, todas las mesas que se cargan son disponibles
        // El backend podría extender esto para devolver órdenes activas
        return mesasData.map((mesa) => ({
            mesa,
            estado: "disponible",
            // TODO: obtener estado y resumen de la orden activa si existe
            // Esta información debería venir del backend
        }));
    };

    const mesasState = getMesasState(mesas);

    return (
        <RNModal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[80%]">
                    <ModalHeader title="Seleccionar mesa" onClose={onClose} />

                    <ScrollView className="px-4 py-4" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                        {loading ? (
                            <Text className="text-sm text-[#79747E] text-center py-8">
                                Cargando mesas...
                            </Text>
                        ) : mesas.length === 0 ? (
                            <View className="items-center py-8">
                                <Ionicons name="alert-circle-outline" size={32} color="#B3261E" />
                                <Text className="text-sm text-[#79747E] text-center mt-3">
                                    No hay mesas disponibles en esta sucursal.
                                </Text>
                            </View>
                        ) : (
                            mesasState.map(({ mesa }) => (
                                <Pressable
                                    key={mesa.id}
                                    onPress={() => handleSelect(mesa)}
                                    className="px-4 py-4 rounded-xl border-2 border-[#E7E0EC] bg-white active:bg-[#F1EEF4]"
                                >
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="grid-outline" size={18} color="#1857B6" />
                                                <Text className="text-base font-semibold text-[#1C1B1F]">
                                                    {mesa.nombre}
                                                </Text>
                                            </View>
                                            <Text className="mt-2 text-xs text-[#79747E]">
                                                {mesa.numero !== undefined ? `Mesa #${mesa.numero}` : ""}
                                                {mesa.capacidad !== undefined ? ` · Capacidad: ${mesa.capacidad}` : ""}
                                            </Text>
                                            <Text className="mt-1 text-xs font-medium text-[#2E7D32]">
                                                ✓ Disponible
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#B8B3BC" />
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </RNModal>
    );
}

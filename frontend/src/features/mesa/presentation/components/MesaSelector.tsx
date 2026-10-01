import ModalHeader from "@/components/modal/ModalHeader";
import type { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { Pressable, Modal as RNModal, ScrollView, Text, View } from "react-native";

interface MesaSelectorProps {
    visible: boolean;
    mesas: MesaDto[];
    loading?: boolean;
    onSelect: (mesa: MesaDto) => void;
    onClose: () => void;
}

/**
 * Modal de selección de una mesa libre, para usarse al crear una orden "en mesa".
 * Recibe las mesas ya cargadas por `useMesa` — no realiza llamadas HTTP.
 */
export default function MesaSelector({
    visible,
    mesas,
    loading,
    onSelect,
    onClose,
}: MesaSelectorProps) {
    const handleSelect = (mesa: MesaDto) => {
        onSelect(mesa);
        onClose();
    };

    return (
        <RNModal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[80%]">
                    <ModalHeader title="Seleccionar mesa" onClose={onClose} />

                    <ScrollView className="px-4 py-4" contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
                        {loading ? (
                            <Text className="text-sm text-[#79747E] text-center py-8">
                                Cargando mesas...
                            </Text>
                        ) : mesas.length === 0 ? (
                            <Text className="text-sm text-[#79747E] text-center py-8">
                                No hay mesas disponibles en esta sucursal.
                            </Text>
                        ) : (
                            mesas.map((m) => (
                                <Pressable
                                    key={m.id}
                                    onPress={() => handleSelect(m)}
                                    className="px-4 py-3 rounded-xl border border-[#E7E0EC]"
                                >
                                    <Text className="text-sm font-medium text-[#1C1B1F]">
                                        {m.nombre}{m.numero !== undefined ? ` · #${m.numero}` : ""}
                                    </Text>
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </RNModal>
    );
}

import ModalHeader from "@/components/modal/ModalHeader";
import { MaterialDto } from "@/features/material/domain/types/material.types";
import { useMemo, useState } from "react";
import { Pressable, Modal as RNModal, ScrollView, Text, TextInput, View } from "react-native";

interface MaterialSelectorProps {
    visible: boolean;
    materiales: MaterialDto[];
    onSelect: (material: MaterialDto) => void;
    onClose: () => void;
}

/**
 * Modal de selección de un material existente, para usarse en formularios
 * que arman listas (p. ej. detalles de una receta). Recibe los materiales ya
 * cargados por el hook correspondiente — no realiza llamadas HTTP.
 */
export default function MaterialSelector({
    visible,
    materiales,
    onSelect,
    onClose,
}: MaterialSelectorProps) {
    const [busqueda, setBusqueda] = useState("");

    const materialesFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return materiales;
        return materiales.filter((m) => m.nombre.toLowerCase().includes(q));
    }, [materiales, busqueda]);

    const handleSelect = (material: MaterialDto) => {
        onSelect(material);
        setBusqueda("");
        onClose();
    };

    return (
        <RNModal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[80%]">
                    <ModalHeader title="Seleccionar material" onClose={onClose} />

                    <View className="px-4 pt-4">
                        <TextInput
                            className="border border-[#E7E0EC] rounded-xl px-4 py-3 text-base text-[#1C1B1F]"
                            placeholder="Buscar material..."
                            placeholderTextColor="#79747E"
                            value={busqueda}
                            onChangeText={setBusqueda}
                        />
                    </View>

                    <ScrollView className="px-4 py-4" contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
                        {materialesFiltrados.length === 0 ? (
                            <Text className="text-sm text-[#79747E] text-center py-8">
                                No se encontraron materiales.
                            </Text>
                        ) : (
                            materialesFiltrados.map((m) => (
                                <Pressable
                                    key={m.id}
                                    onPress={() => handleSelect(m)}
                                    className="px-4 py-3 rounded-xl border border-[#E7E0EC]"
                                >
                                    <Text className="text-sm font-medium text-[#1C1B1F]">{m.nombre}</Text>
                                    {!!m.proveedor && (
                                        <Text className="text-xs text-[#79747E] mt-0.5">{m.proveedor}</Text>
                                    )}
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </RNModal>
    );
}

import ModalHeader from "@/components/modal/ModalHeader";
import {
    TIPO_UNIDAD_LABELS,
    TipoUnidadMedida,
    UNIDAD_MEDIDA_LABELS,
    UNIDAD_TIPO,
    UnidadMedida,
} from "@/features/material/domain/types/material.types";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const TABS = Object.values(TipoUnidadMedida);

interface UnidadMedidaSelectorProps {
    visible: boolean;
    value: UnidadMedida | "";
    onChange: (unidad: UnidadMedida) => void;
    onClose: () => void;
}

/**
 * Modal con tabs (Masa / Volumen / Pieza) para elegir una `UnidadMedida`.
 * Reutiliza `ModalHeader` y las clases de Appos ya usadas en las pantallas de material.
 */
export default function UnidadMedidaSelector({
    visible,
    value,
    onChange,
    onClose,
}: UnidadMedidaSelectorProps) {
    const tabInicial = value ? UNIDAD_TIPO[value] : TipoUnidadMedida.MASA;
    const [tab, setTab] = useState<TipoUnidadMedida>(tabInicial);

    const unidadesTab = Object.values(UnidadMedida).filter((u) => UNIDAD_TIPO[u] === tab);

    const handleSelect = (unidad: UnidadMedida) => {
        onChange(unidad);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[80%]">
                    <ModalHeader title="Unidad de medida" onClose={onClose} />

                    <View className="flex-row bg-[#F1EEF4] rounded-xl p-1 mx-4 mt-4">
                        {TABS.map((t) => {
                            const activo = t === tab;
                            return (
                                <Pressable
                                    key={t}
                                    onPress={() => setTab(t)}
                                    className={`flex-1 items-center py-2 rounded-lg ${activo ? "bg-white" : ""}`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            activo ? "text-[#1857B6]" : "text-[#79747E]"
                                        }`}
                                    >
                                        {TIPO_UNIDAD_LABELS[t]}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <ScrollView className="px-4 py-4" contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
                        {unidadesTab.map((u) => {
                            const seleccionado = value === u;
                            return (
                                <Pressable
                                    key={u}
                                    onPress={() => handleSelect(u)}
                                    className={`px-4 py-3 rounded-xl border ${
                                        seleccionado ? "bg-[#1857B6] border-[#1857B6]" : "border-[#E7E0EC]"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            seleccionado ? "text-white" : "text-[#1C1B1F]"
                                        }`}
                                    >
                                        {UNIDAD_MEDIDA_LABELS[u]}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

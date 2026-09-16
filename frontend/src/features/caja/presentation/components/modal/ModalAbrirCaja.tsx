// --- Modal: abrir caja ---

import ModalHeader from "@/components/modal/ModalHeader";
import { Pressable, Text, View } from "react-native";
import { Modal } from "react-native";

function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}

function ModalAbrirCaja({
    visible,
    onClose,
    onAbrir,
    saldoInicial,
}: {
    visible: boolean;
    onClose: () => void;
    onAbrir: (saldoInicial: number) => void;
    saldoInicial: number;
}) {
    const handleAbrir = () => {
        onAbrir(saldoInicial);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl">
                    <ModalHeader title="Abrir caja" onClose={onClose} />
                    <View className="px-4 pt-6 pb-8">
                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Saldo inicial</Text>
                        <View className="border border-[#E7E0EC] rounded-xl px-4 py-3 mb-1 bg-[#F1EEF4]">
                            <Text className="text-base text-[#1C1B1F]">{formatMoney(saldoInicial)}</Text>
                        </View>
                        <Text className="text-xs text-[#79747E] mb-6">
                            Este monto se asigna automáticamente al abrir la caja.
                        </Text>

                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={onClose}
                                className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                            >
                                <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAbrir}
                                className="flex-1 bg-[#1857B6] rounded-xl py-3 items-center"
                            >
                                <Text className="text-sm font-semibold text-white">Abrir caja</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalAbrirCaja;
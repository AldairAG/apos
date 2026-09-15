import * as Yup from "yup";


// --- Modal: crear caja ---

import { Formik, FormikHelpers } from "formik";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import ModalHeader from "@/components/modal/ModalHeader";

interface CrearCajaForm {
    nombre: string;
}

export default function ModalCrearCaja({
    visible,
    onClose,
    onCrear,
}: {
    visible: boolean;
    onClose: () => void;
    onCrear: (nombre: string) => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl">
                    <ModalHeader title="Nueva caja" onClose={onClose} />
                    <View className="px-4 pt-6 pb-8">
                        <Formik<CrearCajaForm>
                            initialValues={{ nombre: "" }}
                            validationSchema={Yup.object({
                                nombre: Yup.string()
                                    .trim()
                                    .required("El nombre de la caja es obligatorio")
                                    .min(3, "Debe tener al menos 3 caracteres")
                                    .max(50, "No puede superar los 50 caracteres"),
                            })}
                            onSubmit={(values, helpers: FormikHelpers<CrearCajaForm>) => {
                                onCrear(values.nombre.trim());
                                helpers.resetForm();
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <View>
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Nombre</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${touched.nombre && errors.nombre ? "border-[#B3261E]" : "border-[#E7E0EC]"
                                            }`}
                                        placeholder="Ej. Caja Terraza"
                                        placeholderTextColor="#79747E"
                                        value={values.nombre}
                                        onChangeText={handleChange("nombre")}
                                        onBlur={handleBlur("nombre")}
                                        autoFocus
                                    />
                                    {touched.nombre && errors.nombre ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.nombre}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}

                                    <View className="flex-row gap-3 mt-4">
                                        <Pressable
                                            onPress={onClose}
                                            className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            className="flex-1 bg-[#1857B6] rounded-xl py-3 items-center"
                                        >
                                            <Text className="text-sm font-semibold text-white">Crear caja</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
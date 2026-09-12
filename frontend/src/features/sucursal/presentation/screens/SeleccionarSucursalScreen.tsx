import { rutaSucursal } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import * as Yup from "yup";
import { useSucursal } from "../hook/useSucursal";

interface CrearSucursalForm {
    nombre: string;
}

const crearSucursalInitialValues: CrearSucursalForm = {
    nombre: "",
};

const crearSucursalValidationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre de la sucursal es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(80, "El nombre no puede superar los 80 caracteres"),
});

/**
 * Pantalla para seleccionar la sucursal con la que se va a trabajar.
 * Al elegir una sucursal, sincroniza Redux y navega a su dashboard
 * (app/(admin)/sucursal/[sucursalId]).
 * Incluye una modal interna para crear una nueva sucursal.
 */
const SeleccionarSucursalScreen = () => {
    const router = useRouter();
    const { sucursales, cambiarSucursal, loading } = useSucursal();
    // TODO: si useSucursal expone una acción para crear (ej. crearSucursal(nombre)),
    // desestructúrala aquí y úsala en handleCrearSucursal en vez del TODO de abajo.

    const [modalCrearVisible, setModalCrearVisible] = useState(false);

    const seleccionar = (id: string) => {
        cambiarSucursal(id);
        router.push(rutaSucursal(id) as any);
    };

    const abrirModalCrear = () => setModalCrearVisible(true);
    const cerrarModalCrear = () => setModalCrearVisible(false);

    // TODO: implementar el envío real (llamar al service/thunk de sucursal,
    // refrescar `sucursales` al terminar) y luego cerrar la modal.
    const handleCrearSucursal = (
        values: CrearSucursalForm,
        helpers: FormikHelpers<CrearSucursalForm>
    ) => {
        helpers.resetForm();
        cerrarModalCrear();
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#1857B6" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            {sucursales.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="business-outline" size={32} color="#79747E" />
                    <Text className="text-sm text-[#79747E] mt-3 text-center">
                        Aún no hay sucursales registradas.
                    </Text>
                    <Pressable
                        onPress={abrirModalCrear}
                        className="flex-row items-center gap-2 bg-[#1857B6] rounded-full px-5 py-3 mt-4 active:opacity-90"
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white">
                            Crear sucursal
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={sucursales}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
                    ListHeaderComponent={
                        <Pressable
                            onPress={abrirModalCrear}
                            className="flex-row items-center justify-center gap-2 bg-white rounded-2xl p-4 border border-dashed border-[#1857B6] active:bg-[#F1EEF4] mb-1"
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#1857B6" />
                            <Text className="text-sm font-medium text-[#1857B6]">
                                Nueva sucursal
                            </Text>
                        </Pressable>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => seleccionar(item.id)}
                            className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-[#E7E0EC] active:bg-[#F1EEF4]"
                        >
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-[#1C1B1F]">{item.nombre}</Text>
                                <Text className="text-xs text-[#79747E] mt-0.5">{item.direccion}</Text>
                            </View>
                            <View
                                className={`px-2 py-1 rounded-full mr-2 ${item.estado === "ACTIVA" ? "bg-[#D8E2FF]" : "bg-[#FDE2E1]"}`}
                            >
                                <Text className={`text-xs ${item.estado === "ACTIVA" ? "text-[#1857B6]" : "text-[#B3261E]"}`}>
                                    {item.estado === "ACTIVA" ? "Activa" : "Inactiva"}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#79747E" />
                        </Pressable>
                    )}
                />
            )}

            {/* FAB flotante para acceso rápido, además del botón dentro de la lista */}
            {sucursales.length > 0 && (
                <Pressable
                    onPress={abrirModalCrear}
                    className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#1857B6] items-center justify-center shadow-lg active:opacity-90"
                >
                    <Ionicons name="add" size={26} color="#FFFFFF" />
                </Pressable>
            )}

            {/* Modal para crear sucursal */}
            <Modal
                visible={modalCrearVisible}
                transparent
                animationType="slide"
                onRequestClose={cerrarModalCrear}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl">
                        {/* Header de la modal */}
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
                            <Text className="text-base font-semibold text-[#1C1B1F]">
                                Nueva sucursal
                            </Text>
                            <Pressable
                                onPress={cerrarModalCrear}
                                className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
                            >
                                <Ionicons name="close" size={20} color="#1C1B1F" />
                            </Pressable>
                        </View>

                        <View className="px-4 pt-6 pb-8">
                            <Formik
                                initialValues={crearSucursalInitialValues}
                                validationSchema={crearSucursalValidationSchema}
                                onSubmit={handleCrearSucursal}
                            >
                                {({
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur,
                                    handleSubmit: formikSubmit,
                                    isSubmitting,
                                }) => (
                                    <View>
                                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                                            Nombre de la sucursal
                                        </Text>
                                        <TextInput
                                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                                touched.nombre && errors.nombre
                                                    ? "border-[#B3261E]"
                                                    : "border-[#E7E0EC]"
                                            }`}
                                            placeholder="Ej. Sucursal Centro"
                                            placeholderTextColor="#79747E"
                                            value={values.nombre}
                                            onChangeText={handleChange("nombre")}
                                            onBlur={handleBlur("nombre")}
                                            autoFocus
                                        />
                                        {touched.nombre && errors.nombre ? (
                                            <Text className="text-[#B3261E] text-xs mb-2">
                                                {errors.nombre}
                                            </Text>
                                        ) : (
                                            <View className="mb-2" />
                                        )}

                                        <Pressable
                                            onPress={() => formikSubmit()}
                                            disabled={isSubmitting}
                                            className={`rounded-xl py-4 items-center mt-4 ${
                                                isSubmitting ? "bg-[#9EB7DE]" : "bg-[#1857B6]"
                                            }`}
                                        >
                                            <Text className="text-white text-base font-semibold">
                                                {isSubmitting ? "Creando..." : "Crear sucursal"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SeleccionarSucursalScreen;
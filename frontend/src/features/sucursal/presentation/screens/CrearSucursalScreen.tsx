import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import { Pressable, Text, TextInput, View } from "react-native";
import * as Yup from "yup";

interface CrearSucursalForm {
    nombre: string;
}

const initialValues: CrearSucursalForm = {
    nombre: "",
};

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre de la sucursal es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(80, "El nombre no puede superar los 80 caracteres"),
});

/**
 * Modal para crear una nueva sucursal.
 * Se abre como ruta modal de expo-router (app/(admin)/sucursal/crear).
 */
const CrearSucursalScreen = () => {
    const router = useRouter();

    // TODO: implementar el envío real (llamar al service/thunk de sucursal,
    // manejar loading/errores) y navegar de vuelta o refrescar el listado
    // al terminar, por ejemplo: router.back();
    const handleSubmit = (
        values: CrearSucursalForm,
        helpers: FormikHelpers<CrearSucursalForm>
    ) => {};

    return (
        <View className="flex-1 bg-white">
            {/* Header del modal */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
                <Text className="text-base font-semibold text-[#1C1B1F]">
                    Nueva sucursal
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
                >
                    <Ionicons name="close" size={20} color="#1C1B1F" />
                </Pressable>
            </View>

            <View className="px-4 pt-6">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
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
    );
};

export default CrearSucursalScreen;
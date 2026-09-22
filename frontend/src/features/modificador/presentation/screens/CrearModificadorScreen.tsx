import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FieldArray, Formik, type FormikHelpers } from "formik";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import type { ModificadorDto, OpcionDto } from "../../domain/types/modificador.types";
import { useModificador } from "../hook/useModificador";

interface OpcionForm {
    nombre: string;
    precio: string;
    costo: string;
    maximo: string;
}

interface ModificadorForm {
    nombre: string;
    opciones: OpcionForm[];
}

const initialValues: ModificadorForm = {
    nombre: "",
    opciones: [{ nombre: "", precio: "", costo: "", maximo: "1" }],
};

const opcionSchema = Yup.object({
    nombre: Yup.string().trim().required("El nombre de la opción es obligatorio"),
    precio: Yup.string().required("Indica el precio").test("numero", "Debe ser mayor o igual a 0", (value) => {
        const number = Number(value?.replace(",", "."));
        return value !== undefined && value !== "" && !Number.isNaN(number) && number >= 0;
    }),
    costo: Yup.string().required("Indica el costo").test("numero", "Debe ser mayor o igual a 0", (value) => {
        const number = Number(value?.replace(",", "."));
        return value !== undefined && value !== "" && !Number.isNaN(number) && number >= 0;
    }),
    maximo: Yup.string().required("Indica el máximo").test("numero", "Debe ser mayor o igual a 0", (value) => {
        const number = Number(value?.replace(",", "."));
        return value !== undefined && value !== "" && !Number.isNaN(number) && number >= 0;
    }),
});

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre del modificador es obligatorio")
        .min(2, "Debe tener al menos 2 caracteres"),
    opciones: Yup.array().of(opcionSchema).min(1, "Agrega al menos una opción"),
});

function parseNumber(value: string): number {
    const number = Number(value.replace(",", "."));
    return Number.isNaN(number) ? 0 : number;
}

export default function CrearModificadorScreen() {
    const router = useRouter();
    const { crearModificador } = useModificador();

    const handleSubmit = (values: ModificadorForm, helpers: FormikHelpers<ModificadorForm>) => {
        const opciones: OpcionDto[] = values.opciones.map((opcion) => ({
            nombre: opcion.nombre.trim(),
            precio: parseNumber(opcion.precio),
            costo: parseNumber(opcion.costo),
            maximo: parseNumber(opcion.maximo),
        }));
        const modificador: ModificadorDto = {
            nombre: values.nombre.trim(),
            opciones,
        };

        crearModificador(modificador);
        helpers.setSubmitting(false);
        router.back();
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
                <Text className="text-base font-semibold text-[#1C1B1F]">Nuevo modificador</Text>
                <Pressable
                    onPress={() => router.back()}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
                >
                    <Ionicons name="close" size={20} color="#1C1B1F" />
                </Pressable>
            </View>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
                    <ScrollView className="px-4 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Nombre del modificador</Text>
                        <TextInput
                            className="border border-[#E7E0EC] rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1"
                            placeholder="Ej. Tipo de leche"
                            placeholderTextColor="#79747E"
                            value={values.nombre}
                            onChangeText={handleChange("nombre")}
                            onBlur={handleBlur("nombre")}
                            autoFocus
                        />
                        {touched.nombre && errors.nombre && <Text className="text-[#B3261E] text-xs mb-3">{errors.nombre}</Text>}

                        <FieldArray name="opciones">
                            {({ push, remove }) => (
                                <View>
                                    <View className="flex-row items-center justify-between mt-3 mb-2">
                                        <Text className="text-sm font-medium text-[#1C1B1F]">Opciones</Text>
                                        <Pressable
                                            onPress={() => push({ nombre: "", precio: "", costo: "", maximo: "1" })}
                                            className="flex-row items-center gap-1"
                                        >
                                            <Ionicons name="add-circle-outline" size={18} color="#1857B6" />
                                            <Text className="text-sm font-medium text-[#1857B6]">Agregar</Text>
                                        </Pressable>
                                    </View>
                                    {values.opciones.map((opcion, index) => (
                                        <View key={index} className="border border-[#E7E0EC] rounded-2xl p-3 mb-3">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text className="text-sm font-semibold text-[#1C1B1F]">Opción {index + 1}</Text>
                                                {values.opciones.length > 1 && (
                                                    <Pressable onPress={() => remove(index)} hitSlop={8}>
                                                        <Ionicons name="trash-outline" size={18} color="#B3261E" />
                                                    </Pressable>
                                                )}
                                            </View>
                                            <TextInput
                                                className="border border-[#E7E0EC] rounded-xl px-3 py-2.5 text-base text-[#1C1B1F] mb-2"
                                                placeholder="Nombre"
                                                placeholderTextColor="#79747E"
                                                value={opcion.nombre}
                                                onChangeText={handleChange(`opciones.${index}.nombre`)}
                                                onBlur={handleBlur(`opciones.${index}.nombre`)}
                                            />
                                            <View className="flex-row gap-2">
                                                {(["precio", "costo", "maximo"] as const).map((field) => (
                                                    <TextInput
                                                        key={field}
                                                        className="flex-1 border border-[#E7E0EC] rounded-xl px-2 py-2.5 text-sm text-[#1C1B1F]"
                                                        placeholder={field[0].toUpperCase() + field.slice(1)}
                                                        placeholderTextColor="#79747E"
                                                        keyboardType="decimal-pad"
                                                        value={opcion[field]}
                                                        onChangeText={handleChange(`opciones.${index}.${field}`)}
                                                        onBlur={handleBlur(`opciones.${index}.${field}`)}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                    {typeof errors.opciones === "string" && (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.opciones}</Text>
                                    )}
                                </View>
                            )}
                        </FieldArray>

                        <Pressable
                            onPress={() => submit()}
                            disabled={isSubmitting}
                            className={`rounded-xl py-4 items-center mt-2 ${isSubmitting ? "bg-[#9EB7DE]" : "bg-[#1857B6]"}`}
                        >
                            <Text className="text-white text-base font-semibold">
                                {isSubmitting ? "Creando..." : "Crear modificador"}
                            </Text>
                        </Pressable>
                    </ScrollView>
                )}
            </Formik>
        </View>
    );
}
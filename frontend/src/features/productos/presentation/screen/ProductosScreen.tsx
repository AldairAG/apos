import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import { useCategoria } from "../../../categoria/presentation/hook/useCategoria";
import { useModificador } from "../../../modificador/presentation/hook/useModificador";
import { useReceta } from "../../../receta/presentation/hook/useReceta";
import { useSucursal } from "../../../sucursal/presentation/hook/useSucursal";
import type { ProductoDto } from "../../domain/types/producto.types";
import { useProducto } from "../hook/useProducto";
import { RecetaDto } from "@/features/receta/domain/types/receta.types";

const toNumber = (value: string) => Number(value.replace(",", "."));

interface ProductoForm {
    nombre: string;
    precio: string;
    costo: string;
    margenGanancia: string;
    disponible: boolean;
    categoriaId: number | null;
    recetaId: number | null;
    modificadorIds: number[];
}

const initialValuesFormulario: ProductoForm = {
    nombre: "",
    precio: "",
    costo: "0",
    margenGanancia: "",
    disponible: true,
    categoriaId: null,
    recetaId: null,
    modificadorIds: [],
};

const validationSchema = Yup.object({
    nombre: Yup.string().trim().required("El nombre es obligatorio"),

    precio: Yup.string()
        .required("El precio es obligatorio")
        .test("valido", "El precio debe ser un número válido mayor o igual a 0", (v) => {
            if (!v) return false;
            const n = toNumber(v);
            return Number.isFinite(n) && n >= 0;
        }),

    costo: Yup.string()
        .required("El costo es obligatorio")
        .test("valido", "El costo debe ser un número válido mayor o igual a 0", (v) => {
            if (!v) return false;
            const n = toNumber(v);
            return Number.isFinite(n) && n >= 0;
        }),

    margenGanancia: Yup.string().test(
        "valido",
        "El margen de ganancia debe ser un número válido",
        (v) => {
            if (!v) return true; // opcional
            const n = toNumber(v);
            return Number.isFinite(n);
        }
    ),

    categoriaId: Yup.number()
        .nullable()
        .typeError("Selecciona una categoría")
        .required("Selecciona una categoría"),

    recetaId: Yup.number().nullable(),
});

const ProductosScreen = () => {
    const { sucursalActual } = useSucursal();
    const { productos, loading, error, findProductosBySucursal, crearProducto } = useProducto();
    const { categorias, findCategoriasBySucursal } = useCategoria();
    const { recetas, findRecetas } = useReceta();
    const { modificadores, findModificadoresByEmpresa } = useModificador();
    const [formularioVisible, setFormularioVisible] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

    useEffect(() => {
        if (!sucursalActual?.id) return;
        findProductosBySucursal(sucursalActual.id);
        findCategoriasBySucursal(sucursalActual.id);
        findRecetas({ size: 100 });
        findModificadoresByEmpresa();
    }, [sucursalActual?.id]);

    const guardarProducto = async (values: ProductoForm, helpers: FormikHelpers<ProductoForm>) => {
        if (!sucursalActual?.id) {
            setErrorFormulario("No hay una sucursal seleccionada.");
            helpers.setSubmitting(false);
            return;
        }

        const producto: ProductoDto = {
            nombre: values.nombre.trim(),
            precio: toNumber(values.precio),
            costo: toNumber(values.costo),
            margenGanancia: values.margenGanancia ? toNumber(values.margenGanancia) : undefined,
            disponible: values.disponible,
            categoriaId: values.categoriaId as number,
            recetaId: values.recetaId ?? undefined,
            modificadorIds: values.modificadorIds,
            sucursalId: sucursalActual.id,
        };

        try {
            setErrorFormulario(null);
            await crearProducto(producto).unwrap();
            setFormularioVisible(false);
            helpers.resetForm();
        } catch {
            setErrorFormulario("No se pudo crear el producto.");
        } finally {
            helpers.setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Text className="text-xs text-[#79747E]">Productos · {sucursalActual?.nombre}</Text>
                <Pressable
                    accessibilityLabel="Crear producto"
                    className="h-9 w-9 items-center justify-center rounded-lg bg-[#1857B6]"
                    onPress={() => setFormularioVisible(true)}
                >
                    <Ionicons name="add" size={22} color="white" />
                </Pressable>
            </View>
            <FlatList
                data={productos}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
                refreshing={loading}
                onRefresh={() => sucursalActual?.id && findProductosBySucursal(sucursalActual.id)}
                ListEmptyComponent={
                    loading ? <ActivityIndicator color="#1857B6" /> : <Text className="text-center text-sm text-[#79747E]">No hay productos en esta sucursal.</Text>
                }
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white rounded-lg p-4 border border-[#E7E0EC]">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="cube-outline" size={20} color="#1857B6" />
                            <View>
                                <Text className="text-sm text-[#1C1B1F]">{item.nombre}</Text>
                                <Text className="text-xs text-[#79747E]">{item.disponible ? "Disponible" : "No disponible"}</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-[#1C1B1F]">${item.precio.toFixed(2)}</Text>
                    </View>
                )}
            />
            {error ? <Text className="px-4 pb-3 text-sm text-red-700">{error}</Text> : null}

            <Modal visible={formularioVisible} animationType="slide" onRequestClose={() => setFormularioVisible(false)}>
                <Formik
                    initialValues={initialValuesFormulario}
                    validationSchema={validationSchema}
                    onSubmit={guardarProducto}
                    enableReinitialize
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit, isSubmitting, resetForm }) => {
                        // Receta -> costo derivado. Si no hay receta, costo vuelve a "0"
                        // y queda editable manualmente. Si ya había un margen capturado,
                        // recalculamos el precio con el nuevo costo.
                        const handleSeleccionarReceta = (id: number | null) => {
                            setFieldValue("recetaId", id);

                            if (id === null) {
                                setFieldValue("costo", "0");
                                return;
                            }

                            const recetaSeleccionada = recetas.find((r) => r.id === id);
                            // TODO: ajustar `costo` al campo real donde RecetaDto expone
                            // el costo total calculado de la receta.
                            const costoReceta = (recetaSeleccionada as RecetaDto)?.costoTotal ?? 0;
                            setFieldValue("costo", String(costoReceta));

                            const margenNum = toNumber(values.margenGanancia);
                            if (values.margenGanancia && Number.isFinite(margenNum)) {
                                setFieldValue("precio", ((toNumber(values.precio) - costoReceta) / toNumber(values.precio) * 100).toFixed(2));
                            }
                        };

                        // Costo editable a mano (solo posible sin receta seleccionada).
                        // Si ya había margen, recalcula el precio con el nuevo costo.
                        const handleCambiarCosto = (texto: string) => {
                            setFieldValue("costo", texto);
                            if (!values.margenGanancia) return; 
                            const costoNum = toNumber(texto);
                            const margenNum = toNumber(values.margenGanancia);
                            if (Number.isFinite(costoNum) && Number.isFinite(margenNum)) {
                                setFieldValue("precio", ((toNumber(values.precio) - costoNum) / toNumber(values.precio) * 100).toFixed(2));
                            }
                        };

                        // Precio <-> margen de ganancia conectados sobre el costo actual.
                        const handleCambiarPrecio = (texto: string) => {
                            setFieldValue("precio", texto);
                            const costoNum = toNumber(values.costo);
                            const precioNum = toNumber(texto);
                            if (Number.isFinite(costoNum) && costoNum > 0 && Number.isFinite(precioNum)) {
                                const precioCosto=precioNum - costoNum
                                const margenDecimal =precioCosto / precioNum;
                                const nuevoMargen = margenDecimal * 100;
                                setFieldValue("margenGanancia", nuevoMargen.toFixed(2));
                            }
                        };

                        const handleCambiarMargen = (texto: string) => {
                            setFieldValue("margenGanancia", texto);
                            const costoNum = toNumber(values.costo);
                            const margenNum = toNumber(texto);
                            if (Number.isFinite(costoNum) && costoNum > 0 && Number.isFinite(margenNum)) {
                                setFieldValue("precio", (costoNum / (1 - margenNum / 100)).toFixed(2));
                            }
                        };

                        const alternarModificador = (id: number) => {
                            const yaSeleccionado = values.modificadorIds.includes(id);
                            setFieldValue(
                                "modificadorIds",
                                yaSeleccionado
                                    ? values.modificadorIds.filter((itemId) => itemId !== id)
                                    : [...values.modificadorIds, id]
                            );
                        };

                        return (
                            <View className="flex-1 bg-[#F1EEF4]">
                                <View className="flex-row items-center justify-between border-b border-[#E7E0EC] bg-white px-4 py-3">
                                    <Text className="text-base font-semibold text-[#1C1B1F]">Nuevo producto</Text>
                                    <Pressable
                                        accessibilityLabel="Cerrar formulario"
                                        onPress={() => {
                                            setFormularioVisible(false);
                                            resetForm();
                                            setErrorFormulario(null);
                                        }}
                                    >
                                        <Ionicons name="close" size={24} color="#1C1B1F" />
                                    </Pressable>
                                </View>
                                <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
                                    <Campo
                                        etiqueta="Nombre"
                                        value={values.nombre}
                                        onChangeText={handleChange("nombre")}
                                        onBlur={handleBlur("nombre")}
                                    />
                                    {touched.nombre && errors.nombre ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.nombre}</Text>
                                    ) : null}

                                    <Selector
                                        etiqueta="Receta"
                                        opciones={recetas}
                                        seleccionado={values.recetaId}
                                        onSeleccionar={handleSeleccionarReceta}
                                        permitirVacio
                                    />

                                    <Campo
                                        etiqueta="Costo"
                                        value={values.costo}
                                        onChangeText={handleCambiarCosto}
                                        onBlur={handleBlur("costo")}
                                        keyboardType="decimal-pad"
                                        editable={values.recetaId === null}
                                    />
                                    {touched.costo && errors.costo ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.costo}</Text>
                                    ) : null}

                                    <Campo
                                        etiqueta="Precio"
                                        value={values.precio}
                                        onChangeText={handleCambiarPrecio}
                                        onBlur={handleBlur("precio")}
                                        keyboardType="decimal-pad"
                                    />
                                    {touched.precio && errors.precio ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.precio}</Text>
                                    ) : null}

                                    <Campo
                                        etiqueta="Margen de ganancia (%)"
                                        value={values.margenGanancia}
                                        onChangeText={handleCambiarMargen}
                                        onBlur={handleBlur("margenGanancia")}
                                        keyboardType="decimal-pad"
                                    />
                                    {touched.margenGanancia && errors.margenGanancia ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.margenGanancia}</Text>
                                    ) : null}

                                    <Selector
                                        etiqueta="Categoría"
                                        opciones={categorias}
                                        seleccionado={values.categoriaId}
                                        onSeleccionar={(id) => setFieldValue("categoriaId", id)}
                                        requerido
                                    />
                                    {touched.categoriaId && errors.categoriaId ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.categoriaId}</Text>
                                    ) : null}

                                    <Text className="text-sm font-medium text-[#1C1B1F]">Modificadores</Text>
                                    {modificadores.map((modificador) => (
                                        <Pressable
                                            key={modificador.id}
                                            className="flex-row items-center justify-between rounded-lg border border-[#E7E0EC] bg-white px-3 py-3"
                                            onPress={() => modificador.id && alternarModificador(modificador.id)}
                                        >
                                            <Text className="text-sm text-[#1C1B1F]">{modificador.nombre}</Text>
                                            <Ionicons
                                                name={modificador.id && values.modificadorIds.includes(modificador.id) ? "checkbox" : "square-outline"}
                                                size={22}
                                                color="#1857B6"
                                            />
                                        </Pressable>
                                    ))}

                                    {errorFormulario ? <Text className="text-sm text-red-700">{errorFormulario}</Text> : null}

                                    <Pressable
                                        className="items-center rounded-lg bg-[#1857B6] py-3"
                                        onPress={() => handleSubmit()}
                                        disabled={isSubmitting || loading}
                                    >
                                        <Text className="font-semibold text-white">
                                            {isSubmitting || loading ? "Guardando..." : "Guardar producto"}
                                        </Text>
                                    </Pressable>
                                </ScrollView>
                            </View>
                        );
                    }}
                </Formik>
            </Modal>
        </View>
    );
};

const Campo = ({ etiqueta, ...props }: { etiqueta: string } & React.ComponentProps<typeof TextInput>) => (
    <View className="gap-1">
        <Text className="text-sm font-medium text-[#1C1B1F]">{etiqueta}</Text>
        <TextInput className="rounded-lg border border-[#E7E0EC] bg-white px-3 py-3 text-sm text-[#1C1B1F]" {...props} />
    </View>
);

const Selector = ({ etiqueta, opciones, seleccionado, onSeleccionar, permitirVacio, requerido }: {
    etiqueta: string;
    opciones: Array<{ id?: number; nombre: string }>;
    seleccionado: number | null;
    onSeleccionar: (id: number | null) => void;
    permitirVacio?: boolean;
    requerido?: boolean;
}) => (
    <View className="gap-1">
        <Text className="text-sm font-medium text-[#1C1B1F]">{etiqueta}{requerido ? " *" : ""}</Text>
        {permitirVacio ? <Pressable className="rounded-lg border border-[#E7E0EC] bg-white px-3 py-3" onPress={() => onSeleccionar(null)}><Text className="text-sm text-[#79747E]">Sin receta</Text></Pressable> : null}
        {opciones.map((opcion) => opcion.id ? (
            <Pressable key={opcion.id} className="flex-row items-center justify-between rounded-lg border border-[#E7E0EC] bg-white px-3 py-3" onPress={() => onSeleccionar(opcion.id!)}>
                <Text className="text-sm text-[#1C1B1F]">{opcion.nombre}</Text>
                <Ionicons name={seleccionado === opcion.id ? "radio-button-on" : "radio-button-off"} size={20} color="#1857B6" />
            </Pressable>
        ) : null)}
    </View>
);

export default ProductosScreen;
import MaterialSelector from "@/components/MaterialSelector";
import UnidadMedidaSelector from "@/components/UnidadMedidaSelector";
import { MaterialDto, UNIDAD_MEDIDA_LABELS, UnidadMedida } from "@/features/material/domain/types/material.types";
import { useMaterial } from "@/features/material/presentation/hook/useMaterial";
import type { RecetaDetalleDto } from "@/features/receta/domain/types/receta.types";
import { calcularCostoMaterial } from "@/helpers/CostoMaterialHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikHelpers } from "formik";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import { useCategoria } from "../../../categoria/presentation/hook/useCategoria";
import { useModificador } from "../../../modificador/presentation/hook/useModificador";
import { useSucursal } from "../../../sucursal/presentation/hook/useSucursal";
import type { ProductoDto } from "../../domain/types/producto.types";
import { useProducto } from "../hook/useProducto";

const toNumber = (value: string) => Number(value.replace(",", "."));

interface ProductoForm {
    nombre: string;
    precio: string;
    costo: string;
    margenGanancia: string;
    disponible: boolean;
    categoriaId: number | null;
    recetaDetalles: RecetaDetalleDto[];
    modificadorIds: number[];
    sucursalIds: number[];
    porcentajeSobreCostos?: number;
}

const initialValuesFormulario: ProductoForm = {
    nombre: "",
    precio: "",
    costo: "0",
    margenGanancia: "",
    disponible: true,
    categoriaId: null,
    recetaDetalles: [],
    modificadorIds: [],
    sucursalIds: [],
    porcentajeSobreCostos: 15,
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

    sucursalIds: Yup.array().of(Yup.number().required()).min(1, "Selecciona al menos una sucursal"),
});

const ProductosScreen = () => {
    const { sucursalActual, sucursales, findSucursalesByEmpresa } = useSucursal();
    const { productos, loading, error, findProductosByEmpresa, crearProducto, actualizarProducto, eliminarProducto } = useProducto();
    const { categorias, findCategoriasByEmpresa } = useCategoria();
    const { materiales, findMateriales } = useMaterial();
    const { modificadores, findModificadoresByEmpresa } = useModificador();
    const [formularioVisible, setFormularioVisible] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
    const [selectorAbierto, setSelectorAbierto] = useState<"sucursal" | "categoria" | "modificador" | null>(null);
    const [selectorMaterialVisible, setSelectorMaterialVisible] = useState(false);
    const [selectorUnidadIndex, setSelectorUnidadIndex] = useState<number | null>(null);
    const [productoEditando, setProductoEditando] = useState<ProductoDto | null>(null);
    const [esCopiando, setEsCopiando] = useState(false);
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState<ProductoDto | null>(null);

    const valoresIniciales = useMemo<ProductoForm>(() => {
        if (productoEditando) {
            return {
                nombre: esCopiando ? `Copia - ${productoEditando.nombre}` : productoEditando.nombre,
                precio: productoEditando.precio.toString(),
                costo: productoEditando.costo.toString(),
                margenGanancia: productoEditando.margenGanancia?.toString() || "",
                disponible: productoEditando.disponible,
                categoriaId: productoEditando.categoriaId,
                recetaDetalles: productoEditando.recetaDetalles,
                modificadorIds: productoEditando.modificadorIds,
                sucursalIds: productoEditando.sucursalId ? [productoEditando.sucursalId] : [],
                porcentajeSobreCostos: productoEditando.porcentajeSobreCostos,
            };
        }
        return { ...initialValuesFormulario, sucursalIds: sucursalActual?.id ? [sucursalActual.id] : [] };
    }, [productoEditando, esCopiando, sucursalActual?.id]);

    useEffect(() => {
        findSucursalesByEmpresa();
        findMateriales();
        findModificadoresByEmpresa();
    }, []);

    useEffect(() => {
        findProductosByEmpresa();
        findCategoriasByEmpresa();
    }, []);

    const guardarProducto = async (values: ProductoForm, helpers: FormikHelpers<ProductoForm>) => {
        const producto: Omit<ProductoDto, "sucursalId"> = {
            nombre: values.nombre.trim(),
            precio: toNumber(values.precio),
            costo: toNumber(values.costo),
            margenGanancia: values.margenGanancia ? toNumber(values.margenGanancia) : undefined,
            disponible: values.disponible,
            categoriaId: values.categoriaId as number,
            recetaDetalles: values.recetaDetalles,
            modificadorIds: values.modificadorIds,
            porcentajeSobreCostos: values.porcentajeSobreCostos,
        };

        try {
            setErrorFormulario(null);
            if (productoEditando && !esCopiando) {
                // Actualizar producto existente
                await actualizarProducto({ ...producto, id: productoEditando.id, sucursalId: productoEditando.sucursalId }).unwrap();
            } else {
                // Crear nuevo producto (o copiar)
                await crearProducto({ producto, sucursalIds: values.sucursalIds }).unwrap();
            }
            findProductosByEmpresa();
            setFormularioVisible(false);
            setProductoEditando(null);
            setEsCopiando(false);
            helpers.resetForm();
        } catch {
            setErrorFormulario("No se pudo guardar el producto.");
        } finally {
            helpers.setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Text className="text-xs text-[#79747E]">Productos · {sucursalActual?.nombre ?? "Selecciona una sucursal"}</Text>
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
                onRefresh={() => findProductosByEmpresa()}
                ListEmptyComponent={
                    loading ? <ActivityIndicator color="#1857B6" /> : <Text className="text-center text-sm text-[#79747E]">No hay productos en esta sucursal.</Text>
                }
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white rounded-lg p-4 border border-[#E7E0EC]">
                        <View className="flex-row items-center gap-3 flex-1">
                            <Ionicons name="cube-outline" size={20} color="#1857B6" />
                            <View className="flex-1">
                                <Text className="text-sm text-[#1C1B1F]">{item.nombre}</Text>
                                <Text className="text-xs text-[#79747E]">{item.disponible ? "Disponible" : "No disponible"}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-sm font-medium text-[#1C1B1F] mr-2">${item.precio.toFixed(2)}</Text>
                            <Pressable
                                accessibilityLabel="Copiar producto"
                                onPress={() => {
                                    setProductoEditando(item);
                                    setEsCopiando(true);
                                    setFormularioVisible(true);
                                }}
                                hitSlop={8}
                            >
                                <Ionicons name="copy" size={18} color="#1857B6" />
                            </Pressable>
                            <Pressable
                                accessibilityLabel="Editar producto"
                                onPress={() => {
                                    setProductoEditando(item);
                                    setEsCopiando(false);
                                    setFormularioVisible(true);
                                }}
                                hitSlop={8}
                            >
                                <Ionicons name="pencil" size={18} color="#1857B6" />
                            </Pressable>
                            <Pressable
                                accessibilityLabel="Eliminar producto"
                                onPress={() => {
                                    setProductoAEliminar(item);
                                    setModalEliminarVisible(true);
                                }}
                                hitSlop={8}
                            >
                                <Ionicons name="trash" size={18} color="#B3261E" />
                            </Pressable>
                        </View>
                    </View>
                )}
            />
            {error ? <Text className="px-4 pb-3 text-sm text-red-700">{error}</Text> : null}

            <Modal visible={formularioVisible} animationType="slide" onRequestClose={() => setFormularioVisible(false)}>
                <Formik
                    initialValues={valoresIniciales}
                    validationSchema={validationSchema}
                    onSubmit={guardarProducto}
                    enableReinitialize
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit, isSubmitting, resetForm }) => {
                        // Los materiales del producto determinan el costo. Sin materiales el costo
                        // queda en "0" y es editable manualmente. Si ya había margen, se recalcula el precio.
                        const aplicarDetalles = (detalles: RecetaDetalleDto[]) => {
                            setFieldValue("recetaDetalles", detalles);  

                            const costoTotal = detalles.reduce((acc, d) => acc + d.costo, 0);
                            const costoConServicios = costoTotal + costoTotal * (values?.porcentajeSobreCostos ?? 0) / 100;

                            setFieldValue("costo", detalles.length ? costoConServicios.toFixed(2) : "0");

                            const margenNum = toNumber(values.margenGanancia);
                            if (values.margenGanancia && Number.isFinite(margenNum) && margenNum < 100) {
                                setFieldValue("precio", (costoTotal / (1 - margenNum / 100)).toFixed(2));
                            }
                        };

                        const agregarMaterial = (material: MaterialDto) => {
                            aplicarDetalles([
                                ...values.recetaDetalles,
                                {
                                    materialId: material.id!,
                                    nombreMaterial: material.nombre,
                                    cantidad: 0,
                                    unidadMedida: material.unidad,
                                    costo: 0,
                                },
                            ]);
                        };

                        const actualizarDetalle = (index: number, cambios: Partial<RecetaDetalleDto>) => {
                            const detalleActualizado = { ...values.recetaDetalles[index], ...cambios };
                            const material = materiales.find((m) => m.id === detalleActualizado.materialId);
                            detalleActualizado.costo = calcularCostoMaterial(
                                detalleActualizado.cantidad,
                                detalleActualizado.unidadMedida,
                                material
                            );
                            aplicarDetalles(values.recetaDetalles.map((d, i) => (i === index ? detalleActualizado : d)));
                        };

                        const quitarDetalle = (index: number) => {
                            aplicarDetalles(values.recetaDetalles.filter((_, i) => i !== index));
                        };

                        const materialesNoAgregados = materiales.filter(
                            (m) => !values.recetaDetalles.some((d) => d.materialId === m.id)
                        );

                        const alternarSucursal = (id: number) => {
                            setFieldValue(
                                "sucursalIds",
                                values.sucursalIds.includes(id)
                                    ? values.sucursalIds.filter((itemId) => itemId !== id)
                                    : [...values.sucursalIds, id]
                            );
                        };

                        // Costo editable a mano (solo posible sin materiales).
                        // Si ya había margen, recalcula el precio con el nuevo costo.
                        const handleCambiarCosto = (texto: string) => {
                            setFieldValue("costo", texto);
                            if (!values.margenGanancia) return;
                            const costoNum = toNumber(texto);
                            const margenNum = toNumber(values.margenGanancia);
                            if (Number.isFinite(costoNum) && Number.isFinite(margenNum) && margenNum < 100) {
                                setFieldValue("precio", (costoNum / (1 - margenNum / 100)).toFixed(2));
                            }
                        };

                        // Precio <-> margen de ganancia conectados sobre el costo actual.
                        const handleCambiarPrecio = (texto: string) => {
                            setFieldValue("precio", texto);
                            const costoNum = toNumber(values.costo);
                            const precioNum = toNumber(texto);
                            if (Number.isFinite(costoNum) && costoNum > 0 && Number.isFinite(precioNum)) {
                                const precioCosto = precioNum - costoNum
                                const margenDecimal = precioCosto / precioNum;
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

                        const handleCambiarPorcentajeSobreCostos = (texto: string) => {
                            setFieldValue("porcentajeSobreCostos", texto);
                            const costoNum = toNumber(values.costo);
                            const porcentajeNum = toNumber(texto);
                            if (Number.isFinite(costoNum) && costoNum > 0 && Number.isFinite(porcentajeNum)) {
                                setFieldValue("precio", (costoNum / (porcentajeNum / 100)).toFixed(2));
                            }
                        };

                        return (
                            <View className="flex-1 bg-[#F1EEF4]">
                                <View className="flex-row items-center justify-between border-b border-[#E7E0EC] bg-white px-4 py-3">
                                    <Text className="text-base font-semibold text-[#1C1B1F]">
                                        {esCopiando ? "Copiar producto" : productoEditando ? `Editar ${productoEditando.nombre}` : "Nuevo producto"}
                                    </Text>
                                    <Pressable
                                        accessibilityLabel="Cerrar formulario"
                                        onPress={() => {
                                            setFormularioVisible(false);
                                            resetForm();
                                            setErrorFormulario(null);
                                            setProductoEditando(null);
                                            setEsCopiando(false);
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

                                    <Text className="text-sm font-medium text-[#1C1B1F]">Materiales</Text>
                                    {values.recetaDetalles.map((detalle, index) => (
                                        <View key={detalle.materialId} className="rounded-lg border border-[#E7E0EC] bg-white p-3">
                                            <View className="mb-2 flex-row items-center justify-between">
                                                <Text className="text-sm font-semibold text-[#1C1B1F]">{detalle.nombreMaterial}</Text>
                                                <Pressable accessibilityLabel="Quitar material" onPress={() => quitarDetalle(index)} hitSlop={8}>
                                                    <Ionicons name="trash" size={16} color="#B3261E" />
                                                </Pressable>
                                            </View>
                                            <View className="flex-row gap-2">
                                                <TextInput
                                                    className="flex-1 rounded-lg border border-[#E7E0EC] px-3 py-2 text-sm text-[#1C1B1F]"
                                                    placeholder="Cantidad"
                                                    placeholderTextColor="#79747E"
                                                    keyboardType="decimal-pad"
                                                    value={detalle.cantidad ? String(detalle.cantidad) : ""}
                                                    onChangeText={(t) => actualizarDetalle(index, { cantidad: toNumber(t) || 0 })}
                                                />
                                                <Pressable
                                                    onPress={() => setSelectorUnidadIndex(index)}
                                                    className="flex-1 justify-center rounded-lg border border-[#E7E0EC] px-3 py-2"
                                                >
                                                    <Text className="text-sm text-[#1C1B1F]" numberOfLines={1}>
                                                        {UNIDAD_MEDIDA_LABELS[detalle.unidadMedida]}
                                                    </Text>
                                                </Pressable>
                                                <View className="flex-1 justify-center rounded-lg border border-[#E7E0EC] px-3 py-2">
                                                    <Text className="text-sm text-[#1C1B1F]">${detalle.costo.toFixed(2)}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                    <Pressable
                                        onPress={() => setSelectorMaterialVisible(true)}
                                        className="flex-row items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1857B6] py-3"
                                    >
                                        <Ionicons name="add" size={18} color="#1857B6" />
                                        <Text className="text-sm font-medium text-[#1857B6]">Agregar material</Text>
                                    </Pressable>



                                    <Campo
                                        etiqueta="Porcentaje sobre costos (%)"
                                        value={values.porcentajeSobreCostos?.toString() || "0"}
                                        onChangeText={handleCambiarPorcentajeSobreCostos}
                                        onBlur={handleBlur("porcentajeSobreCostos")}
                                        keyboardType="decimal-pad"
                                    />
                                    {touched.porcentajeSobreCostos && errors.porcentajeSobreCostos ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.porcentajeSobreCostos}</Text>
                                    ) : null}

                                    <Campo
                                        etiqueta="Costo"
                                        value={values.costo}
                                        onChangeText={handleCambiarCosto}
                                        onBlur={handleBlur("costo")}
                                        keyboardType="decimal-pad"
                                        editable={values.recetaDetalles.length === 0}
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

                                    <SelectorBoton
                                        etiqueta="Categoría *"
                                        valor={values.categoriaId ? categorias.find((c) => c.id === values.categoriaId)?.nombre ?? "Selecciona una categoría" : "Selecciona una categoría"}
                                        onPress={() => setSelectorAbierto("categoria")}
                                    />
                                    {touched.categoriaId && errors.categoriaId ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.categoriaId}</Text>
                                    ) : null}

                                    <SelectorBoton
                                        etiqueta="Modificadores"
                                        valor={values.modificadorIds.length ? `${values.modificadorIds.length} seleccionado(s)` : "Sin modificadores"}
                                        onPress={() => setSelectorAbierto("modificador")}
                                    />

                                    <SelectorBoton
                                        etiqueta="Sucursales *"
                                        valor={values.sucursalIds.length ? `${values.sucursalIds.length} seleccionada(s)` : "Selecciona sucursales"}
                                        onPress={() => setSelectorAbierto("sucursal")}
                                    />
                                    {touched.sucursalIds && typeof errors.sucursalIds === "string" ? (
                                        <Text className="text-sm text-red-700 -mt-3">{errors.sucursalIds}</Text>
                                    ) : null}

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

                                <Modal visible={selectorAbierto === "sucursal"} transparent animationType="fade" onRequestClose={() => setSelectorAbierto(null)}>
                                    <ListaSeleccionMultipleModal
                                        titulo="Sucursales"
                                        opciones={sucursales}
                                        seleccionados={values.sucursalIds}
                                        onAlternar={alternarSucursal}
                                        onCerrar={() => setSelectorAbierto(null)}
                                    />
                                </Modal>

                                <MaterialSelector
                                    visible={selectorMaterialVisible}
                                    materiales={materialesNoAgregados}
                                    onSelect={agregarMaterial}
                                    onClose={() => setSelectorMaterialVisible(false)}
                                />

                                <UnidadMedidaSelector
                                    visible={selectorUnidadIndex !== null}
                                    value={selectorUnidadIndex !== null ? values.recetaDetalles[selectorUnidadIndex].unidadMedida : ""}
                                    onChange={(u: UnidadMedida) => {
                                        if (selectorUnidadIndex !== null) actualizarDetalle(selectorUnidadIndex, { unidadMedida: u });
                                    }}
                                    onClose={() => setSelectorUnidadIndex(null)}
                                />

                                <Modal visible={selectorAbierto === "categoria"} transparent animationType="fade" onRequestClose={() => setSelectorAbierto(null)}>
                                    <ListaSeleccionModal
                                        titulo="Categoría"
                                        opciones={categorias}
                                        seleccionado={values.categoriaId}
                                        onSeleccionar={(id) => {
                                            setFieldValue("categoriaId", id);
                                            setSelectorAbierto(null);
                                        }}
                                        onCerrar={() => setSelectorAbierto(null)}
                                    />
                                </Modal>

                                <Modal visible={selectorAbierto === "modificador"} transparent animationType="fade" onRequestClose={() => setSelectorAbierto(null)}>
                                    <ListaSeleccionMultipleModal
                                        titulo="Modificadores"
                                        opciones={modificadores}
                                        seleccionados={values.modificadorIds}
                                        onAlternar={alternarModificador}
                                        onCerrar={() => setSelectorAbierto(null)}
                                    />
                                </Modal>
                            </View>
                        );
                    }}
                </Formik>
            </Modal>

            {productoAEliminar && (
                <Modal visible={modalEliminarVisible} animationType="fade" transparent={true} onRequestClose={() => setModalEliminarVisible(false)}>
                    <View className="flex-1 justify-center items-center bg-black/40">
                        <View className="bg-white rounded-2xl p-6 mx-6 max-w-xs">
                            <Text className="text-base font-semibold text-[#1C1B1F] mb-2">Eliminar producto</Text>
                            <Text className="text-sm text-[#79747E] mb-6">
                                ¿Está seguro que desea eliminar "{productoAEliminar.nombre}"? Esta acción no se puede deshacer.
                            </Text>
                            <View className="flex-row gap-3">
                                <Pressable
                                    className="flex-1 items-center rounded-lg py-3 border border-[#1857B6]"
                                    onPress={() => {
                                        setModalEliminarVisible(false);
                                        setProductoAEliminar(null);
                                    }}
                                >
                                    <Text className="text-sm font-medium text-[#1857B6]">Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    className="flex-1 items-center rounded-lg py-3 bg-[#B3261E]"
                                    onPress={async () => {
                                        try {
                                            await eliminarProducto(productoAEliminar.id!).unwrap();
                                            findProductosByEmpresa();
                                            setModalEliminarVisible(false);
                                            setProductoAEliminar(null);
                                        } catch (error) {
                                            // El error se maneja en el slice y se muestra en el error del estado
                                        }
                                    }}
                                >
                                    <Text className="text-sm font-medium text-white">Eliminar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const Campo = ({ etiqueta, ...props }: { etiqueta: string } & React.ComponentProps<typeof TextInput>) => (
    <View className="gap-1">
        <Text className="text-sm font-medium text-[#1C1B1F]">{etiqueta}</Text>
        <TextInput className="rounded-lg border border-[#E7E0EC] bg-white px-3 py-3 text-sm text-[#1C1B1F]" {...props} />
    </View>
);

const SelectorBoton = ({ etiqueta, valor, onPress }: { etiqueta: string; valor: string; onPress: () => void }) => (
    <View className="gap-1">
        <Text className="text-sm font-medium text-[#1C1B1F]">{etiqueta}</Text>
        <Pressable
            className="flex-row items-center justify-between rounded-lg border border-[#E7E0EC] bg-white px-3 py-3"
            onPress={onPress}
        >
            <Text className="text-sm text-[#1C1B1F]">{valor}</Text>
            <Ionicons name="chevron-down" size={18} color="#79747E" />
        </Pressable>
    </View>
);

const ListaSeleccionModal = ({ titulo, opciones, seleccionado, onSeleccionar, onCerrar }: {
    titulo: string;
    opciones: Array<{ id?: number; nombre: string }>;
    seleccionado: number | null;
    onSeleccionar: (id: number | null) => void;
    onCerrar: () => void;
}) => {
    const datos = opciones;
    return (
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onCerrar}>
            <Pressable className="max-h-[70%] rounded-t-2xl bg-white" onPress={(e) => e.stopPropagation()}>
                <View className="flex-row items-center justify-between border-b border-[#E7E0EC] px-4 py-3">
                    <Text className="text-base font-semibold text-[#1C1B1F]">{titulo}</Text>
                    <Pressable accessibilityLabel="Cerrar" onPress={onCerrar}>
                        <Ionicons name="close" size={22} color="#1C1B1F" />
                    </Pressable>
                </View>
                <FlatList
                    data={datos}
                    keyExtractor={(item, index) => (item.id ? String(item.id) : `vacio-${index}`)}
                    contentContainerStyle={{ padding: 12, gap: 8 }}
                    renderItem={({ item }) => (
                        <Pressable
                            className="flex-row items-center justify-between rounded-lg border border-[#E7E0EC] bg-white px-3 py-3"
                            onPress={() => onSeleccionar(item.id ?? null)}
                        >
                            <Text className="text-sm text-[#1C1B1F]">{item.nombre}</Text>
                            <Ionicons
                                name={seleccionado === (item.id ?? null) ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color="#1857B6"
                            />
                        </Pressable>
                    )}
                />
            </Pressable>
        </Pressable>
    );
};

const ListaSeleccionMultipleModal = ({ titulo, opciones, seleccionados, onAlternar, onCerrar }: {
    titulo: string;
    opciones: Array<{ id?: number; nombre: string }>;
    seleccionados: number[];
    onAlternar: (id: number) => void;
    onCerrar: () => void;
}) => (
    <Pressable className="flex-1 justify-end bg-black/40" onPress={onCerrar}>
        <Pressable className="max-h-[70%] rounded-t-2xl bg-white" onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between border-b border-[#E7E0EC] px-4 py-3">
                <Text className="text-base font-semibold text-[#1C1B1F]">{titulo}</Text>
                <Pressable accessibilityLabel="Cerrar" onPress={onCerrar}>
                    <Ionicons name="close" size={22} color="#1C1B1F" />
                </Pressable>
            </View>
            <FlatList
                data={opciones}
                keyExtractor={(item, index) => (item.id ? String(item.id) : `item-${index}`)}
                contentContainerStyle={{ padding: 12, gap: 8 }}
                renderItem={({ item }) => (
                    <Pressable
                        className="flex-row items-center justify-between rounded-lg border border-[#E7E0EC] bg-white px-3 py-3"
                        onPress={() => item.id && onAlternar(item.id)}
                    >
                        <Text className="text-sm text-[#1C1B1F]">{item.nombre}</Text>
                        <Ionicons
                            name={item.id && seleccionados.includes(item.id) ? "checkbox" : "square-outline"}
                            size={22}
                            color="#1857B6"
                        />
                    </Pressable>
                )}
            />
            <Pressable className="m-3 items-center rounded-lg bg-[#1857B6] py-3" onPress={onCerrar}>
                <Text className="font-semibold text-white">Listo</Text>
            </Pressable>
        </Pressable>
    </Pressable>
);

export default ProductosScreen;
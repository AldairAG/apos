import { EstadoCaja } from "@/features/caja/enum/Caja.Enums";
import type { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { useMesa } from "@/features/mesa/presentation/hook/useMesa";
import type { ProductoDto } from "@/features/productos/domain/types/producto.types";
import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { type MetodoPago, type OrdenDto, type TipoOrden } from "../../domain/types/pos.types";
import { usePos } from "../hook/usePos";
import {
    CartSummary,
    ModifierModal,
    OrderTypeSelector,
    PaymentMethods,
    SplitPayment,
    TableSelector,
} from "../components";

type VistaPos = "nueva" | "ordenes";

interface SplitPaymentItem {
    metodo: MetodoPago;
    monto: number;
}

interface LineaCarrito {
    key: string;
    lineId: string;
    producto: ProductoDto;
    cantidad: number;
    notas: string;
    opcionesCantidad: Record<number, number>;
}

const generarClaveLinea = (productoId: number, opcionesCantidad: Record<number, number>): string => {
    const opcionesOrdenadas = Object.entries(opcionesCantidad)
        .filter(([_, cantidad]) => cantidad > 0)
        .sort(([idA], [idB]) => Number(idA) - Number(idB))
        .map(([id, cantidad]) => `${id}:${cantidad}`)
        .join("_");
    return opcionesOrdenadas ? `${productoId}_${opcionesOrdenadas}` : String(productoId);
};

const generarLineId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const ESTADOS_ORDEN: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "#8A6D00" },
    EN_PREPARACION: { label: "En preparaci�n", color: "#1857B6" },
    LISTA: { label: "Lista", color: "#3A7D44" },
    ENTREGADA: { label: "Entregada", color: "#3A7D44" },
    CANCELADA: { label: "Cancelada", color: "#B3261E" },
    COBRADA: { label: "Cobrada", color: "#8B6914" },
};

const moneda = (monto: number) =>
    `$${(monto || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PosHomeScreen = () => {
    const {
        categoriasProductos,
        ordenes,
        catalogoLoading,
        ordenesLoading,
        saving,
        error,
        sucursalId,
        cajaAbierta,
        corteCaja,
        cajaLoading,
        cargarProductos,
        cargarOrdenes,
        cargarContextoCaja,
        crearOrden,
        actualizarEstadoOrden,
        cobrarOrden,
        limpiarError,
    } = usePos();
    const { mesasDisponibles, loading: mesasLoading, cargarMesas } = useMesa();

    const [vista, setVista] = useState<VistaPos>("nueva");
    const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
    const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
    const [tipoOrden, setTipoOrden] = useState<TipoOrden | null>(null);
    const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaDto | null>(null);
    const [mostrarSelectorMesa, setMostrarSelectorMesa] = useState(false);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [modalCobro, setModalCobro] = useState<OrdenDto | null>(null);
    const [usarPagoDividido, setUsarPagoDividido] = useState(false);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
    const [pagoDividido, setPagoDividido] = useState<SplitPaymentItem[]>([]);
    const [contextoCajaSucursalId, setContextoCajaSucursalId] = useState<number | null>(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoDto | null>(null);
    const [opcionesModificador, setOpcionesModificador] = useState<Record<number, number>>({});

    // Cleanup effect when no sucursalId
    useEffect(() => {
        if (!sucursalId) {
            setContextoCajaSucursalId(null);
        }
    }, [sucursalId]);

    // Load data effect
    useEffect(() => {
        if (!sucursalId) {
            return;
        }
        cargarProductos();
        cargarOrdenes(sucursalId);
        cargarMesas(sucursalId);
        cargarContextoCaja(sucursalId).then((cargado) => {
            setContextoCajaSucursalId(cargado ? sucursalId : null);
        });
    }, [sucursalId, cargarProductos, cargarOrdenes, cargarMesas, cargarContextoCaja]);

    const seleccionarTipoOrden = (tipo: TipoOrden) => {
        setTipoOrden(tipo);
        if (tipo !== "EN_MESA") setMesaSeleccionada(null);
    };

    const productosFiltrados = categoriasProductos
        .filter((grupo) => !categoriaActiva || grupo.categoria === categoriaActiva)
        .flatMap((grupo) => grupo.productos.filter((producto) => producto.disponible));

    const subtotal = carrito.reduce((total, linea) => {
        const opciones = linea.producto.modificadores?.flatMap((modificador) => modificador.opciones) ?? [];
        const extra = opciones
            .filter((opcion) => opcion.id !== undefined && (linea.opcionesCantidad[opcion.id] ?? 0) > 0)
            .reduce((sum, opcion) => sum + opcion.precio * linea.opcionesCantidad[opcion.id!], 0);
        return total + linea.producto.precio * linea.cantidad + extra;
    }, 0);

    const agregarProducto = (producto: ProductoDto) => {
        const productoId = producto.id;
        if (!productoId) return;
        if (producto.modificadores && producto.modificadores.length > 0) {
            const tieneOpciones = producto.modificadores.some((mod) => mod.opciones && mod.opciones.length > 0);
            if (tieneOpciones) {
                setProductoSeleccionado(producto);
                setOpcionesModificador({});
                return;
            }
        }
        agregarProductoAlCarrito(producto, {});
    };

    const agregarProductoAlCarrito = (producto: ProductoDto, opcionesCantidad: Record<number, number>) => {
        const productoId = producto.id;
        if (!productoId) return;
        setCarrito((actual) => {
            const lineId = generarLineId();
            const key = generarClaveLinea(productoId, opcionesCantidad);
            return [...actual, { key, lineId, producto, cantidad: 1, notas: "", opcionesCantidad }];
        });
    };

    const confirmarModificadores = () => {
        if (!productoSeleccionado) return;
        agregarProductoAlCarrito(productoSeleccionado, opcionesModificador);
        setProductoSeleccionado(null);
        setOpcionesModificador({});
    };

    const cambiarCantidad = (lineId: string, delta: number) => {
        setCarrito((actual) =>
            actual
                .map((linea) =>
                    linea.lineId === lineId ? { ...linea, cantidad: linea.cantidad + delta } : linea
                )
                .filter((linea) => linea.cantidad > 0)
        );
    };

    const cambiarCantidadOpcion = (lineId: string, opcionId: number, delta: number) => {
        setCarrito((actual) => {
            let actualizado = actual.map((linea) => {
                if (linea.lineId !== lineId) return linea;
                const cantidad = Math.max(0, (linea.opcionesCantidad[opcionId] ?? 0) + delta);
                const opcionesCantidad = { ...linea.opcionesCantidad };
                if (cantidad === 0) {
                    delete opcionesCantidad[opcionId];
                } else {
                    opcionesCantidad[opcionId] = cantidad;
                }
                const nuevaClave = generarClaveLinea(linea.producto.id!, opcionesCantidad);
                return { ...linea, key: nuevaClave, opcionesCantidad };
            });
            const consolidado = actualizado.reduce((resultado: LineaCarrito[], linea) => {
                const existente = resultado.find(
                    (l) => l.key === linea.key && l.producto.id === linea.producto.id
                );
                if (existente) {
                    existente.cantidad += linea.cantidad;
                    return resultado;
                }
                return [...resultado, linea];
            }, []);
            return consolidado;
        });
    };

    const ordenValida = tipoOrden !== null && (tipoOrden !== "EN_MESA" || mesaSeleccionada !== null);

    const guardarOrden = async () => {
        if (!sucursalId || carrito.length === 0 || !tipoOrden || !ordenValida) return;
        limpiarError();
        const orden = {
            subtotal,
            descuento: 0,
            total: subtotal,
            sucursalId,
            tipo: tipoOrden,
            mesaId: tipoOrden === "EN_MESA" ? mesaSeleccionada!.id ?? null : null,
            detalles: carrito.map((linea) => ({
                productoId: linea.producto.id,
                cantidad: linea.cantidad,
                notas: linea.notas.trim(),
                modificadores: (linea.producto.modificadores ?? [])
                    .flatMap((modificador) => modificador.opciones)
                    .filter((opcion) => opcion.id !== undefined && (linea.opcionesCantidad[opcion.id] ?? 0) > 0)
                    .map((opcion) => ({
                        id: opcion.id,
                        precio: opcion.precio,
                        cantidad: linea.opcionesCantidad[opcion.id!],
                    })),
            })),
        };
        try {
            await crearOrden(orden).unwrap();
            setCarrito([]);
            setTipoOrden(null);
            setMesaSeleccionada(null);
            setVista("ordenes");
        } catch {
            // El error se presenta desde el estado del feature.
        }
    };

    const avanzarOrden = async (ordenId: number) => {
        limpiarError();
        try {
            await actualizarEstadoOrden(ordenId).unwrap();
        } catch {
            // El error se presenta desde el estado del feature.
        }
    };

    const confirmarCobro = async () => {
        if (!modalCobro?.id || !cajaAbierta?.id || !corteCaja?.id) return;
        limpiarError();
        const movimientos = usarPagoDividido && pagoDividido.length > 0
            ? pagoDividido.map((pago) => ({
                  descripcion: `Cobro orden #${modalCobro.id}`,
                  monto: pago.monto,
                  metodoDePago: pago.metodo,
              }))
            : [
                  {
                      descripcion: `Cobro orden #${modalCobro.id}`,
                      monto: modalCobro.total,
                      metodoDePago: metodoPago,
                  },
              ];
        try {
            await cobrarOrden({
                ordenId: modalCobro.id,
                cajaId: cajaAbierta.id,
                corteCajaId: corteCaja.id,
                movimientos,
            }).unwrap();
            setModalCobro(null);
            setUsarPagoDividido(false);
            setPagoDividido([]);
        } catch {
            // El error se presenta desde el estado del feature.
        }
    };

    const agregarMetodoPagoDividido = (metodo: MetodoPago, monto: number) => {
        setPagoDividido((actual) => [...actual, { metodo, monto }]);
    };

    const eliminarMetodoPagoDividido = (metodo: MetodoPago) => {
        setPagoDividido((actual) => actual.filter((pago) => pago.metodo !== metodo));
    };

    const actualizarMontoPagoDividido = (metodo: MetodoPago, monto: number) => {
        setPagoDividido((actual) =>
            actual.map((pago) => (pago.metodo === metodo ? { ...pago, monto } : pago))
        );
    };

    if (!sucursalId) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F9F7FA] px-6">
                <Ionicons name="storefront-outline" size={34} color="#1857B6" />
                <Text className="mt-3 text-base font-semibold text-[#1C1B1F]">Selecciona una sucursal</Text>
                <Text className="mt-1 text-center text-sm text-[#79747E]">
                    El cat�logo y las �rdenes dependen de la sucursal activa.
                </Text>
                <Pressable
                    onPress={() => router.push(ROUTES.ADMIN_SUCURSAL.SELECCIONAR as any)}
                    className="mt-5 rounded-lg bg-[#1857B6] px-4 py-3"
                >
                    <Text className="font-semibold text-white">Elegir sucursal</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F1EEF4]">
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
                <View className="mb-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-semibold text-[#1C1B1F]">Punto de venta</Text>
                        <Text className="mt-1 text-xs text-[#79747E]">Sucursal #{sucursalId}</Text>
                    </View>
                    <Pressable
                        onPress={() => router.replace("/admin_home" as any)}
                        className="flex-row items-center gap-2 rounded-lg border border-[#D8D2DC] bg-white px-3 py-2"
                    >
                        <Ionicons name="arrow-back" size={16} color="#49454F" />
                        <Text className="text-sm text-[#49454F]">Administraci�n</Text>
                    </Pressable>
                </View>

                <View className="mb-4 flex-row border-b border-[#D8D2DC]">
                    {(["nueva", "ordenes"] as const).map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => setVista(item)}
                            className={`mr-5 border-b-2 px-1 pb-3 ${vista === item ? "border-[#1857B6]" : "border-transparent"}`}
                        >
                            <Text className={`text-sm font-semibold ${vista === item ? "text-[#1857B6]" : "text-[#79747E]"}`}>
                                {item === "nueva" ? "Nueva orden" : `�rdenes (${ordenes.length})`}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {error ? (
                    <View className="mb-4 flex-row items-center justify-between rounded-lg border border-[#F1B8B2] bg-[#FCEEEE] p-3">
                        <Text className="mr-3 flex-1 text-sm text-[#8C1D18]">{error}</Text>
                        <Pressable onPress={limpiarError} accessibilityLabel="Cerrar error">
                            <Ionicons name="close" size={18} color="#8C1D18" />
                        </Pressable>
                    </View>
                ) : null}

                {vista === "nueva" ? (
                    <View className="gap-4">
                        {/* Selector de tipo de orden */}
                        <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                            <OrderTypeSelector selectedType={tipoOrden} onSelectType={seleccionarTipoOrden} />
                        </View>

                        {/* Selector de mesa si es EN_MESA */}
                        {tipoOrden === "EN_MESA" && (
                            <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                                <Pressable
                                    onPress={() => setMostrarSelectorMesa(true)}
                                    className={`flex-row items-center justify-between rounded-xl px-4 py-4 border-2 ${
                                        mesaSeleccionada
                                            ? "border-[#1857B6] bg-[#EAF1FC]"
                                            : "border-[#E7E0EC] bg-[#F9F7FA]"
                                    }`}
                                >
                                    <View>
                                        <Text className="text-xs text-[#79747E]">Seleccionar mesa</Text>
                                        {mesaSeleccionada && (
                                            <Text className="mt-1 text-base font-semibold text-[#1857B6]">
                                                {mesaSeleccionada.nombre}
                                            </Text>
                                        )}
                                    </View>
                                    <Ionicons
                                        name="grid-outline"
                                        size={24}
                                        color={mesaSeleccionada ? "#1857B6" : "#79747E"}
                                    />
                                </Pressable>
                            </View>
                        )}

                        {/* Selecci�n de productos */}
                        <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                            <Text className="mb-3 text-base font-semibold text-[#1C1B1F]">Productos</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                <Pressable
                                    onPress={() => setCategoriaActiva(null)}
                                    className={`mr-2 rounded-full px-3 py-2 ${
                                        categoriaActiva === null ? "bg-[#1857B6]" : "bg-[#F1EEF4]"
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${
                                            categoriaActiva === null ? "text-white" : "text-[#49454F]"
                                        }`}
                                    >
                                        Todos
                                    </Text>
                                </Pressable>
                                {categoriasProductos.map((grupo) => (
                                    <Pressable
                                        key={grupo.categoria}
                                        onPress={() => setCategoriaActiva(grupo.categoria)}
                                        className={`mr-2 rounded-full px-3 py-2 ${
                                            categoriaActiva === grupo.categoria
                                                ? "bg-[#1857B6]"
                                                : "bg-[#F1EEF4]"
                                        }`}
                                    >
                                        <Text
                                            className={`text-xs font-medium ${
                                                categoriaActiva === grupo.categoria
                                                    ? "text-white"
                                                    : "text-[#49454F]"
                                            }`}
                                        >
                                            {grupo.categoria}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                            {catalogoLoading ? (
                                <Text className="py-4 text-sm text-[#79747E]">Cargando cat�logo...</Text>
                            ) : null}
                            {!catalogoLoading && productosFiltrados.length === 0 ? (
                                <Text className="py-4 text-sm text-[#79747E]">
                                    No hay productos disponibles en esta categor�a.
                                </Text>
                            ) : null}
                            <View className="flex-row flex-wrap gap-2">
                                {productosFiltrados.map((producto) => (
                                    <Pressable
                                        key={producto.id}
                                        onPress={() => agregarProducto(producto)}
                                        className="min-w-[145px] flex-1 rounded-lg border border-[#D8D2DC] p-3 active:bg-[#F1EEF4]"
                                    >
                                        <Text className="text-sm font-semibold text-[#1C1B1F]">
                                            {producto.nombre}
                                        </Text>
                                        <Text className="mt-1 text-sm text-[#1857B6]">
                                            {moneda(producto.precio)}
                                        </Text>
                                        <Text className="mt-2 text-xs font-medium text-[#79747E]">
                                            Agregar +
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Resumen y bot�n de crear orden */}
                        <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-base font-semibold text-[#1C1B1F]">Orden</Text>
                                <Text className="text-xs text-[#79747E]">{carrito.length} productos</Text>
                            </View>

                            {carrito.length === 0 ? (
                                <Text className="py-4 text-sm text-[#79747E]">
                                    Selecciona un tipo de orden y agrega productos.
                                </Text>
                            ) : (
                                <View className="gap-3">
                                    <View className="flex-row items-center justify-between border-t border-[#D8D2DC] pt-3">
                                        <Text className="text-sm font-semibold text-[#1C1B1F]">Subtotal</Text>
                                        <Text className="text-lg font-bold text-[#1857B6]">{moneda(subtotal)}</Text>
                                    </View>
                                    <Pressable
                                        disabled={carrito.length === 0 || saving || !sucursalId || !ordenValida}
                                        onPress={guardarOrden}
                                        className={`items-center rounded-lg px-4 py-3 ${
                                            carrito.length === 0 || saving || !ordenValida
                                                ? "bg-[#B8B3BC]"
                                                : "bg-[#1857B6]"
                                        }`}
                                    >
                                        <Text className="font-semibold text-white">
                                            {saving ? "Guardando..." : "Crear orden"}
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setMostrarCarrito(true)}
                                        className="items-center rounded-lg border border-[#1857B6] bg-[#EAF1FC] px-4 py-3"
                                    >
                                        <Text className="font-semibold text-[#1857B6]">Ver carrito completo</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View className="gap-3">
                        {ordenesLoading ? (
                            <Text className="py-4 text-sm text-[#79747E]">Cargando �rdenes...</Text>
                        ) : null}
                        {!ordenesLoading && ordenes.length === 0 ? (
                            <View className="rounded-lg border border-[#E7E0EC] bg-white p-5">
                                <Text className="text-sm text-[#79747E]">
                                    Todav�a no hay �rdenes en esta sucursal.
                                </Text>
                            </View>
                        ) : null}
                        {ordenes.map((orden) => {
                            const estado = ESTADOS_ORDEN[orden.estado ?? "PENDIENTE"] ?? ESTADOS_ORDEN.PENDIENTE;
                            const siguienteLabel =
                                orden.estado === "PENDIENTE"
                                    ? "Preparar"
                                    : orden.estado === "EN_PREPARACION"
                                    ? "Marcar lista"
                                    : "Entregar";
                            const puedeAvanzar = ["PENDIENTE", "EN_PREPARACION", "LISTA"].includes(
                                orden.estado ?? ""
                            );
                            const cajaLista =
                                contextoCajaSucursalId === sucursalId &&
                                cajaAbierta?.estado === EstadoCaja.ABIERTA &&
                                corteCaja?.estado === EstadoCaja.ABIERTA;

                            return (
                                <View key={orden.id} className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-[#1C1B1F]">
                                                Orden #{orden.id}
                                                {orden.mesaNombre
                                                    ? ` � ${orden.mesaNombre}`
                                                    : orden.mesaId
                                                    ? ` � Mesa ${orden.mesaId}`
                                                    : ""}
                                            </Text>
                                            <Text className="mt-1 text-xs" style={{ color: estado.color }}>
                                                {estado.label}
                                            </Text>
                                        </View>
                                        <Text className="text-sm font-bold text-[#1C1B1F]">
                                            {moneda(orden.total)}
                                        </Text>
                                    </View>
                                    <View className="mt-3 gap-1 border-t border-[#EEEAF0] pt-3">
                                        {orden.detalles.map((detalle, index) => (
                                            <Text
                                                key={detalle.id ?? `${orden.id}-${index}`}
                                                className="text-xs text-[#49454F]"
                                            >
                                                {detalle.cantidad} � {detalle.producto?.nombre ?? `Producto #${detalle.productoId}`}
                                                {detalle.notas ? ` � ${detalle.notas}` : ""}
                                            </Text>
                                        ))}
                                    </View>
                                    {puedeAvanzar || orden.estado === "ENTREGADA" ? (
                                        <View className="mt-3 flex-row justify-end">
                                            {puedeAvanzar ? (
                                                <Pressable
                                                    disabled={saving}
                                                    onPress={() => orden.id && avanzarOrden(orden.id)}
                                                    className="rounded-lg bg-[#1857B6] px-4 py-2"
                                                >
                                                    <Text className="text-xs font-semibold text-white">
                                                        {siguienteLabel}
                                                    </Text>
                                                </Pressable>
                                            ) : (
                                                <Pressable
                                                    disabled={saving || !cajaLista}
                                                    onPress={() => setModalCobro(orden)}
                                                    className={`rounded-lg px-4 py-2 ${
                                                        cajaLista ? "bg-[#8B6914]" : "bg-[#B8B3BC]"
                                                    }`}
                                                >
                                                    <Text className="text-xs font-semibold text-white">
                                                        {cajaLoading
                                                            ? "Cargando caja..."
                                                            : cajaLista
                                                            ? "Cobrar"
                                                            : "Caja sin corte abierto"}
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Carrito flotante */}
            <CartSummary
                itemCount={carrito.length}
                subtotal={subtotal}
                onViewCart={() => setMostrarCarrito(true)}
            />

            {/* Modal de carrito completo */}
            <Modal
                visible={mostrarCarrito && carrito.length > 0}
                transparent
                animationType="slide"
                onRequestClose={() => setMostrarCarrito(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="max-h-[90%] rounded-t-3xl bg-white">
                        <View className="flex-row items-center justify-between border-b border-[#E7E0EC] px-4 py-4">
                            <Text className="text-lg font-semibold text-[#1C1B1F]">
                                Carrito ({carrito.length})
                            </Text>
                            <Pressable onPress={() => setMostrarCarrito(false)}>
                                <Ionicons name="close" size={24} color="#49454F" />
                            </Pressable>
                        </View>
                        <ScrollView className="flex-1 px-4 py-4">
                            {carrito.map((linea) => (
                                <View key={linea.lineId} className="border-b border-[#EEEAF0] py-4">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-[#1C1B1F]">
                                                {linea.producto.nombre}
                                            </Text>
                                            <Text className="mt-1 text-xs text-[#79747E]">
                                                {moneda(linea.producto.precio)} c/u
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Pressable onPress={() => cambiarCantidad(linea.lineId, -1)}>
                                                <Ionicons
                                                    name="remove-circle"
                                                    size={24}
                                                    color="#49454F"
                                                />
                                            </Pressable>
                                            <Text className="min-w-[24px] text-center text-sm font-semibold text-[#1C1B1F]">
                                                {linea.cantidad}
                                            </Text>
                                            <Pressable onPress={() => cambiarCantidad(linea.lineId, 1)}>
                                                <Ionicons
                                                    name="add-circle"
                                                    size={24}
                                                    color="#1857B6"
                                                />
                                            </Pressable>
                                        </View>
                                    </View>

                                    {linea.producto.modificadores?.map((modificador) => (
                                        <View key={modificador.id ?? modificador.nombre} className="mt-3">
                                            <Text className="mb-2 text-xs text-[#79747E]">
                                                {modificador.nombre}
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {modificador.opciones
                                                    .filter((opcion) => opcion.id !== undefined)
                                                    .map((opcion) => {
                                                        const cantidad = linea.opcionesCantidad[opcion.id!] ?? 0;
                                                        return (
                                                            <View
                                                                key={opcion.id}
                                                                className={`flex-row items-center rounded-md border px-2 py-1 ${
                                                                    cantidad > 0
                                                                        ? "border-[#1857B6] bg-[#EAF1FC]"
                                                                        : "border-[#D8D2DC]"
                                                                }`}
                                                            >
                                                                <Text
                                                                    className={`mr-2 text-xs ${
                                                                        cantidad > 0
                                                                            ? "text-[#1857B6]"
                                                                            : "text-[#49454F]"
                                                                    }`}
                                                                >
                                                                    {opcion.nombre} +{moneda(opcion.precio)}
                                                                </Text>
                                                                <Pressable
                                                                    onPress={() =>
                                                                        cambiarCantidadOpcion(
                                                                            linea.lineId,
                                                                            opcion.id!,
                                                                            -1
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="remove-circle-outline"
                                                                        size={18}
                                                                        color={
                                                                            cantidad > 0 ? "#1857B6" : "#B8B3BC"
                                                                        }
                                                                    />
                                                                </Pressable>
                                                                <Text className="mx-1 min-w-[14px] text-center text-xs font-semibold text-[#1C1B1F]">
                                                                    {cantidad}
                                                                </Text>
                                                                <Pressable
                                                                    onPress={() =>
                                                                        cambiarCantidadOpcion(
                                                                            linea.lineId,
                                                                            opcion.id!,
                                                                            1
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="add-circle-outline"
                                                                        size={18}
                                                                        color="#1857B6"
                                                                    />
                                                                </Pressable>
                                                            </View>
                                                        );
                                                    })}
                                            </View>
                                        </View>
                                    ))}

                                    <TextInput
                                        value={linea.notas}
                                        onChangeText={(notas) =>
                                            setCarrito((actual) =>
                                                actual.map((item) =>
                                                    item.lineId === linea.lineId
                                                        ? { ...item, notas }
                                                        : item
                                                )
                                            )
                                        }
                                        placeholder="Nota para cocina"
                                        className="mt-3 rounded-md border border-[#E7E0EC] px-2 py-2 text-xs text-[#1C1B1F]"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <View className="border-t border-[#E7E0EC] px-4 py-4">
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-sm font-semibold text-[#1C1B1F]">Total</Text>
                                <Text className="text-lg font-bold text-[#1857B6]">{moneda(subtotal)}</Text>
                            </View>
                            <Pressable
                                onPress={() => setMostrarCarrito(false)}
                                className="rounded-lg bg-[#1857B6] px-4 py-3"
                            >
                                <Text className="text-center font-semibold text-white">
                                    Continuar comprando
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de modificadores */}
            <ModifierModal
                visible={productoSeleccionado !== null}
                producto={productoSeleccionado}
                opcionesCantidad={opcionesModificador}
                onChangeOpcion={(opcionId, delta) => {
                    const cantidad = Math.max(0, (opcionesModificador[opcionId] ?? 0) + delta);
                    const nuevas = { ...opcionesModificador };
                    if (cantidad === 0) {
                        delete nuevas[opcionId];
                    } else {
                        nuevas[opcionId] = cantidad;
                    }
                    setOpcionesModificador(nuevas);
                }}
                onConfirm={confirmarModificadores}
                onClose={() => setProductoSeleccionado(null)}
            />

            {/* Modal de selecci�n de mesa */}
            <TableSelector
                visible={mostrarSelectorMesa}
                mesas={mesasDisponibles}
                loading={mesasLoading}
                onSelect={setMesaSeleccionada}
                onClose={() => setMostrarSelectorMesa(false)}
            />

            {/* Modal de pago */}
            <Modal
                visible={modalCobro !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setModalCobro(null)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="max-h-[90%] rounded-t-3xl bg-white">
                        <View className="flex-row items-center justify-between border-b border-[#E7E0EC] px-4 py-4">
                            <Text className="text-lg font-semibold text-[#1C1B1F]">
                                Cobrar orden #{modalCobro?.id}
                            </Text>
                            <Pressable onPress={() => setModalCobro(null)}>
                                <Ionicons name="close" size={24} color="#49454F" />
                            </Pressable>
                        </View>
                        <ScrollView className="flex-1 px-4 py-4">
                            {!usarPagoDividido ? (
                                <>
                                    <View className="mb-4 rounded-xl border border-[#E7E0EC] bg-[#F9F7FA] p-4">
                                        <Text className="text-xs text-[#79747E]">Total a cobrar</Text>
                                        <Text className="mt-2 text-2xl font-bold text-[#1C1B1F]">
                                            {moneda(modalCobro?.total ?? 0)}
                                        </Text>
                                    </View>
                                    <PaymentMethods
                                        selectedMethod={metodoPago}
                                        onSelectMethod={setMetodoPago}
                                    />
                                    <View className="mt-4">
                                        <Pressable
                                            onPress={() => setUsarPagoDividido(true)}
                                            className="rounded-lg border border-[#1857B6] bg-[#EAF1FC] px-4 py-3"
                                        >
                                            <Text className="text-center text-sm font-semibold text-[#1857B6]">
                                                Usar pago dividido
                                            </Text>
                                        </Pressable>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <SplitPayment
                                        totalOrden={modalCobro?.total ?? 0}
                                        metodoPagos={pagoDividido}
                                        onAgregarMetodo={agregarMetodoPagoDividido}
                                        onEliminarMetodo={eliminarMetodoPagoDividido}
                                        onActualizarMonto={actualizarMontoPagoDividido}
                                        metodosDisponibles={[
                                            "EFECTIVO",
                                            "TARJETA_DEBITO",
                                            "TARJETA_CREDITO",
                                            "TRANSFERENCIA_BANCARIA",
                                            "DIGITAL",
                                        ]}
                                    />
                                    <View className="mt-4">
                                        <Pressable
                                            onPress={() => {
                                                setUsarPagoDividido(false);
                                                setPagoDividido([]);
                                            }}
                                            className="rounded-lg border border-[#D8D2DC] bg-white px-4 py-3"
                                        >
                                            <Text className="text-center text-sm font-semibold text-[#49454F]">
                                                Usar m�todo �nico
                                            </Text>
                                        </Pressable>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                        <View className="border-t border-[#E7E0EC] px-4 py-4">
                            <Pressable
                                disabled={
                                    saving ||
                                    !cajaAbierta ||
                                    !corteCaja ||
                                    corteCaja.estado !== EstadoCaja.ABIERTA ||
                                    (usarPagoDividido &&
                                        pagoDividido.reduce((sum, p) => sum + p.monto, 0) <
                                        (modalCobro?.total ?? 0))
                                }
                                onPress={confirmarCobro}
                                className={`items-center rounded-lg px-4 py-3 ${
                                    saving ? "bg-[#B8B3BC]" : "bg-[#8B6914]"
                                }`}
                            >
                                <Text className="font-semibold text-white">
                                    {saving ? "Procesando..." : "Confirmar pago"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PosHomeScreen;

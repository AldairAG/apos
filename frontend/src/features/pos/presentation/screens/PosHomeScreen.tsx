import { EstadoCaja } from "@/features/caja/enum/Caja.Enums";
import { useMesa } from "@/features/mesa/presentation/hook/useMesa";
import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { TipoOrden, type MetodoPago, type OrdenDto } from "../../domain/types/pos.types";
import { usePos } from "../hook/usePos";
import useCart from "../hook/useCart";
import {
    CartSummary,
    ModifierModal,
    OrderTypeSelector,
    PaymentMethods,
    SplitPayment,
} from "../components";
import { useSucursal } from "@/features/sucursal/presentation/hook/useSucursal";
import ProductosSelector from "../components/ProductosSelector";
import { moneda } from "@/helpers/FormatHelpers";
import ModalCart from "../components/ModalCart";

type VistaPos = "nueva" | "ordenes";

interface SplitPaymentItem {
    metodo: MetodoPago;
    monto: number;
}


const ESTADOS_ORDEN: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "#8A6D00" },
    EN_PREPARACION: { label: "En preparaci�n", color: "#1857B6" },
    LISTA: { label: "Lista", color: "#3A7D44" },
    ENTREGADA: { label: "Entregada", color: "#3A7D44" },
    CANCELADA: { label: "Cancelada", color: "#B3261E" },
    COBRADA: { label: "Cobrada", color: "#8B6914" },
};


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

    const { sucursalActual } = useSucursal();

    const {
        carrito,
        tipoOrden,
        mesaSeleccionada,
        ordenValida,
        subtotal,
        clearCarrito,
        seleccionarMesa,
    } = useCart();

    const { mesasDisponibles, mesas, loading: mesasLoading, cargarMesas } = useMesa();

    const [vista, setVista] = useState<VistaPos>("nueva");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [modalCobro, setModalCobro] = useState<OrdenDto | null>(null);
    const [usarPagoDividido, setUsarPagoDividido] = useState(false);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
    const [pagoDividido, setPagoDividido] = useState<SplitPaymentItem[]>([]);
    const [contextoCajaSucursalId, setContextoCajaSucursalId] = useState<number | null>(null);


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
        seleccionarTipoOrden(tipo);
        if (tipo !== "EN_MESA") seleccionarMesa(null);
    };


    const guardarOrden = async () => {
        if (!sucursalId || carrito.length === 0 || !tipoOrden || !ordenValida) return;
        limpiarError();
        const orden = {
            subtotal,
            descuento: 0,
            total: subtotal,
            sucursalId,
            tipo: tipoOrden,
            mesaId: tipoOrden.toString() === "EN_MESA" ? mesaSeleccionada!.id ?? null : null,
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
            clearCarrito();
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
                        <Text className="text-lg font-semibold text-[#1C1B1F]">Sucursal {sucursalActual?.nombre}</Text>
                    </View>
                    {/* <Pressable
                        onPress={() => router.replace("/admin_home" as any)}
                        className="flex-row items-center gap-2 rounded-lg border border-[#D8D2DC] bg-white px-3 py-2"
                    >
                        <Ionicons name="arrow-back" size={16} color="#49454F" />
                        <Text className="text-sm text-[#49454F]">Administraci�n</Text>
                    </Pressable> */}
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
                            <OrderTypeSelector selectedType={tipoOrden as Exclude<TipoOrden, "EN_MESA">} onSelectType={seleccionarTipoOrden} />
                        </View>

                        {/* Area para seleccionar una mesa*/}
                        <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                            <Text className="mb-3 text-base font-semibold text-[#1C1B1F]">Seleccionar mesa</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {mesas.map((mesa) => {
                                    const seleccionada = mesaSeleccionada?.id === mesa.id;
                                    const ocupada = mesa.estado === "OCUPADA";

                                    const contenedor = seleccionada
                                        ? "bg-[#1857B6] border-[#1857B6]"
                                        : ocupada
                                            ? "bg-[#FDECEA] border-[#F2B8B5]"
                                            : "bg-white border-[#D8D2DC]";
                                    const textoPrincipal = seleccionada ? "text-white" : "text-[#1C1B1F]";
                                    const textoSecundario = seleccionada ? "text-white/80" : "text-[#49454F]";

                                    return (
                                        <Pressable
                                            key={mesa.id}
                                            onPress={() => seleccionarMesa(mesa)}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: seleccionada }}
                                            accessibilityLabel={`${mesa.nombre}, ${ocupada ? "ocupada" : "libre"}`}
                                            className={`min-w-40 min-h-28 flex-1 rounded-2xl border-2 p-4 justify-between active:opacity-80 ${contenedor}`}
                                        >
                                            {/* Fila superior: nombre grande + check si está seleccionada */}
                                            <View className="flex-row items-start justify-between">
                                                <Text className={`text-xl font-bold ${textoPrincipal}`} numberOfLines={1}>
                                                    {mesa.nombre}
                                                </Text>
                                                {seleccionada && (
                                                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                                                )}
                                            </View>

                                            {/* Estado: chip con icono + texto (no depende solo del color) */}
                                            <View
                                                className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 mt-2 ${seleccionada ? "bg-white/20" : ocupada ? "bg-[#B3261E]" : "bg-[#E4F5E9]"
                                                    }`}
                                            >
                                                <Ionicons
                                                    name={ocupada ? "people" : "checkmark-circle-outline"}
                                                    size={12}
                                                    color={seleccionada || ocupada ? "#FFFFFF" : "#1C7C3F"}
                                                />
                                                <Text
                                                    className={`text-[11px] font-bold ${seleccionada || ocupada ? "text-white" : "text-[#1C7C3F]"
                                                        }`}
                                                >
                                                    {ocupada ? "OCUPADA" : "LIBRE"}
                                                </Text>
                                            </View>

                                            {/* Resumen de la orden actual: total protagonista, estado secundario */}
                                            <View className="flex-row items-end justify-between mt-2">
                                                {mesa.ordenActual ? (
                                                    <>
                                                        <Text className={`text-xs ${textoSecundario}`} numberOfLines={1}>
                                                            {mesa.ordenActual.estado}
                                                        </Text>
                                                        <Text className={`text-lg font-bold ${textoPrincipal}`}>
                                                            ${mesa.ordenActual.total}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <Text className={`text-xs ${textoSecundario}`}>Sin orden</Text>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })
                                }
                            </View>
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
                                                    className={`rounded-lg px-4 py-2 ${cajaLista ? "bg-[#8B6914]" : "bg-[#B8B3BC]"
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


            {/* Selección de productos */}
            <ProductosSelector />

            {/* Carrito flotante */}
            <CartSummary
                onViewCart={() => setMostrarCarrito(true)}
            />

            {/* Modal del carrito */}
            <ModalCart
                mostrarCarrito={mostrarCarrito}
                setMostrarCarrito={setMostrarCarrito}
            />


            {/* Modal de modificadores */}
            <ModifierModal />

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
                                className={`items-center rounded-lg px-4 py-3 ${saving ? "bg-[#B8B3BC]" : "bg-[#8B6914]"
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

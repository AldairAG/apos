import { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { ProductoDto } from "@/features/productos/domain/types/producto.types";
import { useContext } from "react";
import type { OrdenDto, TipoOrden } from "../../domain/types/pos.types";
import { CartContext } from "../context/CartContext";

const generarLineId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


const useCart = () => {
    const context = useContext(CartContext);


    if (!context) {
        throw new Error("useCart debe utilizarse dentro de CartProvider");
    }

    const {
        carritoContext,
        setCarrito,
        productoSeleccionado,
        setProductoSeleccionado,
        opcionesModificador,
        setOpcionesModificador,
    } = context;

    const subtotal = carritoContext.carrito.reduce((total, linea) => {
        const opciones = linea.producto.modificadores?.flatMap((modificador) => modificador.opciones) ?? [];
        const extra = opciones
            .filter((opcion) => opcion.id !== undefined && (linea.opcionesCantidad[opcion.id] ?? 0) > 0)
            .reduce((sum, opcion) => sum + opcion.precio * linea.opcionesCantidad[opcion.id!], 0);
        return total + linea.producto.precio * linea.cantidad + extra;
    }, 0);

    const ordenValida = carritoContext.tipoOrden !== null && (carritoContext.tipoOrden.toString() !== "EN_MESA" || carritoContext.mesaSeleccionada !== null);

    const agregarProductoAlCarrito = (
        producto: ProductoDto,
        opcionesCantidad: Record<number, number>
    ) => {
        if (!producto.id) return;

        setCarrito((actual) => ({
            ...actual,
            carrito: [
                ...actual.carrito,
                {
                    itemId: generarLineId(),
                    producto,
                    cantidad: 1,
                    notas: "",
                    opcionesCantidad,
                },
            ],
        }));
    };


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

    const confirmarModificadores = () => {
        if (!productoSeleccionado) return;
        agregarProductoAlCarrito(productoSeleccionado, opcionesModificador);
        setProductoSeleccionado(null);
        setOpcionesModificador({});
    };

    const cambiarCantidad = (itemId: string, delta: number) => {
        setCarrito((actual) => ({
            ...actual,
            carrito: actual.carrito
                .map((item) =>
                    item.itemId === itemId ? { ...item, cantidad: item.cantidad + delta } : item
                )
                .filter((item) => item.cantidad > 0),
        }));
    };

    const cambiarCantidadOpcion = (itemId: string, opcionId: number, delta: number) => {
        setCarrito((actual) => ({
            ...actual,
            carrito: actual.carrito.map((item) => {
                if (item.itemId !== itemId) return item;
                const cantidad = Math.max(0, (item.opcionesCantidad[opcionId] ?? 0) + delta);
                const opcionesCantidad = { ...item.opcionesCantidad };
                if (cantidad === 0) {
                    delete opcionesCantidad[opcionId];
                } else {
                    opcionesCantidad[opcionId] = cantidad;
                }
                return { ...item, opcionesCantidad };
            }),
        }));
    };


    const clearCarrito = () => {
        setCarrito({
            carrito: [],
            tipoOrden: null,
            mesaSeleccionada: null,
        });
    };

    const onChangeOpcion = (opcionId: number, delta: number) => {
        const cantidad = Math.max(0, (opcionesModificador[opcionId] ?? 0) + delta);
        const nuevas = { ...opcionesModificador };
        if (cantidad === 0) {
            delete nuevas[opcionId];
        } else {
            nuevas[opcionId] = cantidad;
        }
        setOpcionesModificador(nuevas);
    };

    const clearProductoSeleccionado = () => {
        setProductoSeleccionado(null);
        setOpcionesModificador({});
    };

    const agregarNota = (itemId: string, notas: string) => {
        setCarrito((actual) => ({
            ...actual,
            carrito: actual.carrito.map((item) =>
                item.itemId === itemId ? { ...item, notas } : item
            ),
        }));
    };

    const seleccionarTipoOrden = (tipo: TipoOrden) => {
        setCarrito((actual) => ({
            ...actual,
            tipoOrden: tipo,
            mesaSeleccionada: tipo === "EN_MESA" ? actual.mesaSeleccionada : null,
        }));
    };

    const seleccionarMesa = (mesa: MesaDto | null) => {
        setCarrito((actual) => ({
            ...actual,
            mesaSeleccionada: mesa,
            tipoOrden: "EN_MESA",
        }));
    };

    const construirOrden = (sucursalId: number): OrdenDto | null => {
        const { carrito, tipoOrden, mesaSeleccionada } = carritoContext;
        if (carrito.length === 0 || !tipoOrden || !ordenValida) return null;
        return {
            subtotal,
            descuento: 0,
            total: subtotal,
            sucursalId,
            tipo: tipoOrden,
            mesaId: tipoOrden === "EN_MESA" ? mesaSeleccionada?.id ?? null : null,
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
    };

    return {
        subtotal,
        carrito: carritoContext.carrito,
        tipoOrden: carritoContext.tipoOrden,
        mesaSeleccionada: carritoContext.mesaSeleccionada,
        productoSeleccionado,
        opcionesModificador,
        ordenValida,
        agregarProducto,
        confirmarModificadores,
        cambiarCantidad,
        cambiarCantidadOpcion,
        clearCarrito,
        onChangeOpcion,
        clearProductoSeleccionado,
        agregarNota,
        seleccionarTipoOrden,
        seleccionarMesa,
        construirOrden,
    };

};

export default useCart;
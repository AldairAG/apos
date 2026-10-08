import { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { ProductoDto } from "@/features/productos/domain/types/producto.types";
import { useState, useContext } from "react";
import { CartContext, itemCarrito } from "../context/CartContext";

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


const useCart = () => {
    const context = useContext(CartContext);


    if (!context) {
        throw new Error("useCart debe utilizarse dentro de CartProvider");
    }

    const { carritoContext, setCarrito } = context;

    console.log(carritoContext);

    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoDto | null>(null);
    const [opcionesModificador, setOpcionesModificador] = useState<Record<number, number>>({});

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
        setCarrito((context) => {
            context.carrito = (context.carrito as itemCarrito[])
                .map((item) =>
                    item.itemId === itemId ? { ...item, cantidad: item.cantidad + delta } : item
                )
                .filter((item) => item.cantidad > 0) as itemCarrito[];
            return context;
        });
    };

    const cambiarCantidadOpcion = (productoId: string, opcionId: number, delta: number) => {
        setCarrito((actual) => {
            actual.carrito = (actual.carrito as itemCarrito[])
                .map((item) => {
                    if (item.producto.id?.toString() !== productoId) return item;
                    const cantidad = Math.max(0, (item.opcionesCantidad[opcionId] ?? 0) + delta);
                    const opcionesCantidad = { ...item.opcionesCantidad };
                    if (cantidad === 0) {
                        delete opcionesCantidad[opcionId];
                    } else {
                        opcionesCantidad[opcionId] = cantidad;
                    }
                    return { ...item, opcionesCantidad };
                })
                .filter((item) => item.cantidad > 0) as itemCarrito[];
            return actual;
        });
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

    const agregarNota = (itemId: string, nota: string) => {
        setCarrito((actual) => {
            actual.carrito = (actual.carrito as itemCarrito[])
                .map((item) =>
                    item.itemId === itemId ? { ...item, nota } : item
                );
            return actual;
        });
    };

    const seleccionarMesa = (mesa: MesaDto | null) => {
        setCarrito((actual) => ({
            ...actual,
            mesaSeleccionada: mesa,
            tipoOrden: "EN_MESA",
        }));
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
        seleccionarMesa,
    };

};

export default useCart;
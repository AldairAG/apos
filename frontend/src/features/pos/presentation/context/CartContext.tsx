// CartContext.tsx

import { MesaDto } from "@/features/mesa/domain/types/mesa.types";
import { ProductoDto } from "@/features/productos/domain/types/producto.types";
import {
  createContext,
  PropsWithChildren,
  useState,
} from "react";
import { TipoOrden } from "../../domain/types/pos.types";

export interface itemCarrito {
    itemId: string;
    producto: ProductoDto;
    cantidad: number;
    notas: string;
    opcionesCantidad: Record<number, number>;
}


interface posContext {
    carrito: itemCarrito[];
    tipoOrden: TipoOrden | null;
    mesaSeleccionada: MesaDto | null;
}

type CartContextType = {
  carritoContext: posContext;
  setCarrito: React.Dispatch<React.SetStateAction<posContext>>;
};

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: PropsWithChildren) => {

  const [carritoContext, setCarrito] = useState<posContext>({
    carrito: [],
    tipoOrden: null,
    mesaSeleccionada: null,
  });

  return (
    <CartContext.Provider
      value={{
        carritoContext,
        setCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


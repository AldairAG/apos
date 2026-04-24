import { Inventario } from "./inventario.types";

interface InventarioState {
    inventario: Inventario | null;
    loadingInventario: boolean;
    errorInventario: string | null;
}
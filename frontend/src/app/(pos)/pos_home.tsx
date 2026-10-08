import PosHomeScreen from "@/features/pos/presentation/screens/PosHomeScreen";
import { CartProvider } from "@/features/pos/presentation/context/CartContext";

// Ruta: /pos_home — pantalla inicial del módulo POS.
export default function PosHome() {
  return (
    <CartProvider>
      <PosHomeScreen />
    </CartProvider>
  );
}

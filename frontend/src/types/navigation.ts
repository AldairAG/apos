import { ROUTES } from "@/routes/routes";
import { Ionicons } from "@expo/vector-icons";

export const NAV_ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Resumen del día", icon: "home-outline", route: ROUTES.ADMIN.HOME },
  { label: "Sucursales", icon: "business-outline", route: "/sucursal/SeleccionarSucursal" },
  { label: "POS", icon: "storefront-outline", route: "/pos_home" },
  { label: "Recetas", icon: "book-outline", route: ROUTES.ADMIN.RECETAS.PANEL },
  { label: "Productos", icon: "pricetags-outline", route: "/productos" },
  { label: "Reportes", icon: "bar-chart-outline", route: "/reportes" },
];
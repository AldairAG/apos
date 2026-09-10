import { Ionicons } from "@expo/vector-icons";

export const NAV_ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Resumen del día", icon: "home-outline", route: "/dashboard" },
  { label: "Movimientos", icon: "swap-vertical-outline", route: "/movimientos" },
  { label: "Cuentas", icon: "wallet-outline", route: "/cuentas" },
  { label: "Categorías", icon: "pricetags-outline", route: "/categorias" },
  { label: "Reportes", icon: "bar-chart-outline", route: "/reportes" },
  { label: "Configuración", icon: "settings-outline", route: "/configuracion" },
  { label: "Sucursales", icon: "business-outline", route: "/sucursal/SeleccionarSucursal" },
  { label: "POS", icon: "storefront-outline", route: "/pos_home" },
];
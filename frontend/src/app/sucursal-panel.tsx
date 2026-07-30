import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalRequiredRoute } from '@/components/SucursalRequiredRoute';
import { SucursalSelector } from '@/components/SucursalSelector';
import { COLORS, POSIcon } from '@/components/pos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { ROUTES } from '@/routes/routes';
import { useRouter } from 'expo-router';
import { ComponentType, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// Vistas hijas del panel: se reutilizan tal cual (mismos componentes que
// usan sus rutas propias), pero aquí se renderizan como contenido embebido
// dentro del layout del panel, en vez de navegar a una pantalla nueva.
import CajaHome from './caja/caja-home';
import CategoriasScreen from './config/categorias';
import MesasScreen from './config/mesas';
import InventarioSucursalScreen from './inventario/existencias';
import ExtrasScreen from './productos/extras';
import ProductosScreen from './productos/productos';
import EmployeesScreen from './admin/empleados';
import descuentosScreen from './admin/descuentos';

const { width, height } = Dimensions.get('window');
const IS_MOBILE = width < 768;
const IS_TABLET = width >= 768 && width < 1024;

// ── Design tokens: MD3 + Neo-Brutalismo Funcional (mismos que el resto de la app) ──
const INK = '#0D0D0D';
const BORDER_W = 3;
const RADIUS = 16;
const RIPPLE = { color: 'rgba(0,0,0,0.18)', borderless: false };

const hardShadow = (pressed: boolean) => ({
  shadowColor: INK,
  shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: pressed ? 0 : 5,
  transform: [{ translateX: pressed ? 3 : 0 }, { translateY: pressed ? 3 : 0 }],
});

// Vista que se muestra en el área de contenido del panel
type VistaPanel = 'caja' | 'pos' | 'inventario' | 'productos' | 'categorias' | 'mesas' | 'extras' | 'empleados' | 'descuentos';

// Componente a renderizar para cada vista del panel (mismos componentes
// que ya existen como pantallas propias, reutilizados sin duplicar código)
const VISTAS_PANEL: Record<VistaPanel, ComponentType> = {
  caja: CajaHome,
  inventario: InventarioSucursalScreen,
  productos: ProductosScreen,
  extras: ExtrasScreen,
  categorias: CategoriasScreen, // Reutilizamos la misma vista de productos para categorías
  mesas: MesasScreen,
  empleados: EmployeesScreen,
  descuentos: descuentosScreen,
};

interface MenuOption {
  id: string;
  titulo: string;
  icono: string;
  vista?: VistaPanel;   // opcional ahora
  ruta?: string;         // nuevo: para secciones con su propio stack, como clientes
  color: string;
}

// Psicología del color: cada categoría conserva un color semántico estable
// (venta = verde/afirmativo, inventario = azul/informativo, config = ámbar-cálido,
// personal = naranja cercano, clientes = índigo confiable, caja = morado premium)
// para que el operador reconozca la sección por color sin leer el texto.
const MENU_OPTIONS: MenuOption[] = [
  {
    id: 'pos',
    titulo: 'Punto de Venta',
    icono: 'cart',
    vista: 'caja',
    color: COLORS.success,
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    icono: 'cube',
    vista: 'inventario',
    color: COLORS.info,
  },
  {
    id: 'productos',
    titulo: 'Productos',
    icono: 'restaurant',
    vista: 'productos',
    color: COLORS.warning,
  },
  {
    id: 'categorias',
    titulo: 'Categorías',
    icono: 'grid',
    vista: 'categorias',
    color: COLORS.primary,
  },
  {
    id: 'extras',
    titulo: 'Extras',
    icono: 'add-circle',
    vista: 'extras',
    color: COLORS.primary,
  },
  {
    id: 'mesas',
    titulo: 'Configuración de Mesas',
    icono: 'grid',
    vista: 'mesas',
    color: COLORS.primary,
  },
  {
    id: 'corte',
    titulo: 'Caja',
    icono: 'calculator',
    vista: 'caja',
    color: '#9C27B0',
  },
  {
    id: 'personal',
    titulo: 'Personal',
    icono: 'people',
    vista: 'empleados',
    color: '#FF5722',
  },
  {
    id: 'clientes',
    titulo: 'Clientes Frecuentes',
    icono: 'person',
    ruta: ROUTES.CLIENTES.BUSCAR,   // en vez de vista: 'personal'
    color: '#3F51B5',
  },
  {
    id: 'descuentos',
    titulo: 'Descuentos',
    icono: 'pricetag',
    vista: 'descuentos',
    color: '#009688',
  },
];

export default function SucursalPanelScreen() {
  const router = useRouter();
  const { sucursalActual } = useSucursal();

  // En móvil: controla si el drawer está abierto (false = cerrado).
  // En tablet/desktop: el sidebar siempre está visible, este estado no se usa.
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  // Vista mostrada por defecto al entrar al panel: Caja (opción "corte").
  const [activeOption, setActiveOption] = useState<string>('corte');
  const [vistaActiva, setVistaActiva] = useState<VistaPanel>('caja');
  const [mostrarSelectorSucursal, setMostrarSelectorSucursal] = useState(false);

  const handleMenuClick = (option: MenuOption) => {
    // POS se abre en su propia ruta; no se renderiza dentro del layout del panel.
    if (option.id === 'pos') {
      if (IS_MOBILE) setDrawerAbierto(false);
      router.push(ROUTES.POS.HOME);
      return;
    }

    setActiveOption(option.id);
    if (option.vista) {
      setVistaActiva(option.vista);
    }
    // En móvil cerramos el drawer al cambiar de vista
    if (IS_MOBILE) setDrawerAbierto(false);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const handleSucursalSeleccionada = () => {
    setMostrarSelectorSucursal(false);
  };

  // Componente de la vista actualmente seleccionada en el Sidebar
  const VistaActivaComponent = VISTAS_PANEL[vistaActiva];

  const renderSidebarContent = () => (
    <>
      {/* Header del Sidebar */}
      <View style={styles.sidebarHeader}>
        <View style={styles.sucursalBadge}>
          <POSIcon name="storefront" size={30} color={INK} />
        </View>
        <View style={styles.sucursalHeaderInfo}>
          <View style={styles.sucursalPill}>
            <Text style={styles.sucursalPillText}>SUCURSAL ACTIVA</Text>
          </View>
          <Text style={styles.sucursalHeaderNombre} numberOfLines={1}>
            {sucursalActual?.nombre || 'Sin Sucursal'}
          </Text>
          <Text style={styles.sucursalHeaderCodigo}>
            {sucursalActual?.codigo || '---'}
          </Text>
        </View>
      </View>

      {/* Menú de Opciones */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {MENU_OPTIONS.map((option) => {
          const isActive = activeOption === option.id;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.menuItem,
                isActive && { backgroundColor: option.color },
                hardShadow(pressed),
              ]}
              onPress={() => handleMenuClick(option)}
              android_ripple={RIPPLE}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: isActive ? COLORS.white : option.color },
                ]}
              >
                <POSIcon
                  name={option.icono as any}
                  size={19}
                  color={INK}
                />
              </View>
              <Text
                style={[styles.menuText, isActive && styles.menuTextActive]}
                numberOfLines={1}
              >
                {option.titulo.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Footer del Sidebar */}
      <View style={styles.sidebarFooter}>
        <Pressable
          style={({ pressed }) => [styles.backButton, hardShadow(pressed)]}
          onPress={handleBackToDashboard}
          android_ripple={RIPPLE}
        >
          <POSIcon name="arrow-back" size={18} color={INK} />
          <Text style={styles.backText}>VOLVER AL DASHBOARD</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <ProtectedRoute requiredRoute={ROUTES.SUCURSAL_PANEL}>
      <SucursalRequiredRoute requiredRoute={ROUTES.SUCURSAL_PANEL}>
        <View style={styles.container}>

          {/*
           * MÓVIL: drawer como overlay absoluto.
           * TABLET/DESKTOP: sidebar fijo en el layout normal (no overlay).
           */}

          {IS_MOBILE ? (
            <>
              {/* Overlay oscuro al abrir el drawer */}
              {drawerAbierto && (
                <Pressable
                  style={styles.overlay}
                  onPress={() => setDrawerAbierto(false)}
                />
              )}
              {/* Drawer deslizable desde la izquierda */}
              {drawerAbierto && (
                <View style={styles.drawer}>
                  {renderSidebarContent()}
                </View>
              )}
            </>
          ) : (
            /* Sidebar fijo visible siempre en tablet/desktop */
            <View style={styles.sidebar}>
              {renderSidebarContent()}
            </View>
          )}

          {/* Contenido Principal */}
          <View style={styles.mainContent}>

            {/* Header */}
            <View style={styles.contentHeader}>
              {/* Botón de menú solo visible en móvil */}
              {IS_MOBILE ? (
                <Pressable
                  style={({ pressed }) => [styles.menuToggle, hardShadow(pressed)]}
                  onPress={() => setDrawerAbierto(true)}
                  android_ripple={RIPPLE}
                >
                  <POSIcon name="menu" size={22} color={INK} />
                </Pressable>
              ) : (
                <View style={styles.headerSpacer} />
              )}
              <Text style={styles.contentTitle} numberOfLines={1}>PANEL DE SUCURSAL</Text>
              <Pressable
                style={({ pressed }) => [styles.changeSucursalButton, hardShadow(pressed)]}
                onPress={() => setMostrarSelectorSucursal(true)}
                android_ripple={RIPPLE}
              >
                <POSIcon name="swap-horizontal" size={16} color={INK} />
                <Text style={styles.changeSucursalText}>CAMBIAR</Text>
              </Pressable>
            </View>

            {/* Contenedor de la vista activa (Outlet del panel) */}
            <View style={styles.vistaActivaContainer}>
              <VistaActivaComponent />
            </View>

          </View>
        </View>

        <SucursalSelector
          visible={mostrarSelectorSucursal}
          onClose={() => setMostrarSelectorSucursal(false)}
          onSelect={handleSucursalSeleccionada}
        />
      </SucursalRequiredRoute>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F1EC',
  },

  // ── Overlay móvil (oscurece el contenido detrás del drawer) ──────────────
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 13, 13, 0.55)',
    zIndex: 9,
  },

  // ── Drawer móvil (posición absoluta, encima del contenido) ────────────────
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.82,
    height,
    backgroundColor: COLORS.white,
    borderRightWidth: BORDER_W,
    borderRightColor: INK,
    zIndex: 10,
  },

  // ── Sidebar fijo tablet/desktop (ocupa espacio en el layout) ─────────────
  sidebar: {
    width: IS_TABLET ? 240 : 288,
    backgroundColor: COLORS.white,
    borderRightWidth: BORDER_W,
    borderRightColor: INK,
  },

  // ── Header del Sidebar ────────────────────────────────────────────────────
  sidebarHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  sucursalBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalHeaderInfo: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  sucursalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: INK,
  },
  sucursalPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  sucursalHeaderNombre: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },
  sucursalHeaderCodigo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Menú — objetivos táctiles grandes, color sólido al activarse ─────────
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: COLORS.white,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
    marginLeft: 12,
    flex: 1,
  },
  menuTextActive: {
    color: INK,
  },

  // ── Footer del Sidebar ────────────────────────────────────────────────────
  sidebarFooter: {
    padding: 14,
    borderTopWidth: BORDER_W,
    borderTopColor: INK,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    gap: 8,
  },
  backText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── Contenido Principal ───────────────────────────────────────────────────
  mainContent: {
    flex: 1,
  },
  // Contenedor de la vista activa (Outlet del panel): ocupa todo el espacio
  // restante debajo del header para que la vista hija se vea igual que
  // cuando se accedía como pantalla independiente.
  vistaActivaContainer: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  // Botón hamburguesa — solo se renderiza en móvil
  menuToggle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F1EC',
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    textAlign: 'center',
  },
  // Spacer invisible para centrar el título cuando no hay botón
  headerSpacer: {
    width: 46,
  },
  changeSucursalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: INK,
  },
  changeSucursalText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
});
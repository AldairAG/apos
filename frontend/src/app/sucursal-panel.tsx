import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalRequiredRoute } from '@/components/SucursalRequiredRoute';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { ROUTES } from '@/routes/routes';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const IS_MOBILE = width < 768;
const IS_TABLET = width >= 768 && width < 1024;

// Opciones del menú del sidebar
interface MenuOption {
  id: string;
  titulo: string;
  icono: string;
  ruta: string;
  color: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: 'pos',
    titulo: 'Punto de Venta',
    icono: '🛒',
    ruta: ROUTES.POS.VISTA_MESAS,
    color: '#4CAF50',
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    icono: '📦',
    ruta: ROUTES.INVENTARIO.MATERIALES,
    color: '#2196F3',
  },
  {
    id: 'productos',
    titulo: 'Productos',
    icono: '🍽️',
    ruta: ROUTES.PRODUCTOS.PRODUCTOS,
    color: '#FF9800',
  },
  {
    id: 'corte',
    titulo: 'Corte de Caja',
    icono: '🧮',
    ruta: ROUTES.REPORTES.CORTES,
    color: '#9C27B0',
  },
  {
    id: 'gastos',
    titulo: 'Gastos',
    icono: '💸',
    ruta: ROUTES.CAJA.GASTOS,
    color: '#F44336',
  },
];

export default function SucursalPanelScreen() {
  const router = useRouter();
  const { sucursalActual } = useSucursal();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(IS_MOBILE);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const handleMenuClick = (option: MenuOption) => {
    setActiveOption(option.id);
    router.push(option.ruta as any);
    
    // En móvil, cerrar el sidebar después de seleccionar
    if (IS_MOBILE) {
      setSidebarCollapsed(true);
    }
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderSidebarContent = () => (
    <>
      {/* Header del Sidebar */}
      <View style={styles.sidebarHeader}>
        {!sidebarCollapsed && (
          <>
            <View style={styles.sucursalBadge}>
              <Text style={styles.sucursalIcon}>🏪</Text>
            </View>
            <View style={styles.sucursalHeaderInfo}>
              <Text style={styles.sucursalHeaderLabel}>SUCURSAL</Text>
              <Text style={styles.sucursalHeaderNombre} numberOfLines={1}>
                {sucursalActual?.nombre || 'Sin Sucursal'}
              </Text>
              <Text style={styles.sucursalHeaderCodigo}>
                {sucursalActual?.codigo || '---'}
              </Text>
            </View>
          </>
        )}
        {sidebarCollapsed && (
          <View style={styles.sucursalBadgeCollapsed}>
            <Text style={styles.sucursalIconCollapsed}>🏪</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Menú de Opciones */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {MENU_OPTIONS.map((option) => {
          const isActive = activeOption === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.menuItem,
                sidebarCollapsed && styles.menuItemCollapsed,
                isActive && styles.menuItemActive,
              ]}
              onPress={() => handleMenuClick(option)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: isActive ? option.color : '#F5F5F5' },
                ]}
              >
                <Text style={styles.menuIcon}>{option.icono}</Text>
              </View>
              {!sidebarCollapsed && (
                <Text
                  style={[
                    styles.menuText,
                    isActive && { color: option.color, fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {option.titulo}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer del Sidebar */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={[
            styles.backButton,
            sidebarCollapsed && styles.backButtonCollapsed,
          ]}
          onPress={handleBackToDashboard}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
          {!sidebarCollapsed && (
            <Text style={styles.backText}>Volver al Dashboard</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ProtectedRoute requiredRoute={ROUTES.SUCURSAL_PANEL}>
      <SucursalRequiredRoute requiredRoute={ROUTES.SUCURSAL_PANEL}>
        <View style={styles.container}>
          {/* Overlay para móvil cuando el sidebar está abierto */}
          {IS_MOBILE && !sidebarCollapsed && (
            <Pressable style={styles.overlay} onPress={toggleSidebar} />
          )}

          {/* Sidebar */}
          <View
            style={[
              styles.sidebar,
              sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded,
              IS_MOBILE && !sidebarCollapsed && styles.sidebarMobile,
            ]}
          >
            {renderSidebarContent()}
          </View>

          {/* Área de Contenido Principal */}
          <View style={styles.mainContent}>
            {/* Header del Contenido */}
            <View style={styles.contentHeader}>
              <TouchableOpacity
                style={styles.menuToggle}
                onPress={toggleSidebar}
                activeOpacity={0.7}
              >
                <Text style={styles.menuToggleIcon}>☰</Text>
              </TouchableOpacity>
              <Text style={styles.contentTitle}>Panel de Sucursal</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Contenido Vacío por Defecto */}
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyTitle}>
                {sucursalActual?.nombre || 'Panel de Sucursal'}
              </Text>
              <Text style={styles.emptyMessage}>
                Selecciona una opción del menú lateral para comenzar
              </Text>

              {/* Cards de acceso rápido */}
              <View style={styles.quickAccessGrid}>
                {MENU_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.quickAccessCard,
                      { borderLeftColor: option.color },
                    ]}
                    onPress={() => handleMenuClick(option)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickAccessIcon}>{option.icono}</Text>
                    <Text style={styles.quickAccessTitle}>{option.titulo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </SucursalRequiredRoute>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  // Overlay para móvil
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  // Sidebar
  sidebar: {
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sidebarExpanded: {
    width: IS_MOBILE ? width * 0.75 : IS_TABLET ? 240 : 280,
  },
  sidebarCollapsed: {
    width: IS_MOBILE ? 0 : 80,
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: height,
  },
  // Header del Sidebar
  sidebarHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  sucursalBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  sucursalIcon: {
    fontSize: 36,
  },
  sucursalBadgeCollapsed: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalIconCollapsed: {
    fontSize: 28,
  },
  sucursalHeaderInfo: {
    alignItems: 'center',
    width: '100%',
  },
  sucursalHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sucursalHeaderNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
  },
  sucursalHeaderCodigo: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  // Menú
  menuContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: '#F1F8F4',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 12,
    flex: 1,
  },
  // Footer del Sidebar
  sidebarFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  backButtonCollapsed: {
    paddingHorizontal: 0,
  },
  backIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  // Contenido Principal
  mainContent: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuToggle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuToggleIcon: {
    fontSize: 24,
    color: '#424242',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  headerSpacer: {
    width: 45,
  },
  // Contenido Vacío
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
  },
  // Quick Access Cards
  quickAccessGrid: {
    width: '100%',
    maxWidth: 600,
    gap: 15,
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickAccessIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
});

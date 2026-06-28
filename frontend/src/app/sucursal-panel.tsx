import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalRequiredRoute } from '@/components/SucursalRequiredRoute';
import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
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
    icono: 'cart',
    ruta: ROUTES.POS.HOME,
    color: COLORS.success,
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    icono: 'cube',
    ruta: ROUTES.INVENTARIO.MATERIALES,
    color: COLORS.info,
  },
  {
    id: 'productos',
    titulo: 'Productos',
    icono: 'restaurant',
    ruta: ROUTES.PRODUCTOS.PRODUCTOS,
    color: COLORS.warning,
  },
  {
    id: 'mesas',
    titulo: 'Configuración de Mesas',
    icono: 'grid',
    ruta: ROUTES.CONFIG.MESAS,
    color: COLORS.primary,
  },
  {
    id: 'corte',
    titulo: 'Corte de Caja',
    icono: 'calculator',
    ruta: ROUTES.REPORTES.CORTES,
    color: '#9C27B0',
  },
  {
    id: 'gastos',
    titulo: 'Gastos',
    icono: 'cash',
    ruta: ROUTES.CAJA.GASTOS,
    color: COLORS.danger,
  },
];

export default function SucursalPanelScreen() {
  const router = useRouter();
  const { sucursalActual } = useSucursal();

  // En móvil: controla si el drawer está abierto (false = cerrado).
  // En tablet/desktop: el sidebar siempre está visible, este estado no se usa.
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const handleMenuClick = (option: MenuOption) => {
    setActiveOption(option.id);
    router.push(option.ruta as any);
    // En móvil cerramos el drawer al navegar
    if (IS_MOBILE) setDrawerAbierto(false);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const renderSidebarContent = () => (
    <>
      {/* Header del Sidebar */}
      <View style={styles.sidebarHeader}>
        <View style={styles.sucursalBadge}>
          <POSIcon name="storefront" size={34} color={COLORS.white} />
        </View>
        <View style={styles.sucursalHeaderInfo}>
          <POSBadge label="SUCURSAL" variant="success" size="small" />
          <Text style={styles.sucursalHeaderNombre} numberOfLines={1}>
            {sucursalActual?.nombre || 'Sin Sucursal'}
          </Text>
          <Text style={styles.sucursalHeaderCodigo}>
            {sucursalActual?.codigo || '---'}
          </Text>
        </View>
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
                isActive && { borderColor: option.color, backgroundColor: `${option.color}15` },
              ]}
              onPress={() => handleMenuClick(option)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: isActive ? option.color : '#F0F0F0' },
                ]}
              >
                <POSIcon
                  name={option.icono as any}
                  size={20}
                  color={isActive ? COLORS.white : COLORS.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.menuText,
                  isActive && { color: option.color, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {option.titulo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer del Sidebar */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToDashboard}
          activeOpacity={0.7}
        >
          <POSIcon name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backText}>Volver al Dashboard</Text>
        </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.menuToggle}
                  onPress={() => setDrawerAbierto(true)}
                  activeOpacity={0.8}
                >
                  <POSIcon name="menu" size={24} color={COLORS.text} />
                </TouchableOpacity>
              ) : (
                <View style={styles.headerSpacer} />
              )}
              <Text style={styles.contentTitle}>Panel de Sucursal</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Estado vacío + accesos rápidos */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Info de sucursal */}
              <View style={styles.welcomeSection}>
                <POSIcon name="location" size={48} color={COLORS.primary} />
                <Text style={styles.emptyTitle}>
                  {sucursalActual?.nombre || 'Panel de Sucursal'}
                </Text>
                <Text style={styles.emptyMessage}>
                  Selecciona una opción del menú lateral para comenzar
                </Text>
              </View>

              {/* Accesos rápidos */}
              <View style={styles.seccion}>
                <Text style={styles.tituloSeccion}>Accesos Rápidos</Text>
                <View style={styles.quickAccessGrid}>
                  {MENU_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.quickAccessWrapper}
                      onPress={() => handleMenuClick(option)}
                      activeOpacity={0.8}
                    >
                      <POSCard style={styles.quickAccessCard} variant="elevated">
                        <View style={[styles.quickAccessIconContainer, { backgroundColor: option.color }]}>
                          <POSIcon name={option.icono as any} size={26} color={COLORS.white} />
                        </View>
                        <Text style={styles.quickAccessTitle} numberOfLines={2}>
                          {option.titulo}
                        </Text>
                      </POSCard>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

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
    backgroundColor: '#F5F5F5',
  },

  // ── Overlay móvil (oscurece el contenido detrás del drawer) ──────────────
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9,
  },

  // ── Drawer móvil (posición absoluta, encima del contenido) ────────────────
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.78,
    height,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },

  // ── Sidebar fijo tablet/desktop (ocupa espacio en el layout) ─────────────
  sidebar: {
    width: IS_TABLET ? 240 : 280,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },

  // ── Header del Sidebar ────────────────────────────────────────────────────
  sidebarHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  sucursalBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalBadgeCollapsed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalHeaderInfo: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  sucursalHeaderNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  sucursalHeaderCodigo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    marginBottom: 12,
  },

  // ── Menú ──────────────────────────────────────────────────────────────────
  menuContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#F7F7F7',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },

  // ── Footer del Sidebar ────────────────────────────────────────────────────
  sidebarFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    gap: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Contenido Principal ───────────────────────────────────────────────────
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // Botón hamburguesa — solo se renderiza en móvil
  menuToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  // Spacer invisible para centrar el título cuando no hay botón
  headerSpacer: {
    width: 44,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Welcome / Estado vacío ────────────────────────────────────────────────
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ── Accesos Rápidos ───────────────────────────────────────────────────────
  seccion: {
    padding: 16,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessWrapper: {
    width: '48%',
  },
  quickAccessCard: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  quickAccessIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});
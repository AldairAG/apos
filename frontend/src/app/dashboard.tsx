import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalSelector } from '@/components/SucursalSelector';
import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { ROUTES, Rol } from '@/routes/routes';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Modulo {
  titulo: string;
  subtitulo: string;
  icono: string;
  ruta: string;
  color: string;
}

const MODULOS_PRINCIPALES: Modulo[] = [
  {
    titulo: 'Materiales',
    subtitulo: 'Gestión de materiales',
    icono: 'cube',
    ruta: ROUTES.INVENTARIO.MATERIALES,
    color: COLORS.info,
  },
  {
    titulo: 'Recetas',
    subtitulo: 'Administrar recetas',
    icono: 'document-text',
    ruta: ROUTES.PRODUCTOS.RECETAS,
    color: COLORS.warning,
  },
  {
    titulo: 'Productos',
    subtitulo: 'Catálogo de productos',
    icono: 'restaurant',
    ruta: ROUTES.PRODUCTOS.PRODUCTOS,
    color: COLORS.success,
  },
];

const REPORTES: Modulo[] = [
  {
    titulo: 'Ventas',
    subtitulo: 'Reporte de ventas',
    icono: 'trending-up',
    ruta: ROUTES.REPORTES.VENTAS,
    color: COLORS.success,
  },
  {
    titulo: 'Inventario',
    subtitulo: 'Control de stock',
    icono: 'bar-chart',
    ruta: ROUTES.REPORTES.INVENTARIO,
    color: COLORS.info,
  },
  {
    titulo: 'Gastos',
    subtitulo: 'Registro de gastos',
    icono: 'cash',
    ruta: ROUTES.REPORTES.GASTOS,
    color: COLORS.danger,
  },
  {
    titulo: 'Cortes',
    subtitulo: 'Cortes de caja',
    icono: 'calculator',
    ruta: ROUTES.REPORTES.CORTES,
    color: COLORS.primary,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { menu, rol } = useRoleBasedNavigation();
  const { sucursalActual, recargarSucursales } = useSucursal();
  const [mostrarSelectorSucursal, setMostrarSelectorSucursal] = useState(false);
  const [moduloDestino, setModuloDestino] = useState<string | null>(null);

  useEffect(() => {
    recargarSucursales();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.LOGIN);
  };

  const verificarYNavegar = (ruta: string) => {
    if (!sucursalActual) {
      setModuloDestino(ruta);
      setMostrarSelectorSucursal(true);
      return;
    }
    router.push(ruta as any);
  };

  const handleSucursalCardClick = () => {
    if (sucursalActual) {
      router.push(ROUTES.SUCURSAL_PANEL as any);
    } else {
      setMostrarSelectorSucursal(true);
    }
  };

  const handleSucursalSeleccionada = () => {
    if (moduloDestino) {
      router.push(moduloDestino as any);
      setModuloDestino(null);
    }
  };

  const getRoleName = (rolKey: string | null) => {
    switch (rolKey) {
      case Rol.ADMINISTRADOR: return 'Administrador';
      case Rol.GERENTE: return 'Gerente';
      case Rol.MESERO: return 'Mesero';
      case Rol.COCINA: return 'Cocina';
      default: return 'Usuario';
    }
  };

  const renderModuloCard = (modulo: Modulo) => (
    <TouchableOpacity
      key={modulo.ruta}
      style={styles.moduloWrapper}
      onPress={() => verificarYNavegar(modulo.ruta)}
      activeOpacity={0.8}
    >
      <POSCard
        style={StyleSheet.flatten([styles.moduloCard, { backgroundColor: modulo.color }])}
        variant="elevated"
      >
        <POSIcon name={modulo.icono as any} size={40} color={COLORS.white} />
        <Text style={styles.moduloTitulo}>{modulo.titulo}</Text>
        <Text style={styles.moduloSubtitulo}>{modulo.subtitulo}</Text>
      </POSCard>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute requiredRoute={ROUTES.DASHBOARD}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <POSIcon name="person" size={22} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.welcomeText}>Bienvenido</Text>
                <Text style={styles.roleText}>{getRoleName(rol)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <POSIcon name="log-out" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Sucursal Actual */}
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Sucursal Actual</Text>
            <TouchableOpacity onPress={handleSucursalCardClick} activeOpacity={0.8}>
              <POSCard
                style={StyleSheet.flatten([
                  styles.sucursalCard,
                  { borderColor: sucursalActual ? COLORS.success : COLORS.danger },
                ])}
                variant="elevated"
              >
                <View style={styles.sucursalCardContent}>
                  <View style={[
                    styles.sucursalIconContainer,
                    { backgroundColor: sucursalActual ? COLORS.success : COLORS.danger },
                  ]}>
                    <POSIcon name="storefront" size={28} color={COLORS.white} />
                  </View>

                  <View style={styles.sucursalInfo}>
                    {sucursalActual ? (
                      <>
                        <POSBadge label="ACTIVA" variant="success" size="small" />
                        <Text style={styles.sucursalNombre}>{sucursalActual.nombre}</Text>
                        <Text style={styles.sucursalCodigo}>{sucursalActual.codigo}</Text>
                        <Text style={styles.sucursalAccion}>Toca para entrar al panel</Text>
                      </>
                    ) : (
                      <>
                        <POSBadge label="SIN SELECCIONAR" variant="danger" size="small" />
                        <Text style={styles.sucursalNombreInactiva}>Toca para seleccionar</Text>
                      </>
                    )}
                  </View>

                  <POSIcon
                    name="chevron-forward"
                    size={24}
                    color={sucursalActual ? COLORS.success : COLORS.danger}
                  />
                </View>
              </POSCard>
            </TouchableOpacity>
          </View>

          {/* Gestión */}
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Gestión</Text>
            <View style={styles.modulosGrid}>
              {MODULOS_PRINCIPALES.map(renderModuloCard)}
            </View>
          </View>

          {/* Reportes */}
          <View style={[styles.seccion, styles.ultimaSeccion]}>
            <Text style={styles.tituloSeccion}>Reportes</Text>
            <View style={styles.modulosGrid}>
              {REPORTES.map(renderModuloCard)}
            </View>
          </View>

        </ScrollView>

        {/* Modal Selector de Sucursal */}
        <SucursalSelector
          visible={mostrarSelectorSucursal}
          onClose={() => {
            setMostrarSelectorSucursal(false);
            setModuloDestino(null);
          }}
          onSelect={handleSucursalSeleccionada}
        />

      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Header (igual que HomeScreen) ──────────────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Secciones (igual que HomeScreen) ──────────────────────────────────────
  seccion: {
    padding: 16,
  },
  ultimaSeccion: {
    paddingBottom: 20,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },

  // ── Sucursal Card ──────────────────────────────────────────────────────────
  sucursalCard: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
  },
  sucursalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sucursalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalInfo: {
    flex: 1,
    gap: 4,
  },
  sucursalNombre: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  sucursalCodigo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sucursalAccion: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  sucursalNombreInactiva: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
    marginTop: 4,
  },

  // ── Módulos / Reportes Grid ────────────────────────────────────────────────
  modulosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduloWrapper: {
    width: '48%',
  },
  moduloCard: {
    alignItems: 'center',
    padding: 20,
    gap: 10,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  moduloTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  moduloSubtitulo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
});
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalSelector } from '@/components/SucursalSelector';
import { COLORS, POSBadge, POSIcon } from '@/components/pos';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { ROUTES, Rol } from '@/routes/routes';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

// ── Design tokens: MD3 + Neo-Brutalismo Funcional ──────────────────────────
const INK = '#0D0D0D';
const BORDER_W = 3;
const RADIUS = 16;
const RIPPLE = { color: 'rgba(0,0,0,0.18)', borderless: false };

/** Sombra dura desplazada (sin blur) — se "aplana" al presionar para dar
 * feedback físico inmediato, en vez de un fade sutil de opacidad. */
const hardShadow = (pressed: boolean) => ({
  shadowColor: INK,
  shadowOffset: { width: pressed ? 0 : 5, height: pressed ? 0 : 5 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: pressed ? 0 : 6,
  transform: [{ translateX: pressed ? 4 : 0 }, { translateY: pressed ? 4 : 0 }],
});

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { rol } = useRoleBasedNavigation();
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

  const handleCambiarSucursal = () => {
    setMostrarSelectorSucursal(true);
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

  const renderModuloCard = (modulo: Modulo, compact = false) => (
    <Pressable
      key={modulo.ruta}
      style={styles.moduloWrapper}
      onPress={() => verificarYNavegar(modulo.ruta)}
      android_ripple={RIPPLE}
      hitSlop={4}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.moduloCard,
            compact && styles.moduloCardCompact,
            { backgroundColor: modulo.color },
            hardShadow(pressed),
          ]}
        >
          <View style={styles.moduloIconBadge}>
            <POSIcon name={modulo.icono as any} size={compact ? 24 : 32} color={INK} />
          </View>
          <Text style={[styles.moduloTitulo, compact && styles.moduloTituloCompact]} numberOfLines={1}>
            {modulo.titulo.toUpperCase()}
          </Text>
          {!compact && (
            <Text style={styles.moduloSubtitulo} numberOfLines={2}>
              {modulo.subtitulo}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );

  return (
    <ProtectedRoute requiredRoute={ROUTES.DASHBOARD}>
      <View style={styles.container}>

        {/* Header — bloque de color sólido, alto contraste */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <POSIcon name="person" size={24} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.welcomeText}>BIENVENIDO</Text>
                <Text style={styles.roleText}>{getRoleName(rol)}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.logoutButton, hardShadow(pressed)]}
              onPress={handleLogout}
              android_ripple={RIPPLE}
              hitSlop={8}
            >
              <POSIcon name="log-out" size={22} color={INK} />
            </Pressable>
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

        {/* Barra de Sucursal — fija, siempre visible, sin scroll (menos pasos) */}
        <Pressable
          onPress={handleSucursalCardClick}
          android_ripple={RIPPLE}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.sucursalCard,
                { backgroundColor: sucursalActual ? COLORS.success : COLORS.danger },
                hardShadow(pressed),
              ]}
            >
              <View style={styles.sucursalCardContent}>
                <View style={styles.sucursalIconContainer}>
                  <POSIcon
                    name={sucursalActual ? 'checkmark-circle' : 'alert-circle'}
                    size={30}
                    color={INK}
                  />
                </View>

                <View style={styles.sucursalInfo}>
                  {sucursalActual ? (
                    <>
                      <Text style={styles.sucursalEstado}>SUCURSAL ACTIVA</Text>
                      <Text style={styles.sucursalNombre} numberOfLines={1}>
                        {sucursalActual.nombre}
                      </Text>
                      <Text style={styles.sucursalCodigo}>{sucursalActual.codigo} · Toca para ver el panel</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sucursalEstado}>SIN SUCURSAL</Text>
                      <Text style={styles.sucursalNombre}>Toca para seleccionar una</Text>
                    </>
                  )}
                </View>

                <Pressable
                  style={({ pressed: p2 }) => [styles.changeSucursalButton, hardShadow(p2)]}
                  onPress={handleCambiarSucursal}
                  android_ripple={RIPPLE}
                  hitSlop={6}
                >
                  <POSIcon name="swap-horizontal" size={18} color={INK} />
                  <Text style={styles.changeSucursalText}>CAMBIAR</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Gestión */}
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>GESTIÓN</Text>
            <View style={styles.modulosGrid}>
              {MODULOS_PRINCIPALES.map((m) => renderModuloCard(m))}
            </View>
          </View>

          {/* Reportes — jerarquía secundaria: más compactos, misma claridad */}
          <View style={[styles.seccion, styles.ultimaSeccion]}>
            <Text style={styles.tituloSeccion}>REPORTES</Text>
            <View style={styles.modulosGrid}>
              {REPORTES.map((m) => renderModuloCard(m, true))}
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
    backgroundColor: '#F1F1EC',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 19,
    fontWeight: '800',
    color: INK,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD8D8',
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },

  // ── Sucursal — barra fija, alto contraste, un solo tap principal ──────────
  sucursalCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  sucursalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sucursalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalInfo: {
    flex: 1,
    gap: 2,
  },
  sucursalEstado: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: INK,
    opacity: 0.75,
  },
  sucursalNombre: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
  },
  sucursalCodigo: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    opacity: 0.75,
  },
  changeSucursalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  changeSucursalText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Secciones ─────────────────────────────────────────────────────────────
  seccion: {
    padding: 16,
  },
  ultimaSeccion: {
    paddingBottom: 20,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: INK,
    marginBottom: 12,
  },

  // ── Módulos / Reportes — objetivo táctil grande, color sólido ────────────
  modulosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  moduloWrapper: {
    width: '46.5%',
  },
  moduloCard: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 8,
    minHeight: 132,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  moduloCardCompact: {
    minHeight: 96,
    padding: 12,
    gap: 6,
  },
  moduloIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduloTitulo: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  moduloTituloCompact: {
    fontSize: 13,
  },
  moduloSubtitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    opacity: 0.75,
  },
});
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SucursalSelector } from '@/components/SucursalSelector';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { ROUTES, Rol } from '@/routes/routes';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Módulos principales
interface Modulo {
  titulo: string;
  subtitulo: string;
  icono: string;
  ruta: string;
  color: string;
}

// Módulos de productos e inventario
const MODULOS_PRINCIPALES: Modulo[] = [
  {
    titulo: 'Materiales',
    subtitulo: 'Gestión de materiales',
    icono: '📦',
    ruta: ROUTES.INVENTARIO.MATERIALES,
    color: '#2196F3',
  },
  {
    titulo: 'Recetas',
    subtitulo: 'Administrar recetas',
    icono: '📝',
    ruta: ROUTES.PRODUCTOS.RECETAS,
    color: '#FF9800',
  },
  {
    titulo: 'Productos',
    subtitulo: 'Catálogo de productos',
    icono: '🍽️',
    ruta: ROUTES.PRODUCTOS.PRODUCTOS,
    color: '#4CAF50',
  },
];

// Reportes principales
const REPORTES: Modulo[] = [
  {
    titulo: 'Ventas',
    subtitulo: 'Reporte de ventas',
    icono: '📈',
    ruta: ROUTES.REPORTES.VENTAS,
    color: '#4CAF50',
  },
  {
    titulo: 'Inventario',
    subtitulo: 'Control de stock',
    icono: '📊',
    ruta: ROUTES.REPORTES.INVENTARIO,
    color: '#2196F3',
  },
  {
    titulo: 'Gastos',
    subtitulo: 'Registro de gastos',
    icono: '💸',
    ruta: ROUTES.REPORTES.GASTOS,
    color: '#F44336',
  },
  {
    titulo: 'Cortes',
    subtitulo: 'Cortes de caja',
    icono: '🧮',
    ruta: ROUTES.REPORTES.CORTES,
    color: '#9C27B0',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { menu, rol } = useRoleBasedNavigation();
  const { sucursalActual } = useSucursal();
  const [mostrarSelectorSucursal, setMostrarSelectorSucursal] = useState(false);
  const [moduloDestino, setModuloDestino] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.LOGIN);
  };

  const verificarYNavegar = (ruta: string) => {
    // Si no hay sucursal seleccionada
    if (!sucursalActual) {
      setModuloDestino(ruta);
      setMostrarSelectorSucursal(true);
      return;
    }
    
    // Navegar directamente
    router.push(ruta as any);
  };

  const handleSucursalSeleccionada = () => {
    if (moduloDestino) {
      router.push(moduloDestino as any);
      setModuloDestino(null);
    }
  };

  const getRoleName = (rolKey: string | null) => {
    switch (rolKey) {
      case Rol.ADMINISTRADOR:
        return 'Admin';
      case Rol.GERENTE:
        return 'Gerente';
      case Rol.MESERO:
        return 'Mesero';
      case Rol.COCINA:
        return 'Cocina';
      default:
        return 'Usuario';
    }
  };

  const renderModuloCard = (modulo: Modulo) => {
    return (
      <TouchableOpacity
        key={modulo.ruta}
        style={[styles.moduloCard, { backgroundColor: modulo.color }]}
        onPress={() => verificarYNavegar(modulo.ruta)}
        activeOpacity={0.8}
      >
        <Text style={styles.moduloIcon}>{modulo.icono}</Text>
        <Text style={styles.moduloTitulo}>{modulo.titulo}</Text>
        <Text style={styles.moduloSubtitulo}>{modulo.subtitulo}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ProtectedRoute requiredRoute={ROUTES.DASHBOARD}>
      <View style={styles.container}>
        {/* Header Minimalista */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Bienvenido</Text>
                <Text style={styles.roleText}>{getRoleName(rol)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selector de Sucursal Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUCURSAL ACTUAL</Text>
            <TouchableOpacity
              style={[
                styles.sucursalCard,
                sucursalActual ? styles.sucursalCardActive : styles.sucursalCardInactive
              ]}
              onPress={() => setMostrarSelectorSucursal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.sucursalCardContent}>
                <View style={[
                  styles.sucursalIconContainer,
                  sucursalActual ? styles.iconContainerGreen : styles.iconContainerRed
                ]}>
                  <Text style={styles.sucursalIconText}>🏪</Text>
                </View>
                <View style={styles.sucursalInfo}>
                  {sucursalActual ? (
                    <>
                      <Text style={styles.sucursalLabel}>Activa</Text>
                      <Text style={styles.sucursalNombre}>
                        {sucursalActual.nombre}
                      </Text>
                      <Text style={styles.sucursalCodigo}>
                        {sucursalActual.codigo}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sucursalLabel}>Sin Seleccionar</Text>
                      <Text style={styles.sucursalNombreInactive}>
                        Toca para seleccionar
                      </Text>
                    </>
                  )}
                </View>
                <Text style={[styles.chevronIcon, { color: sucursalActual ? '#4CAF50' : '#F44336' }]}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Módulos Principales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GESTIÓN</Text>
            <View style={styles.modulosGrid}>
              {MODULOS_PRINCIPALES.map(renderModuloCard)}
            </View>
          </View>

          {/* Reportes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REPORTES</Text>
            <View style={styles.reportesGrid}>
              {REPORTES.map(renderModuloCard)}
            </View>
          </View>
        </ScrollView>

        {/* Modal de Selección de Sucursal */}
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 15,
    letterSpacing: 1,
  },
  // Sucursal Card
  sucursalCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sucursalCardActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  sucursalCardInactive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  sucursalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  sucursalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerGreen: {
    backgroundColor: '#4CAF50',
  },
  iconContainerRed: {
    backgroundColor: '#F44336',
  },
  sucursalIconText: {
    fontSize: 32,
  },
  chevronIcon: {
    fontSize: 32,
    fontWeight: '300',
  },
  sucursalInfo: {
    flex: 1,
  },
  sucursalLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  sucursalNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  sucursalCodigo: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  sucursalNombreInactive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  // Módulos Grid (Productos, Materiales, Recetas)
  modulosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  moduloCard: {
    width: (width - 55) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  moduloIcon: {
    fontSize: 48,
  },
  moduloTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  moduloSubtitulo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  // Reportes Grid
  reportesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  reporteCard: {
    width: (width - 55) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  reporteIcon: {
    fontSize: 48,
  },
  reporteTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  reporteSubtitulo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
});

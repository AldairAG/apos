import { authThunks } from '@/features/auth/auth.thunks';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type UserRole = 'administrador' | 'operador' | 'mesero';
type SidebarOption =
  | 'inicio'
  | 'inventario'
  | 'recetas'
  | 'reportes'
  | 'sucursales'
  | 'configuracion'
  | 'produccion'
  | 'pedidos'
  | 'menu';

const userRoles: { key: UserRole; label: string }[] = [
  { key: 'administrador', label: 'Admin' },
  { key: 'operador', label: 'Operador' },
  { key: 'mesero', label: 'Mesero' },
];

const sidebarByRole: Record<UserRole, { key: SidebarOption; label: string }[]> = {
  administrador: [
    { key: 'inicio', label: 'Inicio' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'recetas', label: 'Recetas' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'sucursales', label: 'Sucursales' },
    { key: 'configuracion', label: 'Configuracion' },
  ],
  operador: [
    { key: 'inicio', label: 'Inicio' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'recetas', label: 'Recetas' },
    { key: 'produccion', label: 'Produccion' },
  ],
  mesero: [
    { key: 'inicio', label: 'Inicio' },
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'menu', label: 'Menu' },
  ],
};

export default function DashboardScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('administrador');
  const [selected, setSelected] = useState<SidebarOption>('inicio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarItems = sidebarByRole[selectedRole];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.usuario);

  const sectionTitle = useMemo(() => {
    const found = sidebarItems.find((i) => i.key === selected);
    return found ? found.label : 'Inicio';
  }, [selected, sidebarItems]);

  const sectionDescription = useMemo(() => {
    switch (selected) {
      case 'inventario':
        return 'Consulta stock, categorias y movimientos de productos desde este modulo.';
      case 'recetas':
        return 'Gestiona las recetas y sus ingredientes para la produccion.';
      case 'reportes':
        return 'Visualiza ventas, costos y tendencias de rendimiento de tu negocio.';
      case 'sucursales':
        return 'Administra las sucursales registradas en el sistema.';
      case 'configuracion':
        return 'Administra usuarios y preferencias generales de la cuenta.';
      case 'produccion':
        return 'Controla el proceso de produccion y elaboracion de productos.';
      case 'pedidos':
        return 'Registra y gestiona los pedidos de los clientes.';
      case 'menu':
        return 'Consulta los productos disponibles en el menu del dia.';
      default:
        return 'Bienvenido al panel principal.';
    }
  }, [selected]);

  const handleLogout = async () => {
    await dispatch(authThunks.logout());
    router.replace('/');
  };

  const handleSelect = (option: SidebarOption) => {
    setSelected(option);
    setIsMenuOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const firstOption = sidebarByRole[role][0].key;
    setSelected(firstOption);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainArea}>
          <View style={styles.header}>
            <Pressable
              style={styles.hamburgerButton}
              onPress={() => setIsMenuOpen((prev) => !prev)}
            >
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </Pressable>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{sectionTitle}</Text>
            <Text style={styles.subtitle}>Usuario: {user?.email || 'Sin sesion'}</Text>
            <Text style={styles.description}>{sectionDescription}</Text>
          </ScrollView>
        </View>

        {isMenuOpen ? <Pressable style={styles.backdrop} onPress={() => setIsMenuOpen(false)} /> : null}

        {isMenuOpen ? (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Menu</Text>

            <View style={styles.quickActionsContainer}>
              {userRoles.map((role) => {
                const active = role.key === selectedRole;
                return (
                  <Pressable
                    key={role.key}
                    style={[styles.quickActionButton, active && styles.quickActionButtonActive]}
                    onPress={() => handleRoleChange(role.key)}
                  >
                    <Text style={[styles.quickActionText, active && styles.quickActionTextActive]}>
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {sidebarItems.map((item) => {
              const active = item.key === selected;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.sidebarButton, active && styles.sidebarButtonActive]}
                  onPress={() => handleSelect(item.key)}
                >
                  <Text style={[styles.sidebarButtonText, active && styles.sidebarButtonTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar sesion</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f4f9',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  mainArea: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe4f0',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  hamburgerLine: {
    height: 2,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 230,
    backgroundColor: '#0f172a',
    paddingTop: 24,
    paddingHorizontal: 12,
    gap: 8,
    zIndex: 20,
  },
  sidebarTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickActionButtonActive: {
    backgroundColor: '#2563eb',
  },
  quickActionText: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  quickActionTextActive: {
    color: '#ffffff',
  },
  sidebarButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  sidebarButtonActive: {
    backgroundColor: '#2563eb',
  },
  sidebarButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 'auto',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#dc2626',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1d4ed8',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    zIndex: 10,
  },
});

import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

const INK = '#0D0D0D';
const FONDO_CLARO = '#F8FAFC';
const FONDO_OSCURO = '#0F172A';

export default function ClientesLayout() {
    const esOscuro = useColorScheme() === 'dark';

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: esOscuro ? FONDO_OSCURO : FONDO_CLARO },
                headerTintColor: esOscuro ? '#F8FAFC' : INK,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: esOscuro ? FONDO_OSCURO : FONDO_CLARO },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Clientes frecuentes' }} />
            <Stack.Screen name="[clienteId]" options={{ title: 'Tarjeta de fidelidad' }} />
            <Stack.Screen
                name="registrar"
                options={{ title: 'Registrar cliente', presentation: 'modal' }}
            />
        </Stack>
    );
}
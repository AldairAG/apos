import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import TarjetaSellos from '../../components/Tarjetasellos';

type DetalleCliente = {
    cliente: { id: string; nombre: string; telefono: string; whatsappOptIn: boolean };
    tarjeta: { id: string; sellosActuales: number; sellosRequeridos: number };
    recompensasDisponibles: { id: string; fechaGenerada: string }[];
};

const PALETA = {
    primario: '#2563EB',
    secundario: '#22C55E',
    advertencia: '#F59E0B',
    error: '#EF4444',
    fondoClaro: '#F8FAFC',
    fondoOscuro: '#0F172A',
};

async function obtenerDetalle(clienteId: string): Promise<DetalleCliente> {
    const res = await fetch(`https://tu-api.com/clientes/${clienteId}/tarjeta`);
    return res.json();
}
async function registrarVenta(tarjetaId: string, monto: number) {
    return fetch('https://tu-api.com/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarjetaId, monto }),
    });
}
async function canjearRecompensa(recompensaId: string, cajeroId: string) {
    return fetch(`https://tu-api.com/recompensas/${recompensaId}/canjear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cajeroId }),
    });
}

export default function ClienteDetalleScreen() {
    const { clienteId } = useLocalSearchParams<{ clienteId: string }>();
    const esOscuro = useColorScheme() === 'dark';
    const [detalle, setDetalle] = useState<DetalleCliente | null>(null);
    const [procesando, setProcesando] = useState(false);

    const cargar = useCallback(async () => {
        const data = await obtenerDetalle(clienteId);
        setDetalle(data);
    }, [clienteId]);

    useFocusEffect(
        useCallback(() => {
            cargar();
        }, [cargar])
    );

    if (!detalle) return null;

    const colorFondo = esOscuro ? PALETA.fondoOscuro : PALETA.fondoClaro;
    const colorTexto = esOscuro ? '#F8FAFC' : '#0F172A';

    const onRegistrarVenta = async () => {
        setProcesando(true);
        try {
            await registrarVenta(detalle.tarjeta.id, 0); // monto real viene del carrito del POS
            await cargar();
        } catch {
            Alert.alert('Error', 'No se pudo registrar la venta');
        } finally {
            setProcesando(false);
        }
    };

    const onCanjear = async (recompensaId: string) => {
        setProcesando(true);
        try {
            const res = await canjearRecompensa(recompensaId, 'cajero-actual-id');
            if (!res.ok) throw new Error();
            Alert.alert('Listo', 'Recompensa canjeada');
            await cargar();
        } catch {
            Alert.alert('Error', 'No se pudo canjear la recompensa (revisa si ya venció)');
        } finally {
            setProcesando(false);
        }
    };

    return (
        <ScrollView
            style={{ backgroundColor: colorFondo }}
            contentContainerStyle={estilos.contenedor}
        >
            <Text style={[estilos.nombre, { color: colorTexto }]}>{detalle.cliente.nombre}</Text>
            <Text style={estilos.telefono}>{detalle.cliente.telefono}</Text>

            {!detalle.cliente.whatsappOptIn && (
                <View style={[estilos.aviso, { borderColor: PALETA.advertencia }]}>
                    <Text style={{ color: PALETA.advertencia, fontWeight: '600' }}>
                        Este cliente no recibirá avisos por WhatsApp
                    </Text>
                </View>
            )}

            <TarjetaSellos
                sellosActuales={detalle.tarjeta.sellosActuales}
                sellosRequeridos={detalle.tarjeta.sellosRequeridos}
            />

            <TouchableOpacity
                style={[estilos.botonPrimario, { backgroundColor: PALETA.primario }]}
                onPress={onRegistrarVenta}
                disabled={procesando}
            >
                <Text style={estilos.botonTexto}>Registrar venta y sumar sello</Text>
            </TouchableOpacity>

            {detalle.recompensasDisponibles.length > 0 && (
                <View style={estilos.seccion}>
                    <Text style={[estilos.subtitulo, { color: colorTexto }]}>Recompensas disponibles</Text>
                    {detalle.recompensasDisponibles.map((r) => (
                        <TouchableOpacity
                            key={r.id}
                            style={[estilos.botonSecundario, { borderColor: PALETA.secundario }]}
                            onPress={() => onCanjear(r.id)}
                            disabled={procesando}
                        >
                            <Text style={{ color: PALETA.secundario, fontWeight: '700' }}>
                                Canjear recompensa
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: { padding: 20, gap: 16, paddingBottom: 40 },
    nombre: { fontSize: 22, fontWeight: '700' },
    telefono: { fontSize: 14, color: '#94A3B8' },
    aviso: {
        borderWidth: 2,
        borderRadius: 10,
        padding: 12,
    },
    botonPrimario: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    botonTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    seccion: { gap: 10 },
    subtitulo: { fontSize: 16, fontWeight: '700' },
    botonSecundario: {
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
});
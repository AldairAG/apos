import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PALETA = {
    primario: '#2563EB',
    secundario: '#22C55E',
    advertencia: '#F59E0B',
    fondoClaro: '#F8FAFC',
    fondoOscuro: '#0F172A',
    tarjetaOscura: '#1E293B',
};

async function crearCliente(nombre: string, telefono: string, whatsappOptIn: boolean) {
    return fetch('https://tu-api.com/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, whatsappOptIn }),
    });
}

export default function RegistrarClienteScreen() {
    const router = useRouter();
    const { telefono: telefonoInicial } = useLocalSearchParams<{ telefono?: string }>();
    const esOscuro = useColorScheme() === 'dark';

    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState(telefonoInicial ?? '');
    const [whatsappOptIn, setWhatsappOptIn] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const colorFondo = esOscuro ? PALETA.fondoOscuro : PALETA.fondoClaro;
    const colorTexto = esOscuro ? '#F8FAFC' : '#0F172A';
    const colorTarjeta = esOscuro ? PALETA.tarjetaOscura : '#FFFFFF';

    const formularioValido = nombre.trim().length > 1 && telefono.trim().length >= 10;

    const onGuardar = async () => {
        if (!formularioValido) return;
        setGuardando(true);
        try {
            const res = await crearCliente(nombre.trim(), telefono.trim(), whatsappOptIn);
            if (!res.ok) throw new Error();
            const clienteCreado = await res.json();
            router.replace(`/clientes/${clienteCreado.id}`);
        } catch {
            Alert.alert('Error', 'No se pudo registrar el cliente. Verifica el teléfono.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <View style={[estilos.contenedor, { backgroundColor: colorFondo }]}>
            <Text style={[estilos.titulo, { color: colorTexto }]}>Cliente nuevo</Text>

            <View style={estilos.campo}>
                <Text style={[estilos.etiqueta, { color: colorTexto }]}>Nombre</Text>
                <TextInput
                    style={[
                        estilos.input,
                        { backgroundColor: colorTarjeta, color: colorTexto, borderColor: PALETA.primario },
                    ]}
                    placeholder="Nombre del cliente"
                    placeholderTextColor="#94A3B8"
                    value={nombre}
                    onChangeText={setNombre}
                    autoFocus
                />
            </View>

            <View style={estilos.campo}>
                <Text style={[estilos.etiqueta, { color: colorTexto }]}>Teléfono</Text>
                <TextInput
                    style={[
                        estilos.input,
                        { backgroundColor: colorTarjeta, color: colorTexto, borderColor: PALETA.primario },
                    ]}
                    placeholder="10 dígitos"
                    placeholderTextColor="#94A3B8"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity
                style={[
                    estilos.optIn,
                    {
                        backgroundColor: colorTarjeta,
                        borderColor: whatsappOptIn ? PALETA.secundario : PALETA.primario,
                    },
                ]}
                onPress={() => setWhatsappOptIn((v) => !v)}
                activeOpacity={0.8}
            >
                <View
                    style={[
                        estilos.casilla,
                        {
                            backgroundColor: whatsappOptIn ? PALETA.secundario : 'transparent',
                            borderColor: whatsappOptIn ? PALETA.secundario : PALETA.primario,
                        },
                    ]}
                >
                    {whatsappOptIn && <Text style={estilos.check}>✓</Text>}
                </View>
                <Text style={[estilos.optInTexto, { color: colorTexto }]}>
                    Acepta recibir avisos de su tarjeta de fidelidad por WhatsApp
                </Text>
            </TouchableOpacity>

            {!whatsappOptIn && (
                <Text style={[estilos.notaAdvertencia, { color: PALETA.advertencia }]}>
                    Sin este consentimiento no podremos avisarle cuando complete su tarjeta
                </Text>
            )}

            <TouchableOpacity
                style={[
                    estilos.botonGuardar,
                    { backgroundColor: formularioValido ? PALETA.primario : '#94A3B8' },
                ]}
                onPress={onGuardar}
                disabled={!formularioValido || guardando}
            >
                <Text style={estilos.botonTexto}>{guardando ? 'Guardando…' : 'Registrar cliente'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, padding: 20, gap: 16 },
    titulo: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    campo: { gap: 6 },
    etiqueta: { fontSize: 14, fontWeight: '600' },
    input: {
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    optIn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 2,
        borderRadius: 12,
        padding: 14,
    },
    casilla: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    check: { color: '#052e16', fontWeight: '900', fontSize: 14 },
    optInTexto: { flex: 1, fontSize: 14, lineHeight: 20 },
    notaAdvertencia: { fontSize: 13, marginTop: -8 },
    botonGuardar: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    botonTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
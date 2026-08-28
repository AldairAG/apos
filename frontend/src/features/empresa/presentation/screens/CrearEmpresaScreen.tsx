/**
 * EmpresaForm.tsx
 *
 * Formulario "Crear Empresa" con estilo Material 3 (Material You),
 * paleta azul (primary) + amarillo (secondary), construido con
 * React Native + NativeWind.
 *
 * Dependencias necesarias:
 *   npm install nativewind tailwindcss
 *   npx expo install expo-image-picker
 *
 * DTO objetivo:
 *   export interface EmpresaDto {
 *     nombre: string;
 *     imgUrl: string;
 *     imgFile: File;
 *   }
 *
 * Nota: React Native no tiene el objeto `File` del navegador. Aquí se modela
 * el archivo seleccionado como un objeto compatible (uri, name, type) que es
 * el estándar para subir imágenes en RN (FormData). Al enviar al backend se
 * castea al tipo `File` del DTO para mantener compatibilidad de tipos.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// ---------- Tipos ----------

export interface EmpresaDto {
  nombre: string;
  imgUrl: string;
  imgFile: File;
}

interface RNFile {
  uri: string;
  name: string;
  type: string;
}

interface EmpresaFormProps {
  onSubmit: (dto: EmpresaDto) => Promise<void> | void;
  initialValues?: Partial<{ nombre: string; imgUrl: string }>;
}

// ---------- Componente ----------

export default function EmpresaForm({ onSubmit, initialValues }: EmpresaFormProps) {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? "");
  const [imgUrl, setImgUrl] = useState(initialValues?.imgUrl ?? "");
  const [imgFile, setImgFile] = useState<RNFile | null>(null);

  const [nombreFocused, setNombreFocused] = useState(false);
  const [nombreError, setNombreError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para seleccionar el logo de la empresa."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!resultado.canceled && resultado.assets?.length) {
      const asset = resultado.assets[0];
      const nombreArchivo = asset.uri.split("/").pop() ?? "logo.jpg";
      const extension = nombreArchivo.split(".").pop();

      setImgUrl(asset.uri);
      setImgFile({
        uri: asset.uri,
        name: nombreArchivo,
        type: `image/${extension === "jpg" ? "jpeg" : extension}`,
      });
    }
  };

  const validar = () => {
    if (!nombre.trim()) {
      setNombreError("El nombre de la empresa es obligatorio");
      return false;
    }
    setNombreError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    if (!imgFile) {
      Alert.alert("Falta el logo", "Selecciona una imagen para la empresa.");
      return;
    }

    try {
      setSubmitting(true);
      const dto: EmpresaDto = {
        nombre: nombre.trim(),
        imgUrl,
        // RN no tiene `File`; se castea el objeto compatible con FormData.
        imgFile: imgFile as unknown as File,
      };
      await onSubmit(dto);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-m3-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top App Bar */}
      <View className="pt-14 pb-4 px-4 bg-m3-surface">
        <Text className="text-2xl font-semibold text-m3-onSurface">
          Crear empresa
        </Text>
        <Text className="text-sm text-m3-onSurfaceVariant mt-1">
          Completa los datos para registrar una nueva empresa
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card contenedora */}
        <View className="bg-m3-surfaceContainerLow rounded-m3-lg p-5 shadow-sm">
          {/* --- Selector de imagen --- */}
          <Text className="text-xs font-medium text-m3-onSurfaceVariant mb-2 ml-1">
            LOGO DE LA EMPRESA
          </Text>

          <Pressable
            onPress={pickImage}
            className="items-center justify-center mb-1"
          >
            {imgUrl ? (
              <View className="relative">
                <Image
                  source={{ uri: imgUrl }}
                  className="w-32 h-32 rounded-m3-full border-2 border-m3-primary"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 right-0 bg-m3-secondary w-9 h-9 rounded-m3-full items-center justify-center border-2 border-m3-surfaceContainerLow">
                  <Text className="text-m3-onSecondary text-base">✎</Text>
                </View>
              </View>
            ) : (
              <View className="w-32 h-32 rounded-m3-full bg-m3-primaryContainer items-center justify-center border-2 border-dashed border-m3-primary">
                <Text className="text-3xl text-m3-onPrimaryContainer">+</Text>
                <Text className="text-xs text-m3-onPrimaryContainer mt-1">
                  Añadir logo
                </Text>
              </View>
            )}
          </Pressable>

          <Text className="text-center text-xs text-m3-onSurfaceVariant mb-6">
            Toca el círculo para elegir una imagen
          </Text>

          {/* --- Campo Nombre (Outlined Text Field M3) --- */}
          <Text className="text-xs font-medium text-m3-onSurfaceVariant mb-1 ml-1">
            NOMBRE DE LA EMPRESA
          </Text>
          <View
            className={`flex-row items-center rounded-m3-sm px-4 py-3.5 border ${
              nombreError
                ? "border-m3-error"
                : nombreFocused
                ? "border-2 border-m3-primary"
                : "border-m3-outline"
            } bg-m3-surface`}
          >
            <TextInput
              value={nombre}
              onChangeText={(t) => {
                setNombre(t);
                if (nombreError) setNombreError("");
              }}
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
              placeholder="Ej. Acme Corporation"
              placeholderTextColor="#73777F"
              className="flex-1 text-base text-m3-onSurface"
            />
          </View>
          {nombreError ? (
            <Text className="text-xs text-m3-error mt-1 ml-1">
              {nombreError}
            </Text>
          ) : (
            <Text className="text-xs text-m3-onSurfaceVariant mt-1 ml-1">
              Nombre público con el que se identificará la empresa
            </Text>
          )}
        </View>

        {/* --- Acciones --- */}
        <View className="flex-row justify-end items-center mt-6 gap-3">
          <Pressable
            onPress={() => {
              setNombre("");
              setImgUrl("");
              setImgFile(null);
              setNombreError("");
            }}
            className="px-5 py-3 rounded-m3-full active:bg-m3-surfaceContainer"
          >
            <Text className="text-m3-primary font-medium">Cancelar</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`flex-row items-center px-6 py-3 rounded-m3-full ${
              submitting ? "bg-m3-primary/60" : "bg-m3-primary active:bg-m3-tertiary"
            }`}
          >
            {submitting && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
            )}
            <Text className="text-m3-onPrimary font-medium">
              {submitting ? "Guardando..." : "Crear empresa"}
            </Text>
          </Pressable>
        </View>

        {/* Acento amarillo: chip informativo (secondary) */}
        <View className="flex-row items-center self-start bg-m3-secondaryContainer rounded-m3-full px-4 py-2 mt-6">
          <View className="w-2 h-2 rounded-m3-full bg-m3-secondary mr-2" />
          <Text className="text-xs text-m3-onSecondaryContainer">
            Los campos marcados son obligatorios
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
import { obtenerRutaInicialPorRol } from "@/routes/routes";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "./auth.types";

export const saveToSessionStorage = (key: string, value: unknown) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			sessionStorage.setItem(key, JSON.stringify(value));
		}
	} catch (error) {
		console.error('Error saving to sessionStorage:', error);
	}
};

export const loadFromSessionStorage = (key: string) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			const item = sessionStorage.getItem(key);
			return item || null;
		}
		return null;
	} catch (error) {
		console.error('Error loading from sessionStorage:', error);
		return null;
	}
};

export const removeFromSessionStorage = (key: string) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			sessionStorage.removeItem(key);
		}
	} catch (error) {
		console.error('Error removing from sessionStorage:', error);
	}
};

/**
 * Función para obtener la ruta de redirección según el rol del usuario
 * @param token - El token JWT del usuario
 * @returns La ruta correspondiente al rol del usuario
 */
export const obtenerRutaSegunRol = (token: string): string => {
	const rol = obtenerRolDesdeToken(token);
	return obtenerRutaInicialPorRol(rol);
};

/**
 * Función para obtener el rol del usuario desde el token JWT
 * @param token - El token JWT
 * @returns El rol del usuario o null si no hay token o es inválido
 */
export const obtenerRolDesdeToken = (token: string): string | null => {
	if (!token) return null;

	try {
		const decoded = jwtDecode<JwtPayload>(token);
		return decoded.rol || null;
	} catch (error) {
		console.error('Error al decodificar el token:', error);
		return null;
	}
};
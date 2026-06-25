import { apiBase } from '@/api/apiBase';
import { CrearMesaDTO, EstadoMesa, Mesa } from './mesas.types';

const MESA_BASE_URL = '/mesas';

const normalizeEstadoMesa = (estado: string | number | EstadoMesa): EstadoMesa => {
  if (typeof estado === 'number') {
    return estado as EstadoMesa;
  }

  if (typeof estado === 'string' && estado !== '') {
    const numeric = (EstadoMesa as any)[estado as keyof typeof EstadoMesa] as number | undefined;
    if (typeof numeric === 'number') {
      return numeric as EstadoMesa;
    }
    const parsed = Number(estado);
    if (!Number.isNaN(parsed)) {
      return parsed as EstadoMesa;
    }
  }

  return EstadoMesa.LIBRE;
};

const normalizeMesa = (mesa: Mesa): Mesa => ({
  ...mesa,
  estado: normalizeEstadoMesa(mesa.estado as string | number | EstadoMesa),
});

const normalizeMesas = (mesas: Mesa[] | null | undefined): Mesa[] =>
  Array.isArray(mesas) ? mesas.map(normalizeMesa) : [];

export const mesaService = {
  getBySucursal: async (sucursalId: number): Promise<Mesa[]> => {
    const response = await apiBase.get<Mesa[]>(`${MESA_BASE_URL}/sucursal/${sucursalId}`);
    return normalizeMesas(response.data);
  },

  getById: async (id: number): Promise<Mesa> => {
    const response = await apiBase.get<Mesa>(`${MESA_BASE_URL}/${id}`);
    return normalizeMesa(response.data);
  },

  create: async (sucursalId: number, data: CrearMesaDTO): Promise<Mesa> => {
    const response = await apiBase.post<Mesa>(`${MESA_BASE_URL}/${sucursalId}`, data, {
      params: { sucursalId },
    });
    return normalizeMesa(response.data);
  },

  update: async (id: number, data: Mesa): Promise<Mesa> => {
    const response = await apiBase.put<Mesa>(`${MESA_BASE_URL}/${id}`, data);
    return normalizeMesa(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiBase.delete<void>(`${MESA_BASE_URL}/${id}`);
  },

  cambiarEstado: async (id: number, nuevoEstado: EstadoMesa): Promise<Mesa> => {
    const estadoParam = EstadoMesa[nuevoEstado] as string;
    const response = await apiBase.post<Mesa>(`${MESA_BASE_URL}/cambiar-estado/${id}/estado/${estadoParam}`);
    return normalizeMesa(response.data);
  },
};

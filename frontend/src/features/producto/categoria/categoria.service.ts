import { apiBase } from '@/api/apiBase';
import { Categoria, CreateCategoriaDTO, UpdateCategoriaDTO } from './categoria.types';

const CATEGORIA_BASE_URL = '/categorias';

export const categoriaService = {
  /**
   * Obtiene todas las categorías
   */
  getAll: async (): Promise<Categoria[]> => {
    const response = await apiBase.get<Categoria[]>(`${CATEGORIA_BASE_URL}/usuario`);
    return response.data;
  },

  /**
   * Obtiene una categoría por ID
   */
  getById: async (id: number): Promise<Categoria> => {
    const response = await apiBase.get<Categoria>(`${CATEGORIA_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva categoría
   */
  create: async (data: CreateCategoriaDTO): Promise<Categoria> => {
    const response = await apiBase.post<Categoria>(CATEGORIA_BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza una categoría
   */
  update: async (id: number, data: UpdateCategoriaDTO): Promise<Categoria> => {
    const response = await apiBase.put<Categoria>(`${CATEGORIA_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una categoría
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${CATEGORIA_BASE_URL}/${id}`);
  },
};

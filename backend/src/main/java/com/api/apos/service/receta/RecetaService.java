package com.api.apos.service.receta;

import com.api.apos.dto.request.CrearReceta;

import com.api.apos.entity.Receta;

import java.util.List;

public interface RecetaService {

    // ==================== RECETAS ====================

    List<Receta> obtenerRecetasPorSucursal(Long sucursalId);

    List<Receta> obtenerRecetasActivasPorSucursal(Long sucursalId);

    Receta obtenerRecetaPorId(Long recetaId);

    Receta crearReceta(Long sucursalId,CrearReceta request);

    Receta actualizarReceta(Long recetaId, CrearReceta request);

    void eliminarReceta(Long recetaId);

    Receta activarDesactivarReceta(Long recetaId, Boolean activa);

    // ==================== INGREDIENTES DE RECETA ====================


    // ==================== PRODUCTOS ELABORADOS ====================


    // ==================== PRODUCCIÓN (Elaborar receta) ====================


}

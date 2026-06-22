package com.api.apos.domain.receta.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.api.apos.domain.receta.dto.CrearRecetaDTO;
import com.api.apos.domain.receta.entity.DetalleReceta;
import com.api.apos.domain.receta.entity.Receta;

public interface RecetaService {
    Receta crearReceta(CrearRecetaDTO receta);
    Receta actualizarReceta(Long id, Receta receta);
    void eliminarReceta(Long id);
    Optional<Receta> obtenerRecetaPorId(Long id);
    List<Receta> obtenerRecetasPorUsuario(Long idUsuario);
    List<Receta> obtenerRecetasActivas(Long idUsuario);
    List<Receta> obtenerRecetasByUsuarioAutenticado();
    BigDecimal calcularCostoReceta(Long id);
    Receta recalcularCostoTotal(Long id);
    BigDecimal recalcularCostoTotal(List<DetalleReceta> detallesReceta);
    boolean verificarDisponibilidadMateriales(Long id);
    Receta cambiarEstadoActivo(Long id, boolean activo);
    List<Receta> buscarRecetas(Long idUsuario, String termino);
}

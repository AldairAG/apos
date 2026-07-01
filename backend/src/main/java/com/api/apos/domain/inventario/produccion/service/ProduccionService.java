package com.api.apos.domain.inventario.produccion.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.inventario.produccion.entity.Produccion;

public interface ProduccionService {
    Produccion registrarProduccion(Produccion produccion);
    Produccion actualizarProduccion(Long id, Produccion produccion);
    void eliminarProduccion(Long id);
    Produccion obtenerProduccionPorId(Long id);
    List<Produccion> obtenerProduccionesPorReceta(Long idReceta);
    List<Produccion> obtenerProduccionesPorEmpleado(Long idEmpleado);
    List<Produccion> obtenerProduccionesPorMaterial(Long idMaterial);
    List<Produccion> obtenerProduccionesPorFecha(LocalDateTime fechaInicio, LocalDateTime fechaFin);
}

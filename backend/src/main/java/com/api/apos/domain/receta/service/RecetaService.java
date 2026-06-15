package com.api.apos.domain.receta.service;

import java.util.List;

import com.api.apos.domain.receta.entity.Receta;

public interface RecetaService {
    Receta crearReceta(Receta receta);
    Receta actualizarReceta(Long id, Receta receta);
    void eliminarReceta(Long id);
    List<Receta> obtenerRecetasPorUsuario(Long idUsuario);
}

package com.api.apos.domain.catalogo.extra.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.catalogo.extra.entity.OpcionExtra;

public interface OpcionExtraService {
    OpcionExtra crearOpcionExtra(OpcionExtra opcionExtra);
    OpcionExtra actualizarOpcionExtra(Long id, OpcionExtra opcionExtra);
    void eliminarOpcionExtra(Long id);
    Optional<OpcionExtra> obtenerOpcionExtraPorId(Long id);
    List<OpcionExtra> obtenerOpcionesExtraPorGrupo(Long idGrupoExtra);
    List<OpcionExtra> obtenerOpcionesExtraActivas(Long idGrupoExtra);
    OpcionExtra cambiarEstadoActivo(Long id, boolean activo);
}

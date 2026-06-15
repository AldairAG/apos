package com.api.apos.domain.extra.service;

import java.util.List;

import com.api.apos.domain.extra.entity.OpcionExtra;

public interface OpcionExtraService {
    OpcionExtra crearOpcionExtra(OpcionExtra opcionExtra);
    OpcionExtra actualizarOpcionExtra(Long id, OpcionExtra opcionExtra);
    void eliminarOpcionExtra(Long id);
    OpcionExtra obtenerOpcionExtraPorId(Long id);
    List<OpcionExtra> obtenerOpcionesExtraPorGrupo(Long idGrupoExtra);
    List<OpcionExtra> obtenerOpcionesExtraActivas(Long idGrupoExtra);
}

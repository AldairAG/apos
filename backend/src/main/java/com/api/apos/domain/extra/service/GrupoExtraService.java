package com.api.apos.domain.extra.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.extra.entity.GrupoExtra;

public interface GrupoExtraService {
    GrupoExtra crearGrupoExtra(GrupoExtra grupoExtra);
    GrupoExtra actualizarGrupoExtra(Long id, GrupoExtra grupoExtra);
    void eliminarGrupoExtra(Long id);
    Optional<GrupoExtra> obtenerGrupoExtraPorId(Long id);
    List<GrupoExtra> obtenerGruposExtraPorUsuario(Long idUsuario);
    List<GrupoExtra> obtenerGruposExtraActivos(Long idUsuario);
    List<GrupoExtra> obtenerGruposPorProducto(Long idProducto);
    GrupoExtra cambiarEstadoActivo(Long id, boolean activo);
}

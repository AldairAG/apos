package com.api.apos.domain.catalogo.extra.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.catalogo.extra.dto.CreateGrupoExtraDTO;
import com.api.apos.domain.catalogo.extra.dto.GrupoExtraDTO.GrupoExtraResponse;
import com.api.apos.domain.catalogo.extra.entity.GrupoExtra;

public interface GrupoExtraService {
    GrupoExtra crearGrupoExtra(CreateGrupoExtraDTO grupoExtra);
    GrupoExtra actualizarGrupoExtra(Long id, GrupoExtra grupoExtra);
    void eliminarGrupoExtra(Long id);
    Optional<GrupoExtra> obtenerGrupoExtraPorId(Long id);
    List<GrupoExtraResponse> obtenerGruposExtraPorUsuario(Long idUsuario);
    List<GrupoExtra> obtenerGruposExtraActivos(Long idUsuario);
    List<GrupoExtra> obtenerGruposPorProducto(Long idProducto);
    GrupoExtra cambiarEstadoActivo(Long id, boolean activo);
}

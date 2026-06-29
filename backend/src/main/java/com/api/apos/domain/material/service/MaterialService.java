package com.api.apos.domain.material.service;

import java.util.List;
import java.util.Optional;

import com.api.apos.domain.material.Material;
import com.api.apos.domain.material.dto.MaterialDTO;

public interface MaterialService {
    MaterialDTO createMaterial(Material material);
    Material actualizarMaterial(Long id, Material material);
    void eliminarMaterial(Long id);
    Optional<Material> obtenerMaterialPorId(Long id);
    List<Material> getMaterialesPorSucursal(Long idSucursal);
    List<Material> getMaterialesActivos(Long idUsuario);
    Material cambiarEstadoActivo(Long id, boolean activo);
    List<Material> buscarMateriales(Long idUsuario, String termino);
}

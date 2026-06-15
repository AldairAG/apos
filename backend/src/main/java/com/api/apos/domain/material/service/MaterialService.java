package com.api.apos.domain.material.service;

import java.util.List;

import com.api.apos.domain.material.Material;

public interface MaterialService {
    Material createMaterial(Material material);
    Material actualizarMaterial(Long id, Material material);
    void eliminarMaterial(Long id);
    List<Material> getMaterialesPorSucursal(Long idSucursal);
    List<Material> getMaterialesPorUsuario(Long idUsuario, String tipo);
}

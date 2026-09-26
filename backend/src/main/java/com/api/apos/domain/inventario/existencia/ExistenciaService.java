package com.api.apos.domain.inventario.existencia;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ExistenciaService {

    private final ExistenciaRepository existenciaRepository;

    public Existencia save(Existencia existencia) {
        return existenciaRepository.save(existencia);
    }

    public Existencia findById(Long id) {
        return existenciaRepository.findById(id).orElse(null);
    }

    public List<Long> findMaterialIdsWithoutExistencia(
            List<Long> materialIds,
            Long sucursalId) {
        if (materialIds == null || materialIds.isEmpty()) {
            return Collections.emptyList();
        }

        return existenciaRepository
                .findMaterialIdsWithoutExistencia(materialIds, sucursalId);
    }

    public List<Existencia> findAllByMaterialIdAndSucursalId(Long materialId, Long sucursalId) {
        if (materialId == null || sucursalId == null) {
            return Collections.emptyList();
        }

        return existenciaRepository.findBySucursalIdAndMaterialIdIn(
                sucursalId,
                List.of(materialId));
    }

    public List<Existencia> findByMaterialIds(List<Long> materialIds) {
        if (materialIds == null || materialIds.isEmpty()) {
            return Collections.emptyList();
        }

        return existenciaRepository.findByMaterialIds(materialIds);
    }

    public List<Existencia> findBySucursalIdAndMaterialIdIn(Long sucursalId, List<Long> materialIds) {
        if (sucursalId == null || materialIds == null || materialIds.isEmpty()) {
            return Collections.emptyList();
        }

        return existenciaRepository.findBySucursalIdAndMaterialIdIn(sucursalId, materialIds);
    }

}

package com.api.apos.domain.inventario.existencias.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.inventario.existencias.ExistenciaRepository;
import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ExistenciaServiceImpl implements ExistenciaService {

    private final ExistenciaRepository existenciaRepository;

    @Override
    public ExistenciaMaterial obtenerPorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerPorId'");
    }

    @Override
    public List<ExistenciaMaterial> obtenerPorIds(List<Long> materialIds, Long sucursalId) {
        return existenciaRepository.findBySucursalIdAndMaterialIdIn(sucursalId, materialIds);
    }

    @Override
    public ExistenciaMaterial obtenerExistencia(Long sucursalId, Long materialId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerExistencia'");
    }

    @Override
    public List<ExistenciaMaterial> obtenerInventarioSucursal(Long sucursalId) {
        return existenciaRepository.findBySucursal_Id(sucursalId);
    }

    @Override
    public List<ExistenciaMaterial> obtenerStockBajo(Long sucursalId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerStockBajo'");
    }

    @Override
    public List<ExistenciaMaterial> guardarExistencias(List<ExistenciaMaterial> existencias) {
        return existenciaRepository.saveAll(existencias);
    }

    @Override
    public ExistenciaMaterial agregarStock(Long sucursalId, Long materialId, BigDecimal cantidad) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'agregarStock'");
    }

    @Override
    public ExistenciaMaterial descontarStock(Long sucursalId, Long materialId, BigDecimal cantidad) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'descontarStock'");
    }

    @Override
    public ExistenciaMaterial ajustarStock(Long sucursalId, Long materialId, BigDecimal nuevaCantidad) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'ajustarStock'");
    }

}

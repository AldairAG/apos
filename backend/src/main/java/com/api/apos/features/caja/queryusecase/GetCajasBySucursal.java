package com.api.apos.features.caja.queryusecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.mapper.CajaMapper;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GetCajasBySucursal {

    private final SucursalService sucursalService;
    
    public List<CajaDTO> execute(Long idSucursal){
        Sucursal sucursal = sucursalService.obtenerSucursalPorId(idSucursal);
        return sucursal.getCajas().stream().map(CajaMapper::toDTO).toList();
    }
}

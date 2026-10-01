package com.api.apos.aplication.identidad.mesa.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.identidad.mesa.dto.MesaDto;
import com.api.apos.aplication.identidad.mesa.mapper.MesaMapper;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.domain.pos.mesa.Mesa;
import com.api.apos.domain.pos.mesa.MesaService;

import lombok.AllArgsConstructor;



@Service 
@AllArgsConstructor 
public class CrearMesaUseCase {

    private final MesaService mesaService;

    private final SucursalService sucursalService;
    
    public MesaDto execute(MesaDto mesaDto) {

        Sucursal sucursal = sucursalService.findById(mesaDto.getSucursalId());

        Mesa mesa = MesaMapper.toEntity(mesaDto);

        sucursal.addMesa(mesa);

        Mesa mesaCreada = mesaService.save(mesa);

        return MesaMapper.toDto(mesaCreada);
    }

}

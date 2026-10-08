package com.api.apos.aplication.identidad.mesa.mapper;
import com.api.apos.aplication.identidad.mesa.dto.MesaDto;
import com.api.apos.aplication.pos.mapper.PosMapper;
import com.api.apos.domain.pos.mesa.Mesa;

public class MesaMapper {

    public static MesaDto toDto(Mesa mesa) {
        if (mesa == null) {
            return null;
        }

        
        MesaDto mesaDto = MesaDto.builder()
                .id(mesa.getId())
                .numero(mesa.getNumero())
                .nombre(mesa.getNombre())
                .estado(mesa.getEstado())
                .sucursalId(mesa.getSucursal().getId())
                .build();

        if (mesa.getOrdenActual() != null) {
            mesaDto.setOrdenActual(PosMapper.mapToOrdenDto(mesa.getOrdenActual()));
        }

        return mesaDto;
    }

    public static Mesa toEntity(MesaDto mesaDto) {
        if (mesaDto == null) {
            return null;
        }
        Mesa mesa = new Mesa();
        mesa.setId(mesaDto.getId());
        mesa.setNumero(mesaDto.getNumero());
        mesa.setNombre(mesaDto.getNombre());
        mesa.setEstado(mesaDto.getEstado());
        return mesa;
    }
}

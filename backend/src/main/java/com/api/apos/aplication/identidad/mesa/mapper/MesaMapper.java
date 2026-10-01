package com.api.apos.aplication.identidad.mesa.mapper;
import com.api.apos.aplication.identidad.mesa.dto.MesaDto;
import com.api.apos.domain.pos.mesa.Mesa;

public class MesaMapper {

    public static MesaDto toDto(Mesa mesa) {
        if (mesa == null) {
            return null;
        }
        return MesaDto.builder()
                .id(mesa.getId())
                .numero(mesa.getNumero())
                .nombre(mesa.getNombre())
                .estado(mesa.getEstado())
                .ordenActual(mesa.getOrdenActual())
                .sucursalId(mesa.getSucursal().getId())
                .build();
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
        mesa.setOrdenActual(mesaDto.getOrdenActual());
        return mesa;
    }
}

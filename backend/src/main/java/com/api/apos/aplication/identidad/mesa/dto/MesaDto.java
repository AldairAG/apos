package com.api.apos.aplication.identidad.mesa.dto;

import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.enums.EstadoMesa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


@Data 
@AllArgsConstructor 
@Builder 
public class MesaDto {
    
    private Long id;

    private Integer numero;

    private String nombre;

    private EstadoMesa estado;

    private OrdenDto ordenActual;
    
    //Atributo para formulario
    private Long sucursalId;

}

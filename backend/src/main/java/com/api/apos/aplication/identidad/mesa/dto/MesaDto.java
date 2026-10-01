package com.api.apos.aplication.identidad.mesa.dto;

import com.api.apos.domain.pos.orden.Orden;
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

    private Orden ordenActual;
    
    //Atributo para formulario
    private Long sucursalId;

}

package com.api.apos.aplication.cataogo.modificadores.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder 
@Data 
@AllArgsConstructor 
public class ModificadorDto {
     
    private Long id;

    private String nombre;

    private List<OpcionDto> opciones; 

}

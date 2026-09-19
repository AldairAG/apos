package com.api.apos.aplication.modificadores.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder 
@Data 
@AllArgsConstructor 
public class ModifcadorDto {
     
    private Long id;

    private String nombre;

    private List<OpcionDto> opciones; 

}

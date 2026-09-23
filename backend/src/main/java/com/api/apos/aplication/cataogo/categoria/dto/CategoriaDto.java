package com.api.apos.aplication.cataogo.categoria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor 
@Data 
@Builder 
public class CategoriaDto {

    private Long id;

    private String nombre;

    //private List<Producto> productos;

    //Atributos de formulario
    private Long sucursalId;

}

package com.api.apos.aplication.pos.dto;
import java.util.List;

import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;

//Dto que se encargara de mostrar los productos por categoria en el modulo de pos
@Data 
@AllArgsConstructor
@Builder 
public class CategoriaProductoDto {

    private String categoria;

    private List<ProductoDto> productos;
}

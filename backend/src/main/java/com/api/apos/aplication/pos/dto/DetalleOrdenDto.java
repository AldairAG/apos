package com.api.apos.aplication.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.aplication.cataogo.modificadores.dto.OpcionDto;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data 
@AllArgsConstructor
@Builder 
public class DetalleOrdenDto {
    
    private Long id;

    private ProductoDto producto;

    private Integer cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal subtotal;

    private String notas;

    private List<OpcionDto> modificadores;

    //Atributos de formulario
    private Long productoId;

}

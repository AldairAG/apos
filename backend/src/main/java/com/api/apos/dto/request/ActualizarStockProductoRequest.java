package com.api.apos.dto.request;

import lombok.Data;

@Data
public class ActualizarStockProductoRequest {
    
    private Double cantidad;
    private Double stockMinimo;
}

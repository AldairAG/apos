package com.api.apos.features.caja.dto;

import java.util.List;
import java.math.BigDecimal;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CajaDashboardDTO {
    private Long id;
    private String nombre;
    private Boolean activa;

    private BigDecimal montoActual;
    private Long corteActualId;

    private List<MovimientoCajaDTO> movimientos;

}

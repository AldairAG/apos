package com.api.apos.aplication.pos.dto;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.tesoreria.movimiento.dto.MovimientoDto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Service 
@AllArgsConstructor 
@Data 
public class PagarVentaDto {
    private Long ordenId;

    private List<MovimientoDto> movimientos;

}

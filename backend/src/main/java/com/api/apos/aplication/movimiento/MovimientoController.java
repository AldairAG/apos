package com.api.apos.aplication.movimiento;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.movimiento.query.FindByDateQuery;
import com.api.apos.aplication.movimiento.usecase.RegistrarIngresoUseCase;
import com.api.apos.aplication.movimiento.usecase.RegistrarEgresoUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController 
@RequestMapping ("/api/movimientos")
@AllArgsConstructor
public class MovimientoController {
    
    private final RegistrarIngresoUseCase registrarIngresoUseCase;

    private final RegistrarEgresoUseCase registrarEgresoUseCase;

    private final FindByDateQuery findByDateQuery;
    
    @PostMapping("/ingreso")
    public ResponseEntity<ApiResponseWrapper<MovimientoDto>> crearIngreso(@RequestBody MovimientoDto movimientoDto) {
        MovimientoDto createdMovimiento = registrarIngresoUseCase.execute(movimientoDto);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, createdMovimiento, "Ingreso creado exitosamente", null));
    }

    @PostMapping("/egreso")
    public ResponseEntity<ApiResponseWrapper<MovimientoDto>> crearEgreso(@RequestBody MovimientoDto movimientoDto) {
        MovimientoDto createdMovimiento = registrarEgresoUseCase.execute(movimientoDto);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, createdMovimiento, "Egreso creado exitosamente", null));
    }

    @GetMapping("/findByDate/{fecha}")
    public ResponseEntity<ApiResponseWrapper<List<MovimientoDto>>> getMovimientosByDate(@PathVariable String fecha) {
        List<MovimientoDto> movimientos = findByDateQuery.execute(fecha);
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, movimientos, "Movimientos encontrados exitosamente", null));
    }
    

}

package com.api.apos.aplication.movimiento;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.movimiento.usecase.RegistrarIngresoUseCase;
import com.api.apos.aplication.movimiento.usecase.RegistrarEgresoUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping ("/api/movimiento")
@AllArgsConstructor
public class MovimientoController {
    
    private final RegistrarIngresoUseCase registrarIngresoUseCase;

    private final RegistrarEgresoUseCase registrarEgresoUseCase;
    
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

}

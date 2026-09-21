package com.api.apos.aplication.identidad.sucursal;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.api.apos.aplication.identidad.sucursal.dto.SucursalDto;
import com.api.apos.aplication.identidad.sucursal.query.FindSucursalesByEmpresaId;
import com.api.apos.aplication.identidad.sucursal.usecase.CrearSucursalUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping ("/api/sucursales")
@AllArgsConstructor
public class SucursalController {

    private final FindSucursalesByEmpresaId findByEmpresaId;

    private final CrearSucursalUseCase crearSucursalUseCase;

    @GetMapping()
    public ResponseEntity<ApiResponseWrapper<List<SucursalDto>>> FindByEmpresaId() {

        return ResponseEntity.ok(
                new ApiResponseWrapper<>(
                    true,
                findByEmpresaId.execute(),
                null,
                null
            )
        );
    }

    @PostMapping()
    public ResponseEntity<ApiResponseWrapper<SucursalDto>> CrearSucursal(@RequestBody SucursalDto entity) {

        SucursalDto createdEntity = crearSucursalUseCase.execute(entity);

        return ResponseEntity.ok(
            new ApiResponseWrapper<>(
                true,
                createdEntity,
                null,
                null
            )
        );
    }
    
    
    
}

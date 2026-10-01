package com.api.apos.aplication.identidad.sucursal;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.identidad.sucursal.dto.SucursalDto;
import com.api.apos.aplication.identidad.sucursal.query.FindSucursalesByEmpresaId;
import com.api.apos.aplication.identidad.sucursal.usecase.CrearSucursalUseCase;
import com.api.apos.aplication.identidad.sucursal.usecase.DesactivarSucursalUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;



@RestController 
@RequestMapping ("/api/sucursales")
@AllArgsConstructor
public class SucursalController {

    private final FindSucursalesByEmpresaId findByEmpresaId;

    private final CrearSucursalUseCase crearSucursalUseCase;

    private final DesactivarSucursalUseCase desactivarSucursalUseCase;

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

    @DeleteMapping("/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Void>> desactivarSucursal(@PathVariable Long sucursalId) {
        desactivarSucursalUseCase.execute(sucursalId);
        return ResponseEntity.ok(ApiResponseWrapper.success(null));
    }
    
    
    
}

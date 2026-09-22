package com.api.apos.aplication.cataogo.modificadores;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.query.FindModificadoresByEmpresa;
import com.api.apos.aplication.cataogo.modificadores.usecase.CrearModificadorUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController 
@RequestMapping ("/api/modificadores")
@AllArgsConstructor 
public class ModificadorController {
    
    private final FindModificadoresByEmpresa findModificadoresByEmpresa;

    private final CrearModificadorUseCase crearModificadorUseCase;

    @GetMapping("/empresa")
    public ResponseEntity<ApiResponseWrapper<List<ModificadorDto>>> getModificadoresByEmpresa() {
        List<ModificadorDto> modificadorDto = findModificadoresByEmpresa.execute();

        return ResponseEntity.ok(ApiResponseWrapper.success(modificadorDto));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<ModificadorDto>> crearModificador(@RequestBody ModificadorDto modificadorDto) {
        ModificadorDto createdModificador = crearModificadorUseCase.execute(modificadorDto);
        return ResponseEntity.ok(ApiResponseWrapper.success(createdModificador));
    }
    
    
}

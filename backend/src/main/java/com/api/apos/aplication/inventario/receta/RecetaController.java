package com.api.apos.aplication.inventario.receta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.query.FindRecetasByEmpresaId;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController 
@RequestMapping ("/api/recetas")
@AllArgsConstructor 
public class RecetaController {

    private final FindRecetasByEmpresaId findRecetasByEmpresaId;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<Page<RecetaDto>>> findRecetasByEmpresaIdEP(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 10, sort = "nombre", direction = Direction.ASC) Pageable pageable) {

        Page<RecetaDto> response = findRecetasByEmpresaId.execute(nombre,pageable);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

}

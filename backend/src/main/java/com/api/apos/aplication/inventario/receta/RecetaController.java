package com.api.apos.aplication.inventario.receta;

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
import com.api.apos.aplication.inventario.receta.usecase.CrearRecetaUseCase;
import com.api.apos.dto.PageResponse;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping ("/api/recetas")
@AllArgsConstructor 
public class RecetaController {

    private final FindRecetasByEmpresaId findRecetasByEmpresaId;

    private final CrearRecetaUseCase crearRecetaUseCase;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<PageResponse<RecetaDto>>> findRecetasByEmpresaIdEP(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 10, sort = "nombre", direction = Direction.ASC) Pageable pageable) {

        PageResponse<RecetaDto> response = findRecetasByEmpresaId.execute(nombre,pageable);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<RecetaDto>> crearReceta(@RequestBody RecetaDto receta) {
        crearRecetaUseCase.execute(receta);
        return ResponseEntity.ok(ApiResponseWrapper.success(receta));
    }
    

}

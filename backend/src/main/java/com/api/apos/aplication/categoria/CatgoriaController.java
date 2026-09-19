package com.api.apos.aplication.categoria;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.categoria.dto.CategoriaDto;
import com.api.apos.aplication.categoria.usecase.CrearCategoriaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/materiales")
@AllArgsConstructor
public class CatgoriaController {

    private final CrearCategoriaUseCase crearCategoriaUseCase;

    @PostMapping("/")
    public ResponseEntity<ApiResponseWrapper<CategoriaDto>> crearCategoria(@RequestBody CategoriaDto categoriaDto) {
        CategoriaDto response = crearCategoriaUseCase.execute(categoriaDto);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

}

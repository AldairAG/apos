package com.api.apos.aplication.cataogo.categoria;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.cataogo.categoria.dto.CategoriaDto;
import com.api.apos.aplication.cataogo.categoria.query.FindCategoriaBySucursalId;
import com.api.apos.aplication.cataogo.categoria.usecase.CrearCategoriaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;


@RestController
@RequestMapping("/api/categorias")
@AllArgsConstructor
public class CategoriaController {

    private final CrearCategoriaUseCase crearCategoriaUseCase;
    private final FindCategoriaBySucursalId findCategoriaBySucursalId;

    @PostMapping("/")
    public ResponseEntity<ApiResponseWrapper<CategoriaDto>> crearCategoria(@RequestBody CategoriaDto categoriaDto) {
        CategoriaDto response = crearCategoriaUseCase.execute(categoriaDto);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<CategoriaDto>>> getCategoriasBySucursalId(@PathVariable Long sucursalId) {
        List<CategoriaDto> response = findCategoriaBySucursalId.execute(sucursalId);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }
    

}

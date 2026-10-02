package com.api.apos.aplication.inventario.receta;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.query.FindRecetasByEmpresaId;
import com.api.apos.aplication.inventario.receta.usecase.CrearRecetaUseCase;
import com.api.apos.aplication.inventario.receta.usecase.DeleteRecetaUseCase;
import com.api.apos.aplication.inventario.receta.usecase.ObtenerRecetaUseCase;
import com.api.apos.aplication.inventario.receta.usecase.UpdateRecetaUseCase;
import com.api.apos.dto.PageResponse;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;


@RestController 
@RequestMapping ("/api/recetas")
@AllArgsConstructor 
public class RecetaController {

    private final FindRecetasByEmpresaId findRecetasByEmpresaId;

    private final CrearRecetaUseCase crearRecetaUseCase;

    private final UpdateRecetaUseCase updateRecetaUseCase;

    private final DeleteRecetaUseCase deleteRecetaUseCase;

    private final ObtenerRecetaUseCase obtenerRecetaUseCase;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<RecetaDto>> obtenerRecetaPorId(@PathVariable Long id) {
        RecetaDto receta = obtenerRecetaUseCase.execute(id);
        return ResponseEntity.ok(ApiResponseWrapper.success(receta));
    }

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<PageResponse<RecetaDto>>> findRecetasByEmpresaIdEP(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 1000, sort = "nombre", direction = Direction.ASC) Pageable pageable) {

        PageResponse<RecetaDto> response = findRecetasByEmpresaId.execute(nombre,pageable);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<RecetaDto>> crearReceta(@RequestBody RecetaDto receta) {
        crearRecetaUseCase.execute(receta);
        return ResponseEntity.ok(ApiResponseWrapper.success(receta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<RecetaDto>> actualizarReceta(@PathVariable Long id, @RequestBody RecetaDto receta) {
        RecetaDto recetaActualizada = updateRecetaUseCase.execute(id, receta);
        return ResponseEntity.ok(ApiResponseWrapper.success(recetaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> deleteReceta(@PathVariable Long id) {
        deleteRecetaUseCase.execute(id);
        return ResponseEntity.ok(ApiResponseWrapper.success(null));
    }
    

}

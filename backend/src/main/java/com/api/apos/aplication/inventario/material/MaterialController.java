package com.api.apos.aplication.inventario.material;

import com.api.apos.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.inventario.material.dto.MaterialDto;
import com.api.apos.aplication.inventario.material.query.FindMaterialesByEmpresaId;
import com.api.apos.aplication.inventario.material.usecase.CrearMaterialUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/materiales")
@AllArgsConstructor
public class MaterialController {

    private final FindMaterialesByEmpresaId findMaterialesByEmpresaId;

    private final CrearMaterialUseCase createMaterialUseCase;

    @GetMapping("/")
    public ResponseEntity<ApiResponseWrapper<PageResponse<MaterialDto>>> findMaterialesByEmpresaIdEP(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 10, sort = "nombre", direction = Direction.ASC) Pageable pageable) {

        PageResponse<MaterialDto> response = findMaterialesByEmpresaId.execute(nombre, pageable);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponseWrapper<MaterialDto>> createMaterial(@RequestBody MaterialDto entity) {

        MaterialDto nuevoMaterial=createMaterialUseCase.execute(entity);
        return ResponseEntity.ok(ApiResponseWrapper.success(nuevoMaterial));
    }
    

}

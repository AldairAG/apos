package com.api.apos.aplication.inventario.material;

import org.springframework.data.domain.Page;
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
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/materiales")
@AllArgsConstructor
public class MaterialController {

    private final FindMaterialesByEmpresaId findMaterialesByEmpresaId;

    @GetMapping
    public ResponseEntity<ApiResponseWrapper<Page<MaterialDto>>> findMaterialesByEmpresaIdEP(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 10, sort = "nombre", direction = Direction.ASC) Pageable pageable) {

        Page<MaterialDto> response = findMaterialesByEmpresaId.execute(nombre, pageable);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

}

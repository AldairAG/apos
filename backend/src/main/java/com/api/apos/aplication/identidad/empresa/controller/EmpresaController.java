package com.api.apos.aplication.identidad.empresa.controller;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.identidad.empresa.dto.EmpresaDto;
import com.api.apos.aplication.identidad.empresa.usecase.CrearEmpresa;
import com.api.apos.aplication.identidad.empresa.usecase.DesactivarEmpresaActualUseCase;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.helpers.FileStorageService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/empresas")
@AllArgsConstructor
public class EmpresaController {

        private final CrearEmpresa crearEmpresa;

        private final DesactivarEmpresaActualUseCase desactivarEmpresaActualUseCase;

        private final FileStorageService fileStorageService;

        /**
         * @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
         *                       public ResponseEntity<ApiResponseWrapper<EmpresaDto>>
         *                       crearEmpresa(
         * @ModelAttribute EmpresaDto empresaDto,
         * @RequestPart(value = "imgFile", required = false) MultipartFile imgFile) {
         * 
         *                    EmpresaDto createdEmpresa =
         *                    crearEmpresa.execute(empresaDto);
         * 
         *                    return ResponseEntity.ok(
         *                    new ApiResponseWrapper<>(
         *                    true,
         *                    createdEmpresa,
         *                    "Empresa creada correctamente",
         *                    null));
         *                    }
         */

        @PostMapping("/")
        public ResponseEntity<ApiResponseWrapper<EmpresaDto>> crearEmpresa(@RequestBody EmpresaDto empresaDto) {

                EmpresaDto createdEmpresa = crearEmpresa.execute(empresaDto);

                return ResponseEntity.ok(new ApiResponseWrapper<>(true,createdEmpresa,"Empresa creada correctamente",null));
        }

        @DeleteMapping("/actual")
        public ResponseEntity<ApiResponseWrapper<Void>> desactivarEmpresaActual() {
                desactivarEmpresaActualUseCase.execute();
                return ResponseEntity.ok(ApiResponseWrapper.success(null));
        }

        @GetMapping("/{id}/logo")
        public ResponseEntity<Resource> obtenerLogo(
                        @PathVariable Long id) throws IOException {

                Resource resource = fileStorageService
                                .loadFileAsResource("empresas/" + id + "/logo.webp");

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType("image/webp"))
                                .body(resource);
        }

}

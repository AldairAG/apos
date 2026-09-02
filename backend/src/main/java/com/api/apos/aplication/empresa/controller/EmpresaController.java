package com.api.apos.aplication.empresa.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.api.apos.aplication.empresa.controller.dto.EmpresaDto;
import com.api.apos.aplication.empresa.controller.usecase.CrearEmpresa;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.helpers.FileStorageService;
import org.springframework.core.io.Resource;

import lombok.AllArgsConstructor;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/empresas")
@AllArgsConstructor
public class EmpresaController {

        private final CrearEmpresa crearEmpresa;

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

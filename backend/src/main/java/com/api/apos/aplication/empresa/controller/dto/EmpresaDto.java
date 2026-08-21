package com.api.apos.aplication.empresa.controller.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class EmpresaDto {
    private String nombre;
    private String imgUrl;
    private MultipartFile imgFile;

}

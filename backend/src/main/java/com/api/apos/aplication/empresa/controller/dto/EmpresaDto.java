package com.api.apos.aplication.empresa.controller.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.api.apos.aplication.cuenta.dto.CuentaDto;

import lombok.Data;

@Data
public class EmpresaDto {
    private String nombre;
    private String imgUrl;
    private MultipartFile imgFile;

    private List<CuentaDto> cuentas;
}

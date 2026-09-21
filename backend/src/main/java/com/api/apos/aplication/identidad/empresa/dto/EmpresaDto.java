package com.api.apos.aplication.identidad.empresa.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.api.apos.aplication.tesoreria.cuenta.dto.CuentaDto;

import lombok.Data;

@Data
public class EmpresaDto {
    private String nombre;
    private String imgUrl;
    private MultipartFile imgFile;

    private List<CuentaDto> cuentas;
}

package com.api.apos.aplication.cuenta.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.enums.TipoCuenta;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CuentaDto {
    private Long id;

    private String nombre;

    private BigDecimal saldo;

    @Enumerated(EnumType.STRING)
    private TipoCuenta tipo;

    private LocalDateTime updatedAt;

    private LocalDateTime createdAt;
}

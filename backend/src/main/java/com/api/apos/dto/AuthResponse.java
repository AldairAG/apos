package com.api.apos.dto;

import com.api.apos.enums.Rol;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private Rol rol;
    private Long usuarioId;
}

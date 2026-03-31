package com.api.apos.dto;

import com.api.apos.enums.Rol;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private Rol rol;
}

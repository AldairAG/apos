package com.api.apos.domain.auth.usuario;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.auth.usuario.dto.ColaboradorDTO;
import com.api.apos.domain.auth.usuario.service.UsuarioService;
import com.api.apos.helpers.ApiResponseWrapper;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/usuarios/colaboradores")
public class ColaboradorController {

    private final UsuarioService usuarioService;

    ColaboradorController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * POST /api/usuarios/colaboradores
     * Crear colaborador
     * 
     * @param colaboradorDTO
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<ColaboradorDTO>> crearColaborador(
            @RequestBody ColaboradorDTO colaboradorDTO) {
        try {
            return ResponseEntity
                    .ok(new ApiResponseWrapper<>(true, usuarioService.agregarColaborador(colaboradorDTO), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }

    }

}

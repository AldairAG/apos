package com.api.apos.aplication.producto.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.aplication.categoria.dto.CategoriaDto;
import com.api.apos.aplication.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.receta.dto.RecetaDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ProductoDto {
    private Long id;

    private String nombre;

    private BigDecimal precio;

    private BigDecimal costo;

    private Float margenGanancia;

    private Boolean disponible;

    private RecetaDto receta;

    private List<ModificadorDto> modificadores;

    private CategoriaDto categoria;

    // Metodos para formularios

    private Long categoriaId;

    private Long recetaId;

    private List<Long> ModificadorIds;

    private Long sucursalId;

    public void validarDatosCreacion() {

        /* if (nombre == null || nombre.isBlank()) {
            throw new AppException(ErrorCode.NOMBRE_PRODUCTO_OBLIGATORIO);
        }

        if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.PRECIO_PRODUCTO_INVALIDO);
        }

        if (categoriaId == null) {
            throw new AppException(ErrorCode.CATEGORIA_PRODUCTO_OBLIGATORIA);
        }

        if (recetaId == null) {
            throw new AppException(ErrorCode.RECETA_PRODUCTO_OBLIGATORIA);
        }

        if (sucursalId == null) {
            throw new AppException(ErrorCode.SUCURSAL_PRODUCTO_OBLIGATORIA);
        }

        if (ModificadorIds != null &&
                ModificadorIds.stream().anyMatch(Objects::isNull)) {
            throw new AppException(ErrorCode.MODIFICADOR_ID_INVALIDO);
        } */
    }

}

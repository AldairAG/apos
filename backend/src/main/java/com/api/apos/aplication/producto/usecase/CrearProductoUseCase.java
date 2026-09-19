package com.api.apos.aplication.producto.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.producto.dto.ProductoDto;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaRepository;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearProductoUseCase {

    private final ProductoService productoService;

    private final SucursalService sucursalService;

    private final RecetaService recetaService;

    private final ModificadorService modificadorService;

    private final ExistenciaService existenciaService;

    private final CategoriaService categoriaService;

    @Transactional
    public ProductoDto execute(ProductoDto productoDto) {

        // 1. Validar datos de entrada
        productoDto.validarDatosCreacion();

        // 2. Obtener sucursal
        Sucursal sucursal = sucursalService.findById(productoDto.getSucursalId());

        // 3. Obtener categoría y validar pertenencia a la empresa
        Categoria categoria = categoriaService.findById(productoDto.getCategoriaId());

        // 4. Obtener receta
        Receta receta = productoDto.getRecetaId() != null
                ? recetaService.findById(productoDto.getRecetaId())
                : null;

        // 5. Obtener modificadores
        List<Modificador> modificadores = productoDto.getModificadorIds().size() > 0
                ? modificadorService.findByIds(productoDto.getModificadorIds())
                : null;

        // 6. Crear existencias de materiales faltantes en la sucursal
        List<Long> materialIds = receta.getRecetaDetalles()
                .stream()
                .map(detalle -> detalle.getMaterial().getId())
                .toList();

        List<Long> materialesSinExistencia = existenciaService.findMaterialIdsWithoutExistencia(
                materialIds,
                productoDto.getSucursalId());

        // 7. Crear Producto
        // 8. Crear relaciones Producto-Modificador
        // 9. Agregar producto a la sucursal
        // 10. Guardar producto
        // 11. Retornar DTO de respuesta

        return null;

    }

}

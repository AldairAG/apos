package com.api.apos.features.inventario.useCase;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.catalogo.categoria.service.CategoriaService;
import com.api.apos.domain.catalogo.extra.entity.GrupoExtra;
import com.api.apos.domain.catalogo.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.catalogo.extra.service.GrupoExtraService;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoRepository;
import com.api.apos.domain.catalogo.producto.dto.CreateProductoDTO;
import com.api.apos.domain.catalogo.producto.dto.ProductoDTO;
import com.api.apos.domain.catalogo.producto.mapper.ProductoMapper;
import com.api.apos.domain.catalogo.receta.entity.DetalleReceta;
import com.api.apos.domain.catalogo.receta.service.RecetaService;
import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;
import com.api.apos.domain.inventario.existencias.service.ExistenciaService;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearProductoUseCase {

    private final ProductoRepository productoRepository;

    private final CategoriaService categoriaService;

    private final RecetaService recetaService;

    private final GrupoExtraService grupoExtraService;

    private final ExistenciaService existenciaService;

    private final SucursalService sucursalService;

    /**
     * Crear un nuevo producto
     * 
     * @param productoDto DTO del producto a crear
     * @return Producto creado con timestamp
     */
    public ProductoDTO execute(CreateProductoDTO productoDto) {

        if(productoDto.getSucursalId() == null) {
            throw new IllegalArgumentException("El ID de la sucursal no puede ser nulo");
        }

        // Crear un nuevo producto a partir del DTO recibido
        Producto producto = Producto.builder()
                .nombre(productoDto.getNombre())
                .descripcion(productoDto.getDescripcion())
                .precioVenta(BigDecimal.valueOf(productoDto.getPrecioVenta()))
                .costo(BigDecimal.valueOf(productoDto.getCosto()))
                .margen(BigDecimal.valueOf(productoDto.getMargen()))
                .tiempoPreparacion(productoDto.getTiempoPreparacion())
                .activo(productoDto.isActivo())
                .destacado(productoDto.isDestacado())
                .createdAt(LocalDateTime.now())
                .build();

        // Asociar la receta y la categoría al producto
        recetaService.obtenerRecetaPorId(productoDto.getRecetaId()).ifPresent(producto::setReceta);
        categoriaService.obtenerCategoriaPorId(productoDto.getCategoriaId()).ifPresent(producto::setCategoria);

        // Relacionar los grupos de extras con el producto
        if (productoDto.getGruposExtra() != null) {
            List<ProductoGrupoExtra> productosGrupoExtra = productoDto.getGruposExtra().stream()
                    .map(extraDto -> {
                        // Obtener el grupo extra correspondiente al ID proporcionado en el DTO
                        GrupoExtra grupoExtra = grupoExtraService.obtenerGrupoExtraPorId(extraDto.getGrupoExtraId())
                                .get();
                        // Crear la relación entre el producto y el grupo extra
                        ProductoGrupoExtra productoGrupoExtra = ProductoGrupoExtra.builder()
                                .producto(producto)
                                .grupoExtra(grupoExtra)
                                .minimo(extraDto.getMinimo())
                                .maximo(extraDto.getMaximo())
                                .obligatorio(extraDto.getObligatorio())
                                .build();
                        return productoGrupoExtra;
                    }).toList();
            // Asignar la lista de relaciones al producto
            producto.setGruposExtra(productosGrupoExtra);
        }
        // Guardar el producto en la base de datos y devolver el DTO correspondiente
        Producto nuevoProducto = productoRepository.save(producto);
        crearExistenciaEnSucursal(nuevoProducto.getReceta() != null ? nuevoProducto.getReceta().getDetalles() : List.of(), productoDto.getSucursalId());
        return ProductoMapper.toDTO(nuevoProducto);
    }

    /**
     * Este metodo crea la existencia de los ingredientes en la sucursal donde se
     * creo el producto, para que pueda ser vendido
     * En caso de que el producto no tenga receta, no se creara ninguna existencia
     * En caso de que la exitencia ya exista, no se creara una nueva
     * 
     * @param detalleReceta
     * @param sucursalId
     */
    private void crearExistenciaEnSucursal(List<DetalleReceta> detalleReceta, Long sucursalId) {
        // Si no hay detalles de receta, no se hace nada
        if (detalleReceta.isEmpty()) {
            return;
        }

        // Obtener los IDs de los materiales de la receta
        List<Long> materialIds = detalleReceta.stream()
                .map(ingrediente -> ingrediente.getMaterial().getId())
                .toList();

        // Verificar si ya existen existencias para los materiales en la sucursal
        List<ExistenciaMaterial> existencias = existenciaService.obtenerPorIds(materialIds, sucursalId);

        // Crear nuevas existencias para los materiales que no tienen existencia en la
        // sucursal
        List<ExistenciaMaterial> nuevasExistencias = materialIds.stream()
                .filter(materialId -> existencias.stream().noneMatch(e -> e.getMaterial().getId().equals(materialId)))
                .map(materialId -> {
                    Sucursal sucursal = sucursalService.obtenerSucursalPorId(sucursalId);

                    ExistenciaMaterial existencia = ExistenciaMaterial.builder()
                            .sucursal(sucursal)
                            .material(detalleReceta.stream()
                                    .filter(ingrediente -> ingrediente.getMaterial().getId().equals(materialId))
                                    .findFirst()
                                    .map(DetalleReceta::getMaterial)
                                    .orElse(null))
                            .stockActual(BigDecimal.ZERO)
                            .stockMinimo(BigDecimal.ZERO)
                            .stockMaximo(BigDecimal.ZERO)
                            .ubicacion("")
                            .lote("")
                            .alertaBajoStock(false)
                            .ultimaActualizacion(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return existencia;
                })
                .toList();

        // Guardar las nuevas existencias en la base de datos
        existenciaService.guardarExistencias(nuevasExistencias);
    }

}

package com.api.apos.service.receta;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.api.apos.dto.request.CrearReceta;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaIngrediente;
import com.api.apos.entity.Sucursal;
import com.api.apos.enums.TipoIngrediente;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.ProductoElaboradoRepository;
import com.api.apos.repository.RecetaIngredienteRepository;
import com.api.apos.repository.RecetaRepository;
import com.api.apos.repository.SucursalRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RecetaServiceImpl implements RecetaService {

    @Autowired
    private RecetaRepository recetaRepository;

    @Autowired
    private RecetaIngredienteRepository recetaIngredienteRepository;

    @Autowired
    private ProductoElaboradoRepository productoElaboradoRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public List<Receta> obtenerRecetasPorSucursal(Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con ID: " + sucursalId));
        return recetaRepository.findBySucursal_Id(sucursal.getId());
    }

    @Override
    public List<Receta> obtenerRecetasActivasPorSucursal(Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con ID: " + sucursalId));
        return recetaRepository.findBySucursal_IdAndActivaTrue(sucursal.getId());
    }

    @Override
    public Receta obtenerRecetaPorId(Long recetaId) {
        return recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con ID: " + recetaId));
    }

    @Override
    public Receta crearReceta(Long sucursalId, CrearReceta request) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con ID: " + sucursalId));

        Receta receta = new Receta();
        receta.setNombre(request.getNombre());
        receta.setDescripcion(request.getDescripcion());
        receta.setTiempoPreparacion(request.getTiempoPreparacion());
        receta.setPorciones(request.getPorciones());
        receta.setPrecioVenta(request.getPrecioVenta());
        receta.setActiva(true);
        receta.setSucursal(sucursal);
        receta.setTipoReceta(request.getTipoReceta());
        receta.setFechaCreacion(LocalDateTime.now());

        // Crear y determinar la lista de los ingredientes de la receta
        List<RecetaIngrediente> ingredientes = request.getIngredientes().stream().map(ri -> {
            RecetaIngrediente recetaIngrediente = new RecetaIngrediente();
            recetaIngrediente.setReceta(receta);
            recetaIngrediente.setCantidadRequerida(ri.getCantidadRequerida());

            // Determinar el tipo de ingrediente según el tipo en la request
            if (ri.getTipoIngrediente() == TipoIngrediente.MATERIAL) {
                var material = materialRepository.findById(ri.getMaterialId())
                    .orElseThrow(() -> new EntityNotFoundException("Material no encontrado con ID: " + ri.getMaterialId()));
                recetaIngrediente.setMaterial(material);
                recetaIngrediente.setTipoIngrediente(TipoIngrediente.MATERIAL);
            } else if (ri.getTipoIngrediente() == TipoIngrediente.PRODUCTO_ELABORADO) {
                var productoElaborado = productoElaboradoRepository.findById(ri.getMaterialId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto elaborado no encontrado con ID: " + ri.getMaterialId()));
                recetaIngrediente.setProductoElaborado(productoElaborado);
                recetaIngrediente.setTipoIngrediente(TipoIngrediente.PRODUCTO_ELABORADO);
            } else {
                throw new EntityNotFoundException("Tipo de ingrediente inválido: " + ri.getTipoIngrediente());
            }
            return recetaIngrediente;
        }).toList();

        receta.setIngredientes(ingredientes);
        return recetaRepository.save(receta);
    }

    @Override
    public Receta actualizarReceta(Long recetaId, CrearReceta request) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con ID: " + recetaId));

        receta.setNombre(request.getNombre());
        receta.setDescripcion(request.getDescripcion());
        receta.setTiempoPreparacion(request.getTiempoPreparacion());
        receta.setPorciones(request.getPorciones());
        receta.setPrecioVenta(request.getPrecioVenta());
        receta.setTipoReceta(request.getTipoReceta());
        receta.setFechaActualizacion(LocalDateTime.now());

        // Eliminar ingredientes actuales
        recetaIngredienteRepository.deleteAll(receta.getIngredientes());
        // Crear y determinar la lista de los nuevos ingredientes de la receta

        // Crear y determinar la lista de los ingredientes de la receta
        List<RecetaIngrediente> ingredientes = request.getIngredientes().stream().map(ri -> {
            RecetaIngrediente recetaIngrediente = new RecetaIngrediente();
            recetaIngrediente.setReceta(receta);
            recetaIngrediente.setCantidadRequerida(ri.getCantidadRequerida());

            // Intentar obtener como Material (materia prima)
            var material = materialRepository.findById(ri.getMaterialId());
            if (material.isPresent()) {
                recetaIngrediente.setMaterial(material.get());
                recetaIngrediente.setTipoIngrediente(TipoIngrediente.MATERIAL);
            } else {
                // Intentar obtener como ProductoElaborado
                var productoElaborado = productoElaboradoRepository.findById(ri.getMaterialId());
                if (productoElaborado.isPresent()) {
                    recetaIngrediente.setProductoElaborado(productoElaborado.get());
                    recetaIngrediente.setTipoIngrediente(TipoIngrediente.PRODUCTO_ELABORADO);
                } else {
                    throw new EntityNotFoundException("Ingrediente no encontrado con ID: " + ri.getMaterialId());
                }
            }
            return recetaIngrediente;
        }).toList();

        receta.setIngredientes(ingredientes);
        return recetaRepository.save(receta);

    }

    @Override
    public void eliminarReceta(Long recetaId) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con ID: " + recetaId));
        recetaRepository.delete(receta);
    }

    @Override
    public Receta activarDesactivarReceta(Long recetaId, Boolean activa) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con ID: " + recetaId));
        receta.setActiva(activa);
        return recetaRepository.save(receta);
    }

    // ==================== RECETAS ====================

}

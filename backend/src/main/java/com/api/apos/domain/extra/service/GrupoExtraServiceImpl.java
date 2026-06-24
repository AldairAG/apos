package com.api.apos.domain.extra.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.extra.dto.CreateGrupoExtraDTO;
import com.api.apos.domain.extra.entity.GrupoExtra;
import com.api.apos.domain.extra.entity.OpcionExtra;
import com.api.apos.domain.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.extra.repository.GrupoExtraRepository;
import com.api.apos.domain.producto.ProductoService;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.domain.usuario.service.UsuarioService;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de grupos de extras
 * Los grupos de extras son conjuntos de opciones adicionales que se pueden agregar a productos
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GrupoExtraServiceImpl implements GrupoExtraService {
    
    private final GrupoExtraRepository grupoExtraRepository;

    private final UsuarioService usuarioService;

    private final ProductoService productoService;

    /**
     * Crear un nuevo grupo de extras
     * @param grupoExtra Grupo de extras a crear
     * @return Grupo de extras creado con timestamp
     */
    @Override
    public GrupoExtra crearGrupoExtra(CreateGrupoExtraDTO grupoExtraDTO) {

        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();

        GrupoExtra grupoExtra = GrupoExtra.builder()
        .nombre(grupoExtraDTO.getNombre())
        .descripcion(grupoExtraDTO.getDescripcion())
        .usuario(usuario)
        .build();

        productoService.asociarGrupoExtraAProductos(grupoExtraDTO.getProductosIds(), grupoExtra);

        ProductoGrupoExtra productoGrupoExtra =  ProductoGrupoExtra.builder()
        .grupoExtra(grupoExtra)
        .productosIds(grupoExtraDTO.getProductosIds())
        .build();

        List<OpcionExtra> opciones = grupoExtraDTO.getOpciones().stream()
            .map(opcionDTO -> {
                OpcionExtra opcion = OpcionExtra.builder()
                .grupoExtra(grupoExtra)
                .nombre(opcionDTO.getNombre())
                .precio(opcionDTO.getPrecio())
                .activo(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                return opcion;
            })
            .toList();
        grupoExtra.setOpciones(opciones);


        return grupoExtraRepository.save(grupoExtra);
    }

    /**
     * Actualizar un grupo de extras existente
     * @param id ID del grupo de extras
     * @param grupoExtra Datos actualizados
     * @return Grupo de extras actualizado
     * @throws RuntimeException si el grupo de extras no existe
     */
    @Override
    public GrupoExtra actualizarGrupoExtra(Long id, GrupoExtra grupoExtra) {
        GrupoExtra grupoExistente = grupoExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo de extras no encontrado con ID: " + id));
        
        grupoExistente.setNombre(grupoExtra.getNombre());
        grupoExistente.setDescripcion(grupoExtra.getDescripcion());
        grupoExistente.setUpdatedAt(LocalDateTime.now());
        grupoExistente.setUpdatedBy(grupoExtra.getUpdatedBy());
        
        return grupoExtraRepository.save(grupoExistente);
    }

    /**
     * Eliminar un grupo de extras (borrado lógico)
     * @param id ID del grupo de extras a eliminar
     * @throws RuntimeException si el grupo de extras no existe
     */
    @Override
    public void eliminarGrupoExtra(Long id) {
        GrupoExtra grupoExtra = grupoExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo de extras no encontrado con ID: " + id));
        grupoExtra.setActivo(false);
        grupoExtra.setUpdatedAt(LocalDateTime.now());
        grupoExtraRepository.save(grupoExtra);
    }

    /**
     * Obtener un grupo de extras por su ID
     * @param id ID del grupo de extras
     * @return Optional con el grupo de extras si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<GrupoExtra> obtenerGrupoExtraPorId(Long id) {
        return grupoExtraRepository.findById(id);
    }

    /**
     * Obtener todos los grupos de extras de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de grupos de extras del usuario
     */
    @Override
    @Transactional(readOnly = true)
    public List<GrupoExtra> obtenerGruposExtraPorUsuario(Long idUsuario) {
        return grupoExtraRepository.findByUsuario_Id(idUsuario);
    }

    /**
     * Obtener solo grupos de extras activos de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de grupos de extras activos
     */
    @Override
    @Transactional(readOnly = true)
    public List<GrupoExtra> obtenerGruposExtraActivos(Long idUsuario) {
        return grupoExtraRepository.findByUsuario_IdAndActivoTrue(idUsuario);
    }

    /**
     * Obtener grupos de extras asociados a un producto específico
     * @param idProducto ID del producto
     * @return Lista de grupos de extras del producto
     */
    @Override
    @Transactional(readOnly = true)
    public List<GrupoExtra> obtenerGruposPorProducto(Long idProducto) {
        return grupoExtraRepository.findByProductoId(idProducto);
    }

    /**
     * Cambiar el estado activo de un grupo de extras
     * @param id ID del grupo de extras
     * @param activo Nuevo estado
     * @return Grupo de extras actualizado
     * @throws RuntimeException si el grupo de extras no existe
     */
    @Override
    public GrupoExtra cambiarEstadoActivo(Long id, boolean activo) {
        GrupoExtra grupoExtra = grupoExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo de extras no encontrado con ID: " + id));
        grupoExtra.setActivo(activo);
        grupoExtra.setUpdatedAt(LocalDateTime.now());
        return grupoExtraRepository.save(grupoExtra);
    }
}

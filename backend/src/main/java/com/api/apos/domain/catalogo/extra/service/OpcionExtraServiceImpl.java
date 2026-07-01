package com.api.apos.domain.catalogo.extra.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.catalogo.extra.entity.OpcionExtra;
import com.api.apos.domain.catalogo.extra.repository.OpcionExtraRepository;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de opciones de extras
 * Las opciones de extras son los elementos individuales dentro de un grupo de extras
 * Por ejemplo: "Extra Queso", "Extra Tocino" dentro del grupo "Ingredientes Adicionales"
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OpcionExtraServiceImpl implements OpcionExtraService {
    
    private final OpcionExtraRepository opcionExtraRepository;

    /**
     * Crear una nueva opción de extra
     * @param opcionExtra Opción de extra a crear
     * @return Opción de extra creada con timestamp
     */
    @Override
    public OpcionExtra crearOpcionExtra(OpcionExtra opcionExtra) {
        opcionExtra.setCreatedAt(LocalDateTime.now());
        opcionExtra.setUpdatedAt(LocalDateTime.now());
        if (opcionExtra.getActivo() == null) {
            opcionExtra.setActivo(true);
        }
        return opcionExtraRepository.save(opcionExtra);
    }

    /**
     * Actualizar una opción de extra existente
     * @param id ID de la opción de extra
     * @param opcionExtra Datos actualizados
     * @return Opción de extra actualizada
     * @throws RuntimeException si la opción de extra no existe
     */
    @Override
    public OpcionExtra actualizarOpcionExtra(Long id, OpcionExtra opcionExtra) {
        OpcionExtra opcionExistente = opcionExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opción de extra no encontrada con ID: " + id));
        
        opcionExistente.setNombre(opcionExtra.getNombre());
        opcionExistente.setPrecio(opcionExtra.getPrecio());
        opcionExistente.setUpdatedAt(LocalDateTime.now());
        
        return opcionExtraRepository.save(opcionExistente);
    }

    /**
     * Eliminar una opción de extra (borrado lógico)
     * @param id ID de la opción de extra a eliminar
     * @throws RuntimeException si la opción de extra no existe
     */
    @Override
    public void eliminarOpcionExtra(Long id) {
        OpcionExtra opcionExtra = opcionExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opción de extra no encontrada con ID: " + id));
        opcionExtra.setActivo(false);
        opcionExtra.setUpdatedAt(LocalDateTime.now());
        opcionExtraRepository.save(opcionExtra);
    }

    /**
     * Obtener una opción de extra por su ID
     * @param id ID de la opción de extra
     * @return Optional con la opción de extra si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<OpcionExtra> obtenerOpcionExtraPorId(Long id) {
        return opcionExtraRepository.findById(id);
    }

    /**
     * Obtener todas las opciones de extras de un grupo específico
     * @param idGrupoExtra ID del grupo de extras
     * @return Lista de opciones de extras del grupo
     */
    @Override
    @Transactional(readOnly = true)
    public List<OpcionExtra> obtenerOpcionesExtraPorGrupo(Long idGrupoExtra) {
        return opcionExtraRepository.findByGrupoExtra_Id(idGrupoExtra);
    }

    /**
     * Obtener solo opciones de extras activas de un grupo
     * @param idGrupoExtra ID del grupo de extras
     * @return Lista de opciones de extras activas
     */
    @Override
    @Transactional(readOnly = true)
    public List<OpcionExtra> obtenerOpcionesExtraActivas(Long idGrupoExtra) {
        return opcionExtraRepository.findByGrupoExtra_IdAndActivoTrue(idGrupoExtra);
    }

    /**
     * Cambiar el estado activo de una opción de extra
     * @param id ID de la opción de extra
     * @param activo Nuevo estado
     * @return Opción de extra actualizada
     * @throws RuntimeException si la opción de extra no existe
     */
    @Override
    public OpcionExtra cambiarEstadoActivo(Long id, boolean activo) {
        OpcionExtra opcionExtra = opcionExtraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opción de extra no encontrada con ID: " + id));
        opcionExtra.setActivo(activo);
        opcionExtra.setUpdatedAt(LocalDateTime.now());
        return opcionExtraRepository.save(opcionExtra);
    }
}

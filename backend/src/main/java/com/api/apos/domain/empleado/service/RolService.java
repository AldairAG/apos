package com.api.apos.domain.empleado.service;

import java.util.List;

import com.api.apos.domain.empleado.entity.RolEntity;

public interface RolService {
    RolEntity crearRol(RolEntity rol);
    RolEntity actualizarRol(Long id, RolEntity rol);
    void eliminarRol(Long id);
    RolEntity obtenerRolPorId(Long id);
    List<RolEntity> obtenerTodosLosRoles();
    RolEntity asignarPermisos(Long idRol, List<Long> idsPermisos);
}

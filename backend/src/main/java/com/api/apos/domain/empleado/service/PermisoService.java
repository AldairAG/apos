package com.api.apos.domain.empleado.service;

import java.util.List;

import com.api.apos.domain.empleado.entity.Permiso;

public interface PermisoService {
    Permiso crearPermiso(Permiso permiso);
    Permiso actualizarPermiso(Long id, Permiso permiso);
    void eliminarPermiso(Long id);
    Permiso obtenerPermisoPorId(Long id);
    List<Permiso> obtenerTodosLosPermisos();
    List<Permiso> obtenerPermisosPorRol(Long idRol);
}

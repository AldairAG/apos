package com.api.apos.domain.empleado.service;

import java.util.List;

import com.api.apos.domain.empleado.entity.Empleado;

public interface EmpleadoService {
    Empleado crearEmpleado(Empleado empleado);
    Empleado actualizarEmpleado(Long id, Empleado empleado);
    void eliminarEmpleado(Long id);
    Empleado obtenerEmpleadoPorId(Long id);
    List<Empleado> obtenerEmpleadosPorSucursal(Long idSucursal);
    List<Empleado> obtenerEmpleadosActivos(Long idSucursal);
    Empleado obtenerEmpleadoPorCorreo(String correo);
}

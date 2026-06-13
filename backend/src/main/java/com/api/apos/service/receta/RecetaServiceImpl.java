package com.api.apos.service.receta;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.dto.request.CrearReceta;
import com.api.apos.entity.Receta;

@Service
public class RecetaServiceImpl implements RecetaService {

    @Override
    public List<Receta> obtenerRecetasPorSucursal(Long sucursalId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerRecetasPorSucursal'");
    }

    @Override
    public List<Receta> obtenerRecetasActivasPorSucursal(Long sucursalId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerRecetasActivasPorSucursal'");
    }

    @Override
    public Receta obtenerRecetaPorId(Long recetaId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerRecetaPorId'");
    }

    @Override
    public Receta crearReceta(Long sucursalId, CrearReceta request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'crearReceta'");
    }

    @Override
    public Receta actualizarReceta(Long recetaId, CrearReceta request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'actualizarReceta'");
    }

    @Override
    public void eliminarReceta(Long recetaId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'eliminarReceta'");
    }

    @Override
    public Receta activarDesactivarReceta(Long recetaId, Boolean activa) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'activarDesactivarReceta'");
    }

   

}

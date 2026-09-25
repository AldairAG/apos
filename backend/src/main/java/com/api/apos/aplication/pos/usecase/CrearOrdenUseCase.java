package com.api.apos.aplication.pos.usecase;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.domain.pos.detalle_orden.DetalleOrden;
import com.api.apos.domain.pos.mesa.Mesa;
import com.api.apos.domain.pos.mesa.MesaService;
import com.api.apos.domain.pos.orden.OrdenService;

@Service
@AllArgsConstructor 
public class CrearOrdenUseCase {
    
    private final OrdenService ordenService;

    private final SucursalService sucursalService;

    private final MesaService mesaService;

    public void execute(OrdenDto ordenDto) {

        //Obtener sucursal
        Sucursal sucursal = sucursalService.findById(ordenDto.getSucursalId());

        //Determinar si es una orden en mesa y obtener

        if(ordenDto.getMesaId() != null) {
            Mesa mesa = mesaService.findById(ordenDto.getMesaId());
            mesa.asignarOrdenActual(null);
        }

        //Crear el deatalle de la orden mapeando el dto

        ordenDto.getDetalles().forEach(detalle -> {
            DetalleOrden detalleOrden = DetalleOrden.builder()
                .cantidad(detalle.getCantidad())
                .precio(detalle.getPrecio())
                .build();
        });

        //Crear detalle modificadores mapeando el dto

        //Crear orden

        //Descontar de inventario

        //Guardar la orden en la base de datos
        
    }

}

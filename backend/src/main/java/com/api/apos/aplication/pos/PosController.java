package com.api.apos.aplication.pos;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.api.apos.aplication.pos.query.FindOrdenesBySucursalId;
import com.api.apos.aplication.pos.query.FindProductosBySucursaId;
import com.api.apos.aplication.pos.usecase.ActualizarEstadoOrdenUseCase;
import com.api.apos.aplication.pos.usecase.CobrarOrdenUseCase;
import com.api.apos.aplication.pos.usecase.CrearOrdenUseCase;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/pos")
@AllArgsConstructor 
public class PosController {
    
    private final FindOrdenesBySucursalId findOrdenesBySucursalId;

    private final FindProductosBySucursaId findProductosBySucursaId;

    private final ActualizarEstadoOrdenUseCase actualizarEstadoOrdenUseCase;

    private final CobrarOrdenUseCase cobrarOrdenUseCase;

    private final CrearOrdenUseCase crearOrdenUseCase;

    @GetMapping("/ordenes/sucursal/{sucursalId}")
    public ResponseEntity<?> getOrdenesBySucursalId(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(findOrdenesBySucursalId.execute(sucursalId));
    }
    

}

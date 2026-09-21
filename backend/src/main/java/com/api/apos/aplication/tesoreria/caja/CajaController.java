package com.api.apos.aplication.tesoreria.caja;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.tesoreria.caja.dto.CajaDto;
import com.api.apos.aplication.tesoreria.caja.dto.CorteCajaDto;
import com.api.apos.aplication.tesoreria.caja.query.FindCajaBySucursalId;
import com.api.apos.aplication.tesoreria.caja.query.FindCorteCajaActualByCajaId;
import com.api.apos.aplication.tesoreria.caja.usecase.AbrirCajaUseCase;
import com.api.apos.aplication.tesoreria.caja.usecase.CerrarCajaUseCase;
import com.api.apos.aplication.tesoreria.caja.usecase.CrearCajaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController 
@RequestMapping("/api/cajas")
@AllArgsConstructor 
public class CajaController {

    private final FindCajaBySucursalId findCajaBySucursalId;

    private final CerrarCajaUseCase cerrarCajaUseCase;

    private final AbrirCajaUseCase abrirCajaUseCase;

    private final CrearCajaUseCase crearCajaUseCase;

    private final FindCorteCajaActualByCajaId findCorteCajaActualByCajaId;
    

    @PostMapping("/{cajaId}/abrir")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> abrirCaja(@PathVariable String cajaId) {
        CajaDto cajaAbierta=abrirCajaUseCase.execute(Long.parseLong(cajaId));
        return ResponseEntity.ok(ApiResponseWrapper.success(cajaAbierta));
    }

    @PostMapping("/{cajaId}/cerrar")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> cerrarCaja(@PathVariable String cajaId) {
        CajaDto closedCaja = cerrarCajaUseCase.execute(Long.parseLong(cajaId));
        return ResponseEntity.ok(ApiResponseWrapper.success(closedCaja));
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<CajaDto>>> findCajaBySucursalId(@PathVariable String sucursalId) {
        List<CajaDto> cajas = findCajaBySucursalId.execute(Long.parseLong(sucursalId));
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajas, null, null));
    }

    @PostMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> crearCaja(@PathVariable String sucursalId, @RequestBody CajaDto cajaDto) {
        CajaDto createdCaja = crearCajaUseCase.execute(cajaDto, Long.parseLong(sucursalId));
        return ResponseEntity.ok(ApiResponseWrapper.success(createdCaja));
    }

    @GetMapping("/{cajaId}/corte")
    public ResponseEntity<ApiResponseWrapper<CorteCajaDto>> getCorteCajaActualByCajaId(@PathVariable Long cajaId) {
        CorteCajaDto corteCajaDto= findCorteCajaActualByCajaId.execute(cajaId);
        return ResponseEntity.ok(ApiResponseWrapper.success(corteCajaDto));
    }
    
    
    

}

package com.api.apos.domain.caja.caja;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;
import com.api.apos.domain.caja.caja.mapper.CajaMapper;
import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;
import com.api.apos.features.caja.queryusecase.ObtenerMovimientosDeCorteActual;
import com.api.apos.features.caja.usecase.AbrirCajaUseCase;
import com.api.apos.features.caja.usecase.CerrarCajaUseCase;
import com.api.apos.features.caja.usecase.HacerCorteCajaUseCase;
import com.api.apos.features.caja.usecase.RegistrarGastoUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@AllArgsConstructor
@RequestMapping("/api/caja")
public class CajaController {

    private final CajaService cajaService;

    private final ObtenerMovimientosDeCorteActual obtenerMovimientosDeCorteActual;

    private final AbrirCajaUseCase abrirCajaUseCase;

    private final CerrarCajaUseCase cerrarCajaUseCase;

    private final HacerCorteCajaUseCase hacerCorteCajaUseCase;

    private final RegistrarGastoUseCase registrarGastoUseCase;

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<CajaDTO>> CrearCaja(@RequestBody CrearCajaRequest entity) {
        try {
            CajaDTO nuevaCaja = cajaService.crearCaja(entity);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, nuevaCaja, "Caja creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/getBySucursal/{idSucursal}")
    public ResponseEntity<ApiResponseWrapper<List<CajaDTO>>> obtenerCajasPorSucursal(@PathVariable Long idSucursal) {
        try {
            List<CajaDTO> cajas = cajaService.obtenerCajasPorSucursal(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajas, "Cajas obtenidas exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Metodo para obtener los movimientos de una caja relacionados al corte actual
     * @param cajaId
     * @return ResponseEntity con la lista de movimientos de caja
     */
    @GetMapping("/getMovimientosByCaja")
    public ResponseEntity<ApiResponseWrapper<List<MovimientoCajaDTO>>> getMovimientosDeCaja(@RequestParam Long cajaId) {
        try {
            List<MovimientoCajaDTO> movimientos = obtenerMovimientosDeCorteActual.execute(cajaId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, movimientos, "Movimientos obtenidos exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Metodo para abrir una caja
     * @param cajaId
     * @return ResponseEntity con la caja abierta
     */
    @PostMapping("/abrirCaja")
    public ResponseEntity<ApiResponseWrapper<CajaDTO>> abrirCaja(@RequestParam Long cajaId) {
        try {
            CajaDTO cajaAbierta = CajaMapper.toDTO(abrirCajaUseCase.execute(cajaId,1L));
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaAbierta, "Caja abierta exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Metodo para cerrar una caja
     * @param cajaId
     * @return ResponseEntity con la caja cerrada
     */

    @PostMapping("/cerrarCaja")
    public ResponseEntity<ApiResponseWrapper<CajaDTO>> cerrarCaja(@RequestParam Long cajaId) {
        try {
            CajaDTO cajaCerrada = CajaMapper.toDTO(cerrarCajaUseCase.execute(cajaId));
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaCerrada, "Caja cerrada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Metodo para hacer un corte de caja
     * @param cajaId
     * @return ResponseEntity con la caja con el corte realizado
     */
    @PostMapping("/hacerCorteCaja")
    public ResponseEntity<ApiResponseWrapper<CorteCaja>> hacerCorteCaja(@RequestParam Long cajaId) {
        try {
            CorteCaja cajaConCorte = hacerCorteCajaUseCase.execute(cajaId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajaConCorte, "Corte de caja realizado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    /**
     * Metodo para registrar un gasto en una caja
     * @param cajaId
     * @param gasto
     * @return ResponseEntity con la caja con el gasto registrado
     */
    @PostMapping("/registrarGasto")
    public ResponseEntity<ApiResponseWrapper<MovimientoCajaDTO>> registrarGasto(@RequestBody MovimientoCajaDTO movimiento) {
        try {
            MovimientoCajaDTO movimientoCaja = registrarGastoUseCase.execute(movimiento);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, movimientoCaja, "Gasto registrado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
    
}

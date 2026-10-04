package com.api.apos.aplication.pos;

import java.util.List;
import com.api.apos.aplication.pos.query.FindCategoriaProductoDtoByEmpresaId;           

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.pos.dto.CategoriaProductoDto;
import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.aplication.pos.dto.PagarVentaDto;
import com.api.apos.aplication.pos.query.FindOrdenesBySucursalId;
import com.api.apos.aplication.pos.usecase.ActualizarEstadoOrdenUseCase;
import com.api.apos.aplication.pos.usecase.CobrarOrdenUseCase;
import com.api.apos.aplication.pos.usecase.CrearOrdenUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;


@RestController
@RequestMapping("/api/pos")
@AllArgsConstructor 
public class PosController {
    
    private final FindOrdenesBySucursalId findOrdenesBySucursalId;

    private final FindCategoriaProductoDtoByEmpresaId findCategoriaProductoDtoByEmpresaId;

    private final ActualizarEstadoOrdenUseCase actualizarEstadoOrdenUseCase;

    private final CobrarOrdenUseCase cobrarOrdenUseCase;

    private final CrearOrdenUseCase crearOrdenUseCase;


    @GetMapping("/ordenes/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<OrdenDto>>> getOrdenesBySucursalId(@PathVariable Long sucursalId) {

        List<OrdenDto> response = findOrdenesBySucursalId.execute(sucursalId);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }
    
    @GetMapping("/productos/empresa/{empresaId}")
    public ResponseEntity<ApiResponseWrapper<List<CategoriaProductoDto>>> getProductosByEmpresaId(@PathVariable Long empresaId) {

        List<CategoriaProductoDto> response = findCategoriaProductoDtoByEmpresaId.execute(empresaId);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping ("/ordenes/actualizar-estado")
    public ResponseEntity<ApiResponseWrapper<OrdenDto>> actualizarEstadoOrden(@RequestParam Long ordenId) {

        OrdenDto response = actualizarEstadoOrdenUseCase.execute(ordenId);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping("/ordenes/cobrar")
    public ResponseEntity<ApiResponseWrapper<OrdenDto>> cobrarOrden(@RequestBody PagarVentaDto pagarVentaDto) {

        OrdenDto response = cobrarOrdenUseCase.execute(pagarVentaDto);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    }

    @PostMapping("/ordenes/crear")
    public ResponseEntity<ApiResponseWrapper<OrdenDto>> crearOrden(@RequestBody OrdenDto ordenDto) {

        OrdenDto response = crearOrdenUseCase.execute(ordenDto);

        return ResponseEntity.ok(ApiResponseWrapper.success(response));
    } 

}

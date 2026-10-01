package com.api.apos.aplication.identidad.mesa;
    
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.identidad.mesa.dto.MesaDto;
import com.api.apos.aplication.identidad.mesa.query.FindMesasBySucursalId;
import com.api.apos.aplication.identidad.mesa.usecase.CrearMesaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/mesas")
@AllArgsConstructor 
public class MesaController {
    
    private final FindMesasBySucursalId findMesasBySucursalId;

    private final CrearMesaUseCase crearMesaUseCase;

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<MesaDto>>> getMesasBySucursalId(@PathVariable Long sucursalId) {
        List<MesaDto> mesaDto = findMesasBySucursalId.execute(sucursalId); 

        return ResponseEntity.ok(ApiResponseWrapper.success(mesaDto));
    }

    @PostMapping 
    public ResponseEntity<ApiResponseWrapper<MesaDto>> crearMesa(@RequestBody MesaDto mesaDto) {
        return ResponseEntity.ok(ApiResponseWrapper.success(crearMesaUseCase.execute(mesaDto)));
    }
    

}

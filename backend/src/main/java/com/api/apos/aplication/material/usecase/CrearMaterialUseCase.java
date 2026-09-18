package com.api.apos.aplication.material.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.material.dto.MaterialDto;
import com.api.apos.aplication.material.mapper.MaterialMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.organizacion.empresa.Empresa;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor 
public class CrearMaterialUseCase {

    private final MaterialService materialService;

    private final UsuarioService usuarioService;
    
    public MaterialDto execute(MaterialDto materialDto) {
        
        Empresa empresa = usuarioService.getEmpresaFromAuthenticatedUser();

        Material material = Material.builder()
            .cantidad(materialDto.getCantidad())
            .descripcion(materialDto.getDescripcion())
            .nombre(materialDto.getNombre())
            .precio(materialDto.getPrecio())
            .proveedor(materialDto.getProveedor())
            .unidad(materialDto.getUnidad()) 
            .empresa(empresa)
            .build();
            
        return MaterialMapper.toDto(materialService.save(material));

    }

}

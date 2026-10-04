package com.api.apos.aplication.cataogo.producto;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.cataogo.producto.query.FindProductosByEmpresaId;
import com.api.apos.aplication.cataogo.producto.usecase.CrearProductoUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping("/api/productos")
@AllArgsConstructor 
public class ProductoController {
    
    private final FindProductosByEmpresaId findProductosByEmpresaId;

    private final CrearProductoUseCase crearProductoUseCase;

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<ApiResponseWrapper<List<ProductoDto>>> getProductosByEmpresaId(@PathVariable Long empresaId) {
        List<ProductoDto> productos = findProductosByEmpresaId.execute(empresaId);
        return ResponseEntity.ok(ApiResponseWrapper.success(productos));
    }

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<ProductoDto>> createProducto(@RequestBody ProductoDto productoDto) {
        ProductoDto createdProducto = crearProductoUseCase.execute(productoDto);
        return ResponseEntity.ok(ApiResponseWrapper.success(createdProducto));
    }
    
    

}

package com.api.apos.domain.catalogo.categoria;

import java.util.List;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity 
@Table (name = "categoria")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class Categoria {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @OneToMany (mappedBy = "categoria", orphanRemoval = true)
    private List<Producto> productos;

    @ManyToOne(fetch = FetchType.LAZY)
    private Sucursal sucursal;
    
}

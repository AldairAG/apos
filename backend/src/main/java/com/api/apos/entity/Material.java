package com.api.apos.entity;

import com.api.apos.enums.TipoMaterial;
import com.api.apos.enums.TipoUnidad;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    private TipoMaterial tipoMaterial;
    
    @Enumerated(EnumType.STRING)
    private TipoUnidad tipoUnidad;
    
    private Boolean activo;

    @OneToMany(mappedBy = "material")
    @JsonBackReference
    private List<InventarioItem> inventarioItem; // Relación bidireccional con InventarioItem
}

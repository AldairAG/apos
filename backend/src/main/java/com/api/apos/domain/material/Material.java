package com.api.apos.domain.material;

import com.api.apos.enums.TipoMaterial;
import com.api.apos.enums.TipoUnidad;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
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
}

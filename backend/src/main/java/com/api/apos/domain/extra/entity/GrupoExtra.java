package com.api.apos.domain.extra.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grupos_extra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoExtra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    private Boolean activo;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;
    
    @OneToMany(mappedBy = "grupoExtra", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OpcionExtra> opciones;
    
    @JsonIgnore
    @OneToMany(mappedBy = "grupoExtra", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ProductoGrupoExtra> productosGrupo;
}

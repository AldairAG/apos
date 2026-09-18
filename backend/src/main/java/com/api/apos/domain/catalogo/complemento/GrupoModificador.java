package com.api.apos.domain.catalogo.complemento;

import java.util.List;

import com.api.apos.domain.catalogo.modificadores.Modificador;

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
@Table(name = "grupo_modificador")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoModificador {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @OneToMany (mappedBy = "grupoModificador", orphanRemoval = true)
    private List<Modificador> modificadores;

    
}
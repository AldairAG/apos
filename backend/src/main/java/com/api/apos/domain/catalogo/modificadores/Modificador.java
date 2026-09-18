package com.api.apos.domain.catalogo.modificadores;

import java.math.BigDecimal;

import com.api.apos.domain.catalogo.complemento.GrupoModificador;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "modificadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modificador {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn (name = "grupo_modificador_id")
    private GrupoModificador grupoModificador;

    private String nombre;

    private BigDecimal precio;

    private BigDecimal costo;

    private BigDecimal maximo;
    
}

package com.api.apos.domain.catalogo.modificadores;

import java.math.BigDecimal;

import com.api.apos.domain.catalogo.complemento.Modificador;

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
@Table(name = "opciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opcion {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn (name = "modificador_id")
    private Modificador modificador;

    private String nombre;

    private BigDecimal precio;

    private BigDecimal costo;

    private BigDecimal maximo;
    
}

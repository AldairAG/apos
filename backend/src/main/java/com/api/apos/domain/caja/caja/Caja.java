package com.api.apos.domain.caja.caja;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.EstadoCaja;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "cajas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caja {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private Boolean activa;
    @Enumerated(EnumType.STRING)
    private EstadoCaja estado;
    private BigDecimal montoActual;
    private Long corteActualId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @OneToMany(mappedBy = "caja", cascade = CascadeType.ALL)
    private List<CorteCaja> cortes;
    
    @OneToMany(mappedBy = "caja", cascade = CascadeType.ALL)
    private List<MovimientoCaja> movimientos;
}

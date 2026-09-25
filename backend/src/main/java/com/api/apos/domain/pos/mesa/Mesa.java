package com.api.apos.domain.pos.mesa;

import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.enums.EstadoMesa;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "mesas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numero;

    private String nombre;

    private EstadoMesa estado;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_actual_id")
    private Orden ordenActual;

    @ManyToOne
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    public void asignarOrdenActual(Orden orden) {
        this.ordenActual = orden;
        this.estado = EstadoMesa.OCUPADA;
    }
}

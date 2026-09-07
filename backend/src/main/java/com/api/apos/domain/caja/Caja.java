package com.api.apos.domain.caja;

import java.util.List;

import com.api.apos.domain.corte_caja.CorteCaja;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import com.api.apos.domain.sucursal.Sucursal;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Builder 
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "cajas")
@Data 
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    
    private Sucursal sucursal;

    @OneToMany(mappedBy = "caja")
    private List<CorteCaja> cortesCaja;


}

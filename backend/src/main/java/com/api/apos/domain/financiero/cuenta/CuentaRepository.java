package com.api.apos.domain.financiero.cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {
    
    List<Cuenta> findByEmpresaId(Long empresaId); 

}

package com.api.apos.service.gasto;

import com.api.apos.entity.CategoriaGasto;
import com.api.apos.entity.Gasto;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.CategoriaGastoRepository;
import com.api.apos.repository.GastoRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GastoServiceImpl implements GastoService {

    private final GastoRepository gastoRepository;
    private final SucursalRepository sucursalRepository;
    private final CategoriaGastoRepository categoriaGastoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Gasto> findAll() {
        return gastoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Gasto> findById(Long id) {
        return gastoRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Gasto> findBySucursalId(Long sucursalId) {
        return gastoRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Gasto save(Gasto gasto) {
        Sucursal sucursal = sucursalRepository.findById(gasto.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        gasto.setSucursal(sucursal);
        if (gasto.getCategoria() != null && gasto.getCategoria().getId() != null) {
            CategoriaGasto categoria = categoriaGastoRepository.findById(gasto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            gasto.setCategoria(categoria);
        }
        return gastoRepository.save(gasto);
    }

    @Override
    @Transactional
    public Gasto update(Long id, Gasto data) {
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado"));
        gasto.setDescripcion(data.getDescripcion());
        gasto.setMonto(data.getMonto());
        gasto.setFecha(data.getFecha());
        if (data.getCategoria() != null && data.getCategoria().getId() != null) {
            CategoriaGasto categoria = categoriaGastoRepository.findById(data.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            gasto.setCategoria(categoria);
        }
        return gastoRepository.save(gasto);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        gastoRepository.deleteById(id);
    }
}

package com.api.apos.service.gastoreinversion;

import com.api.apos.entity.CategoriaGasto;
import com.api.apos.entity.GastoReinversion;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.CategoriaGastoRepository;
import com.api.apos.repository.GastoReinversionRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GastoReinversionServiceImpl implements GastoReinversionService {

    private final GastoReinversionRepository gastoReinversionRepository;
    private final SucursalRepository sucursalRepository;
    private final CategoriaGastoRepository categoriaGastoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GastoReinversion> findAll() {
        return gastoReinversionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GastoReinversion> findById(Long id) {
        return gastoReinversionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GastoReinversion> findBySucursalId(Long sucursalId) {
        return gastoReinversionRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public GastoReinversion save(GastoReinversion gasto) {
        Sucursal sucursal = sucursalRepository.findById(gasto.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        gasto.setSucursal(sucursal);
        if (gasto.getCategoria() != null && gasto.getCategoria().getId() != null) {
            CategoriaGasto categoria = categoriaGastoRepository.findById(gasto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            gasto.setCategoria(categoria);
        }
        return gastoReinversionRepository.save(gasto);
    }

    @Override
    @Transactional
    public GastoReinversion update(Long id, GastoReinversion data) {
        GastoReinversion gasto = gastoReinversionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto de reinversión no encontrado"));
        gasto.setDescripcion(data.getDescripcion());
        gasto.setMonto(data.getMonto());
        gasto.setFecha(data.getFecha());
        if (data.getCategoria() != null && data.getCategoria().getId() != null) {
            CategoriaGasto categoria = categoriaGastoRepository.findById(data.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            gasto.setCategoria(categoria);
        }
        return gastoReinversionRepository.save(gasto);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        gastoReinversionRepository.deleteById(id);
    }
}

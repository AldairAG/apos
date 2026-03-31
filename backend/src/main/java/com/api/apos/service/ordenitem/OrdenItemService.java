package com.api.apos.service.ordenitem;

import com.api.apos.entity.OrdenItem;
import java.util.List;
import java.util.Optional;

public interface OrdenItemService {
    List<OrdenItem> findAll();
    Optional<OrdenItem> findById(Long id);
    List<OrdenItem> findByOrdenId(Long ordenId);
    OrdenItem save(OrdenItem ordenItem);
    OrdenItem update(Long id, OrdenItem ordenItem);
    void deleteById(Long id);
}

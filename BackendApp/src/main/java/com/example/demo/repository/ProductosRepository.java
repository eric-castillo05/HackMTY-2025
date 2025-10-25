package com.example.demo.repository;

import com.example.demo.models.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, String> {
    Optional<Productos> findByUuidProduct(UUID uuid);  // Spring Data will auto-generate this
    List<Productos> findByLotsName(String lotsName);

}
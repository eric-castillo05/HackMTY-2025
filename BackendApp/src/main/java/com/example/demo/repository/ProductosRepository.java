package com.example.demo.repository;

import com.example.demo.models.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, String> {
    Optional<Productos> findByUrlImage(String urlImage);
    List<Productos> findByLotsName(String lotsName);

}
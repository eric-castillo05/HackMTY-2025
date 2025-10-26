package com.example.demo.repository;

import com.example.demo.models.Vendido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendidoRepository extends JpaRepository<Vendido, String> {
}

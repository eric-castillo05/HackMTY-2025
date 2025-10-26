package com.example.demo.repository;

import com.example.demo.models.Caducados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaducadosRepository extends JpaRepository<Caducados, String> {
}

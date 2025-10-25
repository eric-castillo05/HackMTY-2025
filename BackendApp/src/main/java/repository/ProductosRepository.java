package repository;

import models.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductosRepository extends JpaRepository<Productos, String> {
    Optional<Productos> findByUrlImage(String urlImage);
}

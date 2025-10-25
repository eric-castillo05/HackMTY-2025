package com.example.demo.services;

import com.example.demo.models.Productos;
import com.example.demo.repository.ProductosRepository;
import com.example.demo.utils.STATUS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ProductosService {

    @Autowired
    private ProductosRepository productosRepository;

    // Crear o insertar producto
    public Productos saveProducto(Productos p) {
        return productosRepository.save(p);
    }

    // Consultar por UUID y verificar estado (Nombre corregido)
    public Map<String, Object> checkExpiryByUuid(String uuid_product) { // <-- NOMBRE DEL MÉTODO CORREGIDO
        Optional<Productos> optionalProducto = productosRepository.findByuuid_product(UUID.fromString(uuid_product));
        Map<String, Object> response = new HashMap<>();

        if (optionalProducto.isPresent()) {
            Productos producto = optionalProducto.get();
            Date expiryDate = producto.getExpiry_date();

            // Convertir a LocalDate
            LocalDate expiry = expiryDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            LocalDate today = LocalDate.now();
            long daysDiff = ChronoUnit.DAYS.between(today, expiry);

            response.put("product_name", producto.getProduct_name());
            response.put("expiry_date", expiry);
            response.put("quantity", producto.getQuantity());
            response.put("url_image", producto.getUrlImage());

            if (daysDiff < 0) {
                // Producto vencido → actualizar lote completo y productos
                response.put("status", "VENCIDO");
                response.put("days_overdue", Math.abs(daysDiff));

                // Obtener todos los productos del mismo lote
                List<Productos> productosLote = productosRepository.findByLotsName(producto.getLotsName());

                for (Productos p : productosLote) {
                    p.setStatus(STATUS.valueOf("CADUCADO"));  // suponiendo que existe el campo 'status'
                    productosRepository.save(p);
                }

            } else if (daysDiff == 0) {
                response.put("status", "VENCE HOY");
                response.put("days_left", 0);
            } else {
                response.put("status", "VIGENTE");
                response.put("days_left", daysDiff);
            }

        } else {
            response.put("error", "Producto no encontrado");
        }

        return response;
    }
}
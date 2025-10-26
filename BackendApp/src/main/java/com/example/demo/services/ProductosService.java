package com.example.demo.services;

import com.example.demo.models.Caducados;
import com.example.demo.models.Productos;
import com.example.demo.models.Vendido;
import com.example.demo.repository.CaducadosRepository;
import com.example.demo.repository.ProductosRepository;
import com.example.demo.repository.VendidoRepository;
import com.example.demo.utils.SEGMENTOS;
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

    @Autowired
    private VendidoRepository vendidoRepository;
    @Autowired
    private CaducadosRepository caducadosRepository;


    // Crear o insertar producto
    public Productos saveProducto(Productos p) {
        return productosRepository.save(p);
    }

    // Consultar por UUID y verificar estado (Nombre corregido)
    public Map<String, Object> checkExpiryByUuid(String uuid_product) { // <-- NOMBRE DEL MÉTODO CORREGIDO
        Optional<Productos> optionalProducto = productosRepository.findByUuidProduct(UUID.fromString(uuid_product));
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
            response.put("uuid", producto.getUuidProduct());

            if (daysDiff < 0) {
                // Producto vencido → actualizar lote completo y productos
                response.put("status", "VENCIDO");
                response.put("days_overdue", Math.abs(daysDiff));

                // Obtener todos los productos del mismo lote
                List<Productos> productosLote = productosRepository.findByLotsName(producto.getLotsName());

                for (Productos p : productosLote) {
                    p.setStatus(STATUS.valueOf("CADUCADO"));  // suponiendo que existe el campo 'status'
                    productosRepository.save(p);

                    Caducados caducado = new Caducados();
                    caducado.setProducto(p);
                    caducadosRepository.save(caducado);
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

    public Map<String, Object> checkExitProduct(String uuid_product) {
        Map<String, Object> response = new HashMap<>();
        Optional<Productos> optionalProducto = productosRepository.findByUuidProduct(UUID.fromString(uuid_product));

        if (optionalProducto.isEmpty()) {
            response.put("error", "Producto no encontrado");
            return response;
        }

        Productos producto = optionalProducto.get();
        Date expiryDate = producto.getExpiry_date();
        LocalDate expiry = expiryDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate today = LocalDate.now();
        long daysDiff = ChronoUnit.DAYS.between(today, expiry);

        if (daysDiff < 0) {
            producto.setStatus(STATUS.CADUCADO);
            productosRepository.save(producto);
            response.put("status", "CADUCADO");
            response.put("message", "El producto está caducado y no puede ser vendido.");
            return response;
        }

        Vendido vendido = new Vendido();
        vendido.setProducto(producto);

        vendido.setFlightId("FL-" + UUID.randomUUID().toString().substring(0, 6));
        vendido.setOrigin("Almacén Central");
        vendido.setFlightType(new Date());
        vendido.setSegmentos(SEGMENTOS.RETAIL);
        vendido.setPassengersCount(0);
        vendido.setStandarSpecificationQty(1);
        vendido.setQuantityReturned(0);
        vendido.setQuantityConsumed(1);
        vendido.setUnitCost(10.5f);
        vendido.setCrewFeedback("Producto vigente. Agregado correctamente a 'vendido'.");

        vendidoRepository.save(vendido);

        response.put("status", "VIGENTE");
        response.put("message", "Producto vigente. Agregado correctamente a la tabla 'vendido'.");
        response.put("uuid_vendido", vendido.getUuid_vendido());
        response.put("product_name", producto.getProduct_name());
        response.put("expiry_date", expiry);
        response.put("days_left", daysDiff);
        response.put("segmento", vendido.getSegmentos().name());

        return response;
    }
}
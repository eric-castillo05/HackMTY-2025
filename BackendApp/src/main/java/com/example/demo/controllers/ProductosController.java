package com.example.demo.controllers;

import com.example.demo.models.Productos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.services.ProductosService;

import java.util.Map;

@RestController
@RequestMapping("/productos")
public class ProductosController {

    @Autowired
    private ProductosService productosService;

    // Insertar un nuevo producto
    @PostMapping("/insertar")
    public Productos insertarProducto(@RequestBody Productos producto) {
        return productosService.saveProducto(producto);
    }

    // Consultar producto por URL
    @GetMapping("/verificar")
    public Map<String, Object> verificarProducto(@RequestParam String url) {
        return productosService.checkExpiryByUuid(url);
    }
}

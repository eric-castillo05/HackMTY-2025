package com.example.demo.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.Date;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "productos")
public class Productos {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(
            name = "uuid2",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "uuid_product", nullable = false, updatable = false)
    private String uuid_product;

    @Column(name = "product_id", nullable = false, length = 254)
    private String product_id;

    @Column(name = "product_name", nullable = false, length = 254)
    private String product_name;

    @Column(name = "lots_name", nullable = false, length = 254)
    private String lots_name;

    @Column(name = "expiry_date", nullable = false)  // Fixed typo
    private Date expiry_date;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "urlImage", nullable = false)
    private String urlImage;
}
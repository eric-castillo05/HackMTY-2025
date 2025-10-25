package com.example.demo.models;
import java.util.UUID;
import com.example.demo.utils.STATUS;
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
    @Column(name = "uuidProduct", nullable = false, updatable = false)
    private UUID uuidProduct;

    @Column(name = "product_id", nullable = false, length = 254)
    private String product_id;

    @Column(name = "product_name", nullable = false, length = 254)
    private String product_name;

    @Column(name = "lotsName", nullable = false, length = 254)
    private String lotsName;

    @Column(name = "expiry_date", nullable = false)  // Fixed typo
    private Date expiry_date;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "urlImage", nullable = false)
    private String urlImage;

    @Column (name = "status", nullable = false)
    STATUS status;

    @Column(name = "mlg", nullable = false, length = 2)
    String mlg;

    @PrePersist
    public void prePersist() {
        if (this.uuidProduct == null) {
            this.uuidProduct = UUID.randomUUID();
        }
    }
}
package models;

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
    String uuid_product;

    @Column(name = "product_id", nullable = false, length=254 )
    String product_id;

    @Column(name = "product_name", nullable = false, length=254 )
    String product_name;

    @Column(name = "lots_name", nullable = false, length=254 )
    String lots_name;

    @Column(name = "spiry_date", nullable = false)
    Date expiry_date;

    @Column(name = "quantity", nullable = false)
    int quantity;

    @Column(name = "url_image", nullable = false)
    String url_image;

}

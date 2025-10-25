package models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "caducados")
public class caducados {
    @Id
    @Column(name = "uuid_product")
    @OneToOne
    @JoinColumn(name = "productos",referencedColumnName = "uuid_product")
    private Productos uuid_product;

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(
            name = "uuid2",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "uuid_caducados", nullable = false, updatable = false)
    String uuid_caducados;
}

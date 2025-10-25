package models;

import jakarta.persistence.*;
import lombok.*;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "contenido")

public class contenido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mlg", nullable = false, length=254)
    String mlg;
}

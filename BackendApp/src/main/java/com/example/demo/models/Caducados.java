package com.example.demo.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "caducados")
public class Caducados {

    @Id
    @GeneratedValue(generator = "uuid4")
    @GenericGenerator(
            name = "uuid4",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "uuid_caducados", nullable = false, updatable = false)
    private String uuidCaducados;

    @OneToOne
    @JoinColumn(name = "uuidProduct", referencedColumnName = "uuidProduct", nullable = false)
    private Productos producto;
}
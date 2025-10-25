package models;

import jakarta.persistence.*;
import lombok.*;
import utils.SEGMENTOS;

import java.util.Date;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "vendido")
public class vendido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uuid")
    String uuid;

    @Column(name = "flight_id", nullable = false)
    String flight_id;

    @Column(name = "origin", nullable = false)
    String origin;

    @Column(name = "flight_type", nullable = false)
    Date flight_type;

    @Column(name = "segmentos", nullable = false)
    SEGMENTOS segmentos;

    @Column(name = "passengers_count", nullable = false)
    int passengers_count;

    @Column(name = "product_id")
    @OneToOne
    @JoinColumn(name = "productos",referencedColumnName = "product_id")
    private Productos product_id;

    @Column(name = "standar_specification_qty", nullable = false)
    int standar_specification_qty;

    @Column(name = "quantity_returned", nullable = false)
    int quantity_returned;

    @Column(name = "quantity_consumed", nullable = false)
    int quantity_consumed;

    @Column(name = "unit_cost", nullable = false)
    float unit_cost;

    @Column(name = "crew_feedback", nullable = false, length=254)
    String crew_feedback;

}

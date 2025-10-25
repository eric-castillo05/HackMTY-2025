package com.example.demo.models;

import jakarta.persistence.*;
import lombok.*;
import com.example.demo.utils.SEGMENTOS;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "vendido")
public class Vendido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uuid")
    private String uuid;

    @Column(name = "flight_id", nullable = false)
    private String flightId;

    @Column(name = "origin", nullable = false)
    private String origin;

    @Column(name = "flight_type", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date flightType;

    @Enumerated(EnumType.STRING)
    @Column(name = "segmentos", nullable = false)
    private SEGMENTOS segmentos;

    @Column(name = "passengers_count", nullable = false)
    private int passengersCount;

    // Reference the PRIMARY KEY instead
    @ManyToOne
    @JoinColumn(name = "uuid_product", referencedColumnName = "uuid_product", nullable = false)
    private Productos producto;

    @Column(name = "standar_specification_qty", nullable = false)
    private int standarSpecificationQty;

    @Column(name = "quantity_returned", nullable = false)
    private int quantityReturned;

    @Column(name = "quantity_consumed", nullable = false)
    private int quantityConsumed;

    @Column(name = "unit_cost", nullable = false)
    private float unitCost;

    @Column(name = "crew_feedback", nullable = false, length = 254)
    private String crewFeedback;
}
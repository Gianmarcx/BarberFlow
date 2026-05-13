package com.barberflow.barberflow.dto;

import java.math.BigDecimal;

public class ServiceDTO {

    private Long id;
    private String name;
    private String description;       // ✅ aggiunto
    private int duration;
    private BigDecimal price;         // ✅ era double, corretto in BigDecimal

    public ServiceDTO() {}

    public ServiceDTO(Long id, String name, String description, int duration, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getDuration() { return duration; }
    public BigDecimal getPrice() { return price; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setDuration(int duration) { this.duration = duration; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
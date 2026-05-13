package com.barberflow.barberflow.dto;

public class ServiceDTO{

     private Long id;
     private String name;
     private int duration;
     private double price;

     public ServiceDTO() {}

     public ServiceDTO(Long id, String name, int duration, double price) {
         this.id = id;
         this.name = name;
         this.duration = duration;
         this.price = price;
     }

     public Long getId() {
         return id;
     }

     public void setId(Long id) {
         this.id = id;
     }

     public String getName() {
         return name;
     }

     public void setName(String name) {
         this.name = name;
     }

     public int getDuration() {
         return duration;
     }

     public void setDuration(int duration) {
         this.duration = duration;
     }

     public double getPrice() {
         return price;
     }

     public void setPrice(double price) {
         this.price = price;
     }
}
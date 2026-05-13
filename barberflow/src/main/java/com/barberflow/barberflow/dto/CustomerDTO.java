package com.barberflow.barberflow.dto;

public class CustomerDTO {

    private Long id;
    private String name;
    private String surname;
    private String phone;
    private String email;
    private String notes;

    public CustomerDTO() {}

    public CustomerDTO(Long id, String name, String surname, String phone, String email, String notes) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.email = email;
        this.notes = notes;
    }

    // GETTER & SETTER
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

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

package com.umzug.hello.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String telefonnummer;

    @Enumerated(EnumType.STRING)
    private Role rolle;

    @Enumerated(EnumType.STRING)
    private FahrzeugGroesse fahrzeugGroesse;

    protected User() {
    }

    public User(String name, Role rolle) {
        this.name = name;
        this.rolle = rolle;
    }
    public User(String name, String telefonnummer, Role rolle) {
    this.name = name;
    this.telefonnummer = telefonnummer;
    this.rolle = rolle;
   }
    public User(String name, String telefonnummer, Role rolle, FahrzeugGroesse fahrzeugGroesse) {
        this.name = name;
        this.telefonnummer = telefonnummer;
        this.rolle = rolle;
        this.fahrzeugGroesse = fahrzeugGroesse;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTelefonnummer() {
        return telefonnummer;
    }

    public void setTelefonnummer(String telefonnummer) {
        this.telefonnummer = telefonnummer;
    }

    public Role getRolle() {
        return rolle;
    }

    public void setRolle(Role rolle) {
        this.rolle = rolle;
    }

    public FahrzeugGroesse getFahrzeugGroesse() {
    return fahrzeugGroesse;
   }

   public void setFahrzeugGroesse(FahrzeugGroesse fahrzeugGroesse) {
    this.fahrzeugGroesse = fahrzeugGroesse;
  }

    public enum Role {
        KUNDE, FAHRER
    }

    public enum FahrzeugGroesse {
    KLEIN, GROSS
    }
}
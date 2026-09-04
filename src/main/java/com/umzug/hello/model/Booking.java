package com.umzug.hello.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long kundeId;
	private Long fahrerId;
	private String von;
	private String nach;

	@Enumerated(EnumType.STRING)
	private BookingStatus status;

	protected Booking() {
	}

	public Booking(Long kundeId, String von, String nach) {
		this.kundeId = kundeId;
		this.von = von;
		this.nach = nach;
		this.status = BookingStatus.NEU;
	}
    /*
    NEU = Ahmad hat gerade gebucht ("ich brauche Hilfe beim Umzug"), aber noch niemand hat sich gemeldet. Die Buchung liegt quasi offen da, wartet darauf, dass ein Fahrer sie sieht und zusagt. fahrerId ist zu diesem Zeitpunkt noch leer (null), weil noch kein Fahrer zugeordnet ist.

    ANGENOMMEN = Kerem hat auf "Annehmen" gedrückt. Ab jetzt steht in fahrerId Kerems ID, und beide (Ahmad und Kerem) wissen: "es geht los, wir sollten uns jetzt kontaktieren, um Details/Preis zu klären."

    Also, ganz konkret der Ablauf:

    1.Ahmad bucht → status = NEU, fahrerId = null
    2.Kerem nimmt an → status = ANGENOMMEN, fahrerId = 42 (Kerems ID)
     */
	public enum BookingStatus {
		NEU, ANGENOMMEN
	}

	public Long getId() {
		return id;
	}

	public Long getKundeId() {
		return kundeId;
	}

	public Long getFahrerId() {
		return fahrerId;
	}

	public void setFahrerId(Long fahrerId) {
		this.fahrerId = fahrerId;
	}

	public String getVon() {
		return von;
	}

	public String getNach() {
		return nach;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}
}

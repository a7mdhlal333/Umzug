package com.umzug.hello.controller;

import com.umzug.hello.model.Booking;
import com.umzug.hello.model.User;
import com.umzug.hello.repository.BookingRepository;
import com.umzug.hello.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
@CrossOrigin(
    origins = {"http://localhost:4200", "http://localhost:50878"},
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PATCH,
        RequestMethod.OPTIONS
    }
)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody CreateBookingRequest request) {
        return userRepository.findById(request.kundeId())
                .map(user -> {
                    Booking booking = new Booking(request.kundeId(), request.von(), request.nach());
                    return ResponseEntity.status(HttpStatus.CREATED).body(bookingRepository.save(booking));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    /*
    Buchung nicht vorhanden: 404 Not Found
    Fahrer nicht vorhanden: 404 Not Found
    User ist kein Fahrer: 403 Forbidden
    Alles korrekt: Buchung wird angenommen */
    @PatchMapping("/{id}/accept")
    public ResponseEntity<Booking> acceptBooking(
            @PathVariable Long id,
            @RequestBody AcceptBookingRequest request) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        if (booking.getStatus() == Booking.BookingStatus.ANGENOMMEN) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        User fahrer = userRepository.findById(request.fahrerId()).orElse(null);
        if (fahrer == null) {
            return ResponseEntity.notFound().build();
        }

        if (fahrer.getRolle() != User.Role.FAHRER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        booking.setFahrerId(fahrer.getId());
        booking.setStatus(Booking.BookingStatus.ANGENOMMEN);
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    public record CreateBookingRequest(Long kundeId, String von, String nach) {
    }

    public record AcceptBookingRequest(Long fahrerId) {
    }
    /*
    GET /api/bookings – alle Buchungen
    GET /api/bookings/{id} – eine Buchung
    POST /api/bookings – neue Buchung
    PATCH /api/bookings/{id}/accept – Buchung annehmen
     */

    /*
    Beispiel für POST(neue Buchung):
    {
        "kundeId": 1,
        "von": "Berlin",
        "nach": "Hamburg"
    }
    Beispiel für PATCH(Annehmen):
    {
        "fahrerId": 2
    }

     */
}

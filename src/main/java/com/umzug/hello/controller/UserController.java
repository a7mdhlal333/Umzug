package com.umzug.hello.controller;

import com.umzug.hello.model.User;
import com.umzug.hello.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:50878"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<Void> health() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (isBlank(request.name()) || isBlank(request.telefonnummer()) || request.rolle() == null) {
            return ResponseEntity.badRequest().body("Name, Telefonnummer und Rolle sind erforderlich.");
        }

        String telefonnummer = request.telefonnummer().trim().replaceAll("[\\s()-]", "");
        if (!telefonnummer.matches("^(\\+49|0049|0)[1-9][0-9]{6,13}$")) {
            return ResponseEntity.badRequest().body("Bitte eine gültige deutsche Telefonnummer eingeben.");
        }

        User existingUser = userRepository.findFirstByTelefonnummerOrderByIdAsc(telefonnummer).orElse(null);
        if (existingUser != null) {
            return ResponseEntity.ok(existingUser);
        }

        User newUser = new User(request.name().trim(), telefonnummer, request.rolle());
        return ResponseEntity.status(HttpStatus.OK).body(userRepository.save(newUser));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record LoginRequest(String name, String telefonnummer, User.Role rolle) {
    }
}
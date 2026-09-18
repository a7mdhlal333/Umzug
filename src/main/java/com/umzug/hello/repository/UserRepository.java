package com.umzug.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import com.umzug.hello.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByTelefonnummer(String telefonnummer);
	List<User> findByRolle(User.Role rolle);
}

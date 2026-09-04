package com.umzug.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umzug.hello.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}

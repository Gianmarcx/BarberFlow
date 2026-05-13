@GetMapping("/available")
public ResponseEntity<List<LocalTime>> getAvailableSlots(
        @RequestParam LocalDate date,
        @RequestParam Long serviceId,
        Authentication auth) {

    return ResponseEntity.ok(
            bookingService.getAvailableSlots(date, serviceId, auth.getName())
    );
}

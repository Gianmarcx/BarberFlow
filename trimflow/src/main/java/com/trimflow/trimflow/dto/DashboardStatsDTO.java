package com.trimflow.trimflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalBookingsToday;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private double totalRevenueToday;
    private String currency;
}

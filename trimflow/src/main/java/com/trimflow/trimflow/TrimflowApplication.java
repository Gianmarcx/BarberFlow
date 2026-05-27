package com.trimflow.trimflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // ✅ Aggiungi questo

@SpringBootApplication
@EnableScheduling 
public class TrimflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrimflowApplication.class, args);
    }
}
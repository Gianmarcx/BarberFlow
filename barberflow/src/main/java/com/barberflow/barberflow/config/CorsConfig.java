package com.barberflow.barberflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permetti il frontend (in sviluppo)
        config.addAllowedOrigin("http://localhost:5173");
        
        // Permetti tutti i metodi HTTP
        config.addAllowedMethod("*");
        
        // Permetti tutti gli headers
        config.addAllowedHeader("*");
        
        // Permetti le credenziali (se usi JWT/Auth)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}  
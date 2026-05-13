package com.barberflow.barberflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)                                          // ✅ nuova API 0.12
                .issuedAt(new Date(System.currentTimeMillis()))          // ✅ nuova API 0.12
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // ✅ nuova API 0.12
                .signWith(getSigningKey())                               // ✅ non serve più SignatureAlgorithm
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String extractedEmail = extractEmail(token);
        return extractedEmail.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                      // ✅ parserBuilder() rimosso in 0.12
                .verifyWith(getSigningKey())       // ✅ nuova API 0.12
                .build()
                .parseSignedClaims(token)          // ✅ parseClaimsJws() rimosso in 0.12
                .getPayload();                     // ✅ getBody() rimosso in 0.12
    }
}
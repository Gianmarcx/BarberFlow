package com.barberflow.barberflow.security;

import com.barberflow.barberflow.entity.User;
import com.barberflow.barberflow.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con email: " + email));

        // Mappa ruoli/authorities se li hai; qui un esempio minimale
        Collection<? extends GrantedAuthority> authorities = mapRolesToAuthorities(user);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(User user) {
        // Se la tua entity User ha ruoli, mappali qui; altrimenti restituisci una lista vuota o ROLE_USER
        // Esempio semplice:
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}

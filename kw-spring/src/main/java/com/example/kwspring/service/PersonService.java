package com.example.kwspring.service;

import com.example.kwspring.domain.Person;
import com.example.kwspring.dto.CreatePersonDTO;
import com.example.kwspring.dto.PersonResponseDTO;
import com.example.kwspring.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Service
public class PersonService {

    private final PersonRepository personRepository;

    @Transactional
    public PersonResponseDTO createPerson(CreatePersonDTO request) {
        Person savedPerson = personRepository.save(request.toEntity());
        log.debug("person dto test - {}", savedPerson.getId());
        return savedPerson.toDTO();
    }


    public PersonResponseDTO getPerson(Long persondId) {
        Person person = personRepository.findById(persondId)
                .orElseThrow(() -> new RuntimeException("Person not found"));
        return person.toDTO();
    }
}

package com.example.kwspring.dto;

import com.example.kwspring.domain.Person;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@ToString
@Getter
@Builder
public class CreatePersonDTO {
    private String name;

    private Integer age;

    private String des;

    public Person toEntity() {
        return Person.builder()
                .name(name)
                .age(age)
                .des(des)
                .build();

    }
}

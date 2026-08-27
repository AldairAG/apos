package com.api.apos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AposApplication {

	public static void main(String[] args) {
		SpringApplication.run(AposApplication.class, args);
	}

}

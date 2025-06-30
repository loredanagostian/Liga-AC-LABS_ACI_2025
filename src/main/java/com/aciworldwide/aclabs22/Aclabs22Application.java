package com.aciworldwide.aclabs22;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@Log4j2
@EnableAsync
@EnableRetry
@SpringBootApplication
public class Aclabs22Application {

	public static void main(String[] args) {
		SpringApplication.run(Aclabs22Application.class, args);
	}
}

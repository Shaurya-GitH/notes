Spring Boot is an open source framework built on top of the spring framework. "Boot" refers to the concept of rapidly initiating a spring application by handling all essentials set ups and configurations.

## Core principles
1. Opinionated Defaults
2. Convention over configuration
3. Auto-configurations
4. Embedded-servers
## Use of spring boot
- Web application -> RESTful web services -> microservices
- Batch processing -> Integration with other technologies
- Testing -> Monitoring and management

## Spring Boot starters
- "Dependency Descriptors"
- Combines all the necessary libraries (JAR files) for a particular feature or technology into a single dependency
	1. Simplifies configuration
	2. Boosts productivity
	3. Ensures compatibility

Some important spring boot starters -
1. spring-boot-starter
2. spring-boot-starter-web
3. spring-boot-starter-data-jpa
4. spring-boot-starter-security
5. spring-boot-starter-thymeleaf
6. spring-boot-starter-test
7. spring-boot-starter-actuator
8. spring-boot-starter-aop

Automatically, 
- Folder structure will be created
- JAR files will be added
- configurations will be done

## Spring boot application

@SpringBootApplication annotation provides setup and configurations for our spring boot application

- Mix of 3 different annotations
	1. Configuration
	2. ComponentScan
	3. EnableAutoConfiguration
	
Serves as the entry point for spring boot application

SpringApplication.run() method tasks-
- Initialize spring app
- Configure ApplicationContext
- Load External configuration
- Load and register beans
- Apply auto-configuration
- Start server (if Web)
etc.

In spring-boot-starter-web,
the "static" folder is used to store static web resources such as HTML, CSS, javascript, images etc.
The "templates" folder is used to store dynamic web pages or templates. 

application.properties file acts as a config file for our spring boot application

`server.port=8080`

## CommandLineRunner

CommandLineRunner is an interface used to execute code after the spring application context is initialized. It allows us to run additional tasks or setup logic at startup.
It is used to Override the run() method (functional interfaces only have one method)
It is advised to make a separate @Configuration class with all the bean objects and a CommandLineRunner bean
## @SpringBootApplication

Mix of 3 different annotations 
1. **@Configuration** - Used for providing @Bean definitions
2. **@ComponentScan** - Scans all the @Component annotation beans 
3. **@EnableAutoConfiguration** - Configures the application context automatically according to the dependencies.
Serves as entry point for spring boot application

## @Configuration

Annotating a class with @Configuration indicates that it's primary purpose is as a source of bean definitions. the methods with @Bean annotation inside this class will be treated differently to the @Bean methods in @Component annotation. 

```java
@Configuration
public class TestConfig{
	@Bean
	public Student student(){
		return new Student(school());
	}
	@Bean
	public School school(){
		return new School();
	}
}
```

Configuration is used for managing inter bean method calls. Inside this class, the school() method inside student() will be intercepted and a singleton bean will be injected instead of calling the method multiple times. 

Even though calling a bean method inside another is not a common practice, spring provided this feature for historical uses. Instead of this, constructor DI should be used as a good practice.

## @Bean

@Bean annotation is used on a method to tell the IoC container that a bean has to be created for the object returned by the method. The IoC container calls the method and manages the lifecycle of this bean.

## @Component

@Component annotation is used on a class to allow the IoC container to detect our custom beans automatically similar to @Bean and manage it's lifecyle. Component is used for a class and all it's methods are defined by us. Whereas using @Bean, we usually return an object of a class already written by someone else.

## @Scope("prototype")
Used to change the scope of a bean from "singleton" (default) to prototype - new instance on every DI.

## @Lazy
Bean only initializes when called.

## @Primary
Used to mark the bean as primary when multiple beans of same type are available in the IoC container.

## @Qualifier("name")
Used at the injection point to choose the specific bean of the class. The name of the bean is can be set explicitly in @Component("customName") and in @Bean(name="customName"), by default, the name of the @Component bean is the name of the class in camel case and the name of the @Bean is the name of the method.

> [!note]
> @Scope, @Lazy and @Primary can be used with both @Component and @Bean

## @PostConstruct
Used within a @Component to run a method after the bean is fully initialized. It is used to run business logic which is required to run once at the time of bean creation. The business logic should not be put inside the constructor since spring does a lot of extra setup after the constructor is called.

## @PreDestroy
Used within a @Component to run a method just before the bean is removed from the spring container.

## @Service
This annotation is used for components within the service layer (Components containing the business logic). It provides no functionality difference compared to @Component.
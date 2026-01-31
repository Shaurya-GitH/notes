> [!info] The **SOLID principles** are five essential guidelines that enhance software design, making code more maintainable and scalable.

Main aim of SOLID principles -
> To make software easy to change without breaking existing behavior

## When to use?
SOLID principles should be kept in mind everywhere while designing software. They are meant to be be applied to modules, aiming to keep software soft, not rigid. They should be treated as lighthouses guiding the developer in the right direction even if we cannot see the future.

Similar to how Math helps us think in higher dimensions, SOLID principles help us think ahead of the code being written. It is very easy to write code that works. But, writing maintainable and resilient code is what most developers miss out on.

SOLID principles should inform our decisions, they are not meant to be followed blindly. It is very easy to over engineer and over complicate your code. The main aim should be always kept in mind and questioned at every decision.

## The 5 principles
### 1. Single Responsibility Principle

> [!info] **Single Responsibility Principle (SRP)** states that a module should have one reason to change, meaning it should be responsible to one actor, or to multiple actors whose requirements always change together.

It is essential for identifying where module boundaries should exist so that changes driven by one actor do not impact unrelated parts of the system.

SRP decides where change belongs.

For example, the system is broken down into different layers -
1. **Controller layer** - responsible to the API contracts
2. **Service layer** - responsible to the business logic
3. **Repository layer** - responsible to the persistence logic

Another way SRP can be applied -
1. **User service** - responsible to product/personalization teams
2. **Playback service** - responsible to streaming/media teams
3. **Billing service** - responsible to financial/legal decisions

### 2. Open Closed Principle

>[!info] **Open Closed Principle (OCP)** states that a module should be Open for extension but Closed for modification, meaning, new behavior should be introduced by adding new code instead of modifying existing stable code.

OCP decides how change is added by enabling safe growth. Modification of stable code increases the risk of regressions and unintended side effects. OCP is commonly implemented through the help of interfaces and inheritance.

For example, implementing separate connector services to connect with different CBS is exercising OCP, since the existing implementations are not affected to add new functionality.

> [!note] In case of bugs, modification has to be done to achieve the original intended purpose
### 3. Liskov Substitution Principle

> [!info] **Liskov Substitution Principle (LSP)** states that objects of a superclass must be replaceable by objects of it's subclasses without breaking the application

LSP decides whether change is safe. It constrains and validates **Open Closed Principle (OCP)** by ensuring that new implementations introduced through extension are behaviorally substitutable. In other words, OCP enables adding new code, while LSP ensures that this extension does not break existing behavior. 

LSP also validates the inheritance structure by ensuring that child implementations truly belong to the hierarchy in a behavioral sense. Violations are commonly resolved by applying **ISP**, which prevents forcing implementations to support incompatible behavior.

In practice, LSP becomes especially important when using **dependency injection**, where implementations are substituted at runtime. For example, substituting different CBS connector implementations via dependency injection should not break the application or violate expected contracts.

Changes to avoid while implementing/inheriting an interface/class -
1. Introducing stricter preconditions or weaker postconditions
2. Changing the return type in an incompatible way
3. Altering the semantic meaning of existing behavior
4. Throwing new or broader unchecked exceptions that callers are not prepared to handle

### 4. Interface Segregation Principle

> [!info] Interface Segregation Principle (ISP) states that implementors of an interface should not be forced to implement methods they do not use.

ISP encourages splitting large, bloated interfaces into smaller, more specific interfaces so that the implementing classes only concern themselves with relevant methods.

ISP can also be applied at a high level in system architecture, module design and API design. Clients should only be exposed to the needed functionality. Systems become easier to understand, test, and maintain when dependencies are specific and clear.

### 5. Dependency Inversion Principle

> [!info] Dependency Inversion Principle (DIP) states that high level modules should not depend on low level modules directly; both should depend on abstractions

DIP introduces an abstraction layer between the high and low level modules. The abstractions introduced should not depend on details. The abstraction handles the contract part and the high and low level modules have to follow the contracts.

 Without an explicit abstraction, the low-level module owns the contract, so it is free to evolve its API and semantics in ways that can silently break high-level modules.

**Dependency Inversion Principle (DIP)** is most commonly implemented using interfaces or abstract classes, where the high-level module depends on an abstraction rather than a concrete implementation.

This inversion enables implementations to be swapped without affecting high-level logic. Such extensibility is governed by the **Open Closed Principle (OCP)**, which allows new implementations to be added without modifying existing code, and validated by the **Liskov Substitution Principle (LSP)**, which ensures that substituted implementations remain behaviorally compatible.

> [!note] 
>**SRP and DIP** are primarily about **creating the structure** of a system by defining clear responsibilities and dependency boundaries, while **OCP and LSP** are about **evolving that structure safely over time**.
> SRP and DIP enable OCP and LSP by establishing stable boundaries and contracts. In non-trivial systems, safe and reliable extension is difficult without first putting the right structure in place.
**Object Oriented Programming System**

> [!info] Organizes code into objects and classes and makes it more structured and easy to manage

## Class
- A class is a user defined blueprint from which objects are created
- Represents the set of properties and methods common to all objects
## Object
- Basic unit of OOP that represents real-life entities.
- Instance of a class

## 4 Pillars of Java OOPS Concepts

1. Abstraction
2. Encapsulation
3. Inheritance
4. Polymorphism

### 1. Abstraction
- Only the essential details are displayed to the user
- Separates the ==What== from the ==How==
- Abstraction is achieved by Interfaces and Abstract classes

> [!example]
> Creating a service interface with it's implemented class.
> Here, we make use of the interface and it's method in the controller layer

This hides implementation details and allows us to change or swap out implementations.

### 2. Encapsulation
- Data hiding
- Binds together variables and methods in a single class
- The variables can only be manipulated by the class's methods

>[!Example]
>Getter and Setter methods

### 3. Inheritance
- Achieved by using `extends` keyword
- Supports ==reusability== of code (DRY)

> [!note]
>  The `super()` method is implicitly called at the initialization of a child class if the parent has a No Args constructor.
> If there is no No Args constructor, we need to explicitly call the `super()` method in the child class's constructor. Failing to do so will cause compilation error.

### 4. Polymorphism (many forms)
- Ability to differentiate between entities with the same name efficiently

2 Types of polymorphism in Java -

#### 1. Method overloading: Compile time polymorphism
- More than 1 method share the same name with different parameters (different signature) in a class.

#### 2. Method overriding: Runtime polymorphism/ Dynamic binding
- Child class has the same method as the parent class, the implementation of the child class is used.
- Any subclass can be used wherever a parent class is expected

> [!example]
> DI a concrete class to an interface argument

> [!success] Advantages
> - Reusability
> - Logical and layered structure
> - Modular components

> [!caution] Disadvatages
> - Can use more memory
> - Can feel too heavy


		
## Multithreading

A process is a collection of threads - multiple small tasks known as threads (sub-processes). Multithreading is the execution of multiple threads at the same time.  Multithreading combines both multitasking and multiprocessing depending on the CPU and number of threads.
- Multitasking - Performing multiple tasks at the same time through context switching. 
- Multiprocessing - When one system is connected to multiple processors in order to complete the task. 
Java provides predefined API for multithreading. Threads take very less time for context switching and inter-thread communication.

## Platform threads 

A thread is managed by the operating system. To create a kernel thread, a system call has to be made - which is a costly operation. To tackle this problem, thread pools are used in practical implementations. A finite number of threads are allowed to be created, and the same threads are reused for the processing. 

Context switching keeps happening between the threads created within the process. However, if a particular thread performs a blocking operation (e.g. Making an API call, Writing to a file), the thread is marked as blocked and the CPU does not switch to that thread. The blocked thread is left idle until it is marked as runnable again. When a thread is marked as runnable again, the OS has to reschedule the thread into the context switching. Due to this problem, only finite number of tasks (the same as the number of threads) can be performed at a given time. More incoming requests will have to wait in a queue or get dropped.

> [!warning] Problems with platform threads 
> Expensive to create + Creating too many threads will cause memory issues + sit idle in case of a blocking operation + rescheduling cost after it is marked as runnable again.

## Virtual threads

In Java 21, virtual threads were introduced as a feature of the JVM. Virtual threads are very lightweight (easy to create) since they are managed and scheduled by the JVM itself. A pool of threads is created at the start (carrier threads), the virtual threads are then scheduled on top of the carrier threads - the actual work is done by the OS thread itself. 

Problem solved -
Even though the work is done by the carrier threads, virtual threads solve the problem of idle threads in case of blocking operation. Whenever a blocking operation is performed, The virtual thread is yielded from the carrier thread, and space is made for a another(old or new) virtual thread to take it's place.
Since virtual threads are very lightweight, thousands of these threads can be created and scheduled by the JVM.
Now when a blocking operation is being performed, and a new request comes to the server, a new virtual thread can be spun up immediately and mounted on the carrier thread. (non-blocking)

> [!success] Problems solved with virtual threads
> Cheap to create + lightweight + yielded in case of blocking operation and makes space for other threads + rescheduling cost is low since scheduling is done by the JVM instead of the OS.

## Where to use virtual threads?

It is important to keep in mind that in case there is no blocking operation being performed, platform thread pools will perform the exact same as virtual threads. Virtual threads solve the problem of threads sitting idle and rescheduling after the blocking operation is done.

To make use of virtual threads for Springboot server, this property can be configured in the application.yaml

```yaml
spring.threads.virtual.enabled=true
```

## Resources

- https://www.youtube.com/watch?v=0NtIcbSsjBc
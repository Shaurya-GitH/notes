> [!info] Database locks are mechanisms in DBMS that prevent concurrent access to data to ensure data integrity and consistency.

## Problem statement
Database locks solve two key concurrency problems:
**Lost Update** — if two transactions read the same row and both update it, the second write overwrites the first, losing that change entirely.
**Phantom Read** — if a transaction reads a set of rows, another transaction inserts new rows matching the same query, and the first transaction re-reads, it sees a different result set. The new rows are "phantoms" — they affect the outcome without the first transaction expecting them.

## Multi Version Concurrency Control (MVCC)
Modern DBMS make use of MVCC to update existing data safely in a transaction and also simultaneously allowing reads. 
When a transaction begins, the database creates a new version of the row and performs it's operations on the new versioned row until the transaction is completed. While the transaction is ongoing, other queries read data from the old version of the row. Outdated versions are later removed via cleanup processes.

Problems solved by MVCC:
1. Reads do not block Writes and vice versa.
2. Eliminates Dirty reads by creation of snapshots.
3. Reduces need of locking for several operations.

- MVCC does not solve Lost update problem
## Optimistic locking

Optimistic locking is used when data conflicts are rare, using a version column to prevent concurrent updates unless the data is unchanged.

Read operations are non blocking. Write operations will check if the version column has updated since it was read. If another thread has updated the data, the save operation fails with an `ObjectOptimisticLockingFailureException`. (It creates a race where the first person to save their changes win - First committer wins)

Since we are expecting less data conflicts, we can afford giving an error in case it occurs. 

```java
@Lock(LockModeType.OPTIMISTIC)
Optional<User> findById(String id);
```

## Pessimistic Locking

Pessimistic locking assumes conflicts are likely, locking data for the duration of a transaction to prevent access by other transactions. (It is better to lock rather than to throw error and have multiple retries)
### 1. Pessimistic read
Pessimistic read lock allows reading but blocks any writes to the data while the transaction is open. It also prevents writing data in the transaction itself, i.e., it should be strictly used for reading.

```java
@Lock(LockModeType.PESSIMISTIC_READ)
Optional<User> findById(String id);
```

### 2. Pessimistic write
Pessimistic write lock prevents others from reading and writing until the transaction is completed. Although, some databases implement MVCC which allows readers to fetch data that has already been blocked. (Reads requiring locks are still blocked)

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<User> findById(String id);
```



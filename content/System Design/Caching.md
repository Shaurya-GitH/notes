> [!info] **Caching** is a concept that involves storing frequently accessed data in a more accessible and faster storage to improve the performance and efficiency of the system by increasing the speed of data retrieval and also reduce the amount of calls to the database.

Since database is one of the most common bottlenecks in software design, it is important we implement the right caching strategies to reduce database calls. A caching layer can be introduced to a read intensive call which stores the accessed data in a cache storage after accessing it from the database once. The subsequent calls make a cache hit instead of calling the database to do it's job.

It is important that we invalidate the cache in case of any write to the database to avoid sending stale data (inconsistency). This is called Cache Invalidation. The process of cache invalidation involves deleting or updating the data in the cache. Different cache invalidation strategies include time-based (TTL) or event-based invalidation.

> [!warning]
> Implementing a cache layer to a write heavy operation will lead to more cache invalidations than cache hits and might lead to a lot of cache misses or inconsistency depending on the strategy.

The most common cache storage is Redis. Redis is an in-memory key-value pair database which can handle millions of requests per second.

## Caching pitfalls

### 1. Cache stampede

Cache stampede happens when a cache key expires and multiple requests are simultaneously forced to query the database. This flood of requests can overwhelm the database and potentially lead to system failure.

![[Pasted image 20260215164846.png]]

Solution -
1. Pessimistic write locking = Only one transaction is allowed to read the data at the time. This one request then repopulates the cache and other requests can read from the cache. ([[Database locks]])
2. Proactively update the cache = The key value can be updated before it expires by monitoring the TTL either by a third party or on cache hits.

### 2. Cache penetration

Cache penetration happens when the application queries for data that doesn't exist in the database. The application is forced to hit the database in every single request since there is no data to be cached.

Solution -
1. Storing the value of the non existent data as NULL in the cache layer.
2. Using a bloom filter to store the keys that exist in the cache.

### 3. Cache avalanche

Cache avalanche happens when multiple or all keys in the cache are lost due to server crash, cache restart or when multiple keys expire simultaneously. In this case, all the requests are forced to query the database at the same time.

Solution -
1. Setting up a highly available cache cluster to prevent total server crash.
2. Prewarming the cache in case of a cache restart.
3. Adding jitters/salt to the TTLs to prevent multiple keys expiring simultaneously. 
4. Setting up circuit breakers that prevent database queries in case of overwhelming load. 

## What to do in case the cache storage fills up?

It is possible that the storage used for cache gets filled up. The key strategies used for handling full cache storage are -
### 1. Cache Eviction Policies
When the cache reaches it's capacity limit, these policies govern which data to remove to make room for new, relevant data -

- Least Recently Used (LRU)
- Most Recently Used (MRU)
- First in First out (FIFO)
- Least Frequently Used (LFU)
- Random Replacement
etc.

The goal is to maximize the cache hit rate.

### 2. Set Time-to-Live (TTL)
Set TTL for each entry in the cache database. This ensures that the cached data doesn't stay in the DB permanently, preventing the need to explicitly manage every eviction.

### 3. Use proper caching architectures
- **Distributed Caching (e.g. Redis Cluster):** If a local cache is full, distribute the data across multiple nodes using consistent hashing, rather than just filling up a single machine's memory.
- **Two-Tiered Caching:** Use a local, fast, small-capacity memory (e.g., in-memory HashMap) as the first layer, and a slower, larger-capacity distributed cache (e.g., Redis) as the second layer.
- **Cache-Aside Pattern:** When a cache miss occurs, the application fetches data from the database and updates the cache. If the cache is full, the eviction policy is triggered.
## Resources

- https://www.youtube.com/watch?v=wh98s0XhMmQ

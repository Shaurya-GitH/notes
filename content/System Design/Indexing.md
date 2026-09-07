> [!info] An index is a schema object that improves the speed of data retrieval.

It works by creating a separate data structure that provides pointers to the rows in a table. 

The primary data structure used is the `B-Tree`. B-Trees are self balancing N-ary tree that allows logarithmic insertion, deletion and searching of data.

Custom indexing should be done in read-intensive databases. Write-intensive data should not be indexed since the time and resources used for creating the index on each insertion will be far greater than the resources it will save for retrieval.

```java
@Table(indexes={
			@Index(name="emailIndex",columnList="email")
			})
```

Indexing is essential when all your queries are based on a column used in filters but not indexed (primary key, unique constraints and foreign keys(depending on the database) are automatically indexed). If indexing is not applied in this case, the database will have to iterate through all the rows to query the data instead of just following the index pointer in logarithmic time.

Time complexity for creating and reading indexes = O(logn)
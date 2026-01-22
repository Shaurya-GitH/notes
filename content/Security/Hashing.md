> [!info] Mathematical algorithms that transform input data into a fixed-length sequence of characters, referred to as a hash value.

- They are fast, deterministic and one way. The cipher text cannot be used to reconstruct the plain text.
- They provide data verification and authentication.

> [!example] 
> - MD5 (Message-Digest Algorithm 5) (deprecated)
> - SHA (Secure Hash Algorithm)

> Hashing can be used to store passwords in the database. Although, in case the database gets compromised, hackers can make use of rainbow tables to match commonly used passwords. We make use of salted password hashing to solve this problem
## Salt
> [!info] A **salt** is a random value that you can add to the data before hashing. This makes each hash unique and significantly enhances your security. The salt is then concatenated to the hashed value for verifying the password later.

> [!abstract] Password Storage Process
>1. **Input:** `password` + `salt`
>2. **Process:** Apply Hashing Function
>3. **Result:** `salted hashed password`
>4. **Storage:** `salted_hash` + `:` + `salt` (Stored in DB)
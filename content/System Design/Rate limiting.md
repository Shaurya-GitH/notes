> [!info] Rate limiting is the dropping of requests ==(429 Too Many Requests)== based on certain factors in order to protect system resources or enforce policies.

There are a lot of factors that come into play while implementing rate limiting -
1. What is our objective of rate limiting?
2. What algorithms to use to achieve our objective?
3. Where to implement rate limiting?
4. When to start dropping requests?
5. What's the identity of the rate limited state?
6. What software to use for rate limiting?
Let's try and answer all the above questions.

## What is the objective of rate limiting?

Rate limiting can be implemented to protect system resources (prevent the system from crashing) or to enforce policies. Algorithms differ depending on these objectives and specific requirements. The requirements can include only rate limiting successful responses, allowing paginated requests to go through etc. and depending on the number of allowed requests, we can optimize our algorithms. Recognizing the objective should be the first step in implementing rate limiting.

## What algorithms to use to achieve our objective?

Now that we have figured out our objective, we can choose to use many of the battle tested algorithms or derive/optimize one for our own purpose.

> [!note]
> The algorithms need to be implemented atomically in order to prevent leaking requests.

To protect system resources (protect infrastructure by shaping the traffic) -
1. Token bucket algorithm
2. Leaky bucket algorithm

To enforce policies (enforce fair usage per identity) -
1. Fixed window algorithm
2. Sliding window log algorithm
3. Sliding window counter algorithm

#### Token bucket algorithm

The token bucket algorithm contains of a fixed capacity bucket along with a re-filler. The re-filler adds tokens to the bucket with the specified rate (eg. 3 tokens/sec). A request can only go through if it is assigned a token at the rate limiting filter point. This algorithm ensures that only a certain amount of requests can hit the system at any given moment (equal to the capacity of the bucket) by controlling the burstiness of the requests.

The variables involved in this algorithm are -
- Refilling rate
- Capacity of the bucket
- Tokens in the bucket
- Last refilling time

Token bucket algorithm can easily be implemented by storing the tokens and last refilled time in a cache. The current tokens available can be calculated lazily when the key is fetched using the last refilling time, the refilling rate and capacity of the bucket.

#### Leaky bucket algorithm

This algorithm extends the token bucket algorithm and instead of processing all the requests with a token simultaneously (burst), it puts them in a queue. Our system can then pick up the requests from the queue at the rate it's comfortable at. Leaky bucket algorithm benefits us by smoothening the traffic flow and prevent burst requests. 

However, the extra queue adds latency to the requests. Instead of using leaky bucket, token bucket algorithm can be used with a smaller bucket size which our system can handle even in bursts. This will lead to more retries by the client.

The queue is especially good to prevent retries if the latency is acceptable.

#### Fixed window algorithm

Fixed window algorithm allows only a certain amount of requests within a fixed window (eg. 100 req/hour). This algorithm can be easily implemented by resetting the counter at every chosen window size.

Here we can see, that having 100 requests per hour doesn't prevent the client from sending 100 requests in a second (doesn't handle burst requests). Making it not very useful for traffic shaping. However, we can have a policy saying that only 5 login attempts are allowed in an hour. Fixed window algorithm will work perfectly for this situation.

The algorithm also makes it possible to send 100 requests at 59th minute of the first hour and the 1st minute of the next hour, which will cause high inconsistency in the requests in those 2 hours. This situation can be seen as a con depending on the objective.

#### Sliding window algorithm

To prevent the above situation, we can use a sliding window algorithm. It makes sure that only a certain amount of requests go through within the window from the current time to the decided window size in the past. Two common ways to implement this are as follows -

##### 1. Sliding window log

Implementation involves storing all the requests that passed through with it's timestamp and identity. This way, we can simply count the number of records between the current time and the decided window and decide to rate limit or not. Sliding window log provides accuracy and simplicity.

Being very easy to implement, the algorithm takes up a lot of space in the DB because of logging all the requests. For one million requests per identity, there will be one million entries in the DB for the identity.

In case the allowed requests per identity is very less (<10), we can use an array of timestamps instead of storing a new record for each request. 

##### 2. Sliding window counter

When allowed requests per identity is very large, and 100% accuracy is not a concern, sliding window counter is always the better option.

Instead of storing each timestamp, we create fixed buckets and maintain the count and identity in the bucket. When we want to calculate the count in the sliding window, we can then count the counts in the previous required buckets and we may also use interpolation. The count is approximation even though interpolation helps make it more accurate.

There are multiple scenarios while implementing the algorithm -

1. The bucket size is equal to the window size

In this case, we have two fields on top of the identity and timestamp - `count` and `prev`. The count field contains the number of requests in the current bucket, and the `prev` field has the value of the `count` of the previous bucket. This way, we can calculate the actual count based on the `prev` and `count` field through interpolation.

> [!note] 
> Interpolation is the estimation of an unknown point that falls between two known data points. Here, we assume that the count of the previous bucket is evenly distributed throughout the time window, and we calculate the estimate accordingly.

2. The bucket size is less than the window size

If the window size is too big, we cannot afford to have the same bucket size since we lose too much accuracy. Smaller buckets can be created in this case. We maintain the fields - `rollingCount` and `counts[]`. the `counts` array contains the individual counts of all the buckets in the window. `rollingCount` is calculated by subtracting the count of the oldest bucket from the `rollingCount` of the previous bucket. The `counts` array also helps us with interpolation. This increased complexity increases accuracy but requires us to handle a lot more edge cases (missing buckets). Too many buckets also pose a problem since we have to store counts of all the buckets in each record.
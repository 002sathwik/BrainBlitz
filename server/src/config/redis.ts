import Redis from 'ioredis';

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
})


redis.on('connect', () => {
    console.log('Redis connected successfully');
});


redis.on('error', (err) => {
    console.error('Redis connection error', err);
});

export default redis;
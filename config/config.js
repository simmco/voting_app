var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3030;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/vote'
} else if (env === 'test') {
  process.env.PORT = 3030;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/voteTest'
}

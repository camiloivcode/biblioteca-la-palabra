const levels = {
  error: '\x1b[31m[ERROR]\x1b[0m',
  warn:  '\x1b[33m[WARN]\x1b[0m',
  info:  '\x1b[36m[INFO]\x1b[0m',
  http:  '\x1b[35m[HTTP]\x1b[0m',
  debug: '\x1b[37m[DEBUG]\x1b[0m',
};

const logger = {
  error: (msg, ...args) => console.error(`${new Date().toISOString()} ${levels.error} ${msg}`, ...args),
  warn:  (msg, ...args) => console.warn(`${new Date().toISOString()} ${levels.warn} ${msg}`, ...args),
  info:  (msg, ...args) => console.log(`${new Date().toISOString()} ${levels.info} ${msg}`, ...args),
  http:  (msg, ...args) => console.log(`${new Date().toISOString()} ${levels.http} ${msg}`, ...args),
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${new Date().toISOString()} ${levels.debug} ${msg}`, ...args);
    }
  },
};

module.exports = logger;
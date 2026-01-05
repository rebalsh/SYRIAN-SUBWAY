// // config/redis.js - النسخة النهائية بدون ioredis
// console.log("🔧 Cache: Using optimized in-memory cache");

// class MemoryCache {
//   constructor() {
//     this.store = new Map();
//     this.timers = new Map();
//   }

//   async get(key) {
//     return this.store.get(key) || null;
//   }

//   async setex(key, seconds, value) {
//     this.store.set(key, value);
    
//     // إلغاء المؤقت القديم إذا موجود
//     if (this.timers.has(key)) {
//       clearTimeout(this.timers.get(key));
//     }
    
//     // ضبط مؤقت للحذف
//     if (seconds > 0) {
//       const timer = setTimeout(() => {
//         this.store.delete(key);
//         this.timers.delete(key);
//       }, seconds * 1000);
      
//       this.timers.set(key, timer);
//     }
    
//     return 'OK';
//   }

//   async del(...keys) {
//     let deleted = 0;
//     keys.forEach(key => {
//       if (this.store.delete(key)) {
//         if (this.timers.has(key)) {
//           clearTimeout(this.timers.get(key));
//           this.timers.delete(key);
//         }
//         deleted++;
//       }
//     });
//     return deleted;
//   }

//   async keys(pattern) {
//     const allKeys = Array.from(this.store.keys());
    
//     // تحويل النمط إلى تعبير منتظم بسيط
//     const regexPattern = pattern
//       .replace(/\*/g, '.*')
//       .replace(/\?/g, '.');
//     const regex = new RegExp(`^${regexPattern}$`);
    
//     return allKeys.filter(key => regex.test(key));
//   }

//   async flushall() {
//     // إلغاء جميع المؤقتات
//     this.timers.forEach(timer => clearTimeout(timer));
//     this.timers.clear();
//     this.store.clear();
//     return 'OK';
//   }

//   async ping() {
//     return 'PONG';
//   }

//   async ttl(key) {
//     return this.store.has(key) ? 3600 : -2;
//   }

//   async quit() {
//     this.flushall();
//     return 'OK';
//   }

//   on(event, callback) {
//     // دعم بسيط للأحداث
//     if (event === 'connect') {
//       setTimeout(() => callback(), 100);
//     }
//     return this;
//   }
// }

// // إنشاء نسخة واحدة من الكاش
// const memoryCache = new MemoryCache();

// // تصدير الـ client
// module.exports = memoryCache;

// في نهاية config/redis.js أضف:
// config/redis.js
console.log("🔧 Cache: Using optimized in-memory cache");

class MemoryCache {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async setex(key, seconds, value) {
    this.store.set(key, value);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    if (seconds > 0) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, seconds * 1000);
      
      this.timers.set(key, timer);
    }
    
    return 'OK';
  }

  async del(...keys) {
    let deleted = 0;
    keys.forEach(key => {
      if (this.store.delete(key)) {
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        deleted++;
      }
    });
    return deleted;
  }

  async keys(pattern) {
    const allKeys = Array.from(this.store.keys());
    
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    
    return allKeys.filter(key => regex.test(key));
  }

  async flushall() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.store.clear();
    console.log('🧹 Cache cleared');
    return 'OK';
  }

  async ping() {
    return 'PONG';
  }

  async ttl(key) {
    return this.store.has(key) ? 3600 : -2;
  }

  async quit() {
    return this.flushall();
  }

  on(event, callback) {
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
    return this;
  }
}

// 🔴 يجب يكون هنا - قبل module.exports
const memoryCache = new MemoryCache();

module.exports = memoryCache;
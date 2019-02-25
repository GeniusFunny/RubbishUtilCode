function Promise(executor) {
  const self = this
  self.status = 'pending'
  self.value = undefined
  self.reason = undefined
  self.onResolvedCallback = []
  self.onRejectedCallback = []
  function resolve(value) {
    setTimeout(() => {
      if (self.status === 'pending') {
        self.status = 'resolved'
        self.value = value
        self.onResolvedCallback.forEach(cb => {
          cb(value)
        })
      }
    })
  }
  function reject(reason) {
    setTimeout(() => {
      if (self.status === 'pending') {
        self.status = 'rejected'
        self.reason = reason
        self.onRejectedCallback.forEach(cb => {
          cb(reason)
        })
      }
    })
  }
  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

/*
Promise对象有一个then方法，用来注册在这个Promise状态确定后的回调，很明显，then方法需要写在原型链上。
then方法会返回一个Promise，关于这一点，Promise/A+标准并没有要求返回的这个Promise是一个新的对象.
但在Promise/A标准中，明确规定了then要返回一个新的对象，目前的Promise实现中then几乎都是返回一个新的Promise
([详情](https://promisesaplus.com/differences-from-promises-a#point-5))对象，
所以在我们的实现中，也让then返回一个新的Promise对象。
 */
Promise.prototype.then = function (onResolve, onRejected) {
  let self = this
  let promise2

  onResolve = typeof onResolve === 'function' ? onResolve : function(value) {return value}
  onRejected = typeof onRejected === 'function' ? onRejected : function(reason) {throw reason}

  // Promise总共有三种可能的状态，我们分三个if块来处理，在里面分别都返回一个new Promise。
  if (self.status === 'resolved') {
    console.log('resolved!!!')
    return promise2 = new Promise((resolve, reject) => {
      // 如果promise1(此处即为this/self)的状态已经确定并且是resolved，我们调用onResolved
      // 因为考虑到有可能throw，所以我们将其包在try/catch块里
      setTimeout(() => {
        try {
          let x = onResolve(self.value)
          if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
            x.then(resolve, reject)
          }
          resolve(x)  // 否则，以它的返回值做为promise2的结果
        } catch (e) {
          reject(e) //  如果出错，以捕获到的错误做为promise2的结果
        }
      })
    })
  }
  if (self.status === 'rejected') {
    return promise2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (self.status === 'pending') {
    // 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
    // 只能等到Promise的状态确定后，才能确实如何处理。
    // 所以我们需要把我们的**两种情况**的处理逻辑做为callback放入promise1(此处即this/self)的回调数组里
    // 逻辑本身跟第一个if块内的几乎一致，此处不做过多解释
    return promise2 = new Promise((resolve, reject) => {
      self.onResolvedCallback.push(value => {
        try {
          let x = onResolve(self.value)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          }
        } catch (e) {
          reject(e)
        }
      })
      self.onRejectedCallback.push(reason => {
        try {
          let x = onRejected(self.reason)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}
Promise.race = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      promise.then(resolve, reject)
    })
  })
}
Promise.all = function(promises) {
  return new Promise((resolve, reject) => {
    let done = gen(promises.length, resolve)
    promises.forEach((promise, index) => {
      promise.then((value) => {
        done(index, value)
      }, reject)
    })

  })
}
function gen(length, resolve) {
  let count = 0
  let values = []
  return function(i, value) {
    values[i] = value
    if (++count === length) {
      resolve(values)
    }
  }
}

/*
resolvePromise函数即为根据x的值来决定promise2的状态的函数
也即标准中的[Promise Resolution Procedure](https://promisesaplus.com/#point-47)
x为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
`resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
相信各位一定可以对照标准把标准转换成代码，这里就只标出代码在标准中对应的位置，只在必要的地方做一些解释
*/
function resolvePromise(promise2, x, resolve, reject) {
  let calledOrThrow
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }
  if (x instanceof Promise) {
    // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
    // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
    if (x.status === 'pending') {
      x.then(function(value) {
        resolvePromise(promise2, value, resolve, reject)
      }, reject)
    } else {
      //但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
      x.then(resolve, reject)
    }
    return
  }
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, function rs(y) {
          if (calledOrThrow) return
          calledOrThrow = true
          return resolvePromise(promise2, y, resolve, reject)
        }, function rj(r) {
          if (calledOrThrow) return
          calledOrThrow = true
          return reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (calledOrThrow) return
      calledOrThrow = true
      return reject(e)
    }
  } else {
    resolve(x)
  }
}
new Promise((resolve, reject) => {
  reject(8)
}).then().then().then(res => {
  console.log(res)
}).catch(err => {
  console.log('fuck')
  console.log(err)
})

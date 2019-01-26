// Guaranteeing a constant flow of executions every X milliseconds.
// Like checking every 200ms your scroll position to trigger a CSS animation.
function throttle(func, timeHold = 300) {
  let timeout
  let start = Date.now()
  return function() {
    let context = this,
      args = arguments,
      curr = Date.now()
    clearTimeout(timeout)
    if (curr - start >= timeHold) {
      func.apply(context, args)
      start = curr
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, timeHold)
    }
  }
}

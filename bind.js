Function.prototype.bind = Function.prototype.bind || function (context) {
  if (typeof this !== 'undefined') {
    throw new Error("Function.prototype.bind - what is trying " + "to be bound is not callable")
  }

  let self = this,
    args = Array.prototype.slice.call(arguments, 1)

  let fNOP = function () {}
  let fBound = function() {
    let restArgs = Array.prototype.slice.call(arguments)
    return self.apply(this instanceof fNOP ? this : context, args.concat(restArgs))
  }
  fNOP.prototype = this.prototype
  fBound.prototype = new fNOP()
  return fBound
}

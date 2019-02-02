class EventEmitter {
  constructor() {
    this._events = new Map()
    this._eventsOne = new Map()
    this._maxListeners = 10
  }
}
EventEmitter.prototype.on = function(type, fn) {
  let handler = this._events.get(type)
  if (handler === undefined) {
    this._events.set(type, fn)
  } else if (handler && typeof handler === 'function') {
    this._events.set(type, [handler, fn])
  } else {
    handler.push(fn)
  }
}
EventEmitter.prototype.one = function(type, fn) {
  let handler = this._eventsOne.get(type)
  if (handler === undefined) {
    this._eventsOne.set(type, fn)
  } else if (typeof handler === 'function') {
    this._eventsOne.set(type, [handler, fn])
  } else {
    handler.push(fn)
  }
}
EventEmitter.prototype.off = function(type) {
  if (this._eventsOne.has(type)) {
    this._eventsOne.delete(type)
  }
  if (this._events.has(type)) {
    this._events.delete(type)
  }
}
EventEmitter.prototype.emit = function (type, ...args) {
  let handler = this._events.get(type)
  if (handler && typeof handler === 'function') {
    handler.apply(this, args)
  }
  if (handler && Array.isArray(handler)) {
    handler.forEach(item => item.apply(this, args))
  }
  handler = this._eventsOne.get(type)
  if (handler && typeof handler === 'function') {
    handler.apply(this, args)
  }
  if (handler && Array.isArray(handler)) {
    handler.forEach(item => item.apply(this, args))
  }
  this._eventsOne.delete(type)
}

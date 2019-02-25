class HashRouter {
  constructor() {
    this.routes = new Map()
    this.currenturl = ''
    this.history = []
    this.currentIndex = this.history.length - 1
    this.backIndex = this.history.length - 1
    this.isBack = false
    window.addEventListener('load', this.refresh, false)
    window.addEventListener('hashchange', this.refresh, false)
  }
  route = (path, callback = function() {}) => {
    this.routes.set(path, callback)
  }
  refresh = () => {
    this.currenturl = location.hash.slice(1) || '/'
    this.history.push(this.currenturl)
    this.currentIndex++
    if (!this.isBack) {
      this.backIndex = this.currentIndex
    }
    let cb = this.routes.get(this.currenturl)
    if (typeof cb === 'function') {
      cb()
    }
    this.isBack = false
  }
  backOff = () => {
    this.isBack = true
    this.backIndex <= 0 ? (this.backIndex = 0) : (this.backIndex -= 1)
    location.hash = `#${this.history[this.backIndex]}`
  }
}

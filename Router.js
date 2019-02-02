class Router {
  constructor() {
    this.routes = {}
    this.currentUrl = ''
    this.history = []
    this.isBack = false
    this.currentIndex = -1
    window.addEventListener('load', this.refresh, false)
    window.addEventListener('hashchange', this.refresh, false)
  }
  route = (path, cb) => {
    this.routes[path] = cb || function () {}
  }
  refresh = () => {
    this.currentUrl = location.hash.slice(1) || '/'
    this.history.push(this.currentUrl)
    this.currentIndex++
    this.routes[this.currentUrl]()
  }
  backOff = () => {
    this.isBack = true
    this.currentIndex <= 0 ? (this.currentIndex = 0) : (this.currentIndex -= 1)
    location.hash = `#{this.history[this.currentIndex}`
    this.routes[this.history[this.currentIndex]]()
  }
}

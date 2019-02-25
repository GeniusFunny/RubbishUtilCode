class BrowserRouter {
  constructor() {
    this.routes = new Map()
    this.bindPopState()
  }
  init(path) {
    history.replaceState({path: path}, '首页', path)
    let cb = this.routes.get(path)
    if (typeof cb === 'function') cb()
  }
  route(path, cb = function() {}) {
    this.routes.set(path, cb)
  }
  backOff() {
    history.back()
  }
  go(path) {
    history.pushState({path: path}, '', path)
    let cb = this.routes.get(path)
    if (typeof cb === 'function') cb()
  }
  bindPopState = () => {
    window.addEventListener('popstate', e => {
      let path = e.state && e.state.path
      let cb = this.routes.get(path)
      if (typeof cb === 'function') {
        cb()
      }
    })
  }
}

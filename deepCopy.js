function deepCopyUsingJSON(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function deepCopy(parent) {
  let parents = []
  let children = []
  function _deepCopy() {
    if (typeof parent !== 'object') return parent
    let child
    let type = Object.prototype.toString.call(parent)
    if (type === '[object Array]') {
      child = []
    } else if (type === '[object RegExp]') {
      let flags = ''
      if (parent.global) flags += 'g'
      if (parent.ignoreCase) flags += 'i'
      if (parent.multiline) flags += 'm'
      child = new RegExp(parent.source, flags)
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (type === '[object Date]') {
      child = new Date(parent.getTime())
    } else {
      let proto = Object.getPrototypeOf(parent)
      child = Object.create(proto)
    }
    let index = parents.indexOf(parent)
    if (index !== -1) return children[index]
    parents.push(parent)
    children.push(child)
    for (let p in parent) {
      if (parent.hasOwnProperty(p)) {
        child[p] = _deepCopy(parent[p])
      }
    }
    return child
  }
  return _deepCopy(parent)
}

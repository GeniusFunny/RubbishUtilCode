// Grouping a sudden burst of events (like keystrokes) into a single one.
// 假如设置wait为500ms，那么这500ms中最后一次trigger生效，其余的都会被清除，这相当于一系列的call合并为last call
function debounce(fn, wait) {
  let timeout = null
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments)
    }, wait)
  }
}

const http = require('http')
const queryString = require('querystring')
http.createServer(function (req, res) {
  const url = req.url
  console.log(url)
  switch (url) {
    case '/form':
      if (req.method === 'POST') {
        console.log("[200] " + req.method + " to " + url)
      }
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {
        console.log(queryString.parse(body))
        res.writeHead(200, 'OK', {'ContentType': 'text/html'})
        res.write(`<html><head><title>fuck</title></head><body><div>fuck</div></body></html>`)
        res.end()
      })
  }
}).listen(3000, () => {
  console.log('running at 3000')
})

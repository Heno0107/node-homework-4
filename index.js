const http = require('http')
const { readFile } = require('./helpers/readFile')
const { response } = require('./helpers/response')

http.createServer(async (req , res) => {
    if (req.url === '/' && req.method === 'GET') {
        const html = await readFile('pages' , 'index.html')
        response(res , 200 , 'text/html' , html)
    } else if (req.url === '/api/users' && req.method === 'GET') {
        const users = await readFile('db' , 'users.json')
        response(res , 200 , 'application/json' , users)
    } else if (req.url.match(/^\/api\/users\/[1-5]$/) && req.method === 'GET') {
        const id = req.url.split('/')[3]
        const data = await readFile('db' , 'users.json')
        const users = JSON.parse(data)
        const user = users.find(user => user.id === id)
        response(res , 200 , 'application/json' , JSON.stringify(user))
    } else {
        const html = await readFile('pages' , 'error.html')
        response(res , 404 , 'text/html' , html)
    }
})
.listen(3000 , (err) => {
    if(err){
        console.log(err)
    } else {
        console.log('Server Is Running')
    }
})
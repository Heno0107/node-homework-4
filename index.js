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
    } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === 'GET') {
        const id = req.url.split('/')[3]
        const data = await readFile('db' , 'users.json')
        const error = await readFile('pages' , 'error.html')
        const users = JSON.parse(data)
        const user = users.find(user => user.id === id)
        response(res , user ? 200 : 404 , user ? 'application/json' : 'text/html', user ? JSON.stringify(user) : error)
    } else if (req.url.includes('?') && req.method === 'GET') {
        const searchIndex = req.url.indexOf('?')
        const query = req.url.slice(searchIndex + 1)
        const value = query.split('=').at(-1).toLowerCase()
        const error = await readFile('pages' , 'error.html')
        const users = JSON.parse(await readFile('db' , 'users.json'))
        const result = users.filter((user) => user.name.toLowerCase().indexOf(value) !== -1)
        response(res , result.length ? 200 : 404 , result.length ? 'application/json' : 'text/html' , result.length ? JSON.stringify(result) : error)
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
const http = require('http')
const fs = require('fs').promises
const path = require('path')
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
    } else if (req.url === '/api/users' && req.method === 'POST') {
        req.on('data' , async (chunk) => {
            const body = JSON.parse(chunk.toString())
            body.id = Date.now().toString()
            const users = JSON.parse(await readFile('db' , 'users.json'))
            users.push(body)
            await fs.unlink(path.join(__dirname , 'db' , 'users.json'))
            await fs.appendFile(path.join(__dirname , 'db' , 'users.json') , JSON.stringify(users))
            res.end(JSON.stringify(users))
        })
    } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === 'PATCH') {
        req.on('data' , async (chunk) => {
            const body = JSON.parse(chunk.toString())
            const users = JSON.parse(await readFile('db' , 'users.json'))
            const id = req.url.split('/').at(-1)
            const user = users.find((user) => user.id === id)
            if (user) {
                const userIndex = users.indexOf(user)
                body.name && (users[userIndex].name = body.name)
                body.email && (users[userIndex].email = body.email)
                await fs.unlink(path.join(__dirname , 'db' , 'users.json'))
                await fs.appendFile(path.join(__dirname , 'db' , 'users.json') , JSON.stringify(users))
                res.end(JSON.stringify(users))
            } else {
                res.end('Something Went Wrong')
            }
        })
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

// fetch('http://localhost:3000/api/users' , {
//     method : 'POST' ,
//     headers : {
//         "content-type" : 'application/json'
//     } , 
//     body : JSON.stringify({
//         name : 'Miro'
//     })
// }).then((res) => res.json()).then((res) => console.log(res))

// fetch('http://localhost:3000/api/users/2' , {
//     method : 'PATCH' ,
//     headers : {
//         "content-type" : 'application/json'
//     } , 
//     body : JSON.stringify({
//         name : 'Miro'
//         email : 'miro@gmail.com'
//     })
// }).then((res) => res.json()).then((res) => console.log(res))
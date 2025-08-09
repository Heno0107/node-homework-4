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
        const key = query.split('=').at(-2).toLowerCase()
        const value = query.split('=').at(-1).toLowerCase()
        const error = await readFile('pages' , 'error.html')
        const users = JSON.parse(await readFile('db' , 'users.json'))
        if (key === 'name') {
            const result = users.filter((user) => user.name.toLowerCase().indexOf(value) !== -1)
            response(res , result.length ? 200 : 404 , result.length ? 'application/json' : 'text/html' , result.length ? JSON.stringify(result) : error)
        } else if (key === 'age' && value === 'min') {
            const result = users.toSorted((a , b) => a.age - b.age)
            response(res , result.length ? 200 : 404 , result.length ? 'application/json' : 'text/html' , result.length ? JSON.stringify(result) : error)
        } else if (key === 'age' && value === 'max') {
            const result = users.toSorted((a , b) => b.age - a.age)
            response(res , result.length ? 200 : 404 , result.length ? 'application/json' : 'text/html' , result.length ? JSON.stringify(result) : error)
        } else {
            response(res , 404 , 'text/html' , error)
        }
    } else if (req.url === '/api/users' && req.method === 'POST') {
        req.on('data' , async (chunk) => {
            const body = JSON.parse(chunk.toString())
            body.id = Date.now().toString()
            const users = JSON.parse(await readFile('db' , 'users.json'))
            if(body.name && body.age && body.email && body.password) {
                if(users.find((user) => user.email === body.email)) {
                    res.end('Email Is Already Used')
                } else {
                    users.push(body)
                    await fs.unlink(path.join(__dirname , 'db' , 'users.json'))
                    await fs.appendFile(path.join(__dirname , 'db' , 'users.json') , JSON.stringify(users))
                    res.end(JSON.stringify(users))
                }
            } else {
                res.end('Please Add All Required Fields')
            }
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
                body.age && (users[userIndex].age = body.age)
                body.password && (users[userIndex].password = body.password)
                await fs.unlink(path.join(__dirname , 'db' , 'users.json'))
                await fs.appendFile(path.join(__dirname , 'db' , 'users.json') , JSON.stringify(users))
                res.end(JSON.stringify(users))
            } else {
                res.end('Something Went Wrong')
            }
        })
    } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === 'DELETE') {
        const users = JSON.parse(await readFile('db' , 'users.json'))
        const id = req.url.split('/').at(-1)
        const user = users.find((user) => user.id === id)
        if (user) {
            const filteredUsers = users.filter((user) => user.id !== id)
            response(res , 200 , 'application/json' , JSON.stringify(filteredUsers))
            await fs.unlink(path.join(__dirname , 'db' , 'users.json'))
            await fs.appendFile(path.join(__dirname , 'db' , 'users.json') , JSON.stringify(filteredUsers))
        } else {
            res.end('Wrong User Id')
        }
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
//         name : 'Heno' ,
//         age : 17 ,
//         email : 'heno@gmail.com' ,
//         password : 'Heno1234'
//     })
// }).then((res) => res.json()).then((res) => console.log(res))

// fetch('http://localhost:3000/api/users/2' , {
//     method : 'PATCH' ,
//     headers : {
//         "content-type" : 'application/json'
//     } , 
//     body : JSON.stringify({
//         name : 'Miro' ,
//         age : 17 ,
//         email : 'miro@gmail.com' ,
//         password : 'miro1234'
//     })
// }).then((res) => res.json()).then((res) => console.log(res))

// fetch('http://localhost:3000/api/users/4' , {
//     method : 'DELETE'
// }).then((res) => res.json()).then((res) => console.log(res))
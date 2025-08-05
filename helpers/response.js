const response = (res , statusCode , contentType , html) => {
    res.writeHead(statusCode , {
        'content-type' : contentType
    })
    res.write(html)
    res.end()
}

module.exports = {
    response
}
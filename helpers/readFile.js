const fs = require('fs').promises
const path = require('path')

const readFile = async (folder , file) => {
    const data = await fs.readFile(path.join(__dirname , '..' , folder , file) , 'utf-8')

    return data
}

module.exports = {
    readFile
}
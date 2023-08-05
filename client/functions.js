import axios from 'axios'
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function getDataByIdFromURL(dataType) { // !!! TODO implement on direct link !!!
        const regex = new RegExp('^\/'+dataType+'\/id[A-Za-z0-9]+')
        const path = window.location.pathname
        const pathArray = path.split('/')
        const id = pathArray[pathArray.length-1]
        if (regex.test(path)) {
            console.log('regex.test passed ' )
            return new Promise((resolve, reject) => {
                console.log(`from Promise: ${SERVER_IP}:${SERVER_PORT}/api/${dataType}/${id}`)
                axios.get(`${SERVER_IP}:${SERVER_PORT}/api/${dataType}/${id}`).then(item => {
                console.log('data from getDataByIdFromURL: ', item.data)
                // return item.data
                resolve(item.data)
            })
        })
        }
}

export { getDataByIdFromURL }
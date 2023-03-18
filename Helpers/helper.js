const fs = require('fs')
const path = require('path')

module.exports = {
  WRITTER: async data => {
    const stream = fs.createWriteStream('output.txt', { flags: 'a' })
    // Check if data is null or undefined
    if (data === null || data === undefined) {
      data =
        "Ohh sorry, I'm a little sleepy at this time. Couldn't find what you were looking for. Try again later."
    }
    // Write the text to the stream
    stream.write(`${data}\n**********************************`)
    // Wait for the stream to finish writing
    stream.on('finish', () => {
      console.log('======== Done =======')
    })

    // Close the stream
    stream.end()
  }
}

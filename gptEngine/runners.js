const { Configuration, OpenAIApi } = require('openai')
const { WRITTER } = require('../Helpers/helper')

require('dotenv').config()
const { API_KEY } = process.env

module.exports = {
  GPT_5: async arg => {
    try {
      console.log('How can I help ?? ')
      if (!arg) return console.log('Iam ready. Ask away....')
      console.log('processing......')
      const configuration = new Configuration({
        apiKey: API_KEY
      })
      const openai = new OpenAIApi(configuration)

      let OPTIONS_1 = {
        model: 'text-davinci-003',
        prompt: arg,
        temperature: 0.9,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6
      }

      let OPTIONS_2 = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: arg }]
      }

      const response = await openai.createCompletion(OPTIONS_1 || OPTIONS_2)
      const text = response.data.choices[0].text
      console.log(text)
      return !text || text.includes('500 Internal Server Error')
        ? `Engine is down`
        : (WRITTER(text), text)
    } catch (e) {
      console.log(`Error: ${e.message}`)
      return `Engine is down`
    }
  }
}

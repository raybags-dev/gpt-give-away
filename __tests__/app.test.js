const app = require('../index')
const request = require('supertest')
const GPT_RESPONSE = require('../src/models/responseModel')
const { validateJWTToken, generateJWTToken } = require('../middleware/auth')

describe('Authenticate', () => {
  test('It should return a JWT', async () => {
    const response = await request(app)
      .post('/api/auth')
      .set('Authorization', 'abc123')
      .expect(200)
    expect(response.body).toHaveProperty('token')
  })
})

describe('AskGPT', () => {
  test('It should return a response from GPT-5', async () => {
    jest.setTimeout(100000)
    // Add a valid JWT to the request headers
    const token = await generateJWTToken('abc123')
    const response = await request(app)
      .post('/raybags/v1/wizard/ask-me')
      .set('Authorization', token)
      .send({ data: 'What is the meaning of life?' })
      .expect(200)
    expect(response.body).toHaveProperty('response')
  })

  test('It should return 403 if JWT is invalid', async () => {
    // Send an invalid JWT in the request headers
    const response = await request(app)
      .post('/raybags/v1/wizard/ask-me')
      .set('Authorization', 'invalid_token')
      .send({ data: 'What is the meaning of life?' })
      .expect(403)
    expect(response.body).toEqual({ error: 'Unauthorized!' })
  })
})

describe('GetPaginatedResults', () => {
  test('It should return paginated results', async () => {
    jest.setTimeout(100000)
    // Insert a few test items into the GPT_RESPONSE collection
    await GPT_RESPONSE.create({
      question: 'What is the meaning of life?',
      response: '42'
    })
    await GPT_RESPONSE.create({
      question: 'What is the meaning of the universe?',
      response: 'It is a mystery'
    })
    const response = await request(app)
      .get('/raybags/v1/wizard/data?page=1')
      .expect(200)
    expect(response.body).toHaveLength(2)
  })

  test('It should return 400 if page is 0', async () => {
    const response = await request(app)
      .get('/raybags/v1/wizard/data?page=0')
      .expect(400)
    expect(response.body).toEqual({ error: "Page can't be 0" })
  })
})

describe('GetAll', () => {
  test('It should return all items', async () => {
    jest.setTimeout(100000)
    // Insert a few test items into the GPT_RESPONSE collection
    await GPT_RESPONSE.create({
      question: 'What is the meaning of life?',
      response: '42'
    })
    await GPT_RESPONSE.create({
      question: 'What is the meaning of the universe?',
      response: 'It is a mystery'
    })
    const response = await request(app)
      .get('/raybags/v1/wizard/data-all')
      .expect(200)
    expect(response.body).toHaveLength(2)
  })

  test('It should return 404 if there are no items', async () => {
    // Clear the GPT_RESPONSE collection
    await GPT_RESPONSE.deleteMany({})
    const response = await request(app)
      .get('/raybags/v1/wizard/data-all')
      .expect(404)
    expect(response.body).toEqual({ error: 'Sorry I have nothing for you!' })
  })
})

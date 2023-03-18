module.exports = function asyncMiddleware (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (ex) {
      const statusCode = ex.statusCode || 500
      res.status(statusCode).json({ status: 'failed', message: ex.message })
      if (typeof next === 'function') {
        next({ error: 'something went wrong!\n', message: ex.message })
      }
    }
  }
}

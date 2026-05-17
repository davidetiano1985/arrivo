const { config } = require('dotenv')
const { join } = require('path')

config({ path: join(__dirname, '.env.local') })

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}

import core from 'express'
import process from 'process'

export function register(app: core.Application) {
	return app.get('/api/v1/info', info)
}

const startup = new Date()

function info(request: core.Request, response: core.Response) {
	response.send({
		startup,
		NODE_ENV: process.env.NODE_ENV || 'local',
		BUILD_NUMBER: process.env.BUILD_NUMBER || '<none>',
	})
}

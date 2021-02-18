import core from 'express'
import UserStorage from './util/userstorage'

export function register(app: core.Application, storage: UserStorage) {
	app.get('/api/v1/admin', index)
	app.post('/api/v1/admin/login', async(req, resp) => await login(req, resp, storage))
}

function index(request: core.Request, response: core.Response) {
	response.json({})
}

async function login(request: core.Request, response: core.Response, storage: UserStorage) {
}
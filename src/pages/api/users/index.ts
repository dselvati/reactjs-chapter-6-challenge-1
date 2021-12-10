/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next'

// Tipos de autenticação
// JWT (Storage)
// Next Auth (Social)
// Cognito, Auth0

export default (request: NextApiRequest, response: NextApiResponse) => {
    const users = [
        { id: 1, name: 'Douglas' },
        { id: 2, name: 'Douglas' },
        { id: 3, name: 'Douglas' },
    ]

    return response.json(users)
}


// Serverless
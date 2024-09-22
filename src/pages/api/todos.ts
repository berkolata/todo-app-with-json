import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const todosFilePath = path.join(process.cwd(), 'data', 'todos.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const fileContent = await fs.readFile(todosFilePath, 'utf8');
      const todos = JSON.parse(fileContent);
      res.status(200).json(todos);
    } else if (req.method === 'POST') {
      await fs.writeFile(todosFilePath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: 'Todos updated successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in todos API:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
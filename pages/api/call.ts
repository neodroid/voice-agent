import { NextApiRequest, NextApiResponse } from 'next';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const webCallResponse = await retellClient.call.createWebCall({ 
        agent_id: process.env.RETELL_AGENT_ID || ''
      });
      
      res.status(200).json({ accessToken: webCallResponse.access_token });
    } catch (error) {
      console.error('Error creating web call:', error);
      res.status(500).json({ error: 'Failed to create web call' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
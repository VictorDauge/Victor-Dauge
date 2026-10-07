import { getChatGPTUser } from '../../chatgpt-auth';
import { handleApplication } from '../../../lib/application';
export const dynamic = 'force-dynamic';
export async function GET(request: Request){ return handleApplication(request,await getChatGPTUser()); }
export async function POST(request: Request){ return handleApplication(request,await getChatGPTUser()); }

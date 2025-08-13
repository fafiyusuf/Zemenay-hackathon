import type { NextApiRequest, NextApiResponse } from 'next';
import type { ChatClientOptions } from './index';
export interface CreateServerHandlersOptions {
    /** Function that returns a DB client with from(table).insert/select chain (Supabase-like) */
    db: any;
    generateText(prompt: string, opts?: {
        systemInstruction?: string;
    }): Promise<string>;
    systemPrompt?: string;
}
export declare function createChatHandlers(opts: CreateServerHandlersOptions): {
    start: (req: NextApiRequest, res: NextApiResponse) => Promise<NextApiResponse<any>>;
    chat: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse<any>>;
    history: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse<any>>;
};
export type { ChatClientOptions };

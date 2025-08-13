import React from 'react';
import type { ChatClient } from './index';
export interface ChatWidgetProps {
    client: ChatClient;
    welcomeText?: string;
    placeholder?: string;
    title?: string;
    accentColor?: string;
    className?: string;
    startConversationLazy?: boolean;
    onError?(err: unknown): void;
}
export declare const ChatWidget: React.FC<ChatWidgetProps>;
export default ChatWidget;

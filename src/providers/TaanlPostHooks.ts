import Message from '@/types/Message';

export default abstract class TaanlPostHooks {
    abstract postNewMessage(message: Message): void;
    abstract postMessageDeleted(id: string): void;
}
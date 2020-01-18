import Message from '@/types/Message';

export default abstract class TaanlPostHooks {
    abstract postMessage(message: Message): void;
}
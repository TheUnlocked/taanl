import TaanlProviderWrapper from '@/providers/TaanlProviderWrapper';
import TaanlProvider from '@/providers/TaanlProvider';

export default abstract class Server {
    abstract id: string;
    abstract provider: TaanlProvider | TaanlProviderWrapper;
    abstract name: string;
    abstract logo?: string;
    
    get publicId() {
        return Server.getPublicId(this.provider, this.id);
    }
    async getChannelIds() {
        return this.provider.getChannelIds(this);
    }
    async getChannels() {
        return await Promise.all((await this.provider.getChannelIds(this)).map(x => this.provider.getChannel(this, x)));
    }
    async getChannel(id: string) {
        return await this.provider.getChannel(this, id);
    }

    static getPublicId(provider: TaanlProvider | TaanlProviderWrapper, id: string) {
        return `${provider.name}:${id}`;
    }
    static extractLocalId(publicId: string) {
        return publicId.split(':', 2)[1];
    }
}
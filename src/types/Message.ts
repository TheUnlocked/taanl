import User from './User';
import Media from './Media';
import RichText from './RichText';
import Channel from './Channel';

export default interface Message {
    id: string;
    sender: User;
    channel: Channel;
    contents: RichText,
    date?: Date;
    media: Media[];
}
import Media from './Media';
import { InherentRole, Role } from './Role';
import RichText from './RichText';

export default interface User {
    id: string;
    name: string;
    displayName: RichText;
    avatar?: string;
    tagline?: string;
    status?: 'online' | 'idle' | 'busy' | 'offline' | { name: string; icon: string };
    bot: boolean;
    inherentRoles: InherentRole[];
    roles: Role[];
    media?: Media[];
}
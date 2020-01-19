import { Client, Message } from 'discord.js';
import { ChatParseStrategy } from '@/lib/ChatParser';
import hljs from 'highlight.js';

const codeBlockRegex = /(?<!\\)(?:\\{2})*```(?:\s*((?:\w|\d|\.)+)\s*?\n)?(?:.|[\n\r\u2028\u2029])*?```/gu;
const inlineCodeRegex = /(?<!\\)(?:\\{2})*`.*?`/gu;
const emoteRegex = /(?<!\\)(?:\\{2})*&lt;a?:(?:\w|\d)+:\d+&gt;/gu;
const mentionRegex = /(?<!\\)(?:\\{2})*&lt;@!?\d+&gt;/g;
const channelRegex = /(?<!\\)(?:\\{2})*&lt;#\d+&gt;/g;
const spoilerRegex = /(?<!\\)(?:\\{2})*\|{2}(?!\*)(?:.|[\n\r\u2028\u2029])*?(?<!\\)(?:\\{2})*\|{2}/gu;
const strikethroughRegex = /(?<!\\)(?:\\{2})*~{2}(?!_).*?(?<!\\)(?:\\{2})*~{2}/gu;
const underlineRegex = /(?<!\\)(?:\\{2})*_{2}(?!_).*?(?<!\\)(?:\\{2})*_{2}/gu;
const boldRegex = /(?<!\\)(?:\\{2})*\*{2}(?!\*).*?(?<!\\)(?:\\{2})*\*{2}/gu;
const italicsRegex = /(?<!\\)(?:\\{2})*(?:_.*?(?<!\\)(?:\\{2})*_|\*.*?(?<!\\)(?:\\{2})*\*)/gu;

export function discordParseStrategy(client: Client, message: Message): ChatParseStrategy {
    return [
        {
            regex: codeBlockRegex,
            conversion: (x, lang) => {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                pre.appendChild(code);
                if (lang) {
                    code.innerHTML = x.replace(/^[\\`]+.*?\n|`+$/g, '');
                    code.classList.add(`language-${lang}`);
                    hljs.highlightBlock(code);
                }
                else {
                    code.innerHTML = x.replace(/^[\\`]+|`+$/g, '');
                }
                return {
                    component: pre,
                }
            }
        },
        {
            regex: inlineCodeRegex,
            conversion: x => {
                const code = document.createElement('code');
                code.innerHTML = x.replace(/^[\\`]+|`+$/g, '');
                return {
                    component: code
                }
            }
        },
        {
            regex: emoteRegex,
            conversion: x => {
                const emoji = client.emojis.get(x.split(':')[2].replace(/&gt;$/, ''));
                if (!emoji) {
                    return x;
                }
                return {
                    component: {
                        type: 'EmoteRender',
                        attributes: { src: emoji.url, name: emoji.name }
                    }
                }
            }
        },
        {
            regex: mentionRegex,
            conversion: x => {
                const cleaned = x.replace(/^&lt;@!?|&gt;$/g, '');
                const userMention = message.mentions.users.get(cleaned);
                const memberMention = message.mentions.members.get(cleaned);
                return {
                    style: "background-color: #0062d1; color: #ffffff;",
                    text: memberMention ? `@${memberMention.nickname}` : userMention ? `@${userMention.username}` : '@Unknown'
                }
            }
        },
        {
            regex: channelRegex,
            conversion: x => {
                const cleaned = x.replace(/^&lt;#|&gt;$/g, '');
                const channelMention = message.mentions.channels.get(cleaned);
                return {
                    style: "background-color: #0062d1; color: #ffffff;",
                    text: channelMention ? `#${channelMention.name}` : '#Unknown'
                }
            }
        },
        {
            regex: spoilerRegex,
            conversion: x => {
                const cleaned = x.replace(/^\|{2}|\|{2}$/g, '');
                return `<span class="spoiler">${cleaned}</span>`;
            }
        },
        {
            regex: strikethroughRegex,
            conversion: x => {
                const cleaned = x.replace(/^~{2}|~{2}$/g, '');
                return `<span class="strikethrough">${cleaned}</span>`;
            }
        },
        {
            regex: underlineRegex,
            conversion: x => {
                const cleaned = x.replace(/^_{2}|_{2}$/g, '');
                return `<span class="underline">${cleaned}</span>`;
            }
        },
        {
            regex: boldRegex,
            conversion: x => {
                const cleaned = x.replace(/^\*{2}|\*{2}$/g, '');
                return `<span class="bold">${cleaned}</span>`;
            }
        },
        {
            regex: italicsRegex,
            conversion: x => {
                const cleaned = x.replace(/^(\*|_)|(\*|_)$/g, '');
                return `<span class="italic">${cleaned}</span>`;
            }
        }
    ];
}
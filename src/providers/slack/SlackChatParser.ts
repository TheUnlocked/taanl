import { ChatParseStrategy } from '@/lib/ChatParser';
import hljs from 'highlight.js';
import { WebClient } from '@slack/web-api';

const codeBlockRegex = /(?<!\\)(?:\\{2})*```(?:\s*((?:\w|\d|\.)+)\s*?\n)?(?:.|[\n\r\u2028\u2029])*?```/gu;
const inlineCodeRegex = /(?<!\\)(?:\\{2})*`.*?`/gu;
const emoteRegex = /(?<!\\)(?:\\{2})*:(?:\w|\d)+:/gu;
const mentionRegex = /(?<!\\)(?:\\{2})*&lt;@(?:\d|\w)+&gt;/g;
const locationRegex = /(?<!\\)(?:\\{2})*&lt;!(?:\d|\w)+&gt;/g;
const linkRegex = /(?<!\\)(?:\\{2})*&lt;.+?(?:\|.+?)?&gt;/gu;
const underlineRegex = /(?<!\\)(?:\\{2})*_{2}(?!_).*?(?<!\\)(?:\\{2})*_{2}/gu;
const boldRegex = /(?<!\\)(?:\\{2})*\*{2}(?!\*).*?(?<!\\)(?:\\{2})*\*{2}/gu;
const italicsRegex = /(?<!\\)(?:\\{2})*(?:_.*?(?<!\\)(?:\\{2})*_|\*.*?(?<!\\)(?:\\{2})*\*)/gu;

export function slackParseStrategy(web: WebClient): ChatParseStrategy {
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
            conversion: async x => {
                const emojiList = (await web.emoji.list() as any).emoji;
                const emoji = emojiList[x.split(':')[1]];
                if (!emoji) {
                    return x;
                }
                return {
                    component: {
                        type: 'EmoteRender',
                        attributes: { src: emoji }
                    }
                }
            }
        },
        {
            regex: mentionRegex,
            conversion: async x => {
                const cleaned = x.replace(/^&lt;@|&gt;$/g, '');
                const userMention = await web.users.info({user: cleaned}) as any;
                return {
                    style: "background-color: #0062d1; color: #ffffff;",
                    text: `@${userMention.user.profile.display_name}`
                }
            }
        },
        {
            regex: locationRegex,
            conversion: x => {
                const cleaned = x.replace(/^&lt;!|&gt;$/g, '');
                return {
                    style: "background-color: #0062d1; color: #ffffff;",
                    text: `@${cleaned}`
                }
            }
        },
        {
            regex: linkRegex,
            conversion: x => {
                const cleaned = x.replace(/^&lt;|&gt;$/g, '');
                const split = cleaned.split('|');
                const link = document.createElement('a');
                link.target="_blank";
                link.innerText = split[0];
                if (split.length === 2) {
                    link.href = split[1];
                }
                else {
                    link.href = split[0];
                }
                return {
                    component: link
                }
            }
        },
        {
            regex: underlineRegex,
            conversion: x => {
                const cleaned = x.replace(/^_{2}|_{2}$/g, '');
                return {
                    style: "text-decoration: underline;",
                    text: cleaned
                }
            }
        },
        {
            regex: boldRegex,
            conversion: x => {
                const cleaned = x.replace(/^\*{2}|\*{2}$/g, '');
                return {
                    style: "font-weight: bold;",
                    text: cleaned
                }
            }
        },
        {
            regex: italicsRegex,
            conversion: x => {
                const cleaned = x.replace(/^(\*|_)|(\*|_)$/g, '');
                return {
                    style: "font-style: italic;",
                    text: cleaned
                }
            }
        }
    ];
}
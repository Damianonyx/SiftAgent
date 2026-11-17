/* Local design harness: runs the real bot web server against an isolated,
 * in-memory fixture seeded with synthetic data. No Telegram, providers or keys.
 *   SIFT_BOT_ROOT=../Sift-bot node scripts/dev-workspace.mjs [port]
 * Prints one-use sign-in links for a populated account (42) and an empty one (57). */
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const bot = path.resolve(process.env.SIFT_BOT_ROOT || '../Sift-bot');
const load = file => import(pathToFileURL(path.join(bot, file)));
const { fixture, input, CA } = await load('test/web-fixture.js');
const { criteriaKey } = await load('src/discovery-store.js');
const { evaluateAgent } = await load('src/rules.js');

const port = Number(process.argv[2] || 4300), origin = `http://127.0.0.1:${port}`;
const f = await fixture({ root: path.resolve(here, '../dist/app'), origin, port });
const { seedWorkspace } = await import(pathToFileURL(path.join(here, 'workspace-seed.mjs')));
seedWorkspace(f, { criteriaKey, evaluateAgent, CA });

const link = id => f.server.telegram(input('/web', id), f.allowedUserIds).reply_markup.inline_keyboard[0][0].url;
console.log(JSON.stringify({ origin, populated: link(42), empty: link(57) }));
process.on('SIGTERM', async () => { await f.close(); process.exit(0); });

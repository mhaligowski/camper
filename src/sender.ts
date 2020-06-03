import { MailService, MailDataRequired } from '@sendgrid/mail';

import { getLogger } from './log';
import { buildEmail } from './email';
import { PageCrawlResult } from './crawler';

const logger = getLogger();

export async function send(apiKey: string, results: PageCrawlResult[]): Promise<void> {
    logger.info("Sending email.");
    const mail = new MailService();
    mail.setApiKey(apiKey);

    const msg: MailDataRequired = {
        to: 'mhaligowski@gmail.com',
        from: 'Camper <mhaligowski+camper@gmail.com>',
        subject: 'Found something!',
        content: [
            {
                type: "text/html",
                value: buildEmail(results)
            }
        ]        
    };

    await mail.send(msg);
};
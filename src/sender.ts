import { MailService } from '@sendgrid/mail';

import { getLogger } from './log';

const logger = getLogger();

export async function send(apiKey: string): Promise<void> {
    logger.info("Sending email.");
    const mail = new MailService();
    mail.setApiKey(apiKey);

    const msg = {
        to: 'mhaligowski@gmail.com',
        from: 'test@example.com',
        subject: 'Sending with Twilio SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    
    await mail.send(msg);
};
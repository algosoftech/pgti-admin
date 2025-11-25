const nodemailer = require('nodemailer');

exports.sentContacts = async (options={}) => {
    try {
        const smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'afsarali509@gmail.com',
                pass: 'lwrkpfidmfnndmmv'
            }
        };
        

        const transporter = nodemailer.createTransport(smtpConfig);
        await transporter.verify();
        const info = await transporter.sendMail({
            from : '"Test Mail" <afsarali509@gmail.com>',
            to : options?.email,
            subject : 'Influencer Contacts Excel',
            text: 'Please find attached the Excel file containing contact data.',
            attachments: [
            {
                filename: 'contacts.xlsx',
                content: options?.attachmentBuffer,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
            ]
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.log('error : ',  error);
    }
}
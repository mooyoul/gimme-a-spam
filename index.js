'use strict';

/**
 * Module dependencies.
 */

const
  mandrill    = require('mandrill-api/mandrill'),
  request     = require('request'),
  _           = require('underscore');


/**
 * Bootstrap Application.
 */
const
  client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);


request({
  method: 'GET',
  url: 'https://docs.google.com/spreadsheets/d/116Ajw6c7JGGYY0pYBFAYh_tooM5SLC7yAtb4yUIp40Y/export?gid=0&format=csv'
}, (e, res, body) => {
  if (e) { throw e; }

  console.error('Got response from Google Spreadsheets (status: %d)', res.statusCode);

  const subject = _.chain(body.split('\r\n')) // get rows
    .map((row) => row.split(',')) // get columns
    .filter((row) => row.length && row[0]) // filter invalid rows
    .map((row) => row[0]) // extract keywords
    .sample(3) // samples 3 items
    .value() // exit underscore chain
    .join(' '); // generate subject

  console.error('Generated subject: %s', subject);


  request({
    method: 'GET',
    url: 'https://github.com/mooyoul/gimme-a-spam/archive/master.zip',
    encoding: null // get response body as Buffer
  }, (e, res, bufBody) => {
    if (e) { throw e; }
    if (res.statusCode !== 200) {
      throw new Error('Response status code from github is not 200');
    }

    console.error('Got response from Github (status: %d, size: %s KB)', res.statusCode, (bufBody.length / 1024).toFixed(2));

    client.messages.send({
      message: {
        text: [
          '마감은 지났지만 재미로 참가해봅니다 :)',
          '',
          '소스코드는 https://github.com/mooyoul/gimme-a-spam 에서도 확인하실 수 있습니다!'
        ].join('\n'),
        subject: subject,
        from_email: 'mooyoul@gmail.com',
        from_name: 'MooYeol Lee',
        to: [{
          email: 'spamworldcup@stibee.com',
          name: 'Stibee Spam Worldcup',
          type: 'to'
        }],
        attachments: [{
          type: res.headers['content-type'] || 'application/octet-stream',
          name: 'gimme-a-spam.zip',
          content: bufBody.toString('base64')
        }]
      }
    }, (result) => {
      console.error('Message was sent!', result);
    }, (e) => {
      console.error('Failed to send email');
      throw e;
    });
  });
});


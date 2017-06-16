declare function unescape(s: string): string;

import * as fs from 'fs'
import { join } from 'path';
import * as request from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

class Story {
  private urls = [];
  private count: number = 0;
  private $;
  private path: string = join(process.cwd(), './jiangye.txt');
  constructor(url: string) {
    this.urls.push(url);
  }
  start() {
    this.creatFile();
    this.getData();
  }

  creatFile() {
    const exists = fs.existsSync(this.path);
    if (exists) fs.unlinkSync(this.path);
  }

  getData() {
    let url;
    if (this.urls.length !== 0) {
      url = this.urls.shift();
    } else {
      console.log('done!');
      return;
    }

    const option = {
      method: 'GET',
      encoding: null,
      url: url
    };
    request(option, (err, response, data) => {
      if (!err && response.statusCode === 200) {
        data = iconv.decode(data, 'gb2312').toString();
        this.$ = cheerio.load(data, { decodeEntities: false });
        this.getNextUrl();
        this.saveText();
      }
    })
  }

  getNextUrl() {
    let nextUrl = this.$('#pb_next').attr('href');
    nextUrl = 'http://m.read8.net' + nextUrl;
    this.urls.push(nextUrl);
    this.getData();
  }

  saveText() {
    let title = this.$('#nr_title').text();
    console.log(title);
    let body: string = this.$('#txt.txt').text();
    body = body.replace(/\s{4}/g, '\n');
    body += '\n';
    fs.appendFileSync(this.path, title);
    fs.appendFileSync(this.path, body);
  }

}
const story = new Story('http://m.read8.net/dushu/0/46/30320.html');

story.start();
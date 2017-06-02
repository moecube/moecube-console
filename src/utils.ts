import { URL } from 'url';
import * as child_process from 'child_process';

export const dot = '__<DOT>__';

export const handleImg = (img) => {
  if (img) {
    let url: URL;
    if (img.substring(0, 16) == '/uploads/default') {
      url = new URL(img, 'https://ygobbs.com');
    } else {
      url = new URL(img, 'https://cdn01.moecube.com');
    }
    return url.toString();
  } else {
    return 'https://cdn01.moecube.com/accounts/default_avatar.jpg';
  }
};

export function renderChecksum(files: { path: string, hash?: string }[]) {
  return files.map(({ path, hash }) => `${hash || ''}  ${path}`).join('\n');
}

export function UploadOSS(dist: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let child = child_process.spawn('ossutil', ['cp', '--recursive', dist, 'oss://mycard/test-release'], { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    child.on('error', (error) => {
      reject(error);
    });
  });
}

type QueueParams = {
  concurrency: number;
};

export class Queue {
  concurrency: number;
  running: number;
  queue: Array<Function>;

  constructor(params: QueueParams) {
    Object.assign(this, params);
    this.running = 0;
    this.queue = [];
  }

  set(args: QueueParams): Queue {
    Object.assign(this, args);
    return this;
  }

  push(task: Function): Queue {
    this.queue.push(task);
    return this;
  }

  async run(task: Function) {
    this.queue.push(task);
    await this.next();
  }

  async next() {
    while (this.running < this.concurrency && this.queue.length) {
      let task: Function | undefined = this.queue.shift();
      if (!task) {
        return;
      }
      await task(this, () => {
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
}

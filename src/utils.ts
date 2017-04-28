import {URL} from 'url';
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
  return files.map(({path, hash}) => `${hash || ''}  ${path}`).join('\n');
}

export function UploadOSS(dist: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let child = child_process.spawn('ossutil', ['cp', '--recursive', dist, 'oss://mycard/test-release'], {stdio: 'inherit'});
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

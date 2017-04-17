import { URL } from 'url';

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
}
import * as path from 'path';

let baseUrl = 'http://127.0.01:8001'
let testUrl = 'http://114.215.243.95:8001'

export default {
  upload_path: path.join(__dirname, './test/upload'),
  download_path: path.join(__dirname, './test/release/downloads'),
  new_apps_json: `${baseUrl}/v2/apps`,
  upload_url: `${testUrl}/v1/upload/packageUrl`,
  old_apps_json: 'https://api.moecube.com/apps.json',
  new_package: `${baseUrl}/v1/package/`,
  new_app: (appId) => `${baseUrl}/v1/app/${appId}`,
  old_metalinks: (package_id) => `https://cdn01.moecube.com/release/metalinks/${package_id}.meta4`,
  new_metalinks: (package_id) => `${baseUrl}/${package_id}/meta`,
  old_checksums: (package_id) => `https://cdn01.moecube.com/release/checksums/${package_id}`,
  new_checksums: (package_id) => `${baseUrl}/${package_id}/checksum`,
};

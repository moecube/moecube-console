
aria2c --conf-path=/usr/src/app/aria2.conf -D;

./ossutil config --endpoint oss-cn-hangzhou.aliyuncs.com --access-key-id $OSS_ACCESS_ID
  --access-key-secret $OSS_ACCESS_KEY;

npm start

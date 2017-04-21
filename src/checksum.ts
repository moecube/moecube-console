/**
 * Created by zh99998 on 2017/4/21.
 */
 
export function renderChecksum(files: { path: string, hash?: string }[]) {
  return files.map(({ path, hash }) => `${hash || ''}  ${path}`).join('\n');
}

// 用法示例
// const example = [
//   { path: 'README', hash: '11111111111111111111111111111111', size: 1 },
//   { path: 'main.exe', hash: '22222222222222222222222222222222', size: 2 },
//   { path: 'assets' }, // 对于目录，置 hash 为空 (undefiend 或 不存在)
//   { path: 'assets/1.png', hash: '33333333333333333333333333333333', size: 3 }
// ];
//
// console.log(renderChecksum(example));

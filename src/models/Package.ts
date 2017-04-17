import {Core, Model, Instance, Collection, Index, Property, ObjectID} from 'iridium'

type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
type Platform = 'win32' | 'linux' | 'darwin'

export interface Action {
  execute: string;
  args: string[];
  env: {};
  open?: string;
}

export interface File {
  path: string;
  size: number;
  hash: string;
}

export interface Package {
  id: string;
  name: string;
  appId: string;
  version: string;
  locales: Locale[];
  platforms: Platform[];
  files: File[];
}


@Collection("packages")
@Index({id: 1}, { unique: true })
export class PackageSchema extends Instance<Package, PackageSchema> implements Package {
  @Property(String, true)
  id: string;
  @Property(String, false)
  name: string;
  @Property(String, false)
  appId: string;
  @Property(String, false)
  version: string;
  @Property(Array, false)
  locales: Locale[];
  @Property(Array, false)
  platforms: Platform[];
  @Property(Array, false)
  files: File[];

  handleUpdate(data: Package) {
    Object.assign(this, data)
  }
}
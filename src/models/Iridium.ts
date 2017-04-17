import {Core, Model}  from "iridium";
import {App, AppSchema} from "./App";
import {Package, PackageSchema} from "./Package";


export class MongoDB extends Core {
  Apps = new Model<App, AppSchema>(this, AppSchema)
  Packages = new Model<Package, PackageSchema>(this,PackageSchema)
}

export const mongodb = new MongoDB(process.env["MONGODB"])

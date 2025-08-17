/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activity from "../activity.js";
import type * as brands from "../brands.js";
import type * as customers from "../customers.js";
import type * as dashboards from "../dashboards.js";
import type * as factories from "../factories.js";
import type * as factoryProfiles from "../factoryProfiles.js";
import type * as item_attributes from "../item-attributes.js";
import type * as items from "../items.js";
import type * as location_history from "../location_history.js";
import type * as locations from "../locations.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as scans from "../scans.js";
import type * as seed from "../seed.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";
import type * as tenancy from "../tenancy.js";
import type * as users from "../users.js";
import type * as util from "../util.js";
import type * as workflows from "../workflows.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  brands: typeof brands;
  customers: typeof customers;
  dashboards: typeof dashboards;
  factories: typeof factories;
  factoryProfiles: typeof factoryProfiles;
  "item-attributes": typeof item_attributes;
  items: typeof items;
  location_history: typeof location_history;
  locations: typeof locations;
  messages: typeof messages;
  migrations: typeof migrations;
  notifications: typeof notifications;
  purchaseOrders: typeof purchaseOrders;
  scans: typeof scans;
  seed: typeof seed;
  tasks: typeof tasks;
  teams: typeof teams;
  tenancy: typeof tenancy;
  users: typeof users;
  util: typeof util;
  workflows: typeof workflows;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

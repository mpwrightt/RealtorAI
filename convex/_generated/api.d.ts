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
import type * as agentInteractions from "../agentInteractions.js";
import type * as agents from "../agents.js";
import type * as alerts from "../alerts.js";
import type * as buyerSessions from "../buyerSessions.js";
import type * as demoData from "../demoData.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as listings from "../listings.js";
import type * as marketing from "../marketing.js";
import type * as messages from "../messages.js";
import type * as offers from "../offers.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as savedSearches from "../savedSearches.js";
import type * as sellerSessions from "../sellerSessions.js";
import type * as setup from "../setup.js";
import type * as telemetry from "../telemetry.js";
import type * as tours from "../tours.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agentInteractions: typeof agentInteractions;
  agents: typeof agents;
  alerts: typeof alerts;
  buyerSessions: typeof buyerSessions;
  demoData: typeof demoData;
  favorites: typeof favorites;
  http: typeof http;
  leads: typeof leads;
  listings: typeof listings;
  marketing: typeof marketing;
  messages: typeof messages;
  offers: typeof offers;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  savedSearches: typeof savedSearches;
  sellerSessions: typeof sellerSessions;
  setup: typeof setup;
  telemetry: typeof telemetry;
  tours: typeof tours;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

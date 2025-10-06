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
import type * as admin_agents from "../admin/agents.js";
import type * as admin_analytics from "../admin/analytics.js";
import type * as admin_auth from "../admin/auth.js";
import type * as admin_dashboard from "../admin/dashboard.js";
import type * as admin_featureFlags from "../admin/featureFlags.js";
import type * as admin_healthCheck from "../admin/healthCheck.js";
import type * as admin_logs from "../admin/logs.js";
import type * as admin_monitoring from "../admin/monitoring.js";
import type * as admin_revenue from "../admin/revenue.js";
import type * as admin_setup from "../admin/setup.js";
import type * as agentInteractions from "../agentInteractions.js";
import type * as agents from "../agents.js";
import type * as alerts from "../alerts.js";
import type * as buyerSessions from "../buyerSessions.js";
import type * as demoData from "../demoData.js";
import type * as emailNotifications from "../emailNotifications.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as lib_activityLogger from "../lib/activityLogger.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
import type * as listings from "../listings.js";
import type * as marketing from "../marketing.js";
import type * as messages from "../messages.js";
import type * as offers from "../offers.js";
import type * as openHouses from "../openHouses.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as savedSearches from "../savedSearches.js";
import type * as sellerSessions from "../sellerSessions.js";
import type * as setup from "../setup.js";
import type * as smsCampaigns from "../smsCampaigns.js";
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
  "admin/agents": typeof admin_agents;
  "admin/analytics": typeof admin_analytics;
  "admin/auth": typeof admin_auth;
  "admin/dashboard": typeof admin_dashboard;
  "admin/featureFlags": typeof admin_featureFlags;
  "admin/healthCheck": typeof admin_healthCheck;
  "admin/logs": typeof admin_logs;
  "admin/monitoring": typeof admin_monitoring;
  "admin/revenue": typeof admin_revenue;
  "admin/setup": typeof admin_setup;
  agentInteractions: typeof agentInteractions;
  agents: typeof agents;
  alerts: typeof alerts;
  buyerSessions: typeof buyerSessions;
  demoData: typeof demoData;
  emailNotifications: typeof emailNotifications;
  favorites: typeof favorites;
  http: typeof http;
  leads: typeof leads;
  "lib/activityLogger": typeof lib_activityLogger;
  "lib/adminAuth": typeof lib_adminAuth;
  listings: typeof listings;
  marketing: typeof marketing;
  messages: typeof messages;
  offers: typeof offers;
  openHouses: typeof openHouses;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  savedSearches: typeof savedSearches;
  sellerSessions: typeof sellerSessions;
  setup: typeof setup;
  smsCampaigns: typeof smsCampaigns;
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

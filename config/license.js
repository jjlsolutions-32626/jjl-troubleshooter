"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLicense = readLicense;
exports.initLicenseCheck = initLicenseCheck;
const electron_1 = require("electron");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function licensePath() {
    // Stored in %APPDATA%/JJL Troubleshooter/license.json on Windows
    return node_path_1.default.join(electron_1.app.getPath("userData"), "license.json");
}
function readLicense() {
    try {
        const p = licensePath();
        if (!node_fs_1.default.existsSync(p)) {
            return { valid: false, customer: null, lastPhoneHome: null };
        }
        const data = JSON.parse(node_fs_1.default.readFileSync(p, "utf8"));
        return {
            valid: Boolean(data?.valid),
            customer: data?.customer ?? null,
            lastPhoneHome: data?.lastPhoneHome ?? null,
        };
    }
    catch (err) {
        console.log("[license] read failed:", err.message);
        return { valid: false, customer: null, lastPhoneHome: null };
    }
}
/**
 * Phase-1 stub. Real version will POST to the JJL license server every 7-14
 * days, sign the response with a JJL cert, and refuse to run if the response
 * is invalid or too old. For v0.1, just log the intent and proceed.
 */
function initLicenseCheck() {
    const status = readLicense();
    console.log("[license] startup check — file present:", status.valid, "customer:", status.customer);
    console.log("[license] phase-1 stub: skipping phone-home, proceeding regardless.");
}
//# sourceMappingURL=license.js.map
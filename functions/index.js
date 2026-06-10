// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
firebaseAdmin.initializeApp();

Object.defineProperty(Object.prototype, 'can', {
    enumerable: false,
    value: function (method) {
        return (typeof this[method] === 'function');
    }
})

// Export all functions from accommodations.js in the "accommodations" group:
exports.accommodations = require("./accommodations");

// Export all functions from bookings.js in the "bookings" group:
exports.bookings = require("./bookings");

// Export all functions from pricing.js in the "pricing" group:
exports.pricing = require("./pricing");

// Export all functions from journies.js in the "journies" group:
exports.journies = require("./journies");

// Export all functions from users.js in the "users" group:
exports.users = require("./users");

// Export all functions from events.js in the "events" group:
exports.events = require("./events");

// Export all functions from scheduler.js in the "scheduler" group:
exports.scheduler = require("./scheduler");

// Export all functions from dateUtils.js for shared use
exports.dateUtils = require("./dateUtils");

// Export all functions from invoicing.js for accounting use
exports.invoicing = require("./invoicingFacade");

// Export all functions from invoicing.js for accounting use
exports.invoicingXero = require("./invoicing/xeroProxy");

// Export all functions from embed.js for accounting use
exports.embed = require("./embed");

// Export all functions from paymewnt.js for Stripe use
exports.paymentsStripe = require("./payments/stripeProxy");

// Export all functions from settings.js for accounting use
exports.settings = require("./settings");

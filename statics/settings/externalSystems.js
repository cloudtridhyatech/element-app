import { getSettingsData } from "@/statics/settings/functions.js";

export const getInvoiceSystemAvailability = async (companyId) => {
    return await getSystemAvailability(companyId, 'accounting');
};

export const getPaymentSystemAvailability = async (companyId) => {
    return await getSystemAvailability(companyId, 'payment');
};


async function getSystemAvailability(companyId, type) {

    let settings = await getSettingsData(companyId);

    let systemAllowed = settings[type + 'SystemAllowed'];
    let systemName = settings[type + 'SystemName'];

    return systemName && systemAllowed === true && systemName && systemName !== null && systemName !== '';
}

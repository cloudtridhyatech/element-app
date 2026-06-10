import moment from "moment";
import { firebaseFunctions } from "@/plugins/firebase.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

const format = "ddd D MMM YYYY";

export const getFormattedDate = (transfer) => {

    if (transfer.flightArrivesDateTime && transfer.flightArrivesDateTime !== null) {
        return dateUtilsMixin.methods.mixinFormatDateTimeUTC(transfer.flightArrivesDateTime, format);
    }
    else if (transfer.flightDepartsDateTime && transfer.flightDepartsDateTime !== null) {
        return dateUtilsMixin.methods.mixinFormatDateTimeUTC(transfer.flightDepartsDateTime, format);
    }
    return "";
}

export const getSettings = async (companyId) => {

    const embedGetSettings = firebaseFunctions.httpsCallable(
        "embed-getSettings"
    );

    let result = await embedGetSettings({ companyId: companyId });
    return result.data;
};

import moment from "moment";
import { fireDb } from "@/plugins/firebase.js";

function getCollectionReferencePricingRulesCache(companyId) {
  return `companies/${companyId}/pricingRulesCache/`;
}

function getCollectionPricingRulesCache(companyId) {
  return fireDb.collection(getCollectionReferencePricingRulesCache(companyId))
}

export const getCollectionReferencePricingRules = (companyId) => {
  return `companies/${companyId}/pricingRules`;
};

export const getDocumentReferencePricingRules = (companyId, id) => {
  return `${getCollectionReferencePricingRules(companyId)}/${id}`;
};

export const getCollectionPricingRules = (companyId) => {
  return fireDb.collection(getCollectionReferencePricingRules(companyId));
};

export const getDocumentReferencePricingRule = (companyId, id) => {
  return fireDb.doc(getDocumentReferencePricingRules(companyId, id));
};


function getDatePartOfISOString(isoString) {
  if (isoString) {
    return new moment(isoString).format("YYYY-MM-DD");
  }
  return "";
}

function getTimePartOfISOString(isoString) {
  // we set the seconds to zero to disregard the datepicker using the seconds from the system clock
  if (isoString) {
    return new moment(isoString).set("second", 0).format("HH:mm:ss");
  }
  return "";
}

export const copyTransientDatesToForm = (form, transientForm) => {
  if (transientForm.availableDateRange && transientForm.availableDateRange[0]) {
    form.availableDateFrom = getDatePartOfISOString(
      transientForm.availableDateRange[0]
    );
  } else {
    form.availableDateFrom = "";
  }

  if (transientForm.availableDateRange && transientForm.availableDateRange[1]) {
    form.availableDateTo = getDatePartOfISOString(
      transientForm.availableDateRange[1]
    );
  } else {
    form.availableDateTo = "";
  }

  if (transientForm.availableTimeRange && transientForm.availableTimeRange[0]) {
    form.availableTimeFrom = getTimePartOfISOString(
      transientForm.availableTimeRange[0]
    );
  } else {
    form.availableTimeFrom = "";
  }

  if (transientForm.availableTimeRange && transientForm.availableTimeRange[1]) {
    form.availableTimeTo = getTimePartOfISOString(
      transientForm.availableTimeRange[1]
    );
  } else {
    form.availableTimeTo = "";
  }
};

function convertDateStringToDate(dateString) {
  return moment(dateString, "YYYY-MM-DD");
}

function convertTimeStringToDate(dateString) {
  return moment(dateString, "HH:mm:ss");
}

export const copyAndConvertDatesToTransientForm = (form, transientForm) => {
  if (form.availableDateFrom) {
    transientForm.availableDateRange = [];
    transientForm.availableDateRange.push(
      convertDateStringToDate(form.availableDateFrom)
    );
  }

  if (form.availableDateTo) {
    transientForm.availableDateRange.push(
      convertDateStringToDate(form.availableDateTo)
    );
  }

  if (form.availableTimeFrom) {
    transientForm.availableTimeRange = [];
    transientForm.availableTimeRange.push(
      convertTimeStringToDate(form.availableTimeFrom)
    );
  }

  if (form.availableTimeTo) {
    transientForm.availableTimeRange.push(
      convertTimeStringToDate(form.availableTimeTo)
    );
  }
};

export const convertArrayOfDayKeysToLabel = daysOfWeeksKeys => {
  const dayOfWeekLabels = handleConvertArrayOfDayKeysToLabelsArray(daysOfWeeksKeys);

  if (dayOfWeekLabels.length === 7) {
    return "Everyday";
  }

  return dayOfWeekLabels.join(", ");
};

export const convertArrayOfDayKeysToLabelsArray = daysOfWeeksKeys => handleConvertArrayOfDayKeysToLabelsArray(daysOfWeeksKeys);

const handleConvertArrayOfDayKeysToLabelsArray = daysOfWeeksKeys => {
  const dayOfWeekLabels = [];

  for (var isoWeekday of daysOfWeeksKeys) {
    const dayOfWeekFound = process.env.daysOfWeekOptions.find(
      dayOfWeek => dayOfWeek.isoWeekday === isoWeekday
    );

    if (dayOfWeekFound) {
      dayOfWeekLabels.push(dayOfWeekFound.label);
    }
  }
  return dayOfWeekLabels;
};



export const priceUtilsMixin = {
  methods: {
    mixinConvertArrayOfDayKeysToLabel(daysOfWeeksKeys) {
      return convertArrayOfDayKeysToLabel(daysOfWeeksKeys);
    },
    mixinConvertArrayOfDayKeysToLabelsArray(daysOfWeeksKeys) {
      return convertArrayOfDayKeysToLabelsArray(daysOfWeeksKeys);
    }    
  }
};

export const getPricingRules = async (companyId) => {

  console.log('getPricingRules', companyId);

  const ref = getCollectionPricingRulesCache(companyId).doc("--cache--");

  let pricingRulesCache = [];
  let snapshot;
  try {
    snapshot = await ref.get();
    pricingRulesCache = snapshot.data().cache;
    // we need to sort the pricing rules according to priority (higher the number, higher the priority)
    pricingRulesCache.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.log('getPricingRules error', error);
    pricingRulesCache = [];
  }
  return pricingRulesCache;
};
import moment from "moment";
import {
  createDriverWorkPeriodEvent,
  createStartFlagEvent,
  createEndFlagEvent,
  rewriteEventTitle
} from "@/statics/schedule/functions.js";

export const getDummyResources = numResources => {
  const resources = [];

  for (let index = 1; index < numResources; index++) {
    resources.push({
      id: "driver".concat(index),
      vehicle: "",
      capacity: ""
    });

    resources.push({
      id: "van".concat(index),
      vehicle: "Van ".concat(index),
      capacity: "8"
    });
  }
  return resources;
};

export const getDummyScheduledGroupsWithinEvents = () => {
  const allGroups = [];
  getDummyScheduledEvents().forEach(event => {
    if (event.extendedProps.groups) {
      event.extendedProps.groups.forEach(group => {
        allGroups.push(group);
      });
    }
  });
  console.log("allGroups", allGroups);
  return allGroups;
};

export const getDummyScheduledEvents = () => {
  const dummyEvent01_01 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent01_01"),
    resourceId: "van1",
    title: "",
    start: moment()
      .hour(5)
      .minutes(20)
      .format(),
    end: moment()
      .hour(6)
      .minutes(40)
      .format(),
    classNames: ["c74-timeline-flight-departure-finished"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdfkjhsdfkjuirb",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 3,
          flightDeparts: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "MOR",
          to: "GVA"
        }
      ],
      driver: {
        name: "Fat Tony"
      },
      type: "SHARED"
    }
  };

  dummyEvent01_01.title = rewriteEventTitle(dummyEvent01_01);

  const dummyEvent01_02 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent01_02"),
    resourceId: "van1",
    title: "",
    start: moment()
      .hour(7)
      .minutes(20)
      .format(),
    end: moment()
      .hour(8)
      .minutes(40)
      .format(),
    classNames: ["c74-timeline-flight-arrival-finished"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdjkdsfkldyuiewnbmbjhbdf",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 2,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "GVA",
          to: "MOR"
        },
        {
          id: "STILL NEEDS TO BE SETdfkjhdsfkbsdfbsdfbsdk",
          partyLeaderSurname: "LUTHER",
          partyLeader: "LUTHER, Lex",
          numPassengers: 4,
          flightArrives: "08:50",
          flightNumber: "EXY9987",
          pickupTime: "05:30",
          holidayAddress:
            "Chamois d'Or Hotel and Spa, 826 Rue du Ctre, 74260 Les Gets",
          geo: "46.1556801,6.6647157",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "GVA",
          to: "LGE"
        }
      ],
      driver: {
        name: "Fat Tony"
      },
      type: "SHARED"
    }
  };

  dummyEvent01_02.title = rewriteEventTitle(dummyEvent01_02);

  const dummyEvent01_03 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent01_03"),
    resourceId: "van1",
    title: "",
    start: moment()
      .hour(11)
      .minutes(20)
      .format(),
    end: moment()
      .hour(12)
      .minutes(40)
      .format(),
    classNames: ["c74-timeline-flight-arrival-in-progress"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETlaslkhghgsdue47365",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "GVA",
          to: "MT"
        }
      ],
      driver: {
        name: "Fat Tony"
      },
      type: "PRIVATE"
    }
  };

  dummyEvent01_03.title = rewriteEventTitle(dummyEvent01_03);

  const dummyEvent01_04 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent01_04"),
    resourceId: "van1",
    title: "",
    start: moment()
      .hour(13)
      .minutes(5)
      .format(),
    end: moment()
      .hour(14)
      .minutes(45)
      .format(),
    classNames: ["c74-timeline-flight-departure"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETkldajflkasjflkdjf",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "LGE",
          to: "GVA"
        }
      ],
      driver: {
        name: "Fat Tony"
      },
      type: "SHARED"
    }
  };

  dummyEvent01_04.title = rewriteEventTitle(dummyEvent01_04);

  const dummyEvent02_01 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent02_01"),
    resourceId: "van2",
    title: "",
    start: moment()
      .hour(7)
      .minutes(10)
      .format(),
    end: moment()
      .hour(8)
      .minutes(30)
      .format(),
    classNames: ["c74-timeline-flight-departure-finished"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdsfsdfm,nbmewuir",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 2,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "MOR",
          to: "GVA"
        },
        {
          id: "STILL NEEDS TO BE SETdfdsfdsfkjlkjewryiuewyr43765",
          partyLeaderSurname: "LUTHER",
          partyLeader: "LUTHER, Lex",
          numPassengers: 4,
          flightArrives: "08:50",
          flightNumber: "EXY9987",
          pickupTime: "05:30",
          holidayAddress:
            "Chamois d'Or Hotel and Spa, 826 Rue du Ctre, 74260 Les Gets",
          geo: "46.1556801,6.6647157",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "LGE",
          to: "GVA"
        }
      ],
      driver: {
        name: "Homer Simpson"
      },
      type: "SHARED"
    }
  };

  dummyEvent02_01.title = rewriteEventTitle(dummyEvent02_01);

  const dummyEvent02_02 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent02_02"),
    resourceId: "van2",
    title: "",
    start: moment()
      .hour(11)
      .minutes(20)
      .format(),
    end: moment()
      .hour(13)
      .minutes(40)
      .format(),
    classNames: ["c74-timeline-flight-arrival-loading-passengers"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdsfdsklwejfkljew8943573985",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "GVA",
          to: "PRO"
        }
      ],
      driver: {
        name: "Homer Simpson"
      },
      type: "PRIVATE"
    }
  };

  dummyEvent02_02.title = rewriteEventTitle(dummyEvent02_02);

  const dummyEvent02_03 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent02_02"),
    resourceId: "van2",
    title: "",
    start: moment()
      .hour(14)
      .minutes(20)
      .format(),
    end: moment()
      .hour(16)
      .minutes(20)
      .format(),
    classNames: ["c74-timeline-flight-departure"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SEThhgfghfeyu43578bbh",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "PRO",
          to: "GVA"
        }
      ],
      driver: {
        name: "Homer Simpson"
      },
      type: "SHARED"
    }
  };

  dummyEvent02_03.title = rewriteEventTitle(dummyEvent02_03);

  const dummyEvent03_01 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent03_01"),
    resourceId: "van3",
    title: "",
    start: moment()
      .hour(11)
      .minutes(5)
      .format(),
    end: moment()
      .hour(12)
      .minutes(40)
      .format(),
    classNames: ["c74-timeline-flight-departure-danger"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdfdsflkliku8977987898974635634",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "10:05",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "GVA",
          to: "LGE"
        }
      ],
      driver: {
        name: "Chief Wiggum"
      },
      type: "PRIVATE"
    }
  };

  dummyEvent03_01.title = rewriteEventTitle(dummyEvent03_01);

  const dummyEvent03_02 = {
    id: "STILL NEEDS TO BE SET".concat("dummyEvent03_02"),
    resourceId: "van3",
    title: "",
    start: moment()
      .hour(14)
      .minutes(20)
      .format(),
    end: moment()
      .hour(16)
      .minutes(20)
      .format(),
    classNames: ["c74-timeline-flight-departure"],
    extendedProps: {
      groups: [
        {
          id: "STILL NEEDS TO BE SETdsfsdfsdfsdfsdfsdfsdfsew23",
          partyLeaderSurname: "KENT",
          partyLeader: "KENT, Clarke",
          numPassengers: 4,
          flightArrives: "08:40",
          flightNumber: "EXY4532",
          pickupTime: "05:20",
          holidayAddress:
            "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
          geo: "46.178117, 6.708052",
          tel: "00 44 12345 654321",
          type: "SHARED",
          from: "PRO",
          to: "GVA"
        }
      ],
      driver: {
        name: "Chief Wiggum"
      },
      type: "SHARED"
    }
  };

  dummyEvent03_02.title = rewriteEventTitle(dummyEvent03_02);

  return [
    dummyEvent01_01,
    createStartFlagEvent(dummyEvent01_01),
    createEndFlagEvent(dummyEvent01_01),
    createDriverWorkPeriodEvent(new Date(), "04:50", "06:50", "driver1"),

    dummyEvent01_02,
    createStartFlagEvent(dummyEvent01_02),
    createEndFlagEvent(dummyEvent01_02),
    createDriverWorkPeriodEvent(new Date(), "07:55", "09:30", "driver1"),

    dummyEvent01_03,
    createStartFlagEvent(dummyEvent01_03),
    createEndFlagEvent(dummyEvent01_03),

    dummyEvent01_04,
    createStartFlagEvent(dummyEvent01_04),
    createEndFlagEvent(dummyEvent01_04),

    dummyEvent02_01,
    createStartFlagEvent(dummyEvent02_01),
    createEndFlagEvent(dummyEvent02_01),
    createDriverWorkPeriodEvent(new Date(), "07:00", "08:30", "driver2"),

    dummyEvent02_02,
    createStartFlagEvent(dummyEvent02_02),
    createEndFlagEvent(dummyEvent02_02),

    dummyEvent02_03,
    createStartFlagEvent(dummyEvent02_03),
    createEndFlagEvent(dummyEvent02_03),

    dummyEvent03_01,
    createStartFlagEvent(dummyEvent03_01),
    createEndFlagEvent(dummyEvent03_01),

    dummyEvent03_02,
    createStartFlagEvent(dummyEvent03_02),
    createEndFlagEvent(dummyEvent03_02)
  ];
};

export const getDummyConfirmedTransfers = () => {
  return [
    {
      id: "123456",
      partyLeaderSurname: "KENT",
      partyLeader: "KENT, Clarke",
      numPassengers: 3,
      flightDeparts: "19:00",
      flightNumber: "EXY4532",
      pickupTime: "16:20",
      holidayAddress:
        "The Farmhouse, Mas De La Coutettaz, 429 Chemin de la Coutettaz, 74110 Morzine",
      geo: "46.178117, 6.708052",
      tel: "00 44 12345 654321",
      type: "SHARED",
      from: "MOR",
      to: "GVA"
    },
    {
      id: "dfjkhdkyuiybdfgdfgdssdv",
      partyLeaderSurname: "LUTHER",
      partyLeader: "LUTHER, Lex",
      numPassengers: 3,
      flightDeparts: "19:10",
      flightNumber: "EXY9987",
      pickupTime: "16:40",
      holidayAddress:
        "Chamois d'Or Hotel and Spa, 826 Rue du Ctre, 74260 Les Gets",
      geo: "46.1556801,6.6647157",
      tel: "00 44 12345 654321",
      type: "SHARED",
      from: "LGE",
      to: "GVA"
    },
    {
      id: "dfsadfssfggfktrtegger",
      partyLeaderSurname: "SKYWALKER",
      partyLeader: "SKYWALKER, Anakin",
      numPassengers: 1,
      flightDeparts: "19:50",
      flightNumber: "A-WING",
      pickupTime: "16:20",
      holidayAddress:
        "Chamois d'Or Hotel and Spa, 826 Rue du Ctre, 74260 Les Gets",
      geo: "46.1556801,6.6647157",
      tel: "00 44 12345 654321",
      type: "PRIVATE",
      from: "LGE",
      to: "GVA"
    },
    {
      id: "dfsfggfktrssdsdsfvcbcwtegger",
      partyLeaderSurname: "SKYWALKER",
      partyLeader: "SKYWALKER, Luke",
      numPassengers: 4,
      flightDeparts: "19:50",
      flightNumber: "A-WING",
      pickupTime: "16:20",
      holidayAddress:
        "Chamois d'Or Hotel and Spa, 826 Rue du Ctre, 74260 Les Gets",
      geo: "46.1556801,6.6647157",
      tel: "00 44 12345 654321",
      type: "PRIVATE",
      from: "LGE",
      to: "GVA"
    },
    {
      id: "fdsfsdfasdvewvrvcbcvnnrtrn",
      partyLeaderSurname: "BOND",
      partyLeader: "BOND, James",
      numPassengers: 4,
      flightArrives: "13:00",
      flightNumber: "EZY7654",
      pickupTime: "14:00",
      babySeats: 1,
      childSeats: 1,
      holidayAddress:
        "Chalet Hôtel La Chaumière, Taille Mas Pied des Nants, 74110 Morzine",
      geo: "46.175265,6.7068978",
      tel: "00 44 12345 654321",
      type: "PRIVATE",
      from: "GVA",
      to: "MOR"
    },
    {
      id: "dsfdaerwtsgsfgfdgsdfsdnnfghnhy",
      partyLeaderSurname: "SCARAMANGA",
      partyLeader: "SCARAMANGA, Francisco",
      numPassengers: 3,
      flightArrives: "13:15",
      flightNumber: "EZY2267",
      pickupTime: "14:15",
      holidayAddress: "Le Sporting, 34 Route des Nants, 74110 Morzine",
      geo: "46.177302,6.707738",
      tel: "00 44 12345 654321",
      type: "SHARED",
      from: "GVA",
      to: "MOR"
    }
  ];
};

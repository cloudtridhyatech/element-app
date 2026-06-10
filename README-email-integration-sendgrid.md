[Go Back](/README-email-integration.md)

# SendGrid [(SendGrid Home Page)](https://sendgrid.com/)

This page is specific to integration with SendGrid.

SendGrid/Element integration requires the following steps:

- Create a SendGrid Account
- Create a single sender (depending on setup)

## SendGrid Account

The configuration of Element requires the API Key and Template Id's which are set in SendGrid

## Element Settings

These settings are SendGrid specific. The SendGrid specific settings are displayed in the image below.

<img src="https://user-images.githubusercontent.com/14176120/117949175-c0767b80-b309-11eb-9f25-2817a7ebccf2.png" width="600">

## Element json Data Schema

THe following data is supplied to SendGrid for every email

### Basic Data

```json
{
  "subject": "",
  "bookingRef": "",
  "companyName": "",
  "firstName": "",
  "lastName": "",
  "transfers": [
    {
      "type": "",
      "numPassengers": 0,
      "pickUpDate": "",
      "from": "",
      "to": ""
    }
  ],
  "totalPrice": 0,
  "link": "http://some-web-link"
}
```

| **Field**   | **Type** | **Notes**                                                                                                                      |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| subject     | string   | This text is taken from the value configured in the Element Settings Page                                                      |
| bookingRef  | string   | The unique generated booking reference                                                                                         |
| companyName | string   | The value in Ffirebase companyName                                                                                             |
| firstName   | string   | The booking first name data                                                                                                    |
| lastName    | string   | The booking last name data                                                                                                     |
| transfers   | array    | An array of items representing each transfer in the booking. A split transfer will be represented by a single item (see below) |
| totalPrice  | number   | The sum of the price from earch transfer in the traansfer array                                                                |
| link        | string   | Only used for payment link email. THis will contain a direct Uri link into the Public Embeded Payment Page                     |

### Transfer array item data

| **Field**     | **Type** | **Notes**                                                                                                                                                                                    |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type          | string   | Private or Shared                                                                                                                                                                            |
| numPassengers | number   | The total number of passengers for a transfer. For a split transfer this will be the total number of passengers across all splits                                                            |
| pickUpDate    | string   | The pick up date (DATE ONLY!!). For a split transfer this value will be taken from any journey associated with the transfer. Theroretically each journey could have a different pick up date |
| from          | string   | A placeCode value                                                                                                                                                                            |
| to            | string   | A placeCode value                                                                                                                                                                            |

## Fault Finding

None identified as yet.

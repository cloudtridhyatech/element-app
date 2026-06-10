[Go Back](/README-accounts-integration.md)

# Xero [(Xero Home Page)](https://www.xero.com)

This page is specific to integration with Xero.

Xero/Element integration requires the following steps:

- Create a Xero Account
- Create a Xero App
- Create a Xero Organisation
- Link Element to the Xero App and Organisation
- Configure accounting specific settings in Xero
- Configure/Verify accounting specific settings in Element.

## Xero Account

Visit [Xero](https://www.xero.com). There should be an option to 'Try Xero'.

<img src="https://user-images.githubusercontent.com/14176120/113123998-face0280-920c-11eb-81ca-4cc1bfbc0a0e.png" width="200">

Create and confirm the account.

<img src="https://user-images.githubusercontent.com/14176120/113124229-336ddc00-920d-11eb-9054-013e34ba996e.png" width="600">

## Xero App

Visit the [Xero Developer site](https://developer.xero.com). Login with the created account.
Select the option to create a 'New App'.

<img src="https://user-images.githubusercontent.com/14176120/113124591-93648280-920d-11eb-9237-4a4b8de2a0d6.png" width="600">

Complete the fields as required. It is important that the 'OAuth 2.0 redirect URI' is set to the correct value for the required enviroment. This value is validatied during the 'Xero/Element Link' step below. This URI is a direct call into the Firebase function 'invoicingXero-xeroRedirect'. For localhost development using the Firebase emulator this value is:

| name    | value                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| Local   | http://localhost:5001/element-app-development/us-central1/invoicingXero-xeroRedirect      |
| Dev     | https://us-central1-element-app-development.cloudfunctions.net/invoicingXero-xeroRedirect |
| Staging | -                                                                                         |
| Prod    | https://us-central1-element-app-production.cloudfunctions.net/invoicingXero-xeroRedirect  |

### Production settings as of 14 Jult 2021
| name    | value                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| Name | powder_cab (use appropriate companyKey here) |
| Integration type | Web app |
| Company or application URL | https://app.element-transfers.com |
| Privacy policy URL (optional) | Link to company website |
| Terms and conditions URL (optional) | Link to company website |
| OAuth 2.0 redirect URIs | https://us-central1-element-app-production.cloudfunctions.net/invoicingXero-xeroRedirect |

Once all the required fields are complete, press 'Create app'.

<img width="414" alt="Screenshot 2021-07-14 at 17 23 17" src="https://user-images.githubusercontent.com/4096355/125648348-453b7ee6-5aca-4139-9cea-9fa382a9fb71.png">

**Important!!!**

Ensure that the Client id is copied and saved in a safe external document. Click the link to 'Generate a secret'.

Ensure that the Client secret is copied and saved in a safe external document. Click the 'Save' button to commit the changes to the App.

**Note : ** It seems you don't need to click save now ...

<img src="https://user-images.githubusercontent.com/14176120/113128636-eb04ed00-9211-11eb-8e38-3825994ed7a2.png" width="200">

## Xero Organisation

Visit the [Xero site](https://xero.com). Login with the created account.

From the drop dwon menu on the left, select 'Add a new organisation'. (This step may have been sone during the account creation so no need to add a second organistaion if one already exists)

<img src="https://user-images.githubusercontent.com/14176120/113131441-2228cd80-9215-11eb-9d4c-3390304c2ec8.png" width="200">

It is important that the Organisation is created with the correct Country here, as this affects the default currency of the Organisation. Click Either 'buy now' or 'Start Trial' depending on the how the Organisation is going to be used.

Ensure that the Organisation Name is copied and saved in a safe external document.

<img src="https://user-images.githubusercontent.com/14176120/113131774-8b104580-9215-11eb-975f-94a8f3161685.png" width="200">

## Xero/Element Link

Visit the Element App Settings Page. The Xero Link settings can now be added.

| **Field**                 | **Value**                                               |
| ------------------------- | ------------------------------------------------------- |
| Xero Organisation Name    | The value saved in the 'Xero Organisation' step         |
| Xero Client Id            | The value saved in the 'Xero Organisation' step         |
| Xero Client Secret        | The value saved in the 'Xero App' step                  |
| Account Link Redirect Uri | The OAuth 2.0 redirect URI value in the 'Xero App' step |
| Xero Deep Link Base Uri   | https://go.xero.com/organisationlogin/default.aspx      |
| Xero Invoice Redirect Uri | redirecturl=/AccountsReceivable/View.aspx?InvoiceID=    |

Ensure to set Xero 'Active'. Ignore any warning regarding failure to link Xero at this step.

**The Primary and Secondary Tax Rate fields should be ignored and left blank for now.**

Click 'Save Xero Settings' to commit the values Firestore.

<img src="https://user-images.githubusercontent.com/14176120/113133571-bac04d00-9217-11eb-8197-6e03114bb166.png" width="600">

The 'Link Xero' button can now be clicked. If all settings are configured correctly, this will open a new browser window.

The required Xero Organisation **MUST** be selected from the drop down list to Link to the Xero app. CLick 'Allow access' to continue.

<img src="https://user-images.githubusercontent.com/14176120/113134307-88631f80-9218-11eb-88ec-a786381c8ce8.png" width="600">

If the link was established correctly, the page will show the message below:

<img src="https://user-images.githubusercontent.com/14176120/113134526-d0824200-9218-11eb-9407-202ad7406776.png" width="600">

Return to the Element App Settings Page.

Click the 'Refresh Status' button. The status icon should turn green.

<img src="https://user-images.githubusercontent.com/14176120/113134664-0293a400-9219-11eb-92fc-9b034ac9434c.png" width="600">

If the link process has completed correctly, an extra 'Organisation Short Code' field should be saved to Firestore and available on refreshing the settings screen. If the field in missing/null, re-run the 'link' process.

# Xero Settings

## Invoice prefix (optional step)

The Invoice prefix can be modified by opening the drop down menu on the left, then select:

Settlngs -> Invoice Settings -> Default Settings.

<img src="https://user-images.githubusercontent.com/14176120/113135382-fa883400-9219-11eb-9fba-eba8c77aa56d.png" width="600">

<br/><br/>

## Account Codes

Element currently supports the configuration of 3 Xero Account codes. These represent:

- Booking Offline (Bookings created/edited in the Element web site by staff)
- Booking Online (Bookings created in the Embedded web site by customers)
- Payment Online (Bookings paid for in the Embedded web site by customers)

### Default Code 200

Account Codes in Xero can be viewed by select 'Accounting' from the top menu bar then 'Advanced' from the drop down list. In the 'Advanced settings' area there is a section named 'Chart of accounts'. Enter this section by clicking on it.

The default Xero account used by Element is **200 - Sales**.

<br/>
### Important

**If online payment (e.g with Stripe) are enabled in Element, at least one Xero Account code must be configured to allow payments to the account.**

This can be set by opening the Account Code Details dialog by selecting an item, tick the 'Enable payments to this account' box.

Ensure that this Account Code e.g. 200 is copied and saved in a safe external document. This will be used later when synchronising Element Account Code settings.

Click the 'Save' button to commit the changes to Xero.

<img src="https://user-images.githubusercontent.com/14176120/116539733-2530df80-a8e1-11eb-9fda-8e78eb2f247c.png" width="200">

If no custom Account Codes are created, all Invoice lines for Offline, Online and Payments will be allocated to Account Code 200.

#### Custom codes (Optional)

Suggestions:

| Suggested Value | For                                                                        |
| --------------- | -------------------------------------------------------------------------- |
| 200             | Booking Offline (Bookings created/edited in the Element web site by staff) |
| 201             | Booking Online (Bookings created in the Embedded web site by customers)    |
| 202             | Payment Online (Bookings paid for in the Embedded web site by customers)   |

To add custom Account Codes in Xero, select 'Accounting' from the top menu bar then 'Advanced' from the drop down list. In the 'Advanced settings' area there is a section named 'Chart of accounts'.

Click the add button and a dialog will be displayed. Fill in the required values.

Set the 'Account Type' to either 'Revenue' or Sales'.
Enter a unique 'Code'. Xero will verify if the code is available.
Set the 'Tax' to 'Tax on Sales (0%). As Element is responsible for tax calculations on line items, setting to 0% will prevent Xero from calculating tax values.

**Important!** If this code is to be used for online payment, ensure the 'Enable payments to this account' box is ticked

Ensure that this Account Code is copied and saved in a safe external document. This will be used later when synchronising Element Account Code settings.

Click the 'Save' button to commit the changes to Xero.

<img src="https://user-images.githubusercontent.com/14176120/116543724-20baf580-a8e6-11eb-827f-95478d8b4410.png" width="600">

## Tax Rates (Optional)

If the Xero invoices are to correctly represent the Gross, Net and Tax values from Element, then the Primary TVA Rate % (and optionally Secondary TVA Rate %) must be configured and sychronised in both Element and Zero.

To add custom Tax Rates in Xero, select 'Accounting' from the top menu bar then 'Advanced' from the drop down list. In the 'Advanced settings' area there is a section named 'Tax rates'. Enter this section by clicking on it.

There are already some pre defined tax rates. To add a custom Tax rate click 'New Tax Rate'.

Enter the required values in the pop up.

Ensure that the 'Tax Rate Display Name' is copied and saved in a safe external document. This will be used later when synchronising Element Tax Rate settings with Xero.

Click 'Save' once complete.

<img src="https://user-images.githubusercontent.com/14176120/113136855-c150c380-921b-11eb-9828-10483d02c0fe.png" width="600">

Add a Tax rate for both Primary and Secondary Tax Rate as required. Suggestions below to keep config easier between companies/applications.

| Name   | Rate |
| ------ | ---- |
| TVA_FR | 10%  |
| TVA_CH | 7.7% |

## Item Codes (Optional)

Xero invoices lines can be set-up to represent different Items. These link to Tax Rates configured above.

Item Code can be added to Xero and the corresponding setting added to Element. When Invoices are Added/Updated by Element, the Invoice Primary and Secondary Lines will be automaticaly assigned the specified Item Code.

To add custom Item Codes in Xero, select 'Business' from the top menu bar then 'Products and services' from the drop down list.

To add a custom Item Code click 'New Item'.

Configure the Item Code as an "I sell this item" and select a previously added tax code.

Ensure that the 'Item Code' is copied and saved in a safe external document. This will be used later when synchronising Element Item Code settings with Xero.

TODO Speak to @nigel about this as Sales Account dropdown may have items 200, 201 and 202... so which do we map to.

| Name       | Rate |
| ---------- | ---- |
| TRANSIT_FR | 10%  |
| TRANSIT_CH | 7.7% |

Click 'Save' once complete.

<img src="https://user-images.githubusercontent.com/14176120/113138158-52746a00-921d-11eb-8eca-ed2fe225c486.png" width="600">

Add an Item Code for both Primary and Secondary Tax Rates as required.<br/><br/><br/>

# Element Settings

### Account Codes Settings (Optional)

It is not mandatory to set Account code in Element. The entries can be left blank. The first time a booking is created, Elelemnt will automatically set the values to '200'.
If online payments are enabled, account code '200' in Xero must be set to 'allow payments to the account' (as mentioned above).

To override the Xero 'Account Codes', the Element Xero settings must be updated. Updating the settings will also verify the entries are correct.

Visit the Element App Settings Page. The Account Code fields can now be added.

Enter the values saved in a document from the 'Account Codes' steps above.

DIfferent values can be added for all 3 Account Codes:

- Booking Offline
- Booking Online
- Payment Online

Click 'Save Xero Settings' to commit the values Firestore. This will validate the values to ensure they match the values in Xero. If there are no validation errors an 'Updated' message will be displayed.

<img src="https://user-images.githubusercontent.com/14176120/116545805-c40d0a00-a8e8-11eb-9184-24f374698361.png" width="600">

If there are validation errors an error message will be displayed and the settings will not be saved in Firestore until the correct values are entered.

<img src="https://user-images.githubusercontent.com/14176120/116546104-20702980-a8e9-11eb-87ef-ee5ed38ec1a2.png" width="600"><br/><br/>

### Tax Rate and Item Code Settings (Optional)

To use the Xero 'Tax Rates' and 'Item Codes', the Element Xero settings must be updated. Updating the settings will also verify the entries are correct.

Visit the Element App Settings Page. The Primary and Secondary Tax Rate fields can now be added.

Enter the values saved in a document from the 'Tax Rates' and 'Item Codes' steps above.

Click 'Save Xero Settings' to commit the values Firestore. This will validate the values to ensure they match the values in Xero. If there are no validation errors an 'Updated' message will be displayed.

<img src="https://user-images.githubusercontent.com/14176120/113145391-4345ea00-9226-11eb-8ad5-25fb9c943b53.png" width="600">

If there are validation errors an error message will be displayed and the settings will not be saved in Firestore until the correct values are entered.

<img src="https://user-images.githubusercontent.com/14176120/113145650-94ee7480-9226-11eb-97f3-1a4a605d6b0d.png" width="600">

## Element/Xero Link confirmation

Create a new Booking. If no errors occur during creation, re-open the new booking. An extra section should be displayed:

<img src="https://user-images.githubusercontent.com/14176120/113146439-953b3f80-9227-11eb-826b-cce716204fb8.png" width="600">

## Deactive/Rectivate Xero Link

The Xero/Element link can be deactivated by toggling the 'active' setting in the Xero section of the settings page.

Visit the Element App Settings Page.

Toggle the Active switch to 'Off'. No other settings changes are required.

Click 'Save Xero Settings' to commit the values Firestore.

<img src="https://user-images.githubusercontent.com/14176120/113147740-00394600-9229-11eb-9290-1e36134bcc7e.png" width="600">

To reactivated. simple toggling the 'active' back to and and click 'Save Xero Settings' to commit the values Firestore.

## Add another user to Xero

The company administering the system will need their own loging to Xero.

Click the company drop down top left -> Settings.

Add a new user with the following permissions at this time (beyond the default)

Standard

- add bank account admin
- allow to manage users

## Fault Finding

If an issue occurs with the Element/Xero link, visitng the settings page will try to establish if the link settings are valid. If not, the link can usually be re-established by clicking the 'Link Xero' button again.

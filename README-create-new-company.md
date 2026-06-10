[Go Back](/README.md)

# Creating A New Company

Creating a new company requires the following minimum steps:

- Create a new Collection for the company in Firestore
- Create the initial user
- Verfiy User and assign additional roles.
- Add Company settings

## Firestore - Create a new company document

- In the [(Google firebase Console)](https://console.firebase.google.com) select the required project and navigate to the Firestore area
- In the companies area select 'Add document'. A dialog should pop up
- Using Auto-ID will generate a unique Document ID value. This generated value does not have to be used and a custom value can be entered. Whatever value is used, this will be the **companyId** that is referenced throughout the Element App source code
- Enter fields to represent the **companyKey** and **companyName**. The value of companyKey is referenced throughout the Element App source code
- Click 'Save'.

<img src="https://user-images.githubusercontent.com/14176120/116988531-6dc51000-acc8-11eb-9268-3d1f77f2a815.png" width="300">

## Firebase Authentication - Create an initial user

- In the [(Google firebase Console)](https://console.firebase.google.com) select the required project and to the Authentication area from the left hand menu
- Click 'Add user'. A dialog should pop up
- Enter values for Email and Password

<img src="https://user-images.githubusercontent.com/14176120/116989781-1d4eb200-acca-11eb-9102-ec7e77bcc891.png" width="300">

- Click 'Add user' in the dialog to save the user.
- Once the dialog has closed, copy the User UID of the new user. This is required in the next step.

<img src="https://user-images.githubusercontent.com/14176120/116989916-4f601400-acca-11eb-83c0-54bb65a4e32b.png" width="300">

## Firestore - Create an initial user document

- In the [(Google firebase Console)](https://console.firebase.google.com) select the required project and navigate to the Firestore area
- In the companies area select the required company document
- Click the 'Start collection' link
- Enter the name **users**

<img src="https://user-images.githubusercontent.com/14176120/116991458-7d465800-accc-11eb-80c2-80e3e7ef9963.png" width="300">

- Click 'Next'
- Paste the User UID from the previuos step into the Document ID field
- Add the fields
- active = true
- email = _email address_ from previous step\*
- firstName = _The users first name_
- lastName = _The users last name_
- roles = An array that should contain at least the following values: system-admin, user-admin

<img src="https://user-images.githubusercontent.com/14176120/116991917-2e4cf280-accd-11eb-9c1d-c47138efa626.png" width="300">

- Click 'Save' to save the user.

## User Verification in Algolia & Element

- Login in to [(Algolia)](https://www.algolia.com). The new collection _env_\__company_\_users should have been created automatically with details matching those just entered in the sprvious steps.
- Navigate to the required Element App Deployment
- Login with the created credentials
- Once logged in, select the top _User_ menu. Select the user just logged in and set futher role permissions. Ensure to select _settings-admin_

<img src="https://user-images.githubusercontent.com/14176120/116993391-53dafb80-accf-11eb-865f-d5e15299d082.png" width="300">

- Click 'Update User'
- Select 'Sign Out'. Immediately sign in again. The user should now have access to the menus as derived from the selectd user permissions
- Once logged in, select the top _Other_ menu drop down then _Settings_. This will show the settings screen.
- Click the 'Save Editable Settings' button. This will create an empty --editableSettings-- document in Firestore

<img src="https://user-images.githubusercontent.com/14176120/116994357-80434780-acd0-11eb-8d2f-237f18bd0a15.png" width="300">

<img src="https://user-images.githubusercontent.com/14176120/116994606-d57f5900-acd0-11eb-926b-a868b7d92503.png" width="300">

## Company Specific Settings

- In the [(Google firebase Console)](https://console.firebase.google.com) select the required project and navigate to the Firestore area
- In the companies area select the required company document
- Naviate to the settings document.
- Click the 'Add document' link. A dialog should pop up
- Name the new child document **--settings--**
- Add company specific numeric settings here: maxActiveVehicles, maxActiveDrivers, maxActivePlaces, maxActiveRoutes (all numbers)
- Other system integration settings can also be added here for [Invoicing](/README-accounts-integration.md) and [Payment](/README-payment-integration.md) Systems
- Click 'Save' to save the settings.

# Configuring a Company

## Add configuration data

### Create Booking

To be able to create booking the following minimum configuration steps are mandatory:

- Create at least 2 places
- Create a catch all pricing rule.

And these steps are optional:

- Add a tour operator
- Add accommodation for the tour operator.

### Schedule Transfer

To be able to schedule a booking transfer and the driver login and see the event the following minimum configuration steps should be followed.

- Create additonal users e.g. Driver
- Create a vehicle.

## Firestore Indexes

Certain collection require indexes. (e.g. journies, events). Given the nature of Firestore in that collections may not be created until data is created, the index may have to be added after initial is created. to view/edit the confgutred indexes:

- In the [(Google firebase Console)](https://console.firebase.google.com) select the required project and navigate to the Firestore area
- Select the Indexes tab.

<img src="https://user-images.githubusercontent.com/14176120/117116790-b17e4f00-ad86-11eb-9afb-bbfa16b20cfc.png" width="300">

# Fault Finding

## Indexes

If indexes are not configured correctly, errors can be seen in the browser console. These errors have been observed in the Booking List or Driver screen. The console error provides the url to use to resolve the issue. See image below for an exampole.

<img src="https://user-images.githubusercontent.com/14176120/117116274-12595780-ad86-11eb-82a2-852b559079bc.png" width="300">

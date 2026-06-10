[Go Back](/README.md)

# Using Firebase locally

> We are using the following elements of Firebase

- Cloud Firestore : Store and sync app data at global scale
- Cloud Functions : Run mobile backend code without managing servers
- Authentication : Authenticate users simply and securely
- Hosting : Deliver web app assets with speed and security

## Installing the Firebase CLI

The very first steps before you can begin working with Firebase locally are:

- to install the Firebase CLI
- to login and test the Firebase CLI

Ensure to install the npm version and not the standalone binary.

[Installing the Firebase CLI](https://firebase.google.com/docs/cli)

If developing on Windows, installing the Firebase Tools may be required:

```
PS c:\ npm install -g firebase-tools
```

Additional security privilages may be required to be assigned in Windows to run the Firebase Tool PowerShell scripts.

e.g.

```
PS c:\ Set-ExecutionPolicy -ExecutionPolicy RemoteSigned CurrentUser
```

See [Microsoft PowerShell Security Documentation](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-7.1) for a full description of the above command.

## Using local firebase emulator

TODO
[How to Import Production Data From Cloud Firestore to the Local Emulator](https://medium.com/firebase-developers/how-to-import-production-data-from-cloud-firestore-to-the-local-emulator-e82ae1c6ed8)

The Firebase Local Emulator Suite is a set of advanced tools for developers looking to build and test apps locally using Cloud Firestore, Realtime Database, Authentication, Cloud Functions, Cloud Pub/Sub and Firebase Hosting. Local development with Local Emulator Suite can be a good fit for your prototyping, development and continuous integration workflows.

[Install, configure and integrate Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)

### Further reading

[Firebase Emulator Docs](https://firebase.google.com/docs/emulator-suite)
[Connect your app to the Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth#web)

During development, we use a local firebase emulator that include the following components.

- Cloud Firestore : Store and sync app data at global scale
- Cloud Functions : Run mobile backend code without managing servers
- Auth Emulator : Use a local emulator for auth

Hosting of course only applies to the application when being served from development/staging/production

## The best way to start local emulators as of December 2020

Firstly, ensure you are logged into Firebase Console at the command prompt. This must be with the email account registered with firebase console on development.

```bash
\$ firebase login
```

Next, ensure you are using the dev environment

```bash
$ firebase use
Active Project: default (element-app-development)

Project aliases for /Volumes/ExtraDrive/VUE/element-app:

* default (element-app-development)
  staging (element-app-staging)
  production (element-app-production)
```

If asterisk not next to default, execute

```bash
\$ firebase use default
```

Next, ensure that a .runtimeconfig.json file has been created. In the project root, run the following command: (on windows, the .runtimeconfig.json file may need to be held in functions/ folder)

##### Mac/Linux

```bash
\$ firebase functions:config:get > .runtimeconfig.json
```

##### Windows

###### Important! Windows users seem to need to follow this: https://cloud.google.com/docs/authentication/getting-started#windows

```PowerShell
PS firebase functions:config:get | ac .runtimeconfig.json
```

This should create a file in the functions folder with contents similar to below:

```json
{
  "hosting": {
    "environment": "dev"
  },
  "algolia": {
    "application_id": "XXXXXXXXXX",
    "search_only_api_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "admin_api_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  "settings": {
    "email_create_booking_enabled": "false"
  }
}
```

To prevent emails being sent during development, ensure `email_create_booking_enabled` is set to `false`.

To use a unique developer Algolia search index, ensure `env` is set add to the `algolia` section:


```json
{
  "algolia": {
    "application_id": "XXXXXXXXXX",
    "search_only_api_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "admin_api_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "env": "MyUniqueID"    
  },
}
```

To start an emulator importing a fuller set of data into Firestore, users, companies, vehicles and journies etc., use the following:
This presumes you have a folder data/seed-with-journies in the root directory (which is not stored in source control)

##### Mac/Linux

```bash
\$ npm run firebase-emulator-with-local-auth
```

##### Windows

Ensure the FIREBASE_AUTH_EMULATOR_HOST environmetal variable is set. This is probably best set in the User Environment variables, but can be set just in the scope of the current Termainal/PowerShell session e.g:

```
set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

Then

```
firebase emulators:exec 'node ./setup-emulator.js' --import=data/seed-with-journies --ui
```

You should see the following amongst the console output during startup of the emulators:

Now using alias default (element-app-development)
i emulators: Starting emulators: auth, functions, firestore, hosting

### Starting a local firebase emulator

To start an empty firebase emulator: (not much use currently)

```bash
\$ firebase emulators:start
```

To start an emulator importing a basic set of data into Firestore, users, companies, vehicles etc., use the following:
This presumes you have a folder data/seed in the root directory (which is not stored in source control)

> This will use authentication data from Firestore rather than the NEW local authentication emulator

```bash
\$ firebase emulators:start --import data/seed
```

### Exporting contents of a local firestore

It's sometimes useful to amend your seed data when working with Firestore locally.

- the data directory is not commited to source control
- execute from the project root

```bash
$ firebase emulators:export data/seed
```

## Cloud Functions

All functions are maintainted within the /functions directory

> Adding libraries via npm for the functions should be executed WITHIN the functions directory!!!

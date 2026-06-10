[Go Back](/README.md)

# Deploying to Firebase

## Choose your environment

We have three environments we can deploy to which are defined in .firebaserc as:

```bash
{
  "projects": {
    "default": "element-app-develop",
    "staging": "element-app-staging",
    "production": "element-app-production"
  }
}
```

> PLEASE BE SURE YOU HAVE THE CORRECT ENVIROMENT IN USE BEFORE EXECUTING DEPLOY

The following command shows the active project

```bash
\$ firebase use
Active Project: default (element-app-develop)

* default (element-app-develop)
  staging (element-app-staging)
  production (element-app-production)
```

To switch to a different project/environment, append the environment name

```bash
$ firebase use default
Now using alias default (element-app-develop)
```

[Deploy to multiple environments with Firebase Hosting](https://firebase.googleblog.com/2016/07/deploy-to-multiple-environments-with.html)

## Environment config setup

> You can determine the environment variables already set in the chosen environment using:

```bash
$ firebase functions:config:get
{
  "algolia": {
    "application_id": "xxxxxxx",
    "search_only_api_key": "xxxxxxxxx",
    "admin_api_key": "xxxxxxxxxx"
  },
  "settings": {
    "email_create_booking_enabled": "true"
  }
}
```

> You can set an enviroment variable using:

```bash
firebase functions:config:set algolia.application_id='xxxxxxxxx'
```

## Deploying everything

> build the application

```bash
$ npm run build
```

> deploy the application and cloud functions

```bash
$ firebase deploy
```

The above command deploys both:

- the Vue/Nuxt application (quick process)
- the cloud functions (slow process)

## Deploying application only

> build the application

```bash
$ npm run build
```

> deploy the application

```bash
$ firebase deploy --only hosting
```

## Deploying cloud functions only

> This can be executed within the root directory or within /functions and is usefult if you've only been working with functions. The deployment process is quite slow as each functions 'lives' within it's own environment

```bash
firebase deploy --only functions
```

### Deploying only 'xxxxxxxxx' functions

> As function deployment can be quite slow, you can deploy just a subset to speed things up ...

```bash
firebase deploy --only functions:accommodations
```

[Go Back](/README.md)

# Payment System Integration

Element can be linked to external 3rd party Payment System providers.

- Element configuration that is provider agnostic
- Element/Provider configuration unique to each provider.

### Element Configuration

## Security

### Settings Admin

A user that requires permissions to access the settings page must assigned the role 'Settings Admin'.

<img src="https://user-images.githubusercontent.com/14176120/113120323-61512180-9209-11eb-813a-882a0b97265b.png" width="400">

The user must logout/login to see the changes.

### System Admin

There is a user role that is hidden from the Element User edit screen.  This 'system admin' role can only be assigned by adding the role directly in Firestore. The 'system admin' role allows access to additional configuration over a standard 'settings admin' role.

Find the relevant user and manually add:

**system-admin**

to their role list.

<img src="https://user-images.githubusercontent.com/14176120/113121107-34513e80-920a-11eb-98ca-32056ae701e3.png" width="400">

The user must logout/login to see the changes.

## Settings

### Enable Element Payment System Integration

By default, the integration with any Payment System is switched off in Element.  This can only be enabled adding the setting directly in Firestore.

Navigate to the Firestore --settings-- document for the company that is allowed Payment System Integration e.g.

companies > 6515M7iTKqThTT997M7I > settings > --settings--

Add a new boolean field named:

**paymentSystemAllowed**

and set its value to:

**true**

<img src="https://user-images.githubusercontent.com/14176120/116086469-c298d300-a697-11eb-9e37-577ddb7df3ec.png" width="400">

The Settings page in Element should now display the Payment System integration options/settings.

### Element Settings Page

These settings are payment system agnostic. However the values used for some settings may be important to successful integration of the chosen payment system. The payment specific settings are highlighted in the image below.

<img src="https://user-images.githubusercontent.com/14176120/116215640-ca13b700-a73f-11eb-865f-ffd1a08e20f4.png" width="200">

# Payment Software Provider Integration

[Stripe Integration](/README-payment-integration-stripe.md)

...other system page links to be added here

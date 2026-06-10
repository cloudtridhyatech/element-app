
[Go Back](/README.md)

# Accounting System Integration

Element can be linked to external 3rd party Accounting Software providers.  This requires:

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

### Enable Element Accounting System Integration

By default, the integration with any Accounting System is switched off in Element.  This can only be enabled adding the setting directly in Firestore.

Navigate to the Firestore --settings-- document for the company that is allowed Accounting Integration e.g.

companies > 6515M7iTKqThTT997M7I > settings > --settings--

Add a new boolean field named:

**accountingSystemAllowed**

and set its value to:

**true**

<img src="https://user-images.githubusercontent.com/14176120/113125717-ceb38100-920e-11eb-891d-c7802f1f93a7.png" width="400">

The Settings page in Element should now display the Accounting System integration options/settings.

### Element Settings Page

These settings are account system agnostic. However the values used for some settings may be important to successful integration of the chosen sccounting system.  The accounting specific settings are highlighted in the image below.

<img src="https://user-images.githubusercontent.com/14176120/113122437-88a8ee00-920b-11eb-84ad-cad30368f5d6.png" width="400">

### Element Routes Page

If 'Secondary TVA Rates' are to be used, each Route must be configured with the share of the journey to be allocated to the Secondary TVA by setting the 'Additional Taxable Zone' on the Route edit page.

<img src="https://user-images.githubusercontent.com/14176120/113131109-b0e91a80-9214-11eb-8304-53b0d6cad05d.png" width="400">




# Accounting Software Provider Integration

[Xero Integration](/README-accounts-integration-xero.md)

...other sytem page links to be added here

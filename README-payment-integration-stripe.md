[Go Back](/README-payment-integration.md)

# Stripe [(Stripe Home Page)](https://stripe.com)

This page is specific to integration with Stripe.

Stripe/Element integration requires the following steps: 

- Create a Stripe Account
- Configure the Stripe Business details

## Stripe Account

Visit the [Stripe Registration Page](https://dashboard.stripe.com/register) to create an account.

<img src="https://user-images.githubusercontent.com/14176120/116087133-7732f480-a698-11eb-8808-c0e9c3ef7130.png" width="300">

Stripe will send a verification email. Click the link and enter your password if required to verify the account.

The Developer menu link should give access the the test API keys.  To use the live keys, more details about the business must be supplied.

<img src="https://user-images.githubusercontent.com/14176120/116088447-c7f71d00-a699-11eb-9894-6fa48d73b559.png" width="300">


**Important!!!**

Ensure that the Publishable key is copied and saved in a safe external document.

Ensure that the Secret Key is copied and saved in a safe external document.


## Stripe Developer Documentation

Visit the [Stripe Developer site](https://stripe.com/docs).


## Stripe Settings

### Live Payment Account Activation

**Important!!!**

The Stripe account must be activated for actual card payments to be taken. See the 'Activate your account' link in the Stripe dashboard.

<img src="https://user-images.githubusercontent.com/14176120/116520528-c06a8a80-a8ca-11eb-89b3-310cc7daa28c.png" width="200">

## Element Settings

### API Keys

Visit the Element App Settings Page. The Stripe API keys can now be added.

Enter the values relevant environment (Dev, Prod etc.) saved in a document from the 'Stripe Account' step above.

Click 'Save Stripe Settings' to commit the values to Firestore.

<img src="https://user-images.githubusercontent.com/14176120/116095282-2d4e0c80-a6a0-11eb-9724-d03f7f8ac3a2.png" width="200">


### Enable Payments

Visit the Element App Settings Page. Ensure to set Stripe 'Active'. 

Click 'Save Stripe Settings' to commit the values to Firestore.

<img src="https://user-images.githubusercontent.com/14176120/116095895-b8c79d80-a6a0-11eb-9d16-9111ebe9984a.png" width="200">

## Accounting System Integration

If an accounting system is to be used with Element, extra configuration may be required for online payments to automatically update the invoices to 'Paid', 

| **System**      | **Notes** |
| ----------- | ----------- |
| Xero       | At least one account must be set-up as 'Enable payments to this account'. See 'Accounting->Chart of accounts.      |



## Testing

### Stripe Test Cards

The following test cards are U.S.A card numbers for basic testing. So the payment field will require a Zip code rather than than say a UK postcode.

Zip code 90210 works for testing.  The expiry date and CVV number can be anything valied.

<img src="https://user-images.githubusercontent.com/14176120/116245858-4ff42a00-a761-11eb-82b9-6e7fc468cf3f.png" width="200">

More international card numbers can be found [here](https://stripe.com/docs/testing#international-cards).


## Fault Finding

No fault finding tips as yet. 



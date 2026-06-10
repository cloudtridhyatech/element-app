[Go Back](/README.md)

# 01 Bookings cannot be edited

When in production/staging/dev, it may be that an index has not been created in Firestore. When clicking to edit a booking in the Element app, the booking cannot be retrieved.

This needs to be done for each new company.

<img width="600" alt="Screenshot 2021-05-31 at 11 28 25" src="https://user-images.githubusercontent.com/4096355/120173550-69770e80-c204-11eb-9579-b36946995e91.png">

Looking in the logs within the functions part of the firebase, you should see an error...

<img width="600" alt="Element_App_Production_–_Firebase_console" src="https://user-images.githubusercontent.com/4096355/120173487-5d8b4c80-c204-11eb-9012-e90e5e0ab178.png">

Inside one of the logs, you'll see a prompt to create an index and will need to copy and paste into the browser something like:

https://console.firebase.google.com/v1/r/project/element-app-production/firestore/indexes?create_composite=Cldwcm9qZWN0cy9lbGVtZW50LWFwcC1wcm9kdWN0aW9uL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9qb3Vybmllcy9pbmRleGVzL18QARoNCglib29raW5nSWQQARoSCg5waWNrVXBEYXRlVGltZRABGgwKCF9fbmFtZV9fEAE

Google can mess around saying you don't have the necessary permissions, especially when logged into multiple accounts.

Once you get there, it'll take a few minutes for the index to be created as it gets queued.

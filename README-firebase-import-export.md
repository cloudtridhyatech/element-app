[Go Back](/README.md)

# Import local Firestore database to remote Firestore

> Assuming you have already [exported contents of a local firestore](README-firebase-locally.md)

## Upload the export into a Google bucket

- Visit the [Google Cloud Platform Console](https://console.cloud.google.com/home/dashboard)
- Select correct user account (top right) if you have multiple Google acounts
- Navigate: Hamburger (top left) -> Storage -> Browser
- Change organization if needed and select 'Element App Develop'
- You should see 4 or more buckets
- If there's not a bucket named 'temp-swap-xxxxx', create one
- Select the bucket
- Click upload folder
- Select your local exported data, upload entire directory

## Import into remote Firestore database

- Navigate: Hamburger (top left) -> Firestore -> Data
- Navigate: Import/Export
- Click Import
- Select the bucket referred to above
- In the directory you uploaded, select file: 'export-folder-name/firestore_export/firestore_export.overall_export_metadata
- Click 'select'
- Click 'Import'

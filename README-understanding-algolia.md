[Go Back](/README.md)

# Understanding Algolia

## Developer settings

### Localhost Configuration

Edit the local .runtimeconfig.json file to ensure that a unique developer Algolia search index is set. This is determined by the `env` value.


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

### Clone Indexes

To initiate certain indexes to be used by localhost instances, duplicates of the following Algolia indexes should be created:

- *UNIQUIEID*_morzine_transfer_users
- *UNIQUIEID*_morzine_transfer_accomodations

This can be done via the Alogila management web interface


![image](https://user-images.githubusercontent.com/14176120/116775521-3c93d800-aa5b-11eb-8e9a-b6fb8465ba78.png)


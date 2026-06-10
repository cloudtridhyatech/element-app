[Go Back](/README.md)

# Deploy to Development

When you merge a feature branch/update into the develop branch, this will initiate a Buddy pipeline that will make a release to the remote Firebase environment 'element-app-development'

It will:

- build the project
- copy the built project to Firebase hosting
- install the functions in the /functions directory to Firebase functions

You can see the status of the pipeline in Buddy

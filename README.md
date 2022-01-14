# breathing-guidance-chi22

A quick and dirty implementation of quiz interface with/without breathing guidance to see if very small amount of mindfulness activity can help us remember vocabulary well. This work is hosted on the internet so that other researcher can carry out experiments with different conditions.


## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

# Add firebase configuration

From firebase console, copy firebaseConfig lines into /assets/firebase-config.js.

```js: /assets/firebase-config.js
export default{
    apiKey: "YOUR_KEY_HERE",
    bar: "FOO",
    ...
}
```

# Deploy to Firebase hosting

```bash
yarn generate # builded files will be in /dist
firebase deploy --only hosting # files in /dist will be deployed to hosting servers
```

# Recommended displays, browsers, etc

- Google Chrome on 23-inch Desktop


## Setups on the software
- Chrome should zoom up (200%)
- Please use "Full-screen mode"

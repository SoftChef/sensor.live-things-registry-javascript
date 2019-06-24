# sensor.live-things-registry-javascript

## Overview

This document will help your device connect to AWS IoT quickly. Mainly to speed up the process of certificate exchanging complied to AWS IoT authentication.

## Prepare

Environment

- Create "certs" directory in your develop path.

Packages

- AWS IoT SDK for JavaScript https://github.com/aws/aws-iot-device-sdk-js

sensor.live

- Enable SATR on sensor.live, you will get root_ca.cert.pem, ca.cert.pem and ca.private_key.pem.
- Put the pem files into ./certs directory.

## Installation

```
npm install sensor.live-things-registry
```

## Examples

```js
const aws_iot = require('aws-iot-device-sdk');
const thing_registry = require('sensor.live-things-registry');
const config = {
    aws_iot: {
        endpoint: 'your aws iot endpoint',
        port: '8883', // 8883 or 1883 is default supported with AWS IoT,
        debug: false
    }
}
thing_registry.setCertsPath('./certs'); // you can change the default certificates folder
if (!thing_registry.hasDeviceCertificate()) {
    thing_registry.generateDeviceCertificate({
        thing_name: '<YourDeviceUniqueName>'
    });
}
let thing_name = thing_registry.getThingName();
let keys_path = thing_registry.getKeysPath();
let client_id = `device-${thing_name}`
let thing_shadow = aws_iot.thingShadow({
    ...keys_path,
    host: config.aws_iot.endpoint,
    port: config.aws_iot.port,
    debug: config.aws_iot.debug,
    clientId: client_id
});
```

## API Documentation

#### ThingRegistry.generateDeviceCertificate(options)

Default options:
```
options = {
    thing_name = null,
    country_name = 'TW',
    state_name = 'Taipei',
    locality_name = 'Nangang',
    organization_name = 'SoftChef',
    organization_unit_name = 'IT'
}
```
You can customize the thing name, please ensure the thing name is given uniquely.

The naming rule is based on AWS IoT requirement: Must contain only alphanumeric characters and/or the following: -_:

If your thing_name is null, alternatively, the thing name will generate from the device certificate.

#### ThingRegistry.getThingName()

Get the thing name. Your customized name or from the device certificate.

#### ThingRegistry.getKeysPath()

Return the keys path, properties follow AWS IoT connection options.

#### ThingRegistry.setCertsPath(path)

Change the default certificate files directory.

#### ThingRegistry.setCACertificateName(name)

Change the default CA certificate file name.

#### ThingRegistry.setCAPrivateKeyName(name)

Change the default CA private key file name.

#### ThingRegistry.setRootCACertificateName(name)

Change the default RootCA certificate file name.

#### ThingRegistry.setDeviceCsrName(name)

Change the default device certificate request file name.

#### ThingRegistry.setDeviceCertificateName(name)

Change the default device certificate file name.

#### ThingRegistry.setDevicePublicKeyName(name)

Change the default device public key file name.

#### ThingRegistry.setDevicePrivateKeyName(name)

Change the default device private key file name.

## License

This SDK is distributed under the GNU GENERAL PUBLIC LICENSE Version 3, see LICENSE for more information.

## Support

If you have technical questions about sensor.live-things-registry, contact sensor.live support poke@sensor.live.


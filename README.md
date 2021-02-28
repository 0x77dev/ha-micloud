# ha-micloud

[![CI](https://github.com/0x77dev/ha-micloud/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/0x77dev/ha-micloud/actions/workflows/ci.yml)

Yet another miio repository

Integrates Xiaomi Home Cloud Devices into Home Assistant

## Overview

WIP: Work in progress

The plan is to create universal mapping utility for Mi devices into home assistant

### Bridge

Bridge is an addon that takes Mi devices from cloud and pushes them intro MQTT

All you need to provide is an Username, Password and Region (Country)

### Component

Component is taking those devices from MQTT and maps them into Home Assistant

## Acknowledgements

- [node-mihome](https://github.com/maxinminax/node-mihome) for providing [parts of the code that interact with a xiaomi cloud](https://github.com/maxinminax/node-mihome/blob/e60c287d9bb2d9ba9123543d92ec481be5a62b5e/lib/protocol-micloud.js)

## License

MIT Licensed, see in [LICENSE](./LICENSE)

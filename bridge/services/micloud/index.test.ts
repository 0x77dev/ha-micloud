import { MiCloudDevice } from "."
import { MiCloud } from "./protocol"

describe("MiCloud", () => {
    let device: MiCloudDevice
    let cloud: MiCloud

    beforeAll(async () => {
        device = new MiCloudDevice()

        await device.logIn(process.env.USERNAME || "", process.env.PASSWORD || "")

        cloud = new MiCloud(device, process.env.COUNTRY || "cn")
    })

    test("MiCloudDevice", () => {
        expect(device.isLoggedIn).toBeTruthy()
        expect(device.userAgent).toBeTruthy()
        expect(device.clientId).toBeTruthy()
        expect(device.userId).toBeTruthy()
        expect(device.serviceToken).toBeTruthy()
    })

    test("MiCloudProtocol", async () => {
        expect(cloud.isReady).toBeTruthy()

        const devices = await cloud.getDevices()

        expect(devices).toBeTruthy()

        const device = await cloud.getDevice(devices[0].did)

        expect(device.did).toBe(devices[0].did)
    })
})

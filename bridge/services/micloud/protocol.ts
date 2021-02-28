import { countries, MiCloudDevice } from "./device";
import querystring from "querystring"
import fetch from "node-fetch"
import { generateNonce, getApiUrl, generateSignedNonce, generateSignature } from "./services";
import { Device } from "./interfaces";

export class MiCloud {
    public country: string
    private device: MiCloudDevice

    constructor(device: MiCloudDevice, country: string) {
        this.device = device
        this.country = country
    }

    public get isReady(): boolean {
        return this.device.isLoggedIn
    }

    public async getDevices(deviceIds?: string[]): Promise<Device[]> {
        const req = deviceIds ? {
            dids: deviceIds,
        } : {
                getVirtualModel: false,
                getHuamiDevices: 0,
            };
        const data = await this.request('/home/device_list', req, this.country);

        return data.result.list;
    }

    public async getDevice(deviceId: string): Promise<Device> {
        const req = {
            dids: [String(deviceId)]
        };
        const data = await this.request('/home/device_list', req, this.country);

        return data.result.list[0];
    }

    public async miioCall(deviceId: string, method: string, params: any) {
        const req = { method, params };
        const data = await this.request(`/home/rpc/${deviceId}`, req, this.country);

        return data.result;
    }

    async request(path: string, data: any, country = 'cn'): Promise<any> {
        if (!this.isReady) {
            throw new Error('isReadyFalse');
        }

        if (!countries.includes(country)) {
            throw new Error(`The country ${country} is not support, list supported countries is ${countries.join(', ')}`);
        }

        const url = getApiUrl(country) + path;
        const params = {
            data: JSON.stringify(data),
        };
        const nonce = generateNonce();
        const signedNonce = generateSignedNonce(this.device.sSecurity, nonce);
        const signature = generateSignature(path, signedNonce, nonce, params);
        const body = {
            _nonce: nonce,
            data: params.data,
            signature,
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': this.device.userAgent,
                'x-xiaomi-protocal-flag-cli': 'PROTOCAL-HTTP2',
                'mishop-client-id': '180100041079',
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: [
                    'sdkVersion=accountsdk-18.8.15',
                    `deviceId=${this.device.clientId}`,
                    `userId=${this.device.userId}`,
                    `yetAnotherServiceToken=${this.device.serviceToken}`,
                    `serviceToken=${this.device.serviceToken}`,
                    `locale=${this.device.locale}`,
                    'channel=MI_APP_STORE'].join('; '),
            },
            body: querystring.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`Request error with status ${res.statusText}`);
        }

        const json = await res.json();
        return json;
    }
}
import randomstring from "randomstring"
import querystring from "querystring"
import { countries } from "./defaults"
import { MiCloudRegions } from "./interfaces"
import { parseJson } from "../services"
import crypto from "crypto"
import fetch from "node-fetch"

export class MiCloudDevice {
    private agentId: string = randomstring.generate({
        length: 13,
        charset: 'ABCDEF',
    })

    public userAgent = `Android-7.1.1-1.0.0-ONEPLUS A3010-136-${this.agentId} APP/xiaomi.smarthome APPV/62830`

    public clientId: string = randomstring.generate({
        length: 6,
        charset: 'alphabetic',
        capitalization: 'uppercase',
    });

    public serviceToken?: string;
    public sSecurity!: string;
    public userId?: string;

    public countries: MiCloudRegions[] = countries;
    public locale = "ru"

    public get isLoggedIn(): boolean {
        return !!this.serviceToken && !!this.sSecurity && !!this.userId;
    }

    public async logIn(username: string, password: string): Promise<void> {
        if (this.isLoggedIn) {
            throw new Error("isLoggedInTrue");
        }

        const { sign } = await this.loginStep1();
        const { sSecurity, userId, location } = await this.loginStep2(username, password, sign);
        const { serviceToken } = await this.loginStep3(sign.indexOf('http') === -1 ? location : sign);

        this.sSecurity = sSecurity;
        this.userId = userId;
        this.serviceToken = serviceToken;
    }

    private async loginStep1() {
        const url = 'https://account.xiaomi.com/pass/serviceLogin?sid=xiaomiio&_json=true';
        const res = await fetch(url);

        const content = await res.text();
        const { statusText } = res;

        if (!res.ok) {
            throw new Error(`Response step 1 error with status ${statusText}`);
        }

        const data = parseJson(content);

        if (!data._sign) {
            throw new Error('loginStep1Failed');
        }

        return {
            sign: data._sign,
        };
    }

    private async loginStep2(username: string, password: string, sign: string) {
        const formData = querystring.stringify({
            hash: crypto
                .createHash('md5')
                .update(password)
                .digest('hex')
                .toUpperCase(),
            _json: 'true',
            sid: 'xiaomiio',
            callback: 'https://sts.api.io.mi.com/sts',
            qs: '%3Fsid%3Dxiaomiio%26_json%3Dtrue',
            _sign: sign,
            user: username,
        });

        const url = 'https://account.xiaomi.com/pass/serviceLoginAuth2';
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: [
                    'sdkVersion=accountsdk-18.8.15',
                    `deviceId=${this.clientId};`
                ].join('; '),
            },
        });

        const content = await res.text();
        const { statusText } = res;

        if (!res.ok) {
            throw new Error(`Response step 2 error with status ${statusText}`);
        }

        const { ssecurity: sSecurity, userId, location } = parseJson(content);

        if (!sSecurity || !userId || !location) {
            throw new Error('loginStep2Failed');
        }

        this.sSecurity = sSecurity;
        this.userId = userId;
        return {
            sSecurity,
            userId,
            location,
        };
    }

    private async loginStep3(url: string) {
        const res = await fetch(url);

        const { statusText } = res;

        if (!res.ok) {
            throw new Error(`Response step 3 error with status ${statusText}`);
        }

        const headers = res.headers.raw();
        const cookies = headers['set-cookie'];

        let serviceToken;

        cookies.forEach(cookieStr => {
            const cookie = cookieStr.split('; ')[0];
            const idx = cookie.indexOf('=');
            const key = cookie.substr(0, idx);
            const value = cookie.substr(idx + 1, cookie.length).trim();
            if (key === 'serviceToken') {
                serviceToken = value;
            }
        });

        if (!serviceToken) {
            throw new Error('loginStep3Failed');
        }

        return {
            serviceToken,
        };
    }
}

export * from "./defaults"
export * from "./interfaces"

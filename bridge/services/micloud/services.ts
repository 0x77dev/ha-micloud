import crypto from "crypto"
import { MiCloudRegions } from "./device";

export const parseJson = (str: string): any => {
    if (str.indexOf('&&&START&&&') === 0) {
        str = str.replace('&&&START&&&', '');
    }

    return JSON.parse(str);
}

export const generateSignature = (path: string, signedNonce: string, nonce: string, params: any): string => {
    const exps = [];
    exps.push(path);
    exps.push(signedNonce);
    exps.push(nonce);

    const paramKeys = Object.keys(params);
    paramKeys.sort();
    for (let i = 0, { length } = paramKeys; i < length; i++) {
        const key = paramKeys[i];
        exps.push(`${key}=${params[key]}`);
    }

    return crypto
        .createHmac('sha256', Buffer.from(signedNonce, 'base64'))
        .update(exps.join('&'))
        .digest('base64');
}

export const generateNonce = () => {
    const buf = Buffer.allocUnsafe(12);
    buf.write(crypto.randomBytes(8).toString('hex'), 0, 'hex');
    buf.writeInt32BE(parseInt((Date.now() / 60000).toString(), 10), 8);
    return buf.toString('base64');
}

export const generateSignedNonce = (sSecret: string, nonce: string): string => {
    const s = Buffer.from(sSecret, 'base64');
    const n = Buffer.from(nonce, 'base64');

    return crypto.createHash('sha256').update(s).update(n).digest('base64');
}

export const getApiUrl = (country: MiCloudRegions): string => {
    country = country.trim().toLowerCase();

    return `https://${country === 'cn' ? '' : `${country}.`}api.io.mi.com/app`;
}

import {
    Evaluation,
    Oprf, OPRFClient//, OPRFServer
} from '@cloudflare/voprf-ts';
// import { SecretKeyLoader } from './secretLoader';

const suite = Oprf.Suite.P384_SHA384;

// const loader = new SecretKeyLoader("./secrets/key.priv")
// const privateKey = await loader.getSecretKey();

// const server = new OPRFServer(suite, privateKey);

// client code

const client = new OPRFClient(suite);

const input = new TextEncoder().encode("This is the client's input");
const batch = [input];
const [finData, evalReq] = await client.blind(batch);

// server query
// console.log("req bute len:::", evalReq.serialize().byteLength);

const resp = await fetch("http://localhost:3000/upload-binary", {
    method: "POST",
    headers: {"Content-Type": "application/octet-stream"},
    body: evalReq.serialize()
})

console.log(evalReq.serialize());

const uint8array = new Uint8Array(await resp.arrayBuffer());
// console.log(uint8array.byteLength)
const evaluation = Evaluation.deserialize(suite, uint8array);

// Get output matching first input of batch
const [output] = await client.finalize(finData, evaluation);

console.log(output?.toHex());



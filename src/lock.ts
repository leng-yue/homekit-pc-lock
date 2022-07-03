import {
  Accessory,
  Categories,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Service,
  uuid
} from "hap-nodejs";
import { listSessions, lockSession, parseArgs, unlockSession } from "./utils";


const options = parseArgs();
const accessoryUUID = uuid.generate(options.name);
const accessory = new Accessory("HomeKit PC Lock", accessoryUUID);

const lockerService = new Service.Switch("HomeKit PC Lock");

let currentLocked = false;

const onCharacteristic = lockerService.getCharacteristic(Characteristic.On)!;

onCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  callback(undefined, currentLocked);
});

onCharacteristic.on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
  console.log(`${new Date().toLocaleString()} - Lock state changed to ${value}`);

  const currentLocked = value as boolean;
  const sessions = listSessions();
  for (const session of sessions) {
    if (currentLocked) {
      lockSession(session);
    } else {
      unlockSession(session);
    }
  }

  callback();
});

accessory.addService(lockerService);

accessory.publish({
  username: options.address,
  pincode: options.pincode,
  category: Categories.SWITCH,
});

console.log(`${new Date().toLocaleString()} - Accessory setup finished!`);
console.info(require("os").userInfo().username);

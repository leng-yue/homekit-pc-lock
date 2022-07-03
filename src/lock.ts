#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import {
  Accessory,
  Categories,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue, HAPStorage, Service,
  uuid
} from "hap-nodejs";
import os from "os";
import path from "path";
import { buildSystemctlService, listSessions, lockSession, parseArgs, unlockSession } from "./utils";

const main = () => {
  // Set storage path
  const homePath = os.homedir();
  HAPStorage.setCustomStoragePath(path.join(homePath, '.homekit-pc-lock'));

  // Set up accessory
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

  // Start server
  console.log(`${new Date().toLocaleString()} - Accessory setup finished!`);
  console.log(`${new Date().toLocaleString()} - Pincode: ${options.pincode}`);
  console.log(`${new Date().toLocaleString()} - Address: ${options.address}`);
  console.log(`${new Date().toLocaleString()} - Please use above pincode to pair with your Apple Home.`);
}

const install = () => {
  const service = buildSystemctlService(options);
  const tempPath = path.join(os.homedir(), ".homekit-pc-lock/homekit-pc-lock.service");
  const systemPath = "/etc/systemd/system/homekit-pc-lock.service";

  if (fs.existsSync(systemPath)) {
    console.error("Service already exists, please uninstall first.");
    process.exit(1);
  }

  fs.writeFileSync(tempPath, service);
  console.log(`Service file created at ${tempPath}`);
  console.log(`Copy service file to /etc/systemd/system/`);
  execSync(`sudo cp ${tempPath} ${systemPath}`);

  console.log(`Enable & start service`);
  execSync(`sudo systemctl daemon-reload`);
  execSync(`sudo systemctl enable homekit-pc-lock`);
  execSync(`sudo systemctl start homekit-pc-lock`);
  console.log(`Service enabled and started!`);
}

const uninstall = () => {
  const systemPath = "/etc/systemd/system/homekit-pc-lock.service";
  if (!fs.existsSync(systemPath)) {
    console.error(`Service ${systemPath} does not exist, nothing to uninstall.`);
    process.exit(1);
  }

  console.log(`Disable & stop service`);
  execSync(`sudo systemctl disable homekit-pc-lock`);
  execSync(`sudo systemctl stop homekit-pc-lock`);
  execSync(`sudo systemctl daemon-reload`);
  console.log(`Service disabled and stopped!`);
  console.log(`Remove service file`);
  execSync(`sudo rm ${systemPath}`);
}

const options = parseArgs();

if (options.install) {
  install();
} else if (options.uninstall) {
  uninstall();
} else {
  main();
}

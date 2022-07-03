import { execSync } from "child_process";
import { Command } from "commander";
import { userInfo } from "os";
import path from "path";

export const listSessions = () => {
    const stdout = execSync("loginctl list-sessions").toString();
    const lines = stdout.split("\n");

    const sessionIds = [];
    for (const line of lines) {
        if (line.includes("SESSION") || line.includes("sessions listed")) {
            continue;
        }
        const parts = line.trim().split(" ");
        if (parts.length < 2) {
            continue;
        }

        sessionIds.push(parts[0]);
    }

    return sessionIds;
}

export const lockSession = (sessionId: string) => {
    execSync(`loginctl lock-session ${sessionId}`);
}

export const unlockSession = (sessionId: string) => {
    execSync(`loginctl unlock-session ${sessionId}`);
}

type Options = {
    name: string;
    address: string;
    pincode: string;
    install: boolean;
    uninstall: boolean;
}

export const parseArgs = (): Options => {
    const program = new Command();
    program
        .name("HomeKit PC Lock")
        .option('--name <string>', 'A unique name used to generate a UUID for the accessory.', 'lengyue.pc.lock')
        .option('--address <string>', 'The address of the accessory.', '07:AD:1F:64:A4:B9')
        .option('--pincode <string>', 'The pincode of the accessory.', '892-05-133')
        .option('--install', 'Install as system service.', false)
        .option('--uninstall', 'Uninstall system service.', false)
        .parse();

    const options: Options = program.opts();

    options.address = options.address.toUpperCase();

    if (!options.address.match(/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/)) {
        console.error("Invalid MAC address, must be in the format: XX:XX:XX:XX:XX:XX");
        process.exit(1);
    }

    if (!options.pincode.match(/^[0-9]{3}-[0-9]{2}-[0-9]{3}$/)) {
        console.error("Invalid pincode, must be in the format: XXX-XX-XXX");
        process.exit(1);
    }

    if (options.install && options.uninstall) {
        console.error("Cannot install and uninstall at the same time.");
        process.exit(1);
    }

    return options;
}

export const buildSystemctlService = (options: Options) => {
    const currentUser = userInfo().username;
    const nodePath = execSync(`which node`).toString().trim();
    const execPath = path.join(__dirname, "lock.js");
    const args = `--name ${options.name} --address ${options.address} --pincode ${options.pincode}\n`;

    const service = "[Unit]\n" +
        "Description=HomeKit PC Locker\n" +
        "After=network.target\n\n" +
        "[Service]\n" +
        "Type=simple\n" +
        `User=${currentUser}\n` +
        `ExecStart=${nodePath} ${execPath} ${args}` +
        "Restart=always\n" +
        "RestartSec=10s\n\n" +
        "[Install]\n" +
        "WantedBy=multi-user.target\n";
    
    return service;
}

import { execSync } from "child_process";
import { Command } from "commander";


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

export const parseArgs = () => {
    const program = new Command();
    program
        .name("HomeKit PC Lock")
        .option('--name <string>', 'A unique name used to generate a UUID for the accessory.', 'lengyue.pc.lock')
        .option('--address <string>', 'The address of the accessory.', '07:AD:1F:64:A4:B9')
        .option('--pincode <string>', 'The pincode of the accessory.', '892-05-133');

    program.parse();
    const options = program.opts();

    options.address = options.address.toUpperCase();

    if (!options.address.match(/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/)) {
        console.error("Invalid MAC address, must be in the format: XX:XX:XX:XX:XX:XX");
        process.exit(1);
    }

    if (!options.pincode.match(/^[0-9]{3}-[0-9]{2}-[0-9]{3}$/)) {
        console.error("Invalid pincode, must be in the format: XXX-XX-XXX");
        process.exit(1);
    }

    return options;
}
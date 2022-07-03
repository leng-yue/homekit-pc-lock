# HomeKit PC Lock
<p>
    <a href="https://www.npmjs.com/package/homekit-pc-lock" target="_blank">
        <img src="https://img.shields.io/npm/v/homekit-pc-lock" />
    </a>
    <a href="https://github.com/leng-yue/homekit-pc-lock/settings/actions/workflows/ci.yml" target="_blank">
        <img src="https://img.shields.io/github/workflow/status/leng-yue/bluetooth-locker/CI" />
    </a>
    <a href="https://www.npmjs.com/package/homekit-pc-lock" target="_blank">
        <img src="https://img.shields.io/node/v/homekit-pc-lock" />
    </a>
    <img src="https://img.shields.io/github/license/leng-yue/homekit-pc-lock" />
    <a href="https://www.npmjs.com/package/homekit-pc-lock" target="_blank">
        <img src="https://img.shields.io/npm/dt/homekit-pc-lock" />
    </a>
</p>

A simple pc lock connected to your apple home

## Basic Usage
```shell
# Install
npm install -g homekit-pc-lock

# Run
homekit-pc-lock
# -> Accessory setup finished!
# -> Pincode: 892-05-133
```

Now, you can pair your Apple Home with this pincode. 

## Install as service
```shell
# Install service
homekit-pc-lock --install

# Uninstall service
homekit-pc-lock --uninstall
```

## Customize address and pincode
```
# Address
homekit-pc-lock --address 07:AD:1F:64:A4:B9

# PinCode
homekit-pc-lock --pincode 892-05-133
```

For more options, please check `homekit-pc-lock --help`

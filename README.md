# HomeKit PC Lock
<p>
    <a href="https://github.com/leng-yue/homekit-pc-lock/actions/workflows/ci.yml" target="_blank">
        <img src="https://img.shields.io/github/workflow/status/leng-yue/homekit-pc-lock/CI" />
    </a>
    <img src="https://img.shields.io/github/go-mod/go-version/leng-yue/homekit-pc-lock" />
</p>

A light weight, stable, and high performance HomeKit PC Lock built with GO

## Basic Usage
```shell
# Run
homekit-pc-lock
# -> Name: HomeKit PC Lock
# -> Pincode: 32191123
```

Now, you can pair your Apple Home with this pincode. 

## Install as service
```shell
# Install service
homekit-pc-lock --install

# Uninstall service
homekit-pc-lock --uninstall
```

## Customize pincode
```
# PinCode
homekit-pc-lock --pincode 892-05-133
```

For more options, please check `homekit-pc-lock --help`

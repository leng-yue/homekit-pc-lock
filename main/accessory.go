package main

import (
	"log"
	"regexp"

	"github.com/brutella/hc"
	"github.com/brutella/hc/accessory"
)

func startAccessory() {
	// Check if the pincode is valid
	_, e := regexp.MatchString(*pincode, "^[0-9]{8}$")
	if e != nil {
		log.Fatal("Invalid pincode, must be 8 digits")
	}

	// Create the lock accessory
	info := accessory.Info{
		Name:         *name,
		Manufacturer: "Lengyue <lengyue@lengyue.me>",
	}

	acc := accessory.NewSwitch(info)

	acc.Switch.On.OnValueRemoteUpdate(func(on bool) {
		for _, sessionId := range listSessions() {
			if on {
				log.Println("Locking session", sessionId)
				lockSession(sessionId)
			} else {
				log.Println("Unlocking session", sessionId)
				unlockSession(sessionId)
			}
		}
	})

	config := hc.Config{Pin: *pincode, StoragePath: *storagePath}

	t, err := hc.NewIPTransport(config, acc.Accessory)
	if err != nil {
		log.Fatal(err)
	}

	hc.OnTermination(func() {
		<-t.Stop()
	})

	t.Start()
}

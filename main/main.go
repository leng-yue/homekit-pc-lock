package main

import (
	"flag"
	"log"
	"os"
	"path"
)

var (
	name        *string
	pincode     *string
	storagePath *string
	install     *bool
	uninstall   *bool
)

func init() {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}

	name = flag.String("name", "HomeKit PC Lock", "name of the accessory")
	pincode = flag.String("pincode", "37191166", "pincode for the accessory")
	storagePath = flag.String("storage-path", path.Join(homeDir, ".homekit-pc-lock"), "path to store accessary data")

	install = flag.Bool("install", false, "install the service")
	uninstall = flag.Bool("uninstall", false, "uninstall the service")

	flag.Parse()

	if *install && *uninstall {
		log.Fatal("Only one of --install or --uninstall can be used")
	}

	if _, err := os.Stat(*storagePath); os.IsNotExist(err) {
		err = os.MkdirAll(*storagePath, 0755)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func main() {
	log.Println("Starting HomeKit PC Lock")
	log.Println("Name:", *name)
	log.Println("Pincode:", *pincode)
	log.Println("Storage:", *storagePath)

	if *install {
		installService()
	} else if *uninstall {
		uninstallService()
	} else {
		startAccessory()
	}
}

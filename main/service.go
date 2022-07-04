package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"os/user"
	"path"
)

func installService() {
	systemPath := "/etc/systemd/system/homekit-pc-lock.service"

	if _, err := os.Stat(systemPath); err == nil {
		log.Fatal("Service already exists, please uninstall first.")
	}

	// Copy create executable to current user's home directory
	srcPath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}
	src, err := os.Open(srcPath)
	if err != nil {
		log.Fatal(err)
	}
	defer src.Close()

	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}
	destPath := path.Join(homeDir, ".homekit-pc-lock", "bin")

	dest, err := os.Create(destPath)
	if err != nil {
		log.Fatal(err)
	}
	defer dest.Close()

	log.Println("Copying executable from", srcPath, "to", destPath)

	_, err = io.Copy(dest, src)
	if err != nil {
		log.Fatal(err)
	}

	// Set executable permissions
	os.Chmod(destPath, 0755)

	fmt.Println("Executable copied to", destPath)

	// Generate service file
	currentUser, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}

	username := currentUser.Username

	serviceString := fmt.Sprintf("[Unit]\n"+
		"Description=HomeKit PC Locker\n"+
		"After=network.target\n\n"+
		"[Service]\n"+
		"Type=simple\n"+
		"User=%s\n"+
		"ExecStart=%s --name %s --pincode %s --storage-path %s\n"+
		"Restart=always\n"+
		"RestartSec=10s\n\n"+
		"[Install]\n"+
		"WantedBy=multi-user.target\n",
		username,
		destPath,
		*name,
		*pincode,
		*storagePath,
	)

	tempPath := path.Join(homeDir, ".homekit-pc-lock", "homekit-pc-lock.service")
	err = ioutil.WriteFile(tempPath, []byte(serviceString), 0644)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Service file created at", tempPath)
	log.Println("Copy service file to /etc/systemd/system/")
	exec.Command("sudo", "cp", tempPath, systemPath).Run()

	log.Println("Enable & start service")
	exec.Command("sudo", "systemctl", "daemon-reload").Run()
	exec.Command("sudo", "systemctl", "enable", "homekit-pc-lock").Run()
	exec.Command("sudo", "systemctl", "start", "homekit-pc-lock").Run()
	log.Println("Service enabled and started!")
}

func uninstallService() {
	systemPath := "/etc/systemd/system/homekit-pc-lock.service"

	if _, err := os.Stat(systemPath); err != nil {
		log.Fatal("Service does not exist, nothing to uninstall.")
	}

	log.Println("Disable & stop service")
	exec.Command("sudo", "systemctl", "disable", "homekit-pc-lock").Run()
	exec.Command("sudo", "systemctl", "stop", "homekit-pc-lock").Run()

	log.Println("Remove service file")
	exec.Command("sudo", "rm", systemPath).Run()
	exec.Command("sudo", "systemctl", "daemon-reload").Run()
}

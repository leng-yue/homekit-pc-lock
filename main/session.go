package main

import (
	"log"
	"os/exec"
	"strings"
)

func listSessions() []string {
	out, err := exec.Command("loginctl", "list-sessions").Output()
	if err != nil {
		log.Fatal(err)
	}
	stdout := string(out)
	lines := strings.Split(stdout, "\n")
	sessionIds := []string{}

	for _, line := range lines {
		if strings.Contains(line, "SESSION") || strings.Contains(line, "sessions listed") {
			continue
		}
		var parts []string = strings.Split(strings.Trim(line, " "), " ")
		if len(parts) < 2 {
			continue
		}
		sessionIds = append(sessionIds, parts[0])
	}

	return sessionIds
}

func lockSession(sessionId string) {
	exec.Command("loginctl", "lock-session", sessionId).Run()
}

func unlockSession(sessionId string) {
	exec.Command("loginctl", "unlock-session", sessionId).Run()
}

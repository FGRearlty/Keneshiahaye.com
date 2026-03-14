@echo off
:: Start n8n for Keneshia Haye content automation
:: Runs at http://localhost:5678
:: Double-click this file or add to Windows startup folder to auto-run

set PATH=C:\Program Files\nodejs;C:\Users\Jutsu\AppData\Roaming\npm;%PATH%

echo Starting n8n...
echo Dashboard will be available at: http://localhost:5678
echo.
echo Press Ctrl+C to stop n8n.
echo.

n8n start

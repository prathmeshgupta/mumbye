@echo off
title Mumbye: Maximum City (Godot 4.3 Native)
echo ===================================================
echo     MUMBYE: MAXIMUM CITY - 3D NATIVE EDITION
echo ===================================================
if not exist "%~dp0tools\godot\Godot_v4.3-stable_win64.exe" (
    echo Engine binary missing. Installing Godot 4.3...
    powershell -ExecutionPolicy Bypass -File "%~dp0tools\setup_godot.ps1"
)
echo Starting high-performance GPU hardware rendering...
echo Controls:
echo   WASD / Arrows : Move / Steer
echo   Shift         : Sprint
echo   Space         : Jump / Handbrake Drift
echo   E             : Enter / Exit Kaali-Peeli Taxi or Rickshaw
echo   LMB / F       : Fire / Melee Attack
echo   RMB           : Over-the-shoulder Aiming
echo   Q / Tab       : Cycle Weapons (Fists, Bat, 9mm, SMG)
echo   H             : Horn
echo   L             : Headlights
echo   R             : Radio Stations
echo   Esc           : Pause / Release Mouse
echo ===================================================
start "" "%~dp0tools\godot\Godot_v4.3-stable_win64.exe" --path "%~dp0godot"

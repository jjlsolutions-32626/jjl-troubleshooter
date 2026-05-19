; JJL Troubleshooter custom NSIS macros.
;
; Sets the installed executable to always require admin via the Windows
; AppCompatFlags\Layers registry key. After install, every launch of the
; app pops UAC automatically — no in-app "Restart as Admin" needed.
;
; Registry value "~ RUNASADMIN" is the documented Microsoft compatibility
; layer for "always run as administrator". Stored in HKLM since we install
; per-machine (perMachine=true) — applies to all users on the box.

!macro customInstall
  WriteRegStr HKLM "Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\${APP_FILENAME}.exe" "~ RUNASADMIN"
!macroend

!macro customUnInstall
  DeleteRegValue HKLM "Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\${APP_FILENAME}.exe"
!macroend

!addplugindir /x86-unicode "${PROJECT_DIR}\build\win\x86-unicode\"
!addplugindir /x86-ansi "${PROJECT_DIR}\build\win\x86-ansi\"

showinstdetails show
showuninstdetails show

!macro customInstall
  SimpleSC::InstallService "TermiPass" "TermiPassService" "16" "2" "$INSTDIR\tailscaled.exe -no-logs-no-support" "" "" ""
  Pop $0
  ${If} $0 <> 0
    Push $0
    SimpleSC::GetErrorMessage
    Pop $0
    MessageBox MB_OK|MB_ICONSTOP "InstallService - $0"
  ${EndIf}

  SimpleSC::StartService "TermiPass" "" 30
  Pop $0
  ${If} $0 <> 0
    Push $0
    SimpleSC::GetErrorMessage
    Pop $0
    MessageBox MB_OK|MB_ICONSTOP "StartService - $0"
  ${EndIf}

  SimpleSC::SetServiceDescription "TermiPass" "Connects this computer to others on the TermiPass network."
  Pop $0
!macroend

!include LogicLib.nsh

!macro stopAndUninstallService serviceName
  SetDetailsView show
  DetailPrint "Hello ${serviceName}"

	SimpleSC::ExistsService "${serviceName}"
  Pop $0
	${If} $0 = 0
	  SimpleSC::ServiceIsRunning "${serviceName}"
	  Pop $0
	  Pop $1
	  ${If} $1 = 0
		  goto RemoveService
	  ${Else}
		  SimpleSC::StopService "${serviceName}" 1 30
      Pop $0
      ${If} $0 <> 0
        Push $0
        SimpleSC::GetErrorMessage
        Pop $0
        MessageBox MB_OK|MB_ICONSTOP "Stopping - $0"
      ${EndIf}
	  ${EndIf}

	  RemoveService:
	  SimpleSC::RemoveService "${serviceName}"
    Pop $0
    ${If} $0 <> 0
      Push $0
      SimpleSC::GetErrorMessage
      Pop $0
      MessageBox MB_OK|MB_ICONSTOP "RemoveService - $0"
    ${EndIf}
	${EndIf}
  SetDetailsView hide
!macroEnd

!macro customUnInstall
  !insertmacro stopAndUninstallService "TermiPass"

  Delete "$INSTDIR\tailscaled.exe"
  Delete "$INSTDIR\wintun.dll"

  SetOutPath "$TEMP"
  RMDir "$INSTDIR"
!macroend

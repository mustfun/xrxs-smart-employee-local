; XRXS AI - NSIS Installer Hooks
; 安装时注册 Windows 资源管理器右键菜单，卸载时清理

!macro NSIS_HOOK_POSTINSTALL
  ; 右键文件夹 → "Open with XRXS AI"
  WriteRegStr HKCU "Software\Classes\Directory\shell\XRXSAI" "" "Open with XRXS AI"
  WriteRegStr HKCU "Software\Classes\Directory\shell\XRXSAI" "Icon" "$INSTDIR\${MAINBINARYNAME}.exe"
  WriteRegStr HKCU "Software\Classes\Directory\shell\XRXSAI\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%V"'

  ; 右键文件夹空白处 → "Open with XRXS AI"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\XRXSAI" "" "Open with XRXS AI"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\XRXSAI" "Icon" "$INSTDIR\${MAINBINARYNAME}.exe"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\XRXSAI\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%V"'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DeleteRegKey HKCU "Software\Classes\Directory\shell\XRXSAI"
  DeleteRegKey HKCU "Software\Classes\Directory\Background\shell\XRXSAI"
!macroend

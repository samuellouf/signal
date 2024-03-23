import { MenuItemConstructorOptions, app } from "electron"

const isMac = process.platform === "darwin"

export interface MenuTemplateProps {
  onClickNew: () => void
  onClickOpen: () => void
  onClickSave: () => void
  onClickSaveAs: () => void
  onClickSetting: () => void
  onClickHelp: () => void
}

export const menuTemplate = ({
  onClickNew,
  onClickOpen,
  onClickSave,
  onClickSaveAs,
  onClickSetting,
  onClickHelp,
}: MenuTemplateProps): MenuItemConstructorOptions[] => [
  // { role: 'appMenu' }
  ...((isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            {
              label: "Settings",
              click: onClickSetting,
            },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []) as MenuItemConstructorOptions[]),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      { label: "New", accelerator: "CmdOrCtrl+N", click: onClickNew },
      { label: "Open", accelerator: "CmdOrCtrl+O", click: onClickOpen },
      { label: "Save", accelerator: "CmdOrCtrl+S", click: onClickSave },
      {
        label: "Save As",
        accelerator: "CmdOrCtrl+Shift+S",
        click: onClickSaveAs,
      },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ] as MenuItemConstructorOptions[],
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...((isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [
            { role: "delete" },
            { type: "separator" },
            { role: "selectAll" },
          ]) as MenuItemConstructorOptions[]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...((isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "close" }]) as MenuItemConstructorOptions[]),
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Help",
        click: onClickHelp,
      },
    ],
  },
]

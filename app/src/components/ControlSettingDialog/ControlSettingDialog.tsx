import { arrayMove } from "@dnd-kit/sortable"
import styled from "@emotion/styled"
import { range } from "lodash"
import ChevronDoubleLeftIcon from "mdi-react/ChevronDoubleLeftIcon"
import ChevronDoubleRightIcon from "mdi-react/ChevronDoubleRightIcon"
import { observer } from "mobx-react-lite"
import { useCallback, useState } from "react"
import { useStores } from "../../hooks/useStores"
import { Localized } from "../../localize/useLocalization"
import {
  ControlMode,
  controlModeKey,
  defaultControlModes,
  isEqualControlMode,
} from "../../stores/ControlStore"
import { ControlName } from "../ControlPane/ControlName"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../Dialog/Dialog"
import { Button } from "../ui/Button"
import { DraggableList } from "./DraggableList"

const nonControllerControlModes: ControlMode[] = [
  {
    type: "velocity",
  },
  {
    type: "pitchBend",
  },
]

const getAllControlModes = (): ControlMode[] =>
  nonControllerControlModes.concat(
    range(0, 128).map((i) => ({ type: "controller", controllerType: i })),
  )

const Item = styled.div<{ isSelected: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.themeColor : "transparent"};
  white-space: nowrap;
`

const Content = styled.div`
  max-height: 30rem;
  display: flex;
`

const Pane = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  overflow: auto;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
`

const CenterPane = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const InsertButton = styled(Button)`
  background: ${({ theme }) => theme.secondaryBackgroundColor};
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  min-width: 7rem;
  justify-content: center;
`

export const ControlSettingDialog = observer(() => {
  const { rootViewStore, controlStore } = useStores()
  const { openControlSettingDialog: open } = rootViewStore
  const [selectedLeftMode, setSelectedLeftMode] = useState<ControlMode | null>(
    null,
  )
  const [selectedRightMode, setSelectedRightMode] =
    useState<ControlMode | null>(null)

  const leftModes = controlStore.controlModes

  const rightModes = getAllControlModes().filter(
    (mode) =>
      !controlStore.controlModes.some((m) => isEqualControlMode(m, mode)),
  )

  const leftItems = leftModes.map((mode) => ({
    mode,
    isSelected:
      selectedLeftMode !== null && isEqualControlMode(mode, selectedLeftMode),
  }))

  const rightItems = rightModes.map((mode) => ({
    mode,
    isSelected:
      selectedRightMode !== null && isEqualControlMode(mode, selectedRightMode),
  }))

  const onClose = useCallback(
    () => (rootViewStore.openControlSettingDialog = false),
    [rootViewStore],
  )

  const onClickAdd = () => {
    if (selectedRightMode) {
      controlStore.controlModes.push(selectedRightMode)
      setSelectedRightMode(null)
    }
  }

  const onClickRemove = () => {
    if (selectedLeftMode) {
      controlStore.controlModes = controlStore.controlModes.filter(
        (mode) => !isEqualControlMode(mode, selectedLeftMode),
      )
      setSelectedLeftMode(null)
    }
  }

  const onLeftItemMoved = (fromId: string, toId: string) => {
    const fromIndex = leftItems.findIndex(
      (item) => controlModeKey(item.mode) === fromId,
    )
    const toIndex = leftItems.findIndex(
      (item) => controlModeKey(item.mode) === toId,
    )
    if (fromIndex === -1 || toIndex === -1) {
      return
    }
    controlStore.controlModes = arrayMove(
      controlStore.controlModes,
      fromIndex,
      toIndex,
    )
  }

  const onClickRestoreDefaults = () => {
    controlStore.controlModes = defaultControlModes
  }

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ maxWidth: "40rem" }}>
      <DialogTitle>
        <Localized name="control-settings" />
      </DialogTitle>
      <DialogContent>
        <Content>
          <Pane>
            <DraggableList
              items={leftItems}
              getItemId={(item) => controlModeKey(item.mode)}
              onItemMoved={onLeftItemMoved}
              render={(item) => (
                <Item
                  key={controlModeKey(item.mode)}
                  isSelected={item.isSelected}
                  onClick={() => {
                    setSelectedLeftMode(item.mode)
                    setSelectedRightMode(null)
                  }}
                >
                  <ControlName mode={item.mode} />
                </Item>
              )}
            />
          </Pane>
          <CenterPane>
            <InsertButton onClick={onClickAdd}>
              <ChevronDoubleLeftIcon style={{ width: "1.25rem" }} /> Add
            </InsertButton>
            <InsertButton onClick={onClickRemove}>
              Remove <ChevronDoubleRightIcon style={{ width: "1.25rem" }} />
            </InsertButton>
          </CenterPane>
          <Pane>
            {rightItems.map((item) => (
              <Item
                key={controlModeKey(item.mode)}
                isSelected={item.isSelected}
                onClick={() => {
                  setSelectedLeftMode(null)
                  setSelectedRightMode(item.mode)
                }}
              >
                <ControlName mode={item.mode} />
              </Item>
            ))}
          </Pane>
        </Content>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickRestoreDefaults}>
          <Localized name="restore-defaults" />
        </Button>
        <div style={{ flex: 1 }} />
        <Button onClick={onClose}>
          <Localized name="close" />
        </Button>
      </DialogActions>
    </Dialog>
  )
})

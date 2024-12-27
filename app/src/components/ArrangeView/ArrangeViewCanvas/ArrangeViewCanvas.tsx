import { useTheme } from "@emotion/react"
import { GLCanvas, Transform } from "@ryohey/webgl-react"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useMemo } from "react"
import {
  useArrangeEndSelection,
  useArrangeResizeSelection,
} from "../../../actions"
import { Point } from "../../../entities/geometry/Point"
import { Rect } from "../../../entities/geometry/Rect"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { getClientPos } from "../../../helpers/mouseEvent"
import { observeDrag } from "../../../helpers/observeDrag"
import { AbstractMouseEvent } from "../../../hooks/useContextMenu"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLNodes/Beats"
import { Cursor } from "../../GLNodes/Cursor"
import { Selection } from "../../GLNodes/Selection"
import { Lines } from "./Lines"
import { Notes } from "./Notes"
import { useMoveSelectionGesture } from "./gestures/useMoveSelectionGesture"

export interface ArrangeViewCanvasProps {
  width: number
  onContextMenu: (e: AbstractMouseEvent) => void
}

export const ArrangeViewCanvas: FC<ArrangeViewCanvasProps> = observer(
  ({ width, onContextMenu }) => {
    const { arrangeViewStore, player, pushHistory } = useStores()
    const theme = useTheme()
    const {
      scrollLeft,
      scrollTop,
      contentHeight: height,
      rulerStore: { beats },
      cursorX,
      selection,
      selectionRect,
      trackTransform,
    } = arrangeViewStore

    const moveSelectionGesture = useMoveSelectionGesture()
    const arrangeEndSelection = useArrangeEndSelection()
    const arrangeResizeSelection = useArrangeResizeSelection()

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft],
    )

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop],
    )

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop],
    )

    const setScrollLeft = useCallback((v: number) => {
      arrangeViewStore.setScrollLeftInPixels(v)
      arrangeViewStore.autoScroll = false
    }, [])
    const setScrollTop = useCallback(
      (v: number) => arrangeViewStore.setScrollTop(v),
      [],
    )

    const handleLeftClick = useCallback(
      (e: React.MouseEvent) => {
        const startPosPx: Point = {
          x: e.nativeEvent.offsetX + scrollLeft,
          y: e.nativeEvent.offsetY + scrollTop,
        }
        const startClientPos = getClientPos(e.nativeEvent)

        const isSelectionSelected =
          selectionRect != null && Rect.containsPoint(selectionRect, startPosPx)

        if (isSelectionSelected) {
          moveSelectionGesture.onMouseDown(e, startClientPos, selectionRect)
        } else {
          const startPos = trackTransform.getArrangePoint(startPosPx)
          arrangeViewStore.resetSelection()

          if (!player.isPlaying) {
            player.position = arrangeViewStore.quantizer.round(startPos.tick)
          }

          arrangeViewStore.selectedTrackIndex = Math.floor(startPos.trackIndex)

          observeDrag({
            onMouseMove: (e) => {
              const deltaPx = Point.sub(getClientPos(e), startClientPos)
              const selectionToPx = Point.add(startPosPx, deltaPx)
              arrangeResizeSelection(
                startPos,
                trackTransform.getArrangePoint(selectionToPx),
              )
            },
            onMouseUp: (e) => {
              arrangeEndSelection()
            },
          })
        }
      },
      [
        selection,
        trackTransform,
        scrollLeft,
        scrollTop,
        moveSelectionGesture,
        arrangeEndSelection,
        arrangeResizeSelection,
        player,
        pushHistory,
      ],
    )

    const handleMiddleClick = useCallback(
      (e: React.MouseEvent) => {
        function createPoint(e: MouseEvent) {
          return { x: e.clientX, y: e.clientY }
        }
        const startPos = createPoint(e.nativeEvent)

        observeDrag({
          onMouseMove(e) {
            const pos = createPoint(e)
            const delta = Point.sub(pos, startPos)
            setScrollLeft(Math.max(0, scrollLeft - delta.x))
            setScrollTop(Math.max(0, scrollTop - delta.y))
          },
        })
      },
      [scrollLeft, scrollTop],
    )

    const onMouseDown = useCallback(
      (e: React.MouseEvent) => {
        switch (e.button) {
          case 0:
            handleLeftClick(e)
            break
          case 1:
            handleMiddleClick(e)
            break
          case 2:
            onContextMenu(e)
            break
          default:
            break
        }
      },
      [handleLeftClick, handleMiddleClick, onContextMenu],
    )

    return (
      <GLCanvas
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onContextMenu={useCallback((e: any) => e.preventDefault(), [])}
        style={{ backgroundColor: theme.editorBackgroundColor }}
      >
        <Transform matrix={scrollYMatrix}>
          <Lines width={width} zIndex={0} />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <Beats height={height} beats={beats} zIndex={1} />
          <Cursor x={cursorX} height={height} zIndex={4} />
        </Transform>
        <Transform matrix={scrollXYMatrix}>
          <Notes zIndex={2} />
          <Selection rect={selectionRect} zIndex={3} />
        </Transform>
      </GLCanvas>
    )
  },
)

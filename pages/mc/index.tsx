import React, {useCallback, useEffect, useRef, useState} from 'react';
import {coordinateGetter as multipleContainersCoordinateGetter} from '../../dnd-kit/sensors/multipleContainersKeyboardCoordinates';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import {IPropsMultiContainer} from '../../styles/prop.type';
import {createRange} from '../../dnd-kit/utilities/createRange';
import {
  closestCenter,
  CollisionDetection,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  KeyboardSensor,
  DndContext,
  useSensors,
  getFirstCollision
} from '@dnd-kit/core';
import {createPortal, unstable_batchedUpdates} from 'react-dom';
import {Item} from '../../dnd-kit/components/Item';
import {Container} from '../../dnd-kit/components/container';
import {dropAnimation} from '../../dnd-kit/utilities/drop-animation';
import {empty, PLACEHOLDER_ID, TRASH_ID} from '../../dnd-kit/utilities/constant';
import {Items} from '../../dnd-kit/types/type';
import SortableItem from '../../dnd-kit/components/sortable-item';
import getColor from '../../dnd-kit/utilities/get-color';
import DroppableContainer from '../../dnd-kit/components/droppable-container';

export default function MultipleContainers({
  adjustScale = false,
  itemCount = 3, // Số lượng item Count trong mỗi hàng
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable
}: IPropsMultiContainer) {
  // items này chính là dữ liệu để đưa ra 3 cột nè
  const [items, setItems] = useState<Items>(
    () =>
      initialItems ?? {
        A: createRange(itemCount, index => `A${index + 1}`),
        B: createRange(itemCount, index => `B${index + 1}`),
        C: createRange(itemCount, index => `C${index + 1}`)
        // D: createRange(itemCount, index => `D${index + 1}`)
      }
  );
  // console.log(Object.keys(items));

  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
    // Object keys là số lượng cột nhan
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    args => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => container.id in items)
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container => container.id !== overId && containerItems.includes(container.id)
              )
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{id: overId}];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{id: lastOverId.current}] : [];
    },
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find(key => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  const [isDocument, setIsDocument] = useState<Boolean>(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
    if (typeof window !== 'undefined') setIsDocument(true);
  }, [items]);
  // if (typeof window === undefined) return <>ABCD</>;
  if (!isDocument) return <p>Please waiting for Loading DND-KIT Multi column</p>;

  if (isDocument)
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        onDragStart={({active}) => {
          setActiveId(active.id);
          setClonedItems(items);
        }}
        onDragOver={({active, over}) => {
          const overId = over?.id;

          if (overId == null || overId === TRASH_ID || active.id in items) {
            return;
          }

          const overContainer = findContainer(overId);
          const activeContainer = findContainer(active.id);

          if (!overContainer || !activeContainer) {
            return;
          }

          if (activeContainer !== overContainer) {
            setItems(items => {
              const activeItems = items[activeContainer];
              const overItems = items[overContainer];
              const overIndex = overItems.indexOf(overId);
              const activeIndex = activeItems.indexOf(active.id);

              let newIndex: number;

              if (overId in items) {
                newIndex = overItems.length + 1;
              } else {
                const isBelowOverItem =
                  over &&
                  active.rect.current.translated &&
                  active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
              }

              recentlyMovedToNewContainer.current = true;

              return {
                ...items,
                [activeContainer]: items[activeContainer].filter(item => item !== active.id),
                [overContainer]: [
                  ...items[overContainer].slice(0, newIndex),
                  items[activeContainer][activeIndex],
                  ...items[overContainer].slice(newIndex, items[overContainer].length)
                ]
              };
            });
          }
        }}
        onDragEnd={({active, over}) => {
          if (active.id in items && over?.id) {
            setContainers(containers => {
              const activeIndex = containers.indexOf(active.id);
              const overIndex = containers.indexOf(over.id);

              return arrayMove(containers, activeIndex, overIndex);
            });
          }

          const activeContainer = findContainer(active.id);

          if (!activeContainer) {
            setActiveId(null);
            return;
          }

          const overId = over?.id;

          if (overId == null) {
            setActiveId(null);
            return;
          }

          if (overId === TRASH_ID) {
            setItems(items => ({
              ...items,
              [activeContainer]: items[activeContainer].filter(id => id !== activeId)
            }));
            setActiveId(null);
            return;
          }

          if (overId === PLACEHOLDER_ID) {
            const newContainerId = getNextContainerId();

            unstable_batchedUpdates(() => {
              setContainers(containers => [...containers, newContainerId]);
              setItems(items => ({
                ...items,
                [activeContainer]: items[activeContainer].filter(id => id !== activeId),
                [newContainerId]: [active.id]
              }));
              setActiveId(null);
            });
            return;
          }

          const overContainer = findContainer(overId);

          if (overContainer) {
            const activeIndex = items[activeContainer].indexOf(active.id);
            const overIndex = items[overContainer].indexOf(overId);

            if (activeIndex !== overIndex) {
              setItems(items => ({
                ...items,
                [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
              }));
            }
          }

          setActiveId(null);
        }}
        cancelDrop={cancelDrop}
        onDragCancel={onDragCancel}
        modifiers={modifiers}>
        <div
          style={{
            display: 'inline-grid',
            boxSizing: 'border-box',
            padding: 20,
            gridAutoFlow: vertical ? 'row' : 'column'
          }}>
          <SortableContext
            items={[...containers, PLACEHOLDER_ID]}
            strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}>
            {containers.map(containerId => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => handleRemove(containerId)}>
                <SortableContext items={items[containerId]} strategy={strategy}>
                  {items[containerId].map((value, index) => {
                    return (
                      <SortableItem
                        disabled={isSortingContainer}
                        key={value}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        getIndex={getIndex}
                      />
                    );
                  })}
                </SortableContext>
              </DroppableContainer>
            ))}
            {minimal ? undefined : (
              <DroppableContainer
                id={PLACEHOLDER_ID}
                disabled={isSortingContainer}
                items={empty}
                onClick={handleAddColumn}
                placeholder>
                + Add column
              </DroppableContainer>
            )}
          </SortableContext>
        </div>
        {createPortal(
          <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
            {activeId
              ? containers.includes(activeId)
                ? renderContainerDragOverlay(activeId)
                : renderSortableItemDragOverlay(activeId)
              : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({index: 0})}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Column ${containerId}`}
        columns={columns}
        style={{
          height: '100%'
        }}
        shadow
        unstyled={false}>
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false
            })}
            color={getColor(item)}
            wrapperStyle={wrapperStyle({index})}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setContainers(containers => containers.filter(id => id !== containerID));
  }

  function handleAddColumn() {
    const newContainerId = getNextContainerId();

    unstable_batchedUpdates(() => {
      setContainers(containers => [...containers, newContainerId]);
      setItems(items => ({
        ...items,
        [newContainerId]: []
      }));
    });
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}

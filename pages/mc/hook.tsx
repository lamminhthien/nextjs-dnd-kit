import {defaultDropAnimationSideEffects, DropAnimation, UniqueIdentifier} from '@dnd-kit/core';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {Container, ContainerProps} from '../../components/Container';
import {CSS} from '@dnd-kit/utilities';
import {useEffect, useState} from 'react';
import {Item} from '../../components/Item';

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

const animateLayoutChanges: AnimateLayoutChanges = args => defaultAnimateLayoutChanges({...args, wasDragging: true});
const empty: UniqueIdentifier[] = [];

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const {active, attributes, isDragging, listeners, over, setNodeRef, transition, transform} = useSortable({
    id,
    data: {
      type: 'container',
      children: items
    },
    animateLayoutChanges
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners
      }}
      columns={columns}
      {...props}>
      {children}
    </Container>
  );
}

function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case 'A':
      return '#7193f0';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

export interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle
}: SortableItemProps) {
  const {setNodeRef, setActivatorNodeRef, listeners, isDragging, isSorting, over, overIndex, transform, transition} =
    useSortable({
      id
    });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? {ref: setActivatorNodeRef} : undefined}
      index={index}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

export default function useMCHook() {
  return {
    TRASH_ID,
    PLACEHOLDER_ID,
    animateLayoutChanges,
    empty,
    DroppableContainer,
    getColor,
    useMountStatus,
    SortableItem
  };
}

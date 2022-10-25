import {defaultDropAnimationSideEffects, DropAnimation, UniqueIdentifier} from '@dnd-kit/core';
import {AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {Container, ContainerProps} from '../../components/Container';
import {CSS} from '@dnd-kit/utilities';
import {useEffect, useState} from 'react';

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

const animateLayoutChanges: AnimateLayoutChanges = args => defaultAnimateLayoutChanges({...args, wasDragging: true});
const empty: UniqueIdentifier[] = [];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
};

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

export default function useMCHook() {
  return {
    TRASH_ID,
    PLACEHOLDER_ID,
    animateLayoutChanges,
    empty,
    dropAnimation,
    DroppableContainer,
    getColor,
    useMountStatus
  };
}

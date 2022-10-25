import {UniqueIdentifier} from '@dnd-kit/core';
import {Container, ContainerProps} from '../container';
import {animateLayoutChanges} from '../../utilities/animate-layout-change';
import {CSS} from '../../utilities/css';
import {useSortable} from '@dnd-kit/sortable';

export default function DroppableContainer({
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

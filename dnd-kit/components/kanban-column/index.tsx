import {UniqueIdentifier} from '@dnd-kit/core';
import {SortableContext, SortingStrategy} from '@dnd-kit/sortable';
import React from 'react';
import {Items} from '../../types/type';
import {empty, PLACEHOLDER_ID} from '../../utilities/constant';
import Column from '../column';
import Task from '../task';
interface IKanbanBoard {
  data: UniqueIdentifier[];
  strategy: SortingStrategy;
  minimal: boolean;
  columns: number;
  scrollable: boolean;
  containerStyle: React.CSSProperties;
  items: Items;
  handleRemove: (containerId: UniqueIdentifier) => void;
  isSortingContainer: boolean;
  handle: boolean;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
  getItemStyles({index}: {index: number}): React.CSSProperties;
  renderItem: any;
  getIndex: (id: UniqueIdentifier) => number;
  handleAddColumn: () => void;
}

export default function KanbanBoard({
  data,
  strategy,
  minimal,
  columns,
  scrollable,
  containerStyle,
  items,
  handleRemove,
  isSortingContainer,
  handle,
  wrapperStyle,
  getItemStyles,
  renderItem,
  getIndex,
  handleAddColumn
}: IKanbanBoard) {
  return (
    <div className='kanban-board'>
      <SortableContext items={data} strategy={strategy}>
        {data.map(containerId => (
          <div className='kanban-column' key={containerId}>
            <Column
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
                    <Task
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
            </Column>
          </div>
        ))}
        {minimal ? undefined : (
          <Column id={PLACEHOLDER_ID} disabled={isSortingContainer} items={empty} onClick={handleAddColumn} placeholder>
            + Add column
          </Column>
        )}
      </SortableContext>
    </div>
  );
}

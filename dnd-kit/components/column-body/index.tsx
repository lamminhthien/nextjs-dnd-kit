import {UniqueIdentifier} from '@dnd-kit/core';
import {SortableContext, SortingStrategy} from '@dnd-kit/sortable';
import React from 'react';
import {Items} from '../../types/type';
import Column from '../column';
import Task from '../task';
interface IColumnBody {
  data: UniqueIdentifier[];
  strategy: SortingStrategy;
  minimal: boolean;
  columns: number;
  scrollable: boolean;
  containerStyle: React.CSSProperties;
  items: Items;
  handleRemove: (containerId: UniqueIdentifier) => void;
}

export default function ColumnBody({
  data,
  strategy,
  minimal,
  columns,
  scrollable,
  containerStyle,
  items,
  handleRemove
}: IColumnBody) {
  return (
    <div className='column-body'>
      <SortableContext items={data} strategy={strategy}>
        {data.map(containerId => (
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

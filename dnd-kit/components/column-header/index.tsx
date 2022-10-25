import React from 'react';
import {Remove} from '../Item';
interface IColumnHeader {
  title: string;
  onRemove: () => void;
}

export default function ColumnHeader({title, onRemove}: IColumnHeader) {
  return (
    <div className='kanban-header'>
      {title ? (
        <>
          <div className='column-title'>Column {title}</div>
          <Remove onClick={onRemove} />
        </>
      ) : null}
    </div>
  );
}
